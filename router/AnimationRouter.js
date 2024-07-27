const express = require("express");
const router = express.Router();
const BlenderController = require("../controller/BlenderController");

router.get("/blender", BlenderController.Animation);

module.exports = router;
