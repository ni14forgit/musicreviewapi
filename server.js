const express = require("express");
const app = express();
const cors = require("cors");
// const { pool } = require("./dbConfig");
// const bcrypt = require("bcrypt");
// const multer = require("multer");
// const AWS = require("aws-sdk");
// const uuid = require("uuid/v4");
require("dotenv/config");
const AWS = require("aws-sdk");
var downloader = require("s3-download-stream");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

var auth = {
  secretAccessKey: process.env.AWS_SECRET,
  accessKeyId: process.env.AWS_ID,
};

const { apiRouter } = require("./api/api_server");
const { reset } = require("nodemon");

const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb" }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(function (req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/api", apiRouter);

// app.use(express.urlencoded({limit: '25mb'}));
// app.post("/users/register", async (req, res) => {
// app.post("/users/login", async (req, res) => {
// app.post("/aws/uploadsong", upload.single("file"), (req, res) => {

app.get("/", (req, res) => {
  console.log("hi");
  res.send("hello");
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});

// app.post("/users/retrievesong", async (req, res) => {
