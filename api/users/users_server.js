const { Router } = require("express");
const { submissionsRouter } = require("./submissions");
const { reviewsRouter } = require("./reviews");
const { matchRouter } = require("./match");
const { menuRouter } = require("./menu");
const { emailRouter } = require("./email");

const usersRouter = Router();

usersRouter.use("/submissions", submissionsRouter);
usersRouter.use("/reviews", reviewsRouter);
usersRouter.use("/match", matchRouter);
usersRouter.use("/menu", menuRouter);
usersRouter.use("/email", emailRouter);

module.exports = {
  usersRouter,
};
