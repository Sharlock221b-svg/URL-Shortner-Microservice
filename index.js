require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParse = require("body-parser");
const dns = require("dns");
const shortid = require('shortid');


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

const url_map = new mongoose.Schema({
  original_url: {type: String, unique: true, required: true},
  short_url: {type: String, unique: true, required: true}
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
    urlParts = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(url);
    hostname = urlParts[1]; //hostname
    dns.lookup(hostname, (err, address, family) => {
       if(err) reject(err);
       else resolve("Valid URL");
    })
  });

  checkURL.then((result) => {
    //if the url is valid
    const shortURL = shortid.generate();
    let lookURL =  URL_map.findOne({original_url: url}, {original_url: 1, short_url: 1});
    
    URL_map.create({original_url: url, short_url: shortURL}, (err) => {
       if(err) res.json({error: err});
       else res.json({original_url: url, short_url: shortURL});
    })

  })
  .catch((err) => res.json({error: "Invalid URL"}));
});

//handeling undefined routes
app.get("*", (_req, res) => {
  res.write("Not Found");
  res.end();
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
