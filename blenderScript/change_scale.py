import bpy
import sys

# Get the file path and scale factor from the command line arguments
input_file = sys.argv[4]
print('input file', input_file)
output_file = sys.argv[5]
print('output_file file', output_file)
scale_factor = float(sys.argv[6])
print('scale factor', scale_factor)

# Delete all existing objects in the scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import the FBX file
bpy.ops.import_scene.fbx(filepath=input_file)

# Scale all objects in the scene
for obj in bpy.context.scene.objects:
    obj.scale = (scale_factor, scale_factor, scale_factor)

# Export the scaled FBX file
FBX_OUTPUT_PATH = '/home/raju/Desktop/animation/public/scale_fbx/'
output_file = FBX_OUTPUT_PATH + output_file
bpy.ops.export_scene.fbx(filepath=output_file)

