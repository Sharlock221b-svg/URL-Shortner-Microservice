require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParse = require("body-parser");
const dns = require("dns");

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
  //checking if the url is valid
  urlParts = /^(?:\w+\:\/\/)?([^\/]+)([^\?]*)\??(.*)$/.exec(url);
  hostname = urlParts[1]; //hostname


});

//handeling undefined routes
app.get("*", (_req, res) => {
  res.write("Not Found");
  res.end();
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
