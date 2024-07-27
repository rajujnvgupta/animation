const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const CONFIG = require("../config/config");
const AnimationRouter = require("../router/AnimationRouter");
const multer = require("multer");
const fs = require("fs");

class API_Handler {
  handleApiRequestOn = (app) => {
    // app.use(bodyParser.json({ limit: '50mb', extended: true }));
    // app.use(bodyParser.raw({ limit: '50mb', type: '*/*' }));
    // SoftwareRouter.use(bodyParser.raw({ limit: '50mb', type: '*/*' }));
    app.use(bodyParser.json({ limit: "10mb", extended: true }));
    app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
    // app.use(express.static(path.join(__dirname, '../', 'public')));
    // app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));

    app.use((req, res, next) => {
      res.setHeader("Cache-Control", "no-store");
      next();
    });

    app.get("/", (req, res) => {
      res.render("index", { name: "World" });
      //   res.status(200).send("blender project test");
    });
    app.get("", (req, res) => {
      res.status(200).send("bleder project startiing");
    });

    // API Doc
    if (CONFIG.PROJECT == "localhost" || CONFIG.PROJECT == "lab") {
      app.use(express.static(path.join(__dirname, "../", "docs/ui")));
      app.get("/api-doc", async (req, res) => {
        let url = path.join(__dirname, "../", "/docs/ui/index.html");
        console.log(url, " : url");
        res.sendFile(url, {
          headers: {
            "Content-Type": "text/html",
          },
        });
      });
    }
    // app.use('/api/v1/agent', agentRouter)
    // app.use("/api/v1/infra", InfraRouter); //for Infra related  request
    app.use("/animation", AnimationRouter);
  };
}
module.exports = API_Handler;
