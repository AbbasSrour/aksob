from __future__ import annotations

import math
import os
import struct
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "apps/web/public/textures/texture.png"
TEXTURE_DIR = ROOT / "apps/web/public/models/textures"
ASSET_DIR = ROOT / "assets"
TMP = Path("/tmp/opencode/aksob-round-table")

BASE = TEXTURE_DIR / "tabletop_basecolor_4k.png"
ROUGHNESS = TEXTURE_DIR / "tabletop_roughness_4k.png"
NORMAL = TEXTURE_DIR / "tabletop_normal_4k.png"
AO = TEXTURE_DIR / "tabletop_ao_2k.png"
BLEND = ASSET_DIR / "round-table.blend"
GLB = ROOT / "apps/web/public/models/round-table.glb"


def run(command: list[str]) -> None:
	subprocess.run(command, check=True, cwd=ROOT)


def read_ppm(path: Path) -> tuple[int, int, bytearray]:
	data = path.read_bytes()
	if not data.startswith(b"P6"):
		raise ValueError(f"Unsupported PPM: {path}")
	index = 2
	values: list[bytes] = []
	while len(values) < 3:
		while data[index:index + 1].isspace():
			index += 1
		if data[index:index + 1] == b"#":
			while data[index:index + 1] != b"\n":
				index += 1
			continue
		start = index
		while not data[index:index + 1].isspace():
			index += 1
		values.append(data[start:index])
	while data[index:index + 1].isspace():
		index += 1
	width, height, max_value = (int(value) for value in values)
	if max_value != 255:
		raise ValueError("Expected 8-bit PPM")
	return width, height, bytearray(data[index:])


def write_ppm(path: Path, width: int, height: int, pixels: bytearray) -> None:
	path.write_bytes(f"P6\n{width} {height}\n255\n".encode() + bytes(pixels))


def blur_gray(values: list[float], width: int, height: int, radius: int) -> list[float]:
	if radius <= 0:
		return values[:]
	window = radius * 2 + 1
	tmp = [0.0] * (width * height)
	out = [0.0] * (width * height)
	for y in range(height):
		acc = 0.0
		for x in range(-radius, width + radius):
			if x + radius < width:
				acc += values[y * width + max(0, x + radius)]
			if x - radius - 1 >= 0:
				acc -= values[y * width + min(width - 1, x - radius - 1)]
			if 0 <= x < width:
				tmp[y * width + x] = acc / window
	for x in range(width):
		acc = 0.0
		for y in range(-radius, height + radius):
			if y + radius < height:
				acc += tmp[max(0, y + radius) * width + x]
			if y - radius - 1 >= 0:
				acc -= tmp[min(height - 1, y - radius - 1) * width + x]
			if 0 <= y < height:
				out[y * width + x] = acc / window
	return out


def make_maps() -> None:
	TEXTURE_DIR.mkdir(parents=True, exist_ok=True)
	TMP.mkdir(parents=True, exist_ok=True)
	source_ppm = TMP / "source_4k.ppm"
	run(["magick", str(SOURCE), "-resize", "4096x4096!", str(source_ppm)])
	width, height, pixels = read_ppm(source_ppm)
	count = width * height
	luma = [0.0] * count
	green_bias = [0.0] * count
	for i in range(count):
		r = pixels[i * 3] / 255.0
		g = pixels[i * 3 + 1] / 255.0
		b = pixels[i * 3 + 2] / 255.0
		luma[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b
		green_bias[i] = max(0.0, g - (r + b) * 0.5)

	large = blur_gray(luma, width, height, 34)
	small = blur_gray(luma, width, height, 3)
	body_cloud = blur_gray(green_bias, width, height, 64)
	base_pixels = bytearray(count * 3)
	rough_pixels = bytearray(count * 3)
	height_values = [0.0] * count
	for i in range(count):
		fine = max(0.0, small[i] - large[i] * 0.94)
		vein = max(0.0, min(1.0, (fine - 0.018) * 9.0))
		vein = vein ** 1.38
		bright_vein = max(0.0, min(1.0, (luma[i] - 0.36) * 3.3)) ** 1.25
		vein = max(vein * 0.9, bright_vein * 0.72)
		cloud = max(0.0, min(1.0, (body_cloud[i] - 0.02) * 5.0))
		shade = max(-0.11, min(0.12, (large[i] - 0.22) * 0.55))

		body = (
			0.040 + shade * 0.075 + cloud * 0.014,
			0.132 + shade * 0.135 + cloud * 0.024,
			0.116 + shade * 0.120 + cloud * 0.020,
		)
		mineral = (0.48, 0.52, 0.48)
		muted_vein = vein * 0.38
		r = body[0] * (1.0 - muted_vein) + mineral[0] * muted_vein
		g = body[1] * (1.0 - muted_vein) + mineral[1] * muted_vein
		b = body[2] * (1.0 - muted_vein) + mineral[2] * muted_vein
		# Keep the table in the reference's near-black academic green range.
		r = max(0.022, min(0.44, r * 0.82))
		g = max(0.055, min(0.46, g * 0.84))
		b = max(0.050, min(0.42, b * 0.82))
		base_pixels[i * 3] = int(round(r * 255))
		base_pixels[i * 3 + 1] = int(round(g * 255))
		base_pixels[i * 3 + 2] = int(round(b * 255))

		micro = (math.sin(i * 12.9898 % 8192) * 43758.5453) % 1.0
		rough = 0.255 + vein * 0.058 + cloud * 0.016 + (micro - 0.5) * 0.008
		rough = max(0.235, min(0.34, rough))
		rv = int(round(rough * 255))
		rough_pixels[i * 3] = rv
		rough_pixels[i * 3 + 1] = rv
		rough_pixels[i * 3 + 2] = rv

		height_values[i] = vein * 0.36 + max(0.0, small[i] - 0.22) * 0.08 + micro * 0.008

	height_values = blur_gray(height_values, width, height, 1)
	normal_pixels = bytearray(count * 3)
	strength = 1.35
	for y in range(height):
		for x in range(width):
			i = y * width + x
			x0 = y * width + max(0, x - 1)
			x1 = y * width + min(width - 1, x + 1)
			y0 = max(0, y - 1) * width + x
			y1 = min(height - 1, y + 1) * width + x
			dx = (height_values[x1] - height_values[x0]) * strength
			dy = (height_values[y1] - height_values[y0]) * strength
			nx = -dx
			ny = -dy
			nz = 1.0
			length = math.sqrt(nx * nx + ny * ny + nz * nz)
			nx /= length
			ny /= length
			nz /= length
			normal_pixels[i * 3] = int(round((nx * 0.5 + 0.5) * 255))
			normal_pixels[i * 3 + 1] = int(round((ny * 0.5 + 0.5) * 255))
			normal_pixels[i * 3 + 2] = int(round((nz * 0.5 + 0.5) * 255))

	base_ppm = TMP / "tabletop_basecolor_4k.ppm"
	rough_ppm = TMP / "tabletop_roughness_4k.ppm"
	normal_ppm = TMP / "tabletop_normal_4k.ppm"
	write_ppm(base_ppm, width, height, base_pixels)
	write_ppm(rough_ppm, width, height, rough_pixels)
	write_ppm(normal_ppm, width, height, normal_pixels)
	run(["magick", str(base_ppm), "-define", "png:color-type=2", "-define", "png:compression-level=9", str(BASE)])
	run(["magick", str(rough_ppm), "-define", "png:color-type=0", "-define", "png:compression-level=9", str(ROUGHNESS)])
	run(["magick", str(normal_ppm), "-define", "png:compression-level=9", str(NORMAL)])
	run(["magick", "-size", "2048x2048", "xc:gray(94%)", "-depth", "8", "-define", "png:color-type=0", str(AO)])


def make_blender_script() -> Path:
	script = TMP / "build_round_table_scene.py"
	script.write_text(
		f'''
import bpy
import math
from mathutils import Vector

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()
bpy.context.scene.unit_settings.system = "METRIC"
bpy.context.scene.unit_settings.scale_length = 1.0

base_path = r"{BASE}"
rough_path = r"{ROUGHNESS}"
normal_path = r"{NORMAL}"
blend_path = r"{BLEND}"
glb_path = r"{GLB}"

def mat_principled(name, color, metallic=0.0, roughness=0.5):
	mat = bpy.data.materials.new(name)
	mat.use_nodes = True
	bsdf = mat.node_tree.nodes.get("Principled BSDF")
	bsdf.inputs["Base Color"].default_value = color
	bsdf.inputs["Metallic"].default_value = metallic
	bsdf.inputs["Roughness"].default_value = roughness
	return mat, bsdf

table_mat, table_bsdf = mat_principled("tabletop_pbr_dark_green_stone", (0.055, 0.18, 0.16, 1), 0.0, 0.245)
nodes = table_mat.node_tree.nodes
links = table_mat.node_tree.links
base_node = nodes.new("ShaderNodeTexImage")
base_node.name = "tabletop_basecolor_4k"
base_node.image = bpy.data.images.load(base_path)
base_node.image.colorspace_settings.name = "sRGB"
links.new(base_node.outputs["Color"], table_bsdf.inputs["Base Color"])
rough_node = nodes.new("ShaderNodeTexImage")
rough_node.name = "tabletop_roughness_4k"
rough_node.image = bpy.data.images.load(rough_path)
rough_node.image.colorspace_settings.name = "Non-Color"
links.new(rough_node.outputs["Color"], table_bsdf.inputs["Roughness"])
normal_node = nodes.new("ShaderNodeTexImage")
normal_node.name = "tabletop_normal_4k"
normal_node.image = bpy.data.images.load(normal_path)
normal_node.image.colorspace_settings.name = "Non-Color"
normal_map = nodes.new("ShaderNodeNormalMap")
normal_map.inputs["Strength"].default_value = 0.34
links.new(normal_node.outputs["Color"], normal_map.inputs["Color"])
links.new(normal_map.outputs["Normal"], table_bsdf.inputs["Normal"])

edge_mat, _ = mat_principled("tabletop_quiet_dark_green_edge", (0.035, 0.09, 0.08, 1), 0.0, 0.42)
underside_mat, _ = mat_principled("tabletop_underside_near_black_green", (0.015, 0.024, 0.021, 1), 0.0, 0.56)
brass_mat, _ = mat_principled("satin_machined_brass", (0.69, 0.49, 0.21, 1), 1.0, 0.24)
metal_mat, _ = mat_principled("dark_powder_coated_pedestal", (0.018, 0.023, 0.021, 1), 0.0, 0.52)

segments = 384
top_r = 0.819
trim_outer_r = 0.825
z_top = 0.740
z_under = 0.684

verts = []
faces = []
uvs = []
mats = []

def ring(radius, z):
	start = len(verts)
	for s in range(segments):
		a = 2 * math.pi * s / segments
		x = math.cos(a) * radius
		y = math.sin(a) * radius
		verts.append((x, y, z))
		uvs.append((0.5 + x / (top_r * 2.0), 0.5 + y / (top_r * 2.0)))
	return list(range(start, start + segments))

center_top = len(verts)
verts.append((0, 0, z_top))
uvs.append((0.5, 0.5))
top = ring(top_r, z_top)
side_top = ring(top_r, z_top - 0.005)
side_bottom = ring(top_r, z_under + 0.003)
under = ring(top_r - 0.010, z_under)
center_under = len(verts)
verts.append((0, 0, z_under))
uvs.append((0.5, 0.5))

for s in range(segments):
	n = (s + 1) % segments
	faces.append((center_top, top[s], top[n])); mats.append(0)
	faces.append((top[s], side_top[s], side_top[n], top[n])); mats.append(1)
	faces.append((side_top[s], side_bottom[s], side_bottom[n], side_top[n])); mats.append(1)
	faces.append((side_bottom[s], under[s], under[n], side_bottom[n])); mats.append(2)
	faces.append((center_under, under[n], under[s])); mats.append(2)

mesh = bpy.data.meshes.new("tabletop_core_mesh")
mesh.from_pydata(verts, [], faces)
mesh.update()
tabletop = bpy.data.objects.new("tabletop_core", mesh)
bpy.context.collection.objects.link(tabletop)
tabletop.data.materials.append(table_mat)
tabletop.data.materials.append(edge_mat)
tabletop.data.materials.append(underside_mat)
for poly, mat_index in zip(tabletop.data.polygons, mats):
	poly.material_index = mat_index
uv_layer = tabletop.data.uv_layers.new(name="UVMap")
for poly in tabletop.data.polygons:
	for loop_index in poly.loop_indices:
		uv_layer.data[loop_index].uv = uvs[tabletop.data.loops[loop_index].vertex_index]
bpy.context.view_layer.objects.active = tabletop
tabletop.select_set(True)
bpy.ops.object.shade_smooth()
bevel = tabletop.modifiers.new("machined_soft_edge_bevel", "BEVEL")
bevel.width = 0.003
bevel.segments = 5
bevel.affect = "EDGES"
weighted = tabletop.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
weighted.keep_sharp = True
bpy.ops.object.modifier_apply(modifier=bevel.name)
bpy.ops.object.modifier_apply(modifier=weighted.name)
tabletop.select_set(False)

def add_cylinder(name, radius, depth, z, material, vertices=384):
	bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=(0, 0, z))
	obj = bpy.context.object
	obj.name = name
	obj.data.name = f"{{name}}_mesh"
	obj.data.materials.append(material)
	bpy.ops.object.shade_smooth()
	bev = obj.modifiers.new("small_chamfers", "BEVEL")
	bev.width = 0.0025
	bev.segments = 3
	bev.affect = "EDGES"
	wn = obj.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
	bpy.ops.object.modifier_apply(modifier=bev.name)
	bpy.ops.object.modifier_apply(modifier=wn.name)
	return obj

# Thin brass reveal and side drop as separate machined geometry.
bpy.ops.mesh.primitive_torus_add(major_radius=(trim_outer_r + top_r) * 0.5, minor_radius=(trim_outer_r - top_r) * 0.5, major_segments=384, minor_segments=12, location=(0, 0, z_top - 0.001))
trim_top = bpy.context.object
trim_top.name = "tabletop_brass_trim_top_reveal"
trim_top.data.materials.append(brass_mat)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cylinder_add(vertices=384, radius=trim_outer_r, depth=0.009, location=(0, 0, z_top - 0.0085))
trim_drop = bpy.context.object
trim_drop.name = "tabletop_brass_trim"
trim_drop.data.materials.append(brass_mat)
bpy.ops.object.shade_smooth()
solid = trim_drop.modifiers.new("thin_ring_shell", "SOLIDIFY")
solid.thickness = 0.002
solid.offset = -1
bev = trim_drop.modifiers.new("trim_softened_edges", "BEVEL")
bev.width = 0.0012
bev.segments = 3
wn = trim_drop.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
bpy.context.view_layer.objects.active = trim_drop
bpy.ops.object.modifier_apply(modifier=solid.name)
bpy.ops.object.modifier_apply(modifier=bev.name)
bpy.ops.object.modifier_apply(modifier=wn.name)
bpy.ops.object.select_all(action="DESELECT")
trim_top.select_set(True)
trim_drop.select_set(True)
bpy.context.view_layer.objects.active = trim_drop
bpy.ops.object.join()
trim_drop = bpy.context.object
trim_drop.name = "tabletop_brass_trim"
trim_drop.data.name = "tabletop_brass_trim_mesh"

# Pedestal with subtle taper by lathe profile.
profile = [(0.061, 0.684), (0.059, 0.540), (0.056, 0.380), (0.057, 0.155), (0.059, 0.074)]
verts = []
faces = []
for r, z in profile:
	for s in range(segments):
		a = 2 * math.pi * s / segments
		verts.append((math.cos(a) * r, math.sin(a) * r, z))
for j in range(len(profile) - 1):
	for s in range(segments):
		n = (s + 1) % segments
		faces.append((j * segments + s, (j + 1) * segments + s, (j + 1) * segments + n, j * segments + n))
mesh = bpy.data.meshes.new("pedestal_column_mesh")
mesh.from_pydata(verts, [], faces)
mesh.update()
ped = bpy.data.objects.new("pedestal_column", mesh)
bpy.context.collection.objects.link(ped)
ped.data.materials.append(metal_mat)
bpy.context.view_layer.objects.active = ped
ped.select_set(True)
bpy.ops.object.shade_smooth()
ped.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
bpy.ops.object.modifier_apply(modifier="weighted_normals")
ped.select_set(False)

base = add_cylinder("pedestal_base", 0.260, 0.018, 0.009, metal_mat)
bpy.ops.mesh.primitive_cone_add(vertices=384, radius1=0.118, radius2=0.059, depth=0.042, location=(0, 0, 0.039))
flare = bpy.context.object
flare.name = "pedestal_lower_flare"
flare.data.materials.append(metal_mat)
bpy.ops.object.shade_smooth()
flare.modifiers.new("weighted_normals", "WEIGHTED_NORMAL")
bpy.ops.object.modifier_apply(modifier="weighted_normals")
bpy.ops.object.select_all(action="DESELECT")
base.select_set(True)
flare.select_set(True)
bpy.context.view_layer.objects.active = base
bpy.ops.object.join()
base = bpy.context.object
base.name = "pedestal_base"
base.data.name = "pedestal_base_mesh"

for obj in bpy.context.scene.objects:
	obj.select_set(True)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
for obj in bpy.context.scene.objects:
	obj.select_set(False)

for obj in bpy.context.scene.objects:
	if hasattr(obj.data, "materials"):
		for index in reversed(range(len(obj.data.materials))):
			material = obj.data.materials[index]
			if material and material.name == "Material":
				obj.data.materials.pop(index=index)

for material in list(bpy.data.materials):
	if material.users == 0:
		bpy.data.materials.remove(material)

# Product-look validation camera/lights saved in the .blend.
bpy.ops.object.light_add(type="AREA", location=(1.8, -2.2, 3.2))
key = bpy.context.object
key.name = "soft_studio_key"
key.data.energy = 550
key.data.size = 2.8
bpy.ops.object.camera_add(location=(0, -0.15, 4.0), rotation=(0, 0, 0))
cam = bpy.context.object
cam.name = "top_down_validation_camera"
cam.data.type = "ORTHO"
cam.data.ortho_scale = 2.2
bpy.context.scene.camera = cam

bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.export_scene.gltf(filepath=glb_path, export_format="GLB", export_apply=True, export_materials="EXPORT", export_image_format="AUTO")
''',
		encoding="utf-8",
	)
	return script


def main() -> None:
	make_maps()
	script = make_blender_script()
	run(["blender", "--background", "--python", str(script)])


if __name__ == "__main__":
	main()
