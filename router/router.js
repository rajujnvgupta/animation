const express = require("express"); 
const router = express.Router();
const InfraController = require("../controller/InfraController");
router.get("/host", InfraController.HostList)

module.exports = router;
