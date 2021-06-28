// code adapted from educational tutorial @ Genuis Coders
require("dotenv/config");
const express = require("express");
const app = express();
const port = 3000;
const multer = require("multer");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");
var s3API = require("s3");

//...

// Set up s3 credentials
var client = s3API.createClient({
  s3Options: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const upload = multer({ storage }).single("song");

app.post("/upload", upload, (req, res) => {
  console.log(req);
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `songs/${uuid()}.${fileType}`,
    Body: req.file.buffer,
  };

  s3.upload(params, (error, data) => {
    if (error) {
      res.status(500).send(error);
    }

    res.status(200).send(data);
  });
});

app.listen(port, () => {
  console.log(`Server is up at ${port}`);
});
