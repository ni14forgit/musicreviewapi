const { Router } = require("express");
const sessionRouter = Router();
const { pool } = require("../../dbConfig");
const bcrypt = require("bcrypt");

sessionRouter.get("/isloggedin", async (req, res) => {
  console.log("is logged in?");
  if (req.session.userID) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

sessionRouter.post("/accesssongfeedback", async (req, res) => {
  let { submission_id } = req.body;
  const userId = req.session.userID;
  // if (!userId){
  //     res.json({error: true})
  // }
  const toReturn = { error: false, to: "" };
  pool.query(
    `SELECT user_id from submissions WHERE id = $1`,
    [submission_id],
    (err, results) => {
      if (err || results.rows.length < 1) {
        if (userId) {
          toReturn.error = true;
          toReturn.to = "/home";
          res.json(toReturn);
        } else {
          toReturn.error = true;
          toReturn.to = "/mainscreen";
          res.json(toReturn);
        }
      } else {
        if (results.rows[0].user_id != userId) {
          if (userId) {
            toReturn.error = true;
            toReturn.to = "/home";
            res.json(toReturn);
          } else {
            toReturn.error = true;
            toReturn.to = "/mainscreen";
            res.json(toReturn);
          }
        } else {
          res.json(toReturn);
        }
      }
    }
  );
});

sessionRouter.post("/accesssongtoreview", async (req, res) => {
  let { submission_id, review_id } = req.body;
  const userId = req.session.userID;
  // if (!userId){
  //     res.json({error: true})
  // }
  const toReturn = { error: false, to: "" };
  pool.query(
    `SELECT user_id, submission_id from reviews WHERE id = $1`,
    [review_id],
    (err, results) => {
      if (err || results.rows.length < 1) {
        if (userId) {
          toReturn.error = true;
          toReturn.to = "/home";
          res.json(toReturn);
        } else {
          toReturn.error = true;
          toReturn.to = "/mainscreen";
          res.json(toReturn);
        }
      } else {
        if (
          results.rows[0].user_id != userId ||
          results.rows[0].submission_id != submission_id
        ) {
          if (userId) {
            toReturn.error = true;
            toReturn.to = "/home";
            res.json(toReturn);
          } else {
            toReturn.error = true;
            toReturn.to = "/mainscreen";
            res.json(toReturn);
          }
        } else {
          res.json(toReturn);
        }
      }
    }
  );
});

module.exports = {
  sessionRouter,
};
