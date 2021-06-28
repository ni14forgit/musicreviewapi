const { Router } = require("express");
const { profilesRouter } = require("./profiles/profiles_server");
const { awsRouter } = require("./aws/aws_server");
const { accountsRouter } = require("./accounts/accounts_server");
const { usersRouter } = require("./users/users_server");
const session = require("express-session");

const apiRouter = Router();

apiRouter.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    secure: false,
  })
);

apiRouter.use("/profiles", profilesRouter);
apiRouter.use("/aws", awsRouter);
apiRouter.use("/accounts", accountsRouter);
apiRouter.use("/users", usersRouter);

module.exports = {
  apiRouter,
};
