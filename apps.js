const moment = require("moment-timezone");
const express = require("express");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const path = require("path");
const API_Handler = require("./handler/APIHandler");
const app = express();
const multer = require("multer");
const { spawn } = require('child_process');

app.use(cors({ origin: "*" }));
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));

app.get("/test", (req, res) => {
  res.send("server running");
});

app.get("/model-viewer", (req, res) => {
  const glbfile_name = req.query.glbfile_name;
  if(!glbfile_name){
    res.status(400).json({message: "pass glbfile_name in query param"})
  }
  let modelPath = `export_glb/${glbfile_name}`;
  if (!fs.existsSync(path.join(__dirname, `public/${modelPath}`))) {
    console.log('File exists.');
    res.status(404).json({message: `file does not exist on path ${modelPath}`})
  }
  console.log(modelPath)
  res.render("model-viewer", { modelPath });

});


const blenderExecutable = '/home/raju/Downloads/blender-4.2.0-linux-x64/blender';
const script = 'blenderScript/change_scale.py'
const blenderScript = path.join(__dirname, script);

app.get('/run-blender', (req, res) => {
  // Spawn a child process to run Blender in background mode with the script
  console.log('blenderexec', blenderExecutable, blenderScript)
  let fbxfilPath = `public/models/Curved_Plane.fbx`;
  const blenderProcess = spawn(blenderExecutable, ['--background', '--python', blenderScript, fbxfilPath, 'Curved_Plane_raju.fbx', 2.0]);
  // console.log(blenderProcess)

  blenderProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  blenderProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  blenderProcess.on('error', (err) => {
    console.error('Failed to start subprocess.');
    console.error(err);
    res.status(500).send('Failed to start subprocess.');
  });

  blenderProcess.on('close', (code) => {
    console.log(`Blender process exited with code ${code}`);
    if (code === 0) {
      res.status(200).send('Blender script executed successfully.');
    } else {
      res.status(500).send('Failed to execute Blender script.');
    }
  });
});

const fbx_to_glb_script = 'blenderScript/fbx_to_glb.py'
const fbx_to_glb_blenderScript = path.join(__dirname, fbx_to_glb_script);
// Endpoint to trigger the conversion
app.get('/convert', (req, res) => {


  const fbxfile_name = req.query.fbxfile_name;
  if(!fbxfile_name){
    res.status(400).json({message: "pass glbfile_name in query param"})
  }
  // Update these paths as necessary
  const fbxFilePath = `public/scale_fbx/${fbxfile_name}`
  const outputFilePath = 'public/export_glb/glb_output.glb';

  const blenderProcess = spawn(blenderExecutable, ['--background', '--python', fbx_to_glb_blenderScript, fbxFilePath, outputFilePath]);

  blenderProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  blenderProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  blenderProcess.on('error', (err) => {
    console.error('Failed to start subprocess.');
    console.error(`Error code: ${err.code}`);
    console.error(`Error signal: ${err.signal}`);
    console.error(`Error message: ${err.message}`);
    res.status(500).send(`Failed to start subprocess: ${err.message}`);
  });

  blenderProcess.on('close', (code, signal) => {
    console.log(`Blender process exited with code ${code} and signal ${signal}`);
    if (code === 0) {
      res.status(200).send('FBX file converted to GLB successfully.');
    } else {
      res.status(500).send(`Failed to convert FBX file. Exit code: ${code}, Signal: ${signal}`);
    }
  });
});

//##########################################################################################################

const uploadDir = path.join(__dirname, 'public/models');
if (!fs.existsSync(uploadDir)) {
  console.log('before creating directory')
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('creating directory', uploadDir)

}


app.get('/', (req, res) => {
  res.render('file_upload');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 } // 1MB limit
}).single('file');

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ message: 'File upload failed.', error: err.message });
    }
    console.log('File uploaded successfully:', req.file);
    res.status(200).json({ message: 'File uploaded successfully!', file: req.file });
  });
});

app.use((req, res, next) => {
  throw new HttpError("Can not find this route on SERVER", 404);
});
app.use((error, req, res, next) => {
  return res
    .status(error.statusCode || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

const PORT = 8003;
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
