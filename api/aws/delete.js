const AWS = require("aws-sdk");
const { Router } = require("express");
const multer = require("multer");
const deleteRouter = Router();
require("dotenv").config();
const { pool } = require("../../dbConfig");

const BUCKET_PATH = process.env.AWS_BUCKET_PATH;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const upload = multer();

deleteRouter.post("/song", upload.array("file", 3), async (req, res) => {
  console.log("delete song arrived");

  let { songid } = req.body;

  pool.query(
    `SELECT url FROM songs 
      WHERE id = $1`,
    [songid],
    (err, results) => {
      if (err) {
        throw err;
      }

      if (results.rows.length == 0) {
        console.log("song does not exist");
        res.json({ error: true });
      }

      const key = results.rows[0].url.substring(BUCKET_PATH.length);

      console.log(key);

      var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          res.json({ error: true });
        } else {
          console.log("successfully deleted song");
          res.json({ error: false });
        } // deleted
      });
    }
  );
});

deleteRouter.post("/photo", upload.single("file"), async (req, res) => {
  const userID = req.session.userID || 7;
  // if (!req.session.userID) {
  //   console.log("no account in cache!!");
  //   // return;
  // }

  pool.query(
    `SELECT profile_photo FROM users 
      WHERE id = $1`,
    [userID],
    (err, results) => {
      if (err) {
        throw err;
      }

      if (results.rows.length == 0) {
        console.log("user does not exists");
        res.json({ error: true });
      }

      const key = results.rows[0].profile_photo.substring(BUCKET_PATH.length);

      var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
          res.json({ error: true });
        } else res.json({ error: false }); // deleted
      });
    }
  );
});

module.exports = {
  deleteRouter,
};
