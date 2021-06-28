const { Router } = require("express");
const { uploadRouter } = require("./upload");
const { deleteRouter } = require("./delete");

const awsRouter = Router();

awsRouter.use("/upload", uploadRouter);
awsRouter.use("/delete", deleteRouter);
// delete
//retrieve

module.exports = {
  awsRouter,
};
