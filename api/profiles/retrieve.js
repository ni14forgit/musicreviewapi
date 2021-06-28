const { Router } = require("express");
const retrieveRouter = Router();
const { pool } = require("../../dbConfig");
const {
  getSongs,
  getAccomplishments,
  getProfessions,
  getGenres,
} = require("./helper");

// profile
// name, genres, professions, socialinks, profile_picture
retrieveRouter.get("/", async (req, res) => {
  console.log("retrieve reached");
  const userId = req.session.userID || 15;

  console.log("userID");
  console.log(userId);

  pool.query(
    `SELECT 
      name,
      profile_photo, 
      spotify, 
      instagram, 
      soundcloud,
      reviewer_score 
      FROM users
      WHERE id = $1`,
    [userId],
    async (err, generalResults) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      //   console.log(generalResults);
      const resultsToReturn = generalResults.rows[0];
      const songs = await getSongs(userId);
      const accomplishments = await getAccomplishments(userId);
      const genres = await getGenres(userId);
      const professions = await getProfessions(userId);

      resultsToReturn.songs = songs.rows;
      resultsToReturn.accomplishments = accomplishments.rows;
      resultsToReturn.genres = genres.rows[0];
      resultsToReturn.professions = professions.rows[0];

      res.json({ error: false, profile: resultsToReturn });
    }
  );
});

retrieveRouter.post("/other", async (req, res) => {
  console.log("other retrieve reached");
  // const userId = 15 || req.session.userID;
  let { userId } = req.body;

  pool.query(
    `SELECT 
      name,
      profile_photo, 
      spotify, 
      instagram, 
      soundcloud,
      reviewer_score 
      FROM users
      WHERE id = $1`,
    [userId],
    async (err, generalResults) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      //   console.log(generalResults);
      const resultsToReturn = generalResults.rows[0];
      const songs = await getSongs(userId);
      const accomplishments = await getAccomplishments(userId);
      const genres = await getGenres(userId);
      const professions = await getProfessions(userId);

      resultsToReturn.songs = songs.rows;
      resultsToReturn.accomplishments = accomplishments.rows;
      resultsToReturn.genres = genres.rows[0];
      resultsToReturn.professions = professions.rows[0];

      res.json({ error: false, profile: resultsToReturn });
    }
  );
});

module.exports = {
  retrieveRouter,
};
