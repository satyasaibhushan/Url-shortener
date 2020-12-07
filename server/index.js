const express = require("express");
const cors = require("cors");
const yup = require("yup");
const monk = require("monk");
const dotenv = require("dotenv");
const { nanoid } = require("nanoid");
const CLIENT_ID = '342980464169-2jqomrchsthgjpdafk50ba8akj22g2v0.apps.googleusercontent.com';
const cookieParser = require('cookie-parser');

const hostname = "127.0.0.1";

dotenv.config();

const db = monk(process.env.MONGO_URI);
const urls = db.get("urls");
urls.createIndex({ slug: 1 }, { unique: true });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("./public"));
app.use('/error', express.static('error'));
app.use(cookieParser());
const isLoggedin = (req,res,next)=>{
  req.user ? next():next() ;
}

app.get("/", (req, res) => {
  res.json({
    message: "shorten your urls",
  });
});

app.get("/urls", async (req, res) => {
  let url = await urls.find();
  url = url.map(ele=>{return {slug:ele.slug,url:ele.url,count:ele.count?ele.count:0}})
  url = url.sort((a,b)=> (b.count?b.count:0)-(a.count?a.count:0))
  await res.json(url);
});
app.get("/delete/:slug",async(req,res)=>{
  let { slug } = req.params;
   await urls.remove({slug:slug})
   await res.json();
})

app.get("/:id",isLoggedin, async (req, res) => {
  let { id: slug } = req.params;

  try {
    const url = await urls.findOne({ slug });
    if (url) {
      res.redirect(url.url);
      if(url.count>=0) await  urls.update({ slug}, { $inc: { count: 1 } })
      else await urls.update({slug},{$set:{count:1}})
    } else res.redirect(`/error`);
  } catch (error) {
    console.log(error)
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
    const newUrl = { slug, url, count:0 };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith("E11000 duplicate key error collection")) {
      error.message = "slug in use, try another one";
    }
    next(error);
  }
});
app.post("/tokenVerify",async (req,res,next)=>{
  let {id_token:token} = req.body;
  const {OAuth2Client} = require('google-auth-library');
  const client = new OAuth2Client(CLIENT_ID);
  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    if(userid == '117443434510256381405')res.json({isValid:true})
    else res.json({isValid:false})
  }
  verify().catch(console.error);
})

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
