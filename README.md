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
- Convert single images, spritesheets, ordered image sequences, or selected folders into deterministic pixel-art outputs.
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

## Pixel Art Converter Architecture

The current implementation is local browser canvas code, but the pipeline is deliberately classical and maps directly to a C# implementation with OpenCvSharp plus ImageSharp or SkiaSharp.

Suggested C# modules:

- `ImageLoader`: reads PNG/WebP/JPEG/GIF frames or image sequences into RGBA buffers.
- `EdgeAnalyzer`: computes luminance plus alpha-aware Sobel edges.
- `Preprocessor`: smooths only low-edge, low-color-distance neighborhoods.
- `EdgeAwareResampler`: downsamples blocks with edge-weighted and alpha-weighted sampling.
- `RetracePass`: posterizes hue, saturation, lightness, and alpha before palette reduction so the result reads as redrawn pixel art instead of a blurred resize.
- `PaletteBuilder`: creates fixed palettes, deterministic retrace palettes, Median Cut, or K-means adaptive palettes.
- `Quantizer`: maps pixels to nearest palette color with optional Floyd-Steinberg or ordered Bayer dithering.
- `ClusterCleaner`: removes isolated one-pixel noise and merges tiny color islands while preserving strong edge-map pixels.
- `OutlinePass`: retraces alpha-boundary and dark contour pixels to improve sprite readability.
- `AlphaCleaner`: removes low-alpha residue, bleeds foreground RGB into transparent pixels, and preserves alpha.
- `SheetPacker`: packs converted frames into a single sheet with padding and edge extrusion.

Processing stages:

1. Load RGBA image or ordered sequence frames.
2. Compute alpha-aware Sobel edge map.
3. Smooth noisy gradients only where edge strength is low.
4. Edge-aware downsample to target sprite size.
5. Posterize local forms into retrace-friendly hue and shade bands.
6. Build retrace, adaptive, or fixed palette, typically 16-128 colors.
7. Quantize with optional dithering.
8. Cel-shade matching hue/lightness bands for clustered shading.
9. Clean isolated clusters and merge tiny color islands while protecting intentional edges.
10. Retrace silhouette and internal dark contour pixels.
11. Clean alpha and transparent RGB.
12. Upscale with nearest neighbor only.
13. Pack batch frames into one sheet.

Edge-aware downsampling pseudocode:

```text
for each output pixel:
  sourceRect = source pixels covered by output pixel
  for each source pixel in sourceRect:
    edgeWeight = 1 + edgeMap[pixel] * edgeStrength
    alphaWeight = max(alpha, smallValue)
    weight = edgeWeight * alphaWeight
    accumulate RGB using weight
    accumulate alpha using edgeWeight
  output = weighted average
```

Adaptive quantization pseudocode:

```text
pixels = all non-transparent RGB pixels
boxes = [pixels]
while boxes.count < paletteSize:
  box = box with widest RGB channel range
  sort box pixels by widest channel
  split at median
palette = average color of each box
for each pixel:
  replace RGB with nearest palette color
```

Retrace palette pseudocode:

```text
for each visible pixel:
  convert RGB to HSL
  bucket by hue family, saturation band, and lightness band
  accumulate weighted average color per bucket
sort buckets by coverage
palette = largest buckets up to target color count
add a compatible dark outline color when space remains
```

Deterministic K-means quantization pseudocode:

```text
sample non-transparent pixels with a deterministic stride
initialize centers from Median Cut
repeat fixed iteration count:
  assign each pixel to nearest center
  replace each center with the mean of assigned pixels
for each pixel:
  replace RGB with nearest center
```

Optimization strategies:

- Use typed contiguous RGBA buffers (`Span<byte>` / `Memory<byte>` in C#, `Uint8ClampedArray` in JS).
- Reuse scratch buffers for edge maps, quantization work buffers, and masks.
- Process frames independently so sequences can be parallelized with `Parallel.ForEach`.
- Limit median-cut input by deterministic stride sampling for very large images.
- Keep pixel-art sharpness by disabling interpolation except in explicit preprocessing and by using nearest-neighbor reconstruction only.
- Run RGB bleeding after alpha cleanup so removed residue cannot contaminate transparent pixels.

## Notes

This project does not clone or depend on an existing sprite-sheet project. It is vanilla HTML, CSS, and JavaScript served by a tiny local Node server.

For maximum video format coverage, a future optional FFmpeg bridge can be added. The current version stays dependency-free and uses browser-native decoding.
