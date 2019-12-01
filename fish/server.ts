require("dotenv").config();
const express = require("express");
const admin = require("firebase-admin");
const atob = require("atob");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(atob(process.env.FB_SA_KEY))),
  databaseURL: "https://push-test-afbe2.firebaseio.com"
});

app.use(cors());
app.use(bodyParser.json({ type: "*/*" }));

app.get("/", function(request, response) {
  response.send({ msg: "ok" });
});

app.post("/register/:tk", (req, res) => {
  const { tk } = req.params;
  admin
    .messaging()
    .subscribeToTopic([tk], process.env.TOPIC)
    .then(function(response) {
      console.log(`Successfully subscribed ${tk} to topic`, response);
      res.send({ msg: `Successfully subscribed ${tk} to topic`, response });
    })
    .catch(function(error) {
      console.log("Error subscribing to topic:", error);
      res.status(500).send(error);
    });
});

app.post("/send", (req, res) => {
  const topic = process.env.TOPIC;
  const { payload, fish } = req.body;

  if (!payload || !fish || fish !== process.env.FISH_KEY) {
    throw "invalid push";
  }

  const message = {
    data: { payload: JSON.stringify(payload) },
    topic
  };

  admin
    .messaging()
    .send(message)
    .then(response => {
      console.log("Successfully sent message:", message);
      res.send({ msg: `Successfully sent msg`, response });
    })
    .catch(error => {
      console.log("Error sending message:", error);
      res.status(500).send(error);
    });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});