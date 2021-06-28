const { pool } = require("../../dbConfig");
const getSongs = async (userId) => {
  try {
    var results = await pool.query(
      `SELECT id, title, url FROM songs WHERE user_id = $1`,
      [userId]
    );
    return results;
  } catch (err) {
    console.log("err");
    throw err;
  }
};

const getAccomplishments = async (userId) => {
  try {
    var results = await pool.query(
      `SELECT id, title, description, date FROM accomplishments WHERE user_id = $1`,
      [userId]
    );
    return results;
  } catch (err) {
    console.log("err");
    throw err;
  }
};

const getGenres = async (userId) => {
  try {
    var results = await pool.query(
      `SELECT rap, blues, indie, country, edm FROM genres WHERE user_id = $1`,
      [userId]
    );
    return results;
  } catch (err) {
    console.log("genre");
    throw err;
  }
};

const getProfessions = async (userId) => {
  try {
    var results = await pool.query(
      `SELECT singer, songwriter, audio_engineer, producer FROM professions WHERE user_id = $1`,
      [userId]
    );
    return results;
  } catch (err) {
    console.log("prof");
    throw err;
  }
};

module.exports = {
  getSongs,
  getAccomplishments,
  getGenres,
  getProfessions,
};
