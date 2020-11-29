const express = require("express");
const cors = require("cors");
const yup = require("yup");
const monk = require("monk");
const dotenv = require("dotenv");
const { nanoid } = require("nanoid");
// const morgan
// const helmet

dotenv.config();

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./public"));

app.get("/", (req, res) => {
  res.json({
    message: "shorten your urls",
  });
});
app.get("/:id", async (req, res) => {
  let { id: slug } = req.params;

  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
    } else res.redirect(`/?error=${slug} not found`);
  } catch (error) {
    res.redirect(`/?error=Link not found`);
  }
});



const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

app.post("/url", async (req, res, next) => {
  let { slug, url } = req.body;
  try {
    await schema.validate({ slug, url });
    if (!slug) {
      slug = nanoid(5);
    }
    slug = slug.toLowerCase();
    const newUrl = { slug, url };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith("E11000 duplicate key error collection")) {
      error.message = "slug in use, try another one";
    }
    next(error);
  }
});

app.get("/url/:id", async (req, res) => {
  //get info
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
