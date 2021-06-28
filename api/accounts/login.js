const { Router } = require("express");
const loginRouter = Router();
const { pool } = require("../../dbConfig");
const bcrypt = require("bcrypt");
// const session = require("express-session")

// registerRouter.use(
//   session({
//     secret: "secret-key",
//     resave: false,
//     saveUninitialized: false,
//     secure: false,
//   })
// );

loginRouter.post("/", async (req, res) => {
  console.log("users/login reached");
  console.log(req.session.account);
  if (req.session.account) {
    console.log(req.session.account);
  } else {
    console.log("not yet defined");
  }
  const loginResultsToReturn = {
    success: true,
    errors: { acountDoesNotExistError: false, incorrectPasswordError: false },
  };
  let { email, password } = req.body;
  console.log(email);
  pool.query(
    `SELECT * FROM users
            WHERE email = $1`,
    [email],
    (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows);
      if (results.rows.length > 0) {
        const user = results.rows[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) {
            throw err;
          }

          if (isMatch) {
            console.log("passwords match, user can log in!");
            req.session.account = email;
            req.session.userID = user.id;
            console.log(req.session.userID);
            res.json(loginResultsToReturn);
          } else {
            console.log("passwords do NOT match, incorrect password");
            loginResultsToReturn.success = false;
            loginResultsToReturn.errors.incorrectPasswordError = true;
            res.json(loginResultsToReturn);
          }
        });
      } else {
        console.log(`no user found with email ${email}`);
        loginResultsToReturn.success = false;
        loginResultsToReturn.errors.acountDoesNotExistError = true;
        res.json(loginResultsToReturn);
      }
    }
  );
});

module.exports = {
  loginRouter,
};
