const express = require("express");
const routes = require("./router.js");
const uuid = require("uuid").v4;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.headers["request_id"] = uuid();
  next();
});

app.use("/", routes);

app.listen(3001, () => {
  console.log("Server Started");
});
