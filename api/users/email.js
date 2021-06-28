const { pool } = require("../../dbConfig");
const { Router } = require("express");
const emailRouter = Router();
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SEND_GRID);

// process.env.SEND_GRID

emailRouter.post("/onsubmission", async (req, res) => {
  // let { body, subject, review_id } = req.body;
  let { reviews, submission_id, submitterName, submitterEmail } = req.body;

  var messagesToSend = [];

  for (var i = 0; i < reviews.length; i++) {
    const msg = {
      to: reviews[i].user_email,
      from: "ni14@duke.edu",
      subject: "You have a song to review!",
      text: `Hello ${reviews[i].name}, you will be reviewing ${submitterName}'s submission. Please log on to check it out!`,
    };
    messagesToSend.push(msg);
  }

  const msgToSubmitter = {
    to: submitterEmail,
    from: "ni14@duke.edu",
    subject: "We found you reviewer(s)!",
    text: `Hello ${submitterName}, we found you 1-2 reviewers for your recent submission. Please log on and periodically check for updates and take a look at your reviewer's profiles!`,
  };

  messagesToSend.push(msgToSubmitter);

  for (var i = 0; i < messagesToSend.length; i++) {
    sgMail
      .send(messagesToSend[i])
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  }

  res.json({ success: true });
});

emailRouter.post("/onreviewupdate", async (req, res) => {
  let { reviewerName, submitterEmail } = req.body;
  const msgToSubmitter = {
    to: submitterEmail,
    from: "ni14@duke.edu",
    subject: "Update(s) on your music submission!",
    text: `Hello! ${reviewerName} updated their review on your submission. Go check it out!`,
  };

  // console.log(msgToSubmitter);

  sgMail
    .send(msgToSubmitter)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

  res.json({ success: true });
});

module.exports = {
  emailRouter,
};
