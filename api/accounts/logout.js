const { Router } = require("express");
const logoutRouter = Router();
const { pool } = require("../../dbConfig");
const bcrypt = require("bcrypt");

logoutRouter.post("/", async (req, res) => {
  console.log("reacted");
  req.session.userID = null;
  res.json({ successful: true });
});

module.exports = {
  logoutRouter,
};
