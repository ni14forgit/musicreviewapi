const { Router } = require("express");
const countRouter = Router();
const { pool } = require("../../dbConfig");

countRouter.get("/", async (req, res) => {
  const getNumUsers = async () => {
    try {
      var results = await pool.query(`SELECT COUNT(*) FROM users`);
      return results;
    } catch (err) {
      console.log("err");
      throw err;
    }
  };

  const getNumSubmissions = async () => {
    try {
      var results = await pool.query(`SELECT COUNT(*) FROM submissions`);
      return results;
    } catch (err) {
      console.log("err");
      throw err;
    }
  };

  const getNumReviews = async () => {
    try {
      var results = await pool.query(`SELECT COUNT(*) FROM reviews`);
      return results;
    } catch (err) {
      console.log("err");
      throw err;
    }
  };

  const numReviews = await getNumReviews();
  const numSubmissions = await getNumSubmissions();
  const numUsers = await getNumUsers();

  res.json({
    numReviews: numReviews,
    numSubmissions: numSubmissions,
    numUsers: numUsers,
  });
});

module.exports = {
  countRouter,
};
