const moment = require("moment-timezone");
const express = require("express");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const path = require("path");
const API_Handler = require("./handler/APIHandler");
const app = express();
const multer = require("multer");

app.use(cors({ origin: "*" }));
const server = http.createServer(app);

// new API_Handler().handleApiRequestOn(app); // http handler

// app.set("views", path.join(__dirname, "views")); //this is optional
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);

app.set("views", path.join(__dirname, "views"));
app.get("/test", (req, res) => {
  res.send("server working");
});
app.get("/model-viewer", (req, res) => {
  //   res.render("model-viewer");
  let modelPath = "models/curve_plane_output.glb";
  res.render("model-viewer", { modelPath });
});
app.use((req, res, next) => {
  throw new HttpError("Can not find this route on SERVER", 404); //
});
app.use((error, req, res, next) => {
  return res
    .status(error.statusCode || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

const PORT = process.env.APP_PORT || 8003;
server.listen(PORT, () => {
  console.log(
    "\n",
    "Server                                     :        WebSocket & API"
  );
  console.log(
    "\n",
    `PORT                                       :        ${PORT}`
  );
});
server.setTimeout(60000);
/*
// Example using Express.js
const express = require("express");
const path = require("path");
// const ejs = require("ejs");
const app = express();
const ejs = require("ejs");

// Serve static files (e.g., GLB models)
app.use(express.static(path.join(__dirname, "models")));

app.use("/models", express.static(path.join(__dirname, "models")));

app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.get("/", (req, res) => {
  res.send("rajue testing");
});
app.get("/model-viewer", (req, res) => {
  res.render("model-viewer", { modelPath: "models/curve_plane_output.glb" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
*/
