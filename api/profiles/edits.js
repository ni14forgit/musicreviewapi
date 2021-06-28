const { Router } = require("express");
const editsRouter = Router();
const { pool } = require("../../dbConfig");

// NSERT INTO users (name, email, password, profile_photo, spotify, instagram, soundcloud, genres, professions)

const tempID = 15;

editsRouter.post("/name", async (req, res) => {
  console.log("edit name reached");

  let { name } = req.body;
  const userId = req.session.userID || tempID;
  console.log("userID edit name");
  console.log(userId);

  pool.query(
    `UPDATE users
    SET name = $1 
    WHERE id = $2`,
    [name, userId],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

editsRouter.post("/sociallinks", async (req, res) => {
  console.log("sociallinks name reached");

  let { instagram, spotify, soundcloud } = req.body;
  const userId = req.session.userID || tempID;

  pool.query(
    `UPDATE users 
    SET soundcloud = $1, 
     spotify = $2,
    instagram = $3 
    WHERE id = $4`,
    [soundcloud, spotify, instagram, userId],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

editsRouter.post("/genres", async (req, res) => {
  console.log("edit genres reached");

  let { genres } = req.body;
  const userId = req.session.userID || tempID;

  console.log(genres);
  console.log(genres.rap);
  console.log(genres.indie);

  pool.query(
    `UPDATE genres
    SET rap = $1,
        blues = $2, 
        country = $3,
        indie = $4, 
        edm = $5
    WHERE user_id = $6`,
    [
      genres.rap,
      genres.blues,
      genres.country,
      genres.indie,
      genres.edm,
      userId,
    ],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

editsRouter.post("/professions", async (req, res) => {
  console.log("edit professions reached");

  let { professions } = req.body;
  const userId = req.session.userID || tempID;

  pool.query(
    `UPDATE professions
    SET audio_engineer = $1,
        songwriter = $2, 
        singer = $3,
        producer = $4
    WHERE user_id = $5`,
    [
      professions.audio_engineer,
      professions.songwriter,
      professions.singer,
      professions.producer,
      userId,
    ],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

editsRouter.post("/profilephoto", async (req, res) => {
  console.log("edit profilephoto reached");

  let { profilephoto } = req.body;
  const userId = req.session.userID || tempID;

  pool.query(
    `UPDATE users
    SET profile_photo = $1 
    WHERE id = $2`,
    [profilephoto.path_to_profile_photo, userId],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

editsRouter.post("/addsong", async (req, res) => {
  console.log("add song reached");

  let { song } = req.body;
  // const song = songs[0]
  const userId = req.session.userID || tempID;
  pool.query(
    `INSERT INTO songs (user_id, url, title)
    VALUES ($1, $2, $3)
    RETURNING id`,
    [userId, song.path_to_song, song.songname],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false, id: results.rows[0].id });
    }
  );
});

editsRouter.post("/deletesong", async (req, res) => {
  console.log("delete song reached");
  let { songid } = req.body;
  const userId = req.session.userID || tempID;
  pool.query(
    `DELETE FROM songs
    WHERE id = $1;`,
    [songid],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

editsRouter.post("/addaccomplishment", async (req, res) => {
  console.log("add accomplishment reached");

  let { accomplishment } = req.body;
  // const song = songs[0]
  const userId = req.session.userID || tempID;
  pool.query(
    `INSERT INTO accomplishments (user_id, title, description, date)
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
    [
      userId,
      accomplishment.title,
      accomplishment.description,
      accomplishment.date,
    ],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      // console.log(results.rows[0].id);
      res.json({ error: false, id: results.rows[0].id });
    }
  );
});

editsRouter.post("/deleteaccomplishment", async (req, res) => {
  console.log("delete accomplishment reached");
  let { accomplishmentId } = req.body;
  pool.query(
    `DELETE FROM accomplishments
    WHERE id = $1;`,
    [accomplishmentId],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

editsRouter.post("/accomplishment", async (req, res) => {
  console.log("accomplishment reached");

  let { accomplishment, accomplishmentId } = req.body;

  pool.query(
    `UPDATE accomplishments
    SET title = $1, 
     description = $2,
    date = $3 
    WHERE id = $4`,
    [
      accomplishment.title,
      accomplishment.description,
      accomplishment.date,
      accomplishmentId,
    ],
    (err, results) => {
      if (err) {
        res.json({ error: true });
        throw err;
      }
      res.json({ error: false });
    }
  );
});

module.exports = {
  editsRouter,
};
