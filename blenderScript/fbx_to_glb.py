import bpy
import os
import sys

# Set the path to the FBX file and the output GLB file
input_file = sys.argv[4]
print('input file', input_file)
output_file = sys.argv[5]
print('output_file file', output_file)
# scale_factor = float(sys.argv[6])
# print('scale factor', scale_factor)
fbx_file_path = input_file
output_file_path = output_file

# Clear the existing scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Import the FBX file
bpy.ops.import_scene.fbx(filepath=fbx_file_path)

# Export to GLB
bpy.ops.export_scene.gltf(filepath=output_file_path, export_format='GLB')

print(f"Converted {fbx_file_path} to {output_file_path}")
