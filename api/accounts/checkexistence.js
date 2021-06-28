const { Router } = require("express");
const checkExistenceRouter = Router();
const { pool } = require("../../dbConfig");
const bcrypt = require("bcrypt");

checkExistenceRouter.post("/", async (req, res) => {
  console.log("users/checkexistence reached");
  let { email, password } = req.body;
  console.log({ email, password });

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
        console.log("user with this email already exists!");
        res.json({ userAlreadyExists: true });
      } else {
        console.log("user with this email DOES NOT exist!");
        res.json({ userAlreadyExists: false });
      }
    }
  );
});

module.exports = {
  checkExistenceRouter,
};
