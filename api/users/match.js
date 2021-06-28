const { pool } = require("../../dbConfig");
const { Router } = require("express");
const { getGenres, getProfessions } = require("../profiles/helper");
const matchRouter = Router();

const compareDicts = (potentialDict, submissionDict) => {
  var counter = 0;
  // console.log("potential dict");
  // console.log(potentialDict);
  // const keys = potentialDict.keys();
  const keys = Object.keys(potentialDict);

  if (keys.length == 0) {
    return 0;
  }

  for (var i = 0; i < keys.length; i++) {
    if (potentialDict[keys[i]] && submissionDict[keys[i]]) {
      counter += 1;
    }
  }
  return counter;
};

const checkGenresAndProfessionsMatch = (features, genres, professions) => {
  if (
    compareDicts(features.genres, genres) >= 1 &&
    compareDicts(features.professions, professions) >= 1
  ) {
    return true;
  }
  return false;
};

const findReviewers = async (
  submitted_user_id,
  submitted_genres,
  submitted_professions
) => {};

matchRouter.post("/ss", async (req, res) => {
  console.log("hi");

  const submitted_user_id = req.session.userID || 15;

  let { submission_id, submitted_genres, submitted_professions } = req.body;
  console.log(submission_id);

  // const submitted_genres = {
  //   rap: false,
  //   blues: false,
  //   indie: false,
  //   country: true,
  //   edm: false,
  // };
  // const submitted_professions = {
  //   singer: false,
  //   songwriter: false,
  //   audio_engineer: true,
  //   producer: false,
  // };

  const getNumOpenReviews = async (reviewer_user_id) => {
    try {
      var results = await pool.query(
        `SELECT id FROM reviews
          WHERE user_id = $1 AND touched = FALSE`,
        [reviewer_user_id]
      );
      return results.rows.length;
    } catch (err) {
      console.log("retrieve submission song WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const getNameAndEmail = async (user_id) => {
    try {
      var results = await pool.query(
        `SELECT name, email FROM users
          WHERE id = $1`,
        [user_id]
      );
      return results.rows[0];
    } catch (err) {
      console.log("retrieve submission song WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const submitIntoReviews = async (submission_id_passed, reviewer_user_id) => {
    try {
      var results = await pool.query(
        `INSERT INTO reviews (submission_id, user_id)
        VALUES ($1, $2)
        RETURNING id`,
        [submission_id_passed, reviewer_user_id]
      );
      return results.rows[0].id;
    } catch (err) {
      throw err;
    }
  };

  var promises = [];
  pool.query(
    "SELECT id, open_reviews, email, name from users WHERE id != $1",
    [submitted_user_id],
    async (err, results) => {
      if (err) {
        console.log(err);
        throw err;
      }

      var selectionCounter = 0;
      var selectedReviewers = [];

      for (var i = 0; i < results.rows.length; i++) {
        var tempGenres = await getGenres(results.rows[i].id);
        var tempProfessions = await getProfessions(results.rows[i].id);
        var numOpenReviews = await getNumOpenReviews(results.rows[i].id);
        promises.push({
          id: results.rows[i].id,
          email: results.rows[i].email,
          numOpenReviews: numOpenReviews,
          name: results.rows[i].name,
          genres: tempGenres.rows.length > 0 ? tempGenres.rows[0] : {},
          professions:
            tempProfessions.rows.length > 0 ? tempProfessions.rows[0] : {},
        });
      }

      // console.log(promises);

      const genresAndProfessionsMatches = promises.filter((features) =>
        checkGenresAndProfessionsMatch(
          features,
          submitted_genres,
          submitted_professions
        )
      );

      genresAndProfessionsMatches.sort(function (a, b) {
        return a.numOpenReviews - b.numOpenReviews;
      });
      if (genresAndProfessionsMatches.length > 1) {
        // console.log(genresAndProfessionsMatches[0]);
        // console.log(genresAndProfessionsMatches[1]);
        selectedReviewers.push(genresAndProfessionsMatches[0]);
        selectedReviewers.push(genresAndProfessionsMatches[1]);
        selectionCounter += 2;
        console.log("2 genreprofessions matched");
        console.log(selectionCounter);
      } else if (genresAndProfessionsMatches.length > 0) {
        console.log("1 genreprofessions matched");
        selectedReviewers.push(genresAndProfessionsMatches[0]);
        // console.log(genresAndProfessionsMatches[0]);
        selectionCounter += 1;
      }

      if (selectionCounter < 2) {
        const professionMatches = promises.filter(
          (features) =>
            compareDicts(features.professions, submitted_professions) >= 1 &&
            (selectionCounter == 1
              ? features.id != genresAndProfessionsMatches[0].id
              : true)
        );

        professionMatches.sort(function (a, b) {
          return a.numOpenReviews - b.numOpenReviews;
        });

        const iteratorValue = 2 - selectionCounter;

        for (
          var i = 0;
          i < Math.min(iteratorValue, professionMatches.length);
          i++
        ) {
          // console.log(professionMatches[i]);
          console.log("a match");
          selectedReviewers.push(professionMatches[0]);
          selectionCounter += 1;
        }
      }

      if (selectionCounter === 0) {
        function getRandomInt(max) {
          return Math.floor(Math.random() * max);
        }

        const idRow = getRandomInt(promises.length);
        selectedReviewers.push(promises[idRow]);
        selectionCounter += 1;
      }

      var reviewsToReturn = [];

      const submitterInfo = await getNameAndEmail(submitted_user_id);

      for (var i = 0; i < selectionCounter; i++) {
        // pool.query(
        //   `INSERT INTO reviews (submission_id, user_id)
        // VALUES ($1, $2)`,
        //   [submission_id, selectedReviewers[i]]
        // );

        const reviewIDToPush = await submitIntoReviews(
          submission_id,
          selectedReviewers[i].id
        );
        reviewsToReturn.push({
          review_id: reviewIDToPush,
          user_email: selectedReviewers[i].email,
          name: selectedReviewers[i].name,
        });
      }

      res.json({
        success: true,
        reviews: reviewsToReturn,
        submission_id: submission_id,
        submitterName: submitterInfo.name,
        submitterEmail: submitterInfo.email,
      });
    }
  );
});

module.exports = {
  matchRouter,
};
