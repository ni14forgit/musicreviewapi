const { Router } = require("express");
const { checkExistenceRouter } = require("./checkexistence");
const { countRouter } = require("./count");
const { loginRouter } = require("./login");
const { logoutRouter } = require("./logout");
const { sessionRouter } = require("./session");

// const { registerRouter } = require("./register");

const accountsRouter = Router();

accountsRouter.use("/checkexistence", checkExistenceRouter);
accountsRouter.use("/login", loginRouter);
accountsRouter.use("/logout", logoutRouter);
accountsRouter.use("/count", countRouter);
accountsRouter.use("/session", sessionRouter);
//accomplishments
//friends

module.exports = {
  accountsRouter,
};
