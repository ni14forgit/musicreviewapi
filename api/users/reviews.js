const { Router } = require("express");
const reviewsRouter = Router();
const { pool } = require("../../dbConfig");

const tempID = 15;

reviewsRouter.post("/retrieve", async (req, res) => {
  let { review_id } = req.body;
  const userId = req.session.userID;

  const getUserInfo = async (user_id) => {
    try {
      var results = await pool.query(
        `SELECT profile_photo, name FROM users WHERE id = $1`,
        [user_id]
      );
      return results.rows[0];
    } catch (err) {
      console.log("err");
      throw err;
    }
  };
  pool.query(
    `SELECT * FROM reviewcomments
          WHERE review_id = $1`,
    [review_id],
    async (err, results) => {
      if (err) {
        console.log(err);
        console.log("retrieve comments wrong");
        res.json({ success: false });
        throw err;
      }

      console.log(review_id);

      pool.query(
        `SELECT general_overview FROM reviews
              WHERE id = $1`,
        [review_id],
        async (err2, results2) => {
          if (err2) {
            console.log(err2);
            console.log("retrieve overview wrong");
            res.json({ success: false });
            throw err;
          }

          const userInfoTemp = await getUserInfo(userId);

          res.json({
            success: true,
            comments: results.rows,
            generalOverview: results2.rows[0].general_overview,
            reviewer_own_photo: userInfoTemp.profile_photo,
            reviewer_own_name: userInfoTemp.name,
          });
        }
      );
    }
  );
});

reviewsRouter.post("/statictotalretrieve", async (req, res) => {
  // let { review_ids } = req.body;
  let { submission_id } = req.body;

  const getReviewers = async (submissionID) => {
    try {
      const results = await pool.query(
        `SELECT id FROM reviews WHERE submission_id = $1`,
        [submissionID]
      );
      return results;
    } catch (err) {
      console.log("retrieving reviewers incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const getComments = async (review_id) => {
    try {
      var results = await pool.query(
        `SELECT * FROM reviewcomments
        WHERE review_id = $1`,
        [review_id]
      );
      return results;
    } catch (err) {
      console.log("retrieving comments incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const getReviewTable = async (review_id) => {
    try {
      var results = await pool.query(
        `SELECT * FROM reviews
        WHERE id = $1`,
        [review_id]
      );
      return results;
    } catch (err) {
      console.log("retrieving overview incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const getReviewerProfile = async (user_id) => {
    try {
      var results = await pool.query(
        `SELECT id, instagram, name, spotify, soundcloud, profile_photo FROM users
        WHERE id = $1`,
        [user_id]
      );
      return results;
    } catch (err) {
      console.log("retrieving overview incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const getProfessions = async (user_id) => {
    try {
      var results = await pool.query(
        `SELECT singer, songwriter, audio_engineer, producer FROM professions WHERE user_id = $1`,
        [user_id]
      );
      return results;
    } catch (err) {
      console.log("prof");
      throw err;
    }
  };

  const getReviewerSongs = async (user_id) => {
    try {
      var results = await pool.query(
        `SELECT * FROM songs
        WHERE user_id = $1`,
        [user_id]
      );
      return results;
    } catch (err) {
      console.log("retrieving overview incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const getEverything = async (review_id) => {
    const commentsResult = await getComments(review_id);
    const reviewTableResult = await getReviewTable(review_id);

    const comments = commentsResult.rows;
    const reviewTable = reviewTableResult.rows[0];

    const reviewerProfileResult = await getReviewerProfile(reviewTable.user_id);
    const reviewerSongsResult = await getReviewerSongs(reviewTable.user_id);
    const reviewerProfessionsResult = await getProfessions(reviewTable.user_id);

    const reviewerProfile = reviewerProfileResult.rows[0];
    reviewerProfile.professions = reviewerProfessionsResult.rows[0];
    const reviewerSongs = reviewerSongsResult.rows;

    return {
      comments: comments,
      reviewTable: reviewTable,
      reviewerProfile: reviewerProfile,
      reviewerSongs: reviewerSongs,
      review_id: review_id,
    };
  };

  const review_ids_rows = await getReviewers(submission_id);
  var review_ids = [];
  for (var i = 0; i < review_ids_rows.rows.length; i++) {
    review_ids.push(review_ids_rows.rows[i].id);
  }
  console.log("review_ids");
  console.log(review_ids);
  const promises = [];
  for (var i = 0; i < review_ids.length; i++) {
    promises.push(getEverything(review_ids[i]));
  }

  Promise.all(promises).then((result) =>
    res.json({ success: true, reviews: result })
  );

  // res.json();
});

reviewsRouter.post("/submit", async (req, res) => {
  let { review_id, deletedComments, overview, comments } = req.body;

  const submitNewGeneralOverview = async (new_general_overview) => {
    try {
      var results = await pool.query(
        `UPDATE reviews
              SET general_overview = $1
              WHERE id = $2`,
        [new_general_overview, review_id]
      );
      return results;
    } catch (err) {
      console.log("upadting overview incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const deleteComment = async (comment_id) => {
    try {
      var results = await pool.query(
        `DELETE FROM reviewcomments
              WHERE id = $1`,
        [comment_id]
      );
      return results;
    } catch (err) {
      console.log("deleting comments incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const addComment = async (comment, timestamp) => {
    try {
      var results = await pool.query(
        `INSERT INTO reviewcomments (review_id, timestamp, comment)
          VALUES ($1, $2, $3)`,
        [review_id, timestamp, comment]
      );
      return results;
    } catch (err) {
      console.log("adding comments incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const changeBooleanColumns = async (column_name, boolean) => {
    try {
      var results = await pool.query(
        `UPDATE reviews SET ${column_name} = $1
          WHERE id = $2`,
        [boolean, review_id]
      );
      return results;
    } catch (err) {
      console.log("changing boolean columns incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  const promises = [];

  if (overview.altered) {
    // finalres.overview = submitNewGeneralOverview();
    promises.push(submitNewGeneralOverview(overview.value));
  }

  for (var i = 0; i < deletedComments.length; i++) {
    // finalres.deleted.push(deleteComment(deletedComments[i]));
    promises.push(deleteComment(deletedComments[i]));
  }

  for (var i = 0; i < comments.length; i++) {
    // finalres.added.push(
    //   addComment(addedComments[i].comment, addedComments[i].timestamp)
    if (!comments[i].saved) {
      promises.push(addComment(comments[i].comment, comments[i].timestamp));
    }

    // );
  }

  const checkCompletedReview = () => {
    if (comments.length > 0 && overview.value != "") {
      return true;
    }
    return false;
  };

  //   const g = await finalres;

  Promise.all(promises)
    .then(async () => {
      await changeBooleanColumns("new_update", true);
      if (checkCompletedReview()) {
        await changeBooleanColumns("touched", true);
      }
      res.json({ success: true });
    })
    .catch((err) => {
      res.json({ success: false });
    });
});

reviewsRouter.post("/submitfeedbackscore", async (req, res) => {
  let { score, review_id } = req.body;

  const updateReviewersProfileScore = async (userID) => {
    // select user id from review id
    // collect all reviews that have score above 0
    // update user table

    pool.query(
      `SELECT feedback_quality FROM reviewers WHERE user_id = $1 AND feedback_quality > 0;`,
      [userID],
      (err, results) => {
        if (err) {
          res.json({ success: false });
          throw err;
        }

        var totalSum = 0;
        for (var i = 0; i < results.rows.length; i++) {
          totalSum += results.rows[i].feedback_quality;
        }
        const avgScore = Math.round(totalSum / results.rows.length);

        pool.query(
          `UPDATE users 
        SET reviewer_score = $1
        WHERE id = $2
        RETURNING user_id;`,
          [userID, avgScore],
          (err2, results2) => {
            if (err2) {
              res.json({ success: false });
              throw err2;
            }

            res.json({ success: true });
          }
        );
      }
    );
  };

  pool.query(
    `UPDATE reviews 
    SET feedback_quality = $1
    WHERE id = $2
    RETURNING user_id;`,
    [score, review_id],
    (err, results) => {
      if (err) {
        res.json({ success: false });
        throw err;
      }

      updateReviewersProfileScore(results.rows[0].user_id);

      res.json({ success: true });
    }
  );
});

reviewsRouter.post("/seenupdate", async (req, res) => {
  let { submission_id } = req.body;
  pool.query(
    `UPDATE reviews SET new_update = $1 WHERE submission_id = $2`,
    [false, submission_id],
    (err, results) => {
      if (err) {
        console.log(err);
        throw err;
      }
      res.json({ success: true });
    }
  );
});

reviewsRouter.get("/unopenedfeedbackcount", async (req, res) => {
  const userID = req.session.userID || 15;

  const hasUnopenedFeedback = async (submission_id) => {
    try {
      var count = 0;
      var results = await pool.query(
        `SELECT new_update FROM reviews
        WHERE submission_id = $1`,
        [submission_id]
      );
      for (var i = 0; i < results.rows.length; i++) {
        if (results.rows[i].new_update) {
          count += 1;
        }
      }
      return count;
    } catch (err) {
      console.log("has unopened feedback incorrect");
      console.log(err);
      res.json({ success: false });
      throw err;
    }
  };

  var promises = [];

  pool.query(
    `SELECT id from submissions WHERE user_id = $1`,
    [userID],
    (err, results) => {
      if (err) {
        console.log(err);
        throw err;
      }
      const submissionIDs = results.rows;
      for (var i = 0; i < submissionIDs.length; i++) {
        promises.push(hasUnopenedFeedback(submissionIDs[i].id));
      }
    }
  );

  Promise.all(promises).then((results) => {
    var count = 0;
    for (var i = 0; i < results.length; i++) {
      count += results[i];
    }
    res.json({ unopenedfeedback: count });
  });
});

reviewsRouter.get("/todoreviewcount", async (req, res) => {
  const userID = req.session.userID || 15;

  pool.query(
    `SELECT touched from reviews WHERE user_id = $1`,
    [userID],
    (err, results) => {
      if (err) {
        console.log(err);
        throw err;
      }
      var count = 0;
      for (var i = 0; i < results.rows.length; i++) {
        if (!results.rows[i].touched) {
          count += 1;
        }
      }
      res.json({ todoreview: count });
    }
  );
});

module.exports = {
  reviewsRouter,
};

// pool.query(
//     `INSERT INTO reviewcomments (review_id, timestamp, comment)
//       VALUES ($1, $2, $3)`
//   ),
//     [review_id, addedComments[i].timestamp, addedComments[i].comment],
//     (err, results) => {
//       if (err) {
//         console.log("adding comments incorrect");
//         console.log(err);
//       }
//     };
