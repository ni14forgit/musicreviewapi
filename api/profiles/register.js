const { Router } = require("express");
const registerRouter = Router();
const { pool } = require("../../dbConfig");
const bcrypt = require("bcrypt");
const uuid = require("uuid/v4");
// const session = require("express-session");

// const GENRES = ["genre1", "genre2", "genre3", "genre4", "genre5"];
// const PROFESSIONS = [
//   "profession1",
//   "profession2",
//   "profession3",
//   "profession4",
// ];

// const convertGenreToText = (options) => {
//   var genrestring = "";

//   for (var i = 0; i < GENRES.length; i++) {
//     if (options[i]) {
//       genrestring += GENRES[i] + ", ";
//     }
//   }
//   genrestring = genrestring.slice(0, -2);

//   return genrestring;
// };

// const convertProfessionToText = (options) => {
//   var professionstring = "";

//   for (var i = 0; i < PROFESSIONS.length; i++) {
//     if (options[i]) {
//       professionstring += PROFESSIONS[i] + ", ";
//     }
//   }
//   professionstring = professionstring.slice(0, -2);

//   return professionstring;
// };

// registerRouter.use(
//   session({
//     secret: "secret-key",
//     resave: false,
//     saveUninitialized: false,
//     secure: false,
//   })
// );

registerRouter.post("/", async (req, res) => {
  console.log("users/register reached");
  let {
    name,
    email,
    password,
    profilephoto,
    songs,
    genres,
    professions,
    spotify,
    soundcloud,
    instagram,
  } = req.body;
  console.log({
    name,
    email,
    password,
    profilephoto,
    songs,
    genres,
    professions,
    spotify,
    soundcloud,
    instagram,
  });

  let hashedPassword = await bcrypt.hash(password, 10);

  const registerUser = async () => {
    try {
      var results = await pool.query(
        `INSERT INTO users (name, email, password, profile_photo, spotify, instagram, soundcloud)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, password`,
        [
          name,
          email,
          hashedPassword,
          profilephoto.path_to_profile_photo,
          spotify,
          instagram,
          soundcloud,
        ]
      );
      return results;
    } catch (err) {
      throw err;
    }
  };

  const insertSongs = async (id) => {
    var iterateOverSongs;
    for (
      iterateOverSongs = 0;
      iterateOverSongs < songs.songs.length;
      iterateOverSongs++
    ) {
      console.log("inserting song");
      pool.query(
        `INSERT INTO songs (user_id, url, title)
                VALUES ($1, $2, $3)`,
        [
          id,
          songs.songs[iterateOverSongs].path_to_song,
          songs.songs[iterateOverSongs].songname,
        ],
        (err, results) => {
          if (err) {
            console.log(err);
            throw err;
          }
        }
      );
    }
  };

  const insertGenres = async (id) => {
    pool.query(
      `INSERT INTO genres (user_id, rap, indie, country, edm, blues)
          VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, genres.rap, genres.indie, genres.country, genres.edm, genres.blues],
      (err, results) => {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );
  };

  const insertProfessions = async (id) => {
    pool.query(
      `INSERT INTO professions (user_id, singer, songwriter, audio_engineer, producer)
          VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        professions.singer,
        professions.songwriter,
        professions.audio_engineer,
        professions.producer,
      ],
      (err, results) => {
        if (err) {
          console.log(err);
          throw err;
        }
      }
    );
  };

  pool.query(
    `SELECT * FROM users
        WHERE email = $1`,
    [email],
    async (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results.rows);
      if (results.rows.length > 0) {
        console.log("user with this email already exists!");
      } else {
        const registerResults = await registerUser();
        await insertSongs(registerResults.rows[0].id);
        await insertGenres(registerResults.rows[0].id);
        await insertProfessions(registerResults.rows[0].id);
        req.session.userID = registerResults.rows[0].id;
        res.json({ success: true });
      }
    }
  );

  // res.json({ val: 5 });
});

// console.log(insertResults);

module.exports = {
  registerRouter,
};
