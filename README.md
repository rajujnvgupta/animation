# animation
Editing basic 3D model properties of a given file using blender python package
# dependency
    all dependency are there in package.json file
# start server command
node apps

# server url
http://localhost:8003


# ############################## API END POINT DOCUMENTATION ##################################################

 # (get method to render to upload page) 
/upload

# (POST method) upload end point to upload fbx file on server to /public/models/  path
/upload/upload 

# (GET method) convert fbx_file which is on path /public/models/ into glb then render to UI. GLB file path /public/export_glb
/convert?fbxfile_name=Curved_Plane.fbx  //this for fbx to glb conversion api and then render

# (GET method)  below end point is for rendering glb file which is on path /public/export_gbl/
/model-viewer?glbfile_name=Curved_Plane_raju.glb // this is for rendering glb file

# (GET method) scale end point is to change scale factor of fbx file
/scale?fbxfile_name=Curved_Plane.fbx                // run scale script to change scale

# #####################################################################################################



