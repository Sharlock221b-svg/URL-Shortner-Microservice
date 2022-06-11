require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParse = require("body-parser");
const dns = require("dns");
const shortid = require("shortid");
const validUrl = require("is-url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParse.urlencoded({ extended: true }));

//connecting mongoose to mongodb
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
//document schema
const url_map = new mongoose.Schema({
  original_url: { type: String, unique: true, required: true },
  short_url: { type: String, unique: true, required: true },
});

const URL_map = mongoose.model("url_map", url_map);

//handeling main page
app.get("/", function (_req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (_req, res) {
  res.json({ greeting: "hello API" });
});

// handling post request
app.post("/api/shorturl", (req, res) => {
  //accessing the url from the body
  const url = req.body.url;
  const checkURL = new Promise((resolve, reject) => {
    //checking if the url is valid
    if (!validUrl(url)) {
      reject("invalid url");
    }
    //hostname lookup
    let host = new URL(url).hostname;
    dns.lookup(host, (err) => {
      if (err) {
        reject("Invalid Hostname");
      }
      resolve(url);
   });
  });

  checkURL
    .then(async (result) => {
      //if the url is valid
      const shortURL = shortid.generate();
      //checking if the url is already in the database
      let lookURL = await URL_map.findOne(
        { original_url: url },
        { original_url: 1, short_url: 1, _id: 0 }
      );
      if (lookURL !== null) {
        res.json(lookURL);
      } else {
        let newURL = new URL_map({
          original_url: url,
          short_url: shortURL,
        });
        await newURL.save();
        res.json({ original_url: url, short_url: shortURL });
      }
    })
    .catch((err) => res.json({ error: err }));
});

//handeling undefined routes
app.get("*", (_req, res) => {
  res.write("Not Found");
  res.end();
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
