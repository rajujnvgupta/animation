const express = require("express");
const cors = require("cors");
const http = require("http");
const fs = require("fs");
const path = require("path");
const app = express();
const multer = require("multer");
const { spawn } = require('child_process');
app.use(cors({ origin: "*" }));
const server = http.createServer(app);
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.engine("ejs", require("ejs").__express);
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.send("server running");
});

//#######################################THIS is for Rendering GLB file ####################################

app.get("/model-viewer", (req, res) => {
  try{
    const glbfile_name = req.query.glbfile_name;
    if(!glbfile_name){
      res.status(400).json({message: "pass glbfile_name in query param"})
    }
    let modelPath = `export_glb/${glbfile_name}`;
    if (!fs.existsSync(path.join(__dirname, `public/${modelPath}`))) {
      console.log('File not exists.');
      return res.status(404).json({message: `file does not exist on path ${modelPath}`})
    }
    console.log(modelPath)
    res.render("model-viewer", { modelPath }); //render glb file
  }catch(error){
    console.log('error while model rendering', error)
    return res.status(500).json({message: error.message || 'errow while glb model rendering'})
  }
});

//#############################################################################################

//########################### change the scale of fbx file  ###################################
const BLENDER_EXECUTABLE = '/home/raju/Downloads/blender-4.2.0-linux-x64/blender';
const SCALE_SCRIPT = 'blenderScript/change_scale.py'
const BLENDER_SCRIPT = path.join(__dirname, SCALE_SCRIPT);

app.get('/scale', (req, res) => {
  try{
    // console.log('blenderexec', BLENDER_EXECUTABLE, BLENDER_SCRIPT)
    const fbxfile_name = req.query.fbxfile_name;
    if(!fbxfile_name){
      res.status(400).json({message: "pass fbxfile_name in query param"})
    }

    console.log(fbxfile_name)
    let FBX_FILE_PATH = `/public/models/${fbxfile_name}`;
    if (!fs.existsSync(path.join(__dirname, FBX_FILE_PATH))) {
      console.log('File not exists.');
      return res.status(404).json({message: `file does not exist on path ${FBX_FILE_PATH}`})
    }
    let output_filename = fbxfile_name.split('.')[0] + '.' + 'fbx'
    const SCALED_FBX_OUTPUT_FILE_PATH = `/public/models/${output_filename}`

    console.log('FBX_FILE_PATH', FBX_FILE_PATH, 'SCALED_FBX_OUTPUT_FILE_PATH', SCALED_FBX_OUTPUT_FILE_PATH)
    const blenderProcess = spawn(BLENDER_EXECUTABLE, ['--background', '--python', BLENDER_SCRIPT, FBX_FILE_PATH, SCALED_FBX_OUTPUT_FILE_PATH, 2.0]);

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
  }catch(error){
    console.log('error while changing scale of bfx file', error)
    return res.status(500).json({message: error.message || 'errow while changing scale of bfx file'})
  }
});


//#######################################################################################################



//#################################THIS is for exporting fbx to glb file ####################################
const fbx_to_glb_script = 'blenderScript/fbx_to_glb.py'
const fbx_to_glb_blenderScript = path.join(__dirname, fbx_to_glb_script);
// Endpoint to trigger the conversion
app.get('/convert', (req, res) => {
  const fbxfile_name = req.query.fbxfile_name;
  if(!fbxfile_name){
    res.status(400).json({message: "pass fbxfile_name in query param"})
  }

  // Update these paths as necessary
  const fbxFilePath = `public/models/${fbxfile_name}`

  if (!fs.existsSync(path.join(__dirname, fbxFilePath))) {
    console.log('File not exists.');
    return res.status(404).json({message: `file does not exist on path ${fbxFilePath}`})
  }

  const output_glb_file = fbxfile_name.split('.')[0]  + '.' + 'glb'
  const outputFilePath = `public/export_glb/${output_glb_file}`;
  const modelPath = `export_glb/${output_glb_file}`

  const blenderProcess = spawn(BLENDER_EXECUTABLE, ['--background', '--python', fbx_to_glb_blenderScript, fbxFilePath, outputFilePath]);

  let conversion_status = false
  blenderProcess.stdout.on('data', (data) => {
    console.log(`fbx to glb conversion completed: ${data}`);
    conversion_status = true
  });

  blenderProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  blenderProcess.on('error', (err) => {
    console.error('Failed to start subprocess.');
    console.error(`Error code: ${err.code}`);
    console.error(`Error message: ${err.message}`);
    res.status(500).send(`Failed to start subprocess: ${err.message}`);
  });

  blenderProcess.on('close', (code, signal) => {
    console.log(`Blender process exited with code ${code} and signal ${signal}`);
    if (code === 0) {
      console.log(`FBX file converted to GLB successfully. file path on server: ${outputFilePath}`)
      // res.status(200).send(`FBX file converted to GLB successfully. file path on server: ${outputFilePath}`);
      res.render("model-viewer", { modelPath });
    } else if(conversion_status) {
      console.log(`FBX file converted to GLB successfully. file path on server: ${outputFilePath}`)
      res.render("model-viewer", { modelPath });
      // res.status(200).send(`FBX file converted to GLB successfully. file path on server: ${outputFilePath}`);
    }else{
      res.status(500).send(`Failed to convert FBX file. Exit code: ${code}, Signal: ${signal}`);
    }
  });
});

//##########################################################################################################


// ###################################### Uploading fbx file ###############################################
const uploadDir = path.join(__dirname, 'public/models');
if (!fs.existsSync(uploadDir)) {
  console.log('before creating directory')
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('creating directory', uploadDir)

}

app.get('/upload', (req, res) => {
  res.render('file_upload');
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {

    cb(null, file.originalname) // + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 } // 1MB limit
}).single('file');

app.post('/upload/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ message: 'File upload failed.', error: err.message });
    }
    console.log('File uploaded successfully:', req.file);
    res.status(200).json({ message: 'File uploaded successfully!', file: req.file });
  });
});

//###############################################################################################


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
    `PORT                                       :        ${PORT}`
  );
});
server.setTimeout(60000);
