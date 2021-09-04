const express = require("express");
const cors = require("cors");
const yup = require("yup");
const monk = require("monk");
const dotenv = require("dotenv");
const { nanoid } = require("nanoid");
const CLIENT_ID = "342980464169-2jqomrchsthgjpdafk50ba8akj22g2v0.apps.googleusercontent.com";
const cookieParser = require("cookie-parser");
const fs = require("fs");

const hostname = "127.0.0.1";

dotenv.config();

const verified_users = process.env.VERIFIED_USERS.split(",");
const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./public"));
app.use("/error", express.static("error"));
app.use(cookieParser());
const isLoggedin = (req, res, next) => {
  if (req.header("bearer-token")) {
    verify(req.header("bearer-token")).then(response => {
      if (response) next();
      else {
        res.sendStatus(404);
      }
    });
  } else res.sendStatus(404);
};

console.log('hello')
app.get("/", (req, res) => {
  res.json({
    message: "shorten your urls",
  });
});

app.get("/urls", isLoggedin, async (req, res) => {
  console.log('ey')
  console.log(process.env.MONGO_URI)
  let url = await urls.find({});
  console.log('ey1')
  url = url.map(ele => {
    return { slug: ele.slug, url: ele.url, count: ele.count ? ele.count : 0 };
  });
  url = url.sort((a, b) => (b.count ? b.count : 0) - (a.count ? a.count : 0));
  writeToFile("./test.json", { ...url });
  await res.json(url);
});

app.get("/delete/:slug", isLoggedin, async (req, res) => {
  let { slug } = req.params;
  await urls.remove({ slug: slug });
  await res.json();
});

app.get("/:id", async (req, res) => {
  let { id: slug } = req.params;

  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
      if (url.count >= 0) await urls.update({ slug }, { $inc: { count: 1 } });
      else await urls.update({ slug }, { $set: { count: 1 } });
    } else res.redirect(`/error`);
  } catch (error) {
    console.log(error);
  }
});

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.post("/url", isLoggedin, async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({ slug, url });
    if (!slug) {
      slug = nanoid(5);
    }
    slug = slug.toLowerCase();
    const newUrl = { slug, url, count: 0 };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith("E11000 duplicate key error collection")) {
      error.message = "slug in use, try another one";
    }
    next(error);
  }
});
app.post("/tokenVerify", async (req, res, next) => {
  let { id_token: token } = req.body;
  verify(token).then(response => {
    if (response) res.json({ isValid: true });
    else res.json({ isValid: false });
  });
});

app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  } else res.status(500);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV == "production" ? "" : error.stack,
  });
});

const listener = app.listen(process.env.PORT || 3000, function () {
  let { family, address, port } = listener.address();
  address = address == "::" ? "localhost" : address;
  console.log(`app is listening on: ${family}:${address}:${port}`);
});

async function verify(token) {
  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload["sub"];
  let flag = 0;
  verified_users.forEach(ele => {
    if (ele == userid) flag = 1;
  });
  if (flag == 1) return true;
  else return false;
}

const writeToFile = (filename, obj) => {
  fs.writeFile(filename, JSON.stringify(obj), function (err) {
    if (err) {
      return console.log(err);
    }
  });
};
