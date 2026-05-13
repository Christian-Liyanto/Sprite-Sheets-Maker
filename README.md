# Sprite Sheets Maker

A local browser-based tool for converting animated media into sprite sheets with metadata.

## Run

Use Node directly:

```powershell
node server.js
```

Then open:

```text
http://localhost:4173
```

On Windows you can also double-click `start.bat`.

## Features

- Decode animated images with `ImageDecoder` when the browser supports it: GIF, animated WEBP, APNG.
- Decode video through the browser video engine: MP4, WEBM, MOV, AVI, and MKV support depends on installed browser codecs.
- Select multiple ordered image files and pack them as one sprite sheet.
- Use separate Sprite Sheet Converter and Background Remover pages.
- Preview the first background-removed frame, including resize, fit, transparency, and crop settings.
- Resize frames to source size, a fixed custom size, or source size multiplied by a factor.
- Fit frames by contain, cover, or stretch.
- Remove duplicate consecutive frames with a percentage threshold and fold their duration into the kept frame.
- Remove only edge-connected background regions by selected chroma color or top-left pixel with percentage tolerance.
- Refine alpha edges, despill contaminated edge colors, and clean transparent RGB to reduce export halos.
- Bleed foreground RGB into transparent edges and extrude frame edges into sheet padding to reduce filtering artifacts.
- Remove low-alpha residue before RGB bleeding so tiny background noise does not survive extraction.
- Crop transparent bounds globally or per frame.
- Export a PNG sprite sheet and JSON, XML, or CSV metadata.

## Notes

This project does not clone or depend on an existing sprite-sheet project. It is vanilla HTML, CSS, and JavaScript served by a tiny local Node server.

For maximum video format coverage, a future optional FFmpeg bridge can be added. The current version stays dependency-free and uses browser-native decoding.
