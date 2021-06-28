const AWS = require("aws-sdk");
const { Router } = require("express");
const multer = require("multer");
const uploadRouter = Router();
const uuid = require("uuid/v4");
require("dotenv").config();

const BUCKET_PATH = process.env.AWS_BUCKET_PATH;

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

const upload = multer();

uploadRouter.post("/songs", upload.array("file", 3), async (req, res) => {
  //   console.log(req.files);

  const uploadSingleSongS3 = async (song_file) => {
    let myFile = song_file.originalname.split(".");
    const fileType = myFile[myFile.length - 1];
    const path_to_song = `songs/${uuid()}.${fileType}`;
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: path_to_song,
      Body: song_file.buffer,
      ACL: "public-read",
    };

    const s3Result = await s3
      .upload(params, async (error, data) => {
        if (error) {
          console.log("error occurred");
          console.log(error);
          //   error = true;
          return { error: true, song: false };
          //   res.status(500).send(error);
        } else {
          console.log("we are chilling!");

          return {
            error: false,
            song: {
              songname: song_file.originalname,
              path_to_song: BUCKET_PATH + path_to_song,
            },
          };
          //   res.json({ path_to_song: BUCKET_PATH + path_to_song });
          // songS3Urls.push({songname: req.files[i].originalname, path_to_song: BUCKET_PATH + path_to_song})
        }
      })
      .promise();

    // console.log(s3Result);

    return s3Result;
  };

  var songS3Urls = [];
  //   var error = null;

  for (const item of req.files) {
    const asnycResult = await uploadSingleSongS3(item);

    const song = {
      songname: item.originalname,
      path_to_song: asnycResult.Location,
    };

    songS3Urls.push(song);
  }

  console.log("results!");
  console.log(songS3Urls);
  res.json({ songs: songS3Urls });
});

uploadRouter.post("/photo", upload.single("file"), async (req, res) => {
  let myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  const path_to_profile_photo = `profilePhotos/${uuid()}.${fileType}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: path_to_profile_photo,
    Body: req.file.buffer,
    ACL: "public-read",
  };

  const s3Result = await s3
    .upload(params, (error, data) => {
      if (error) {
        console.log("error occurred");
        console.log(error);
        res.status(500).send(error);
      } else {
        console.log("we are chilling!");
        //   res.json({ path_to_profile_photo: BUCKET_PATH + path_to_profile_photo });
      }
    })
    .promise();
  console.log({ photo: { path_to_profile_photo: s3Result.Location } });
  res.json({ path_to_profile_photo: s3Result.Location });
});

module.exports = {
  uploadRouter,
};
