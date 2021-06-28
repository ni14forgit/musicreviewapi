const { Router } = require("express");
const { editsRouter } = require("./edits");
const { registerRouter } = require("./register");
const { retrieveRouter } = require("./retrieve");

const profilesRouter = Router();

profilesRouter.use("/edits", editsRouter);
profilesRouter.use("/register", registerRouter);
profilesRouter.use("/retrieve", retrieveRouter);
//accomplishments
//friends

module.exports = {
  profilesRouter,
};
