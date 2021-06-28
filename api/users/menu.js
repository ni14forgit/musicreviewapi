const { Router } = require("express");
const menuRouter = Router();
const { pool } = require("../../dbConfig");

menuRouter.get("/feedback", (req, res) => {
  const userID = req.session.userID;

  if (!userID) {
    res.json({ feedbacks: [] });
  }

  console.log("feedback hit");
  console.log(userID);

  const getReviewers = async (submission_id, date) => {
    try {
      const results = await pool.query(
        `SELECT id, user_id, touched FROM reviews WHERE submission_id = $1`,
        [submission_id]
      );
      const resultsSongTitle = await pool.query(
        `SELECT title FROM submissionsongs WHERE submission_id = $1`,
        [submission_id]
      );

      // console.log(results.rows);
      // console.log(resultsSongTitle.rows);

      //   var profilePictures
      //   for (var i = 0; i < results.rows.length; i++){

      //   }

      var dataToReturn = {
        submission_id: submission_id,
        reviewers: [],
        title: resultsSongTitle.rows[0].title,
        date: date,
      };
      for (var i = 0; i < results.rows.length; i++) {
        const profilePicture = await pool.query(
          `SELECT profile_photo FROM users WHERE id = $1`,
          [results.rows[i].user_id]
        );
        console.log(profilePicture.rows[0]);
        dataToReturn.reviewers.push({
          id: results.rows[i].id,
          user_id: results.rows[i].user_id,
          touched: results.rows[i].touched,
          photo: profilePicture.rows[0].profile_photo,
        });
      }
      return dataToReturn;
    } catch (err) {
      if (err) {
        throw err;
      }
    }
  };

  pool.query(
    `SELECT id, date from submissions WHERE user_id = $1`,
    [userID],
    (err, results) => {
      if (err) {
        console.log(err);
        throw err;
      }

      var dataToReturn = [];
      promises = [];
      for (var i = 0; i < results.rows.length; i++) {
        promises.push(getReviewers(results.rows[i].id, results.rows[i].date));
      }
      Promise.all(promises).then((values) => {
        // console.log(values);
        // add more information
        console.log(values);
        res.json({ feedbacks: values });
      });
    }
  );
});

menuRouter.get("/musictoreview", (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.json({ musictoreview: [] });
  }

  const getSubmissionMeta = async (submission_id) => {
    try {
      const actualSubmission = await pool.query(
        `SELECT * FROM submissions WHERE id = $1`,
        [submission_id]
      );

      const resultsSongTitle = await pool.query(
        `SELECT title FROM submissionsongs WHERE submission_id = $1`,
        [submission_id]
      );

      var dataToReturn = {
        submission_id: submission_id,
        // review_id: review_id,
        title: resultsSongTitle.rows[0].title,
        date: actualSubmission.rows[0].date,
      };

      const profilePicture = await pool.query(
        `SELECT profile_photo FROM users WHERE id = $1`,
        [actualSubmission.rows[0].user_id]
      );

      dataToReturn.submitter = {
        id: submission_id,
        user_id: actualSubmission.rows[0].user_id,
        photo: profilePicture.rows[0].profile_photo,
      };

      return dataToReturn;
    } catch (err) {
      if (err) {
        throw err;
      }
    }
  };

  pool.query(
    `SELECT * from reviews WHERE user_id = $1`,
    [userID],
    (err, results) => {
      if (err) {
        console.log(err);
        throw err;
      }
      var promises = [];
      for (var i = 0; i < results.rows.length; i++) {
        promises.push(getSubmissionMeta(results.rows[i].submission_id));
      }

      Promise.all(promises).then((values) => {
        for (var j = 0; j < results.rows.length; j++) {
          values[j].review_id = results.rows[j].id;
          values[j].feedback_quality = results.rows[j].feedback_quality;
          values[j].touched = results.rows[j].touched;
        }
        res.json({ musictoreview: values });
      });
    }
  );
});

module.exports = {
  menuRouter,
};
