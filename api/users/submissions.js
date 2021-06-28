const { Router } = require("express");
const submissionsRouter = Router();
const { pool } = require("../../dbConfig");

const tempID = 15;

submissionsRouter.post("/submit", async (req, res) => {
  console.log("submit song called");

  let { song, questions, genres, preferredProfessions, date } = req.body;
  const userId = req.session.userID;
  console.log("userId");
  console.log(userId);

  const submitGeneralSubmission = async () => {
    try {
      var results = await pool.query(
        `INSERT INTO submissions (user_id, date)
        VALUES ($1, $2)
        RETURNING id`,
        [userId, date]
      );
      return results;
    } catch (err) {
      console.log("submit submission WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const submitSubmissionSong = async (submission_id) => {
    try {
      var results = await pool.query(
        `INSERT INTO submissionsongs (submission_id, url, title)
        VALUES ($1, $2, $3)
        RETURNING id`,
        [submission_id, song.path_to_song, song.songname]
      );
      return results;
    } catch (err) {
      console.log("submit submission WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const submitSubmissionGenres = async (submission_id) => {
    try {
      var results = await pool.query(
        `INSERT INTO submissiongenres (submission_id, rap, blues, indie, country, edm)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [
          submission_id,
          genres.rap,
          genres.blues,
          genres.indie,
          genres.country,
          genres.edm,
        ]
      );
      return results;
    } catch (err) {
      console.log("submit genres WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const submitSubmissionProfessions = async (submission_id) => {
    try {
      var results = await pool.query(
        `INSERT INTO submissionprofessions (submission_id, singer, songwriter, audio_engineer, producer)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
          submission_id,
          preferredProfessions.singer,
          preferredProfessions.songwriter,
          preferredProfessions.audio_engineer,
          preferredProfessions.producer,
        ]
      );
      return results;
    } catch (err) {
      console.log("submit professions WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const submitSubmissionQuestions = async (submission_id) => {
    var iterateOverQuestions;
    for (
      iterateOverQuestions = 0;
      iterateOverQuestions < questions.length;
      iterateOverQuestions++
    ) {
      console.log("inserting questions");
      pool.query(
        `INSERT INTO submissionquestions (submission_id, question)
                VALUES ($1, $2)`,
        [submission_id, questions[iterateOverQuestions].question],
        (err, results) => {
          if (err) {
            console.log(err);
            console.log("questions wrong");
            res.json({ success: false });
            throw err;
          }
        }
      );
    }
  };

  const submission = await submitGeneralSubmission();
  const submissionID = submission.rows[0].id;
  await submitSubmissionSong(submissionID);
  await submitSubmissionGenres(submissionID);
  await submitSubmissionProfessions(submissionID);
  await submitSubmissionQuestions(submissionID);

  res.json({ success: true, submissionId: submissionID });
});

submissionsRouter.post("/retrieve", async (req, res) => {
  console.log("retrieve submission triggered");

  let { submission_id } = req.body;
  const userId = req.session.userID || tempID;

  const retrieveSubmissionSong = async () => {
    try {
      var results = await pool.query(
        `SELECT * FROM submissionsongs
          WHERE submission_id = $1`,
        [submission_id]
      );
      return results;
    } catch (err) {
      console.log("retrieve submission song WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const retrieveSubmissionQuestions = async () => {
    try {
      var results = await pool.query(
        `SELECT * FROM submissionquestions
          WHERE submission_id = $1`,
        [submission_id]
      );
      return results;
    } catch (err) {
      console.log("retrieve questions song WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const retrieveSubmissionReviewers = async () => {
    try {
      var results = await pool.query(
        `SELECT * FROM reviews
          WHERE submission_id = $1`,
        [submission_id]
      );
      return results;
    } catch (err) {
      console.log("retrieve reviews song WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const retrieveSubmitterUserInfo = async () => {
    try {
      var results = await pool.query(
        `SELECT user_id FROM submissions
          WHERE id = $1`,
        [submission_id]
      );

      const user_id = results.rows[0].user_id;

      const realres = await pool.query(
        `SELECT email FROM users WHERE id = $1`,
        [user_id]
      );

      return realres.rows[0].email;

      // return results;
    } catch (err) {
      console.log("retrieve reviews song WRONG");
      res.json({ success: false });
      throw err;
    }
  };

  const songResult = await retrieveSubmissionSong();
  const questionsResult = await retrieveSubmissionQuestions();
  const reviewersResult = await retrieveSubmissionReviewers();
  const submitterEmail = await retrieveSubmitterUserInfo();

  console.log("olol");
  console.log(submitterEmail);

  res.json({
    success: true,
    song: songResult.rows[0],
    questions: questionsResult.rows,
    reviewers: reviewersResult.rows,
    submitterEmail: submitterEmail,
  });
});

module.exports = {
  submissionsRouter,
};
