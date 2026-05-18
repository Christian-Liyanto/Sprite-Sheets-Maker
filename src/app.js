const $ = (id) => document.getElementById(id);

const ui = {
  codecStatus: $("codecStatus"),
  tabButtons: document.querySelectorAll("[data-page-target]"),
  toolPages: document.querySelectorAll("[data-page]"),
  dropZone: $("dropZone"),
  fileInput: $("fileInput"),
  fileMeta: $("fileMeta"),
  backgroundDropZone: $("backgroundDropZone"),
  backgroundFileInput: $("backgroundFileInput"),
  backgroundFileMeta: $("backgroundFileMeta"),
  sourcePreviewMeta: $("sourcePreviewMeta"),
  sourceFramePreview: $("sourceFramePreview"),
  sourcePreviewEmpty: $("sourcePreviewEmpty"),
  convertBtn: $("convertBtn"),
  progress: $("progress"),
  useSourceFps: $("useSourceFps"),
  sampleFpsField: $("sampleFpsField"),
  sampleFps: $("sampleFps"),
  useSourceFrameCount: $("useSourceFrameCount"),
  maxFramesField: $("maxFramesField"),
  maxFrames: $("maxFrames"),
  removeDuplicates: $("removeDuplicates"),
  duplicateThresholdField: $("duplicateThresholdField"),
  duplicateThreshold: $("duplicateThreshold"),
  sizeMode: $("sizeMode"),
  customSizeFields: $("customSizeFields"),
  frameWidth: $("frameWidth"),
  frameHeight: $("frameHeight"),
  multiplierField: $("multiplierField"),
  multiplier: $("multiplier"),
  fitModeField: $("fitModeField"),
  fitMode: $("fitMode"),
  backgroundMode: $("backgroundMode"),
  keyColorField: $("keyColorField"),
  keyColor: $("keyColor"),
  keyToleranceField: $("keyToleranceField"),
  keyTolerance: $("keyTolerance"),
  alphaNoiseField: $("alphaNoiseField"),
  alphaNoise: $("alphaNoise"),
  matteRefineField: $("matteRefineField"),
  matteRefine: $("matteRefine"),
  despillField: $("despillField"),
  despillEdges: $("despillEdges"),
  transparentRgbField: $("transparentRgbField"),
  cleanTransparentRgb: $("cleanTransparentRgb"),
  edgeExtrusionField: $("edgeExtrusionField"),
  edgeExtrusion: $("edgeExtrusion"),
  cropMode: $("cropMode"),
  columns: $("columns"),
  padding: $("padding"),
  pivotX: $("pivotX"),
  pivotY: $("pivotY"),
  metadataFormat: $("metadataFormat"),
  sheetCanvas: $("sheetCanvas"),
  emptyState: $("emptyState"),
  summary: $("summary"),
  downloadPng: $("downloadPng"),
  downloadMeta: $("downloadMeta"),
  downloadBgPreview: $("downloadBgPreview"),
  conversionBackdrop: $("conversionBackdrop"),
  conversionTitle: $("conversionTitle"),
  conversionMessage: $("conversionMessage"),
  conversionProgressBar: $("conversionProgressBar"),
  conversionProgressValue: $("conversionProgressValue"),
  pixelDropZone: $("pixelDropZone"),
  pixelFileInput: $("pixelFileInput"),
  pixelFolderInput: $("pixelFolderInput"),
  pixelFolderBtn: $("pixelFolderBtn"),
  pixelFileMeta: $("pixelFileMeta"),
  pixelWidth: $("pixelWidth"),
  pixelHeight: $("pixelHeight"),
  pixelUpscale: $("pixelUpscale"),
  pixelPaletteMode: $("pixelPaletteMode"),
  pixelPaletteSizeField: $("pixelPaletteSizeField"),
  pixelPaletteSize: $("pixelPaletteSize"),
  pixelObjectMosaic: $("pixelObjectMosaic"),
  pixelMosaicStrengthField: $("pixelMosaicStrengthField"),
  pixelMosaicStrength: $("pixelMosaicStrength"),
  pixelRetraceStrength: $("pixelRetraceStrength"),
  pixelEdgeStrength: $("pixelEdgeStrength"),
  pixelCleanupPasses: $("pixelCleanupPasses"),
  pixelOutlineStrength: $("pixelOutlineStrength"),
  pixelAlphaThreshold: $("pixelAlphaThreshold"),
  pixelPolishStrength: $("pixelPolishStrength"),
  pixelDitherMode: $("pixelDitherMode"),
  pixelDitherStrength: $("pixelDitherStrength"),
  pixelColumns: $("pixelColumns"),
  pixelPadding: $("pixelPadding"),
  pixelConvertBtn: $("pixelConvertBtn"),
  pixelProgress: $("pixelProgress"),
  pixelCanvas: $("pixelCanvas"),
  pixelEmptyState: $("pixelEmptyState"),
  pixelSummary: $("pixelSummary"),
  downloadPixelPng: $("downloadPixelPng")
};

const state = {
  file: null,
  files: [],
  pixelFiles: [],
  outputName: "spritesheet",
  previewTimer: null,
  previewRun: 0,
  backgroundPreviewBlobUrl: null,
  pixelBlobUrl: null,
  sheetBlobUrl: null,
  metadataBlobUrl: null
};

function setProgress(message, isWarning = false) {
  ui.progress.innerHTML = isWarning ? `<span class="warning">${message}</span>` : message;
}

function setPixelProgress(message, isWarning = false) {
  ui.pixelProgress.innerHTML = isWarning ? `<span class="warning">${message}</span>` : message;
}

function showConversionBackdrop(title, message, progress = 0) {
  ui.conversionTitle.textContent = title;
  ui.conversionBackdrop.hidden = false;
  updateConversionBackdrop(message, progress);
}

function updateConversionBackdrop(message, progress) {
  const value = clampNumber(progress, 0, 100, 0);
  ui.conversionMessage.textContent = message;
  ui.conversionProgressBar.style.width = `${value}%`;
  ui.conversionProgressValue.textContent = `${Math.round(value)}%`;
}

function hideConversionBackdrop() {
  ui.conversionBackdrop.hidden = true;
}

function waitForUiPaint() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function setupRangeTooltips() {
  document.querySelectorAll('input[type="range"]').forEach((input) => {
    const parent = input.closest("label");
    if (!parent) return;
    parent.classList.add("range-field");
    const tooltip = document.createElement("span");
    tooltip.className = "range-tooltip";
    parent.append(tooltip);

    const update = () => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const value = Number(input.value);
      const percent = max === min ? 0 : (value - min) / (max - min);
      input.style.setProperty("--range-fill", `${percent * 100}%`);
      tooltip.style.left = `${percent * 100}%`;
      tooltip.textContent = formatRangeValue(input);
    };

    const show = () => {
      update();
      parent.classList.add("show-range-tooltip");
    };
    const hide = () => parent.classList.remove("show-range-tooltip");

    input.addEventListener("input", update);
    input.addEventListener("change", update);
    input.addEventListener("pointerdown", show);
    input.addEventListener("pointermove", () => {
      if (parent.classList.contains("show-range-tooltip")) update();
    });
    input.addEventListener("pointerup", hide);
    input.addEventListener("pointercancel", hide);
    input.addEventListener("focus", show);
    input.addEventListener("blur", hide);
    update();
  });
}

function formatRangeValue(input) {
  const label = input.closest("label")?.querySelector("span")?.textContent || "";
  const step = Number(input.step || 1);
  const value = Number(input.value);
  const decimals = step > 0 && step < 1 ? String(step).split(".")[1]?.length || 1 : 0;
  const text = value.toFixed(decimals);
  return label.includes("(%)") ? `${text}%` : text;
}

function switchPage(page) {
  ui.toolPages.forEach((toolPage) => {
    toolPage.classList.toggle("active", toolPage.dataset.page === page);
  });
  ui.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.pageTarget === page);
  });
}

function syncFrameControls() {
  ui.sampleFpsField.hidden = ui.useSourceFps.checked;
  ui.maxFramesField.hidden = ui.useSourceFrameCount.checked;
  ui.duplicateThresholdField.hidden = !ui.removeDuplicates.checked;
}

function syncFrameSizeControls() {
  ui.customSizeFields.hidden = ui.sizeMode.value !== "custom";
  ui.multiplierField.hidden = ui.sizeMode.value !== "multiplier";
  ui.fitModeField.hidden = ui.sizeMode.value !== "custom";
}

function syncPixelControls() {
  ui.pixelPaletteSizeField.hidden = !["retrace", "adaptive", "kmeans"].includes(ui.pixelPaletteMode.value);
  ui.pixelMosaicStrengthField.hidden = !ui.pixelObjectMosaic.checked;
}

function syncTransparencyControls() {
  const enabled = ui.backgroundMode.value !== "none";
  ui.keyColorField.hidden = ui.backgroundMode.value !== "chroma";
  ui.keyToleranceField.hidden = !enabled;
  ui.alphaNoiseField.hidden = !enabled;
  ui.matteRefineField.hidden = !enabled;
  ui.despillField.hidden = !enabled;
  ui.transparentRgbField.hidden = !enabled;
  ui.edgeExtrusionField.hidden = !enabled;
}

function syncConditionalControls() {
  syncFrameControls();
  syncFrameSizeControls();
  syncPixelControls();
  syncTransparencyControls();
}

function getSettings() {
  const useSourceFrameCount = ui.useSourceFrameCount.checked;
  return {
    useSourceFps: ui.useSourceFps.checked,
    sampleFps: clampNumber(ui.sampleFps.value, 1, 120, 24),
    useSourceFrameCount,
    maxFrames: useSourceFrameCount ? Number.POSITIVE_INFINITY : clampNumber(ui.maxFrames.value, 1, 2000, 300),
    removeDuplicates: ui.removeDuplicates.checked,
    duplicateThreshold: percentToByteThreshold(ui.duplicateThreshold.value, 3.1),
    sizeMode: ui.sizeMode.value,
    frameWidth: clampNumber(ui.frameWidth.value, 1, 8192, 32),
    frameHeight: clampNumber(ui.frameHeight.value, 1, 8192, 32),
    multiplier: clampNumber(ui.multiplier.value, 1, 16, 4),
    fitMode: ui.fitMode.value,
    backgroundMode: ui.backgroundMode.value,
    keyColor: hexToRgb(ui.keyColor.value),
    keyTolerance: percentToRgbDistance(ui.keyTolerance.value, 9.5),
    alphaNoiseThreshold: percentToByteThreshold(ui.alphaNoise.value, 1),
    matteRefine: ui.matteRefine.value,
    despillEdges: ui.despillEdges.checked,
    cleanTransparentRgb: ui.cleanTransparentRgb.checked,
    edgeExtrusion: ui.edgeExtrusion.checked,
    cropMode: ui.cropMode.value,
    columns: clampNumber(ui.columns.value, 0, 2000, 0),
    padding: clampNumber(ui.padding.value, 0, 256, 2),
    pivotX: clampNumber(ui.pivotX.value, 0, 1, 0.5),
    pivotY: clampNumber(ui.pivotY.value, 0, 1, 0.5),
    metadataFormat: ui.metadataFormat.value
  };
}

function getPixelSettings() {
  return {
    width: clampNumber(ui.pixelWidth.value, 4, 512, 64),
    height: clampNumber(ui.pixelHeight.value, 4, 512, 64),
    upscale: clampNumber(ui.pixelUpscale.value, 1, 12, 4),
    paletteMode: ui.pixelPaletteMode.value,
    paletteSize: Math.round(clampNumber(ui.pixelPaletteSize.value, 16, 128, 18)),
    objectMosaic: ui.pixelObjectMosaic.checked,
    mosaicStrength: clampNumber(ui.pixelMosaicStrength.value, 0, 100, 55) / 100,
    retraceStrength: clampNumber(ui.pixelRetraceStrength.value, 0, 100, 88) / 100,
    edgeStrength: clampNumber(ui.pixelEdgeStrength.value, 0, 100, 76) / 100,
    cleanupPasses: Math.round(clampNumber(ui.pixelCleanupPasses.value, 0, 8, 5)),
    outlineStrength: clampNumber(ui.pixelOutlineStrength.value, 0, 100, 76) / 100,
    alphaThreshold: percentToByteThreshold(ui.pixelAlphaThreshold.value, 2),
    polishStrength: clampNumber(ui.pixelPolishStrength.value, 0, 100, 62) / 100,
    ditherMode: ui.pixelDitherMode.value,
    ditherStrength: clampNumber(ui.pixelDitherStrength.value, 0, 100, 35) / 100,
    columns: Math.round(clampNumber(ui.pixelColumns.value, 0, 256, 0)),
    padding: Math.round(clampNumber(ui.pixelPadding.value, 0, 64, 2))
  };
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function percentToByteThreshold(value, fallback) {
  return (clampNumber(value, 0, 100, fallback) / 100) * 255;
}

function percentToRgbDistance(value, fallback) {
  return (clampNumber(value, 0, 100, fallback) / 100) * Math.hypot(255, 255, 255);
}

function hexToRgb(hex) {
  const raw = hex.replace("#", "");
  return {
    r: Number.parseInt(raw.slice(0, 2), 16),
    g: Number.parseInt(raw.slice(2, 4), 16),
    b: Number.parseInt(raw.slice(4, 6), 16)
  };
}

function detectMime(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (file.type) return file.type;
  if (ext === "gif" || ext === "giv") return "image/gif";
  if (ext === "webp") return "image/webp";
  if (ext === "png" || ext === "apng") return "image/png";
  if (ext === "mp4") return "video/mp4";
  if (ext === "mov") return "video/quicktime";
  if (ext === "webm") return "video/webm";
  if (ext === "avi") return "video/x-msvideo";
  if (ext === "mkv") return "video/x-matroska";
  return "application/octet-stream";
}

function mediaKind(file) {
  const mime = detectMime(file);
  const ext = file.name.split(".").pop().toLowerCase();
  if (mime.startsWith("image/") || ["gif", "giv", "webp", "png", "apng"].includes(ext)) return "image";
  if (mime.startsWith("video/") || ["mp4", "mov", "webm", "avi", "mkv"].includes(ext)) return "video";
  return "unknown";
}

function baseName(name) {
  return name.replace(/\.[^/.]+$/, "") || "spritesheet";
}

function naturalCompareNames(a, b) {
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
}

function describeFiles(files) {
  if (files.length === 1) {
    const file = files[0];
    return `${file.name} - ${formatBytes(file.size)} - ${detectMime(file)}`;
  }

  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  return `${files.length} image sequence files - ${formatBytes(totalBytes)}`;
}

function isImageSequence(files) {
  return files.length > 1 && files.every((file) => mediaKind(file) === "image");
}

function updateCodecStatus() {
  const video = document.createElement("video");
  const checks = [
    ["MP4", video.canPlayType('video/mp4; codecs="avc1.42E01E"')],
    ["WEBM", video.canPlayType('video/webm; codecs="vp8, vorbis"')],
    ["MOV", video.canPlayType("video/quicktime")],
    ["AVI", video.canPlayType("video/x-msvideo")],
    ["MKV", video.canPlayType("video/x-matroska")]
  ];
  const supported = checks.filter(([, result]) => result).map(([label]) => label);
  const imageDecoder = "ImageDecoder" in window ? "animated images" : "static image fallback";
  ui.codecStatus.textContent = `Browser decode: ${supported.join(", ") || "video support limited"}; ${imageDecoder}.`;
}

function onFiles(fileList) {
  const files = Array.from(fileList || []).sort(naturalCompareNames);
  if (!files.length) return;

  if (files.length > 1 && !isImageSequence(files)) {
    setProgress("Multiple selection currently supports image sequences only.", true);
    return;
  }

  state.files = files;
  state.file = files[0];
  state.outputName = files.length > 1 ? baseName(files[0].name).replace(/[_\-\s]?\d+$/, "") || "image_sequence" : baseName(files[0].name);
  ui.fileMeta.textContent = describeFiles(files);
  ui.backgroundFileMeta.textContent = ui.fileMeta.textContent;
  scheduleFirstFramePreview();
  ui.convertBtn.disabled = false;
  ui.summary.textContent = "";
  setProgress("Ready to convert.");
}

function onFile(file) {
  onFiles(file ? [file] : []);
}

function onPixelFiles(fileList) {
  const files = Array.from(fileList || [])
    .filter((file) => mediaKind(file) === "image")
    .sort(naturalCompareNames);

  if (!files.length) {
    setPixelProgress("Pixel Art Converter accepts image files only.", true);
    return;
  }

  state.pixelFiles = files;
  state.outputName = files.length > 1 ? baseName(files[0].name).replace(/[_\-\s]?\d+$/, "") || "pixel_sequence" : baseName(files[0].name);
  ui.pixelFileMeta.textContent = describeFiles(files);
  ui.pixelConvertBtn.disabled = false;
  ui.pixelSummary.textContent = "";
  setPixelProgress("Ready to convert.");
}

function scheduleFirstFramePreview() {
  window.clearTimeout(state.previewTimer);
  state.previewTimer = window.setTimeout(renderFirstFramePreview, 120);
}

async function renderFirstFramePreview() {
  if (!state.file) return;
  const run = ++state.previewRun;
  const kind = mediaKind(state.file);
  revokeBackgroundPreview();
  ui.sourceFramePreview.hidden = true;
  ui.sourcePreviewEmpty.hidden = false;
  ui.sourcePreviewEmpty.textContent = "Rendering first frame...";
  ui.sourcePreviewMeta.textContent = kind === "unknown" ? detectMime(state.file) : kind.toUpperCase();

  try {
    const decoded = await decodeFirstFrame(state.file);
    if (run !== state.previewRun) return;

    const settings = getSettings();
    const [processed] = processFrames([decoded.frame], decoded.source, settings);
    drawFirstFramePreview(processed.canvas);
    ui.sourcePreviewEmpty.hidden = true;
    ui.sourcePreviewMeta.textContent = `${processed.canvas.width}x${processed.canvas.height} from ${decoded.source.width}x${decoded.source.height}`;
  } catch (error) {
    if (run !== state.previewRun) return;
    showSourcePreviewFallback();
  }
}

function showSourcePreviewFallback() {
  revokeBackgroundPreview();
  ui.sourceFramePreview.hidden = true;
  ui.sourcePreviewEmpty.hidden = false;
  ui.sourcePreviewEmpty.textContent = "Preview unavailable for this file.";
  ui.sourcePreviewMeta.textContent = "Preview unavailable";
}

function drawFirstFramePreview(canvas) {
  ui.sourceFramePreview.width = canvas.width;
  ui.sourceFramePreview.height = canvas.height;
  ui.sourceFramePreview.getContext("2d").drawImage(canvas, 0, 0);
  ui.sourceFramePreview.hidden = false;
  ui.sourceFramePreview.toBlob((blob) => {
    if (!blob) return;
    revokeBackgroundPreview();
    state.backgroundPreviewBlobUrl = URL.createObjectURL(blob);
    ui.downloadBgPreview.disabled = false;
  }, "image/png");
}

function revokeBackgroundPreview() {
  if (state.backgroundPreviewBlobUrl) {
    URL.revokeObjectURL(state.backgroundPreviewBlobUrl);
  }
  state.backgroundPreviewBlobUrl = null;
  ui.downloadBgPreview.disabled = true;
}

async function decodeFirstFrame(file) {
  const kind = mediaKind(file);
  if (kind === "image") return decodeFirstImageFrame(file);
  if (kind === "video") return decodeFirstVideoFrame(file);
  throw new Error("Unsupported media type.");
}

async function decodeFirstImageFrame(file) {
  const mime = detectMime(file);

  if ("ImageDecoder" in window) {
    const buffer = await file.arrayBuffer();
    const decoder = new ImageDecoder({ data: buffer, type: mime });
    try {
      const result = await decoder.decode({ frameIndex: 0 });
      const image = result.image;
      const canvas = document.createElement("canvas");
      canvas.width = image.displayWidth;
      canvas.height = image.displayHeight;
      canvas.getContext("2d").drawImage(image, 0, 0);
      image.close();
      return {
        frame: { canvas, duration: 100, sourceIndex: 0 },
        source: { width: canvas.width, height: canvas.height }
      };
    } finally {
      decoder.close();
    }
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  bitmap.close();
  return {
    frame: { canvas, duration: 100, sourceIndex: 0 },
    source: { width: canvas.width, height: canvas.height }
  };
}

async function decodeFirstVideoFrame(file) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await waitForEvent(video, "loadedmetadata", "error");
    if (video.readyState < 2) {
      await waitForEvent(video, "loadeddata", "error");
    }
    await seekVideo(video, 0);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    return {
      frame: { canvas, duration: 100, sourceIndex: 0 },
      source: { width: canvas.width, height: canvas.height }
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function convert() {
  if (!state.files.length) return;
  const settings = getSettings();
  resetDownloads();
  ui.convertBtn.disabled = true;
  showConversionBackdrop("Converting Sprite Sheet", "Preparing conversion...", 0);
  await waitForUiPaint();

  try {
    setProgress("Decoding frames...");
    updateConversionBackdrop("Decoding frames...", 8);
    const decoded = await decodeFrames(state.files, settings, (message, progress) => {
      setProgress(message);
      const percent = Number.isFinite(progress) ? 8 + progress * 42 : 18;
      updateConversionBackdrop(message, percent);
    });

    if (!decoded.frames.length) {
      throw new Error("No frames could be decoded from this file.");
    }

    setProgress(`Processing ${decoded.frames.length} frames...`);
    updateConversionBackdrop(`Processing ${decoded.frames.length} frames...`, 52);
    let frames = await processFramesWithProgress(decoded.frames, decoded.source, settings, (message, progress) => {
      setProgress(message);
      updateConversionBackdrop(message, 52 + progress * 24);
    });

    const beforeDuplicates = frames.length;
    if (settings.removeDuplicates) {
      updateConversionBackdrop("Removing duplicate frames...", 78);
      await waitForUiPaint();
      frames = removeDuplicateFrames(frames, settings.duplicateThreshold);
    }

    if (!frames.length) {
      throw new Error("All frames were removed. Lower the duplicate threshold or disable duplicate removal.");
    }

    setProgress("Packing sprite sheet...");
    updateConversionBackdrop("Packing sprite sheet...", 88);
    await waitForUiPaint();
    const packed = packFrames(frames, decoded, settings);
    drawSheet(packed);
    const metadata = buildMetadata(packed, decoded, settings, state.files.length > 1 ? `${state.files.length} image sequence files` : state.file.name);
    const metadataText = serializeMetadata(metadata, settings.metadataFormat);

    prepareDownloads(packed.canvas, metadataText, settings.metadataFormat);
    showSummary(decoded.frames.length, beforeDuplicates - frames.length, packed, settings.metadataFormat);
    updateConversionBackdrop("Done.", 100);
    setProgress("Done.");
    await waitForUiPaint();
  } catch (error) {
    console.error(error);
    updateConversionBackdrop(error.message || "Conversion failed.", 100);
    setProgress(error.message || "Conversion failed.", true);
  } finally {
    hideConversionBackdrop();
    ui.convertBtn.disabled = false;
  }
}

async function decodeFrames(input, settings, report) {
  const files = Array.isArray(input) ? input : [input];
  if (files.length > 1) {
    return decodeImageSequenceFrames(files, settings, report);
  }

  const file = files[0];
  const kind = mediaKind(file);
  if (kind === "image") {
    return decodeImageFrames(file, settings, report);
  }
  if (kind === "video") {
    return decodeVideoFrames(file, settings, report);
  }
  throw new Error("Unsupported media type.");
}

async function decodeImageSequenceFrames(files, settings, report) {
  const limit = Math.min(files.length, settings.maxFrames);
  const frames = [];
  let maxWidth = 1;
  let maxHeight = 1;
  const duration = Math.round(1000 / settings.sampleFps);

  for (let index = 0; index < limit; index += 1) {
    const decoded = await decodeFirstImageFrame(files[index]);
    frames.push({
      canvas: decoded.frame.canvas,
      duration,
      sourceIndex: index,
      sourceName: files[index].name
    });
    maxWidth = Math.max(maxWidth, decoded.source.width);
    maxHeight = Math.max(maxHeight, decoded.source.height);
    if (index % 10 === 0 || index === limit - 1) report(`Decoded ${index + 1} sequence frames...`, (index + 1) / limit);
  }

  return {
    frames,
    source: { width: maxWidth, height: maxHeight },
    decoder: "Image sequence",
    sequence: true
  };
}

async function decodeImageFrames(file, settings, report) {
  const mime = detectMime(file);

  if ("ImageDecoder" in window) {
    const buffer = await file.arrayBuffer();
    const decoder = new ImageDecoder({ data: buffer, type: mime });
    await decoder.tracks.ready;
    const track = decoder.tracks.selectedTrack;
    const hasKnownFrameCount = Number.isFinite(track.frameCount) && track.frameCount > 0;
    const unknownFrameFallback = Number.isFinite(settings.maxFrames) ? settings.maxFrames : 2000;
    const total = hasKnownFrameCount ? track.frameCount : unknownFrameFallback;
    const limit = Math.min(total, settings.maxFrames);
    const frames = [];
    let source = null;

    for (let index = 0; index < limit; index += 1) {
      try {
        const result = await decoder.decode({ frameIndex: index });
        const image = result.image;
        const canvas = document.createElement("canvas");
        canvas.width = image.displayWidth;
        canvas.height = image.displayHeight;
        canvas.getContext("2d").drawImage(image, 0, 0);
        frames.push({
          canvas,
          duration: Math.max(1, Math.round((image.duration || 100000) / 1000)),
          sourceIndex: index
        });
        source = source || { width: image.displayWidth, height: image.displayHeight };
        image.close();
        if (index % 10 === 0 || index === limit - 1) report(`Decoded ${index + 1} image frames...`, (index + 1) / limit);
      } catch (error) {
        if (frames.length) break;
        throw error;
      }
    }

    decoder.close();
    return { frames, source: source || { width: 1, height: 1 }, decoder: "ImageDecoder" };
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0);
  bitmap.close();
  return {
    frames: [{ canvas, duration: 100, sourceIndex: 0 }],
    source: { width: canvas.width, height: canvas.height },
    decoder: "createImageBitmap"
  };
}

async function decodeVideoFrames(file, settings, report) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;

  try {
    await waitForEvent(video, "loadedmetadata", "error");
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error("Could not read the video duration.");
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
      throw new Error("Could not read the video dimensions.");
    }

    if (video.readyState < 2) {
      await waitForEvent(video, "loadeddata", "error");
    }

    if (settings.useSourceFps) {
      const frames = await decodeVideoAtSourceRate(video, width, height, settings, report);
      return {
        frames,
        source: { width, height },
        decoder: "HTMLVideoElement.requestVideoFrameCallback",
        duration: video.duration
      };
    }

    const frameDuration = 1000 / settings.sampleFps;
    const frames = [];
    const step = 1 / settings.sampleFps;
    const count = Math.min(settings.maxFrames, Math.ceil(video.duration * settings.sampleFps));

    for (let index = 0; index < count; index += 1) {
      const targetTime = Math.min(video.duration - 0.001, index * step);
      await seekVideo(video, targetTime);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(video, 0, 0, width, height);
      frames.push({
        canvas,
        duration: Math.round(frameDuration),
        sourceIndex: index
      });
      if (index % 10 === 0 || index === count - 1) report(`Decoded ${index + 1} video frames...`, (index + 1) / count);
    }

    return {
      frames,
      source: { width, height },
      decoder: "HTMLVideoElement",
      duration: video.duration
    };
  } catch (error) {
    if (error.message === "Source frame rate capture is not available in this browser.") {
      throw error;
    }
    const ext = file.name.split(".").pop().toUpperCase();
    throw new Error(`${ext} could not be decoded by this browser. Try MP4/H.264 or WEBM, or add an FFmpeg bridge later for full container support.`);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function decodeVideoAtSourceRate(video, width, height, settings, report) {
  if (!("requestVideoFrameCallback" in video)) {
    throw new Error("Source frame rate capture is not available in this browser.");
  }

  const maxFrames = settings.maxFrames;
  const frames = [];
  let finished = false;
  let frameRequestId = null;
  let lastMediaTime = null;

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      if (frameRequestId !== null && "cancelVideoFrameCallback" in video) {
        video.cancelVideoFrameCallback(frameRequestId);
      }
      video.pause();
    };
    const finish = (completedPlayback) => {
      if (finished) return;
      finished = true;
      if (completedPlayback && frames.length && lastMediaTime !== null) {
        const remaining = Math.round(Math.max(0, video.duration - lastMediaTime) * 1000);
        if (remaining > 0) frames[frames.length - 1].duration = remaining;
      }
      cleanup();
      resolve(frames);
    };
    const fail = (error) => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(error);
    };
    const captureCanvas = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(video, 0, 0, width, height);
      return canvas;
    };
    const onFrame = (now, metadata) => {
      if (finished) return;
      const mediaTime = Number.isFinite(metadata.mediaTime) ? metadata.mediaTime : video.currentTime;
      if (frames.length && lastMediaTime !== null) {
        const delta = Math.round(Math.max(0.001, mediaTime - lastMediaTime) * 1000);
        frames[frames.length - 1].duration = delta;
      }

      const previousDuration = frames.length ? frames[frames.length - 1].duration : Math.round(1000 / 60);
      frames.push({
        canvas: captureCanvas(),
        duration: previousDuration,
        sourceIndex: frames.length
      });
      lastMediaTime = mediaTime;

      if (frames.length % 10 === 0) {
        const progress = Number.isFinite(maxFrames) ? frames.length / maxFrames : null;
        report(`Decoded ${frames.length} source video frames...`, progress);
      }
      if (frames.length >= maxFrames) {
        finish(false);
        return;
      }

      frameRequestId = video.requestVideoFrameCallback(onFrame);
    };
    const onEnded = () => finish(true);
    const onError = () => fail(new Error("Video playback failed."));

    video.addEventListener("ended", onEnded, { once: true });
    video.addEventListener("error", onError, { once: true });
    frameRequestId = video.requestVideoFrameCallback(onFrame);
    video.currentTime = 0;
    video.play().catch(fail);
  });
}

function waitForEvent(target, success, failure) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(success, onSuccess);
      target.removeEventListener(failure, onFailure);
    };
    const onSuccess = () => {
      cleanup();
      resolve();
    };
    const onFailure = () => {
      cleanup();
      reject(new Error("Media failed to load."));
    };
    target.addEventListener(success, onSuccess, { once: true });
    target.addEventListener(failure, onFailure, { once: true });
  });
}

function seekVideo(video, time) {
  if (Math.abs(video.currentTime - time) < 0.0005 && video.readyState >= 2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Video seek failed."));
    };
    video.addEventListener("seeked", onSeeked, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.currentTime = time;
  });
}

function processFrames(frames, source, settings) {
  const target = targetSize(source, settings);
  let processed = frames.map((frame, index) => {
    const canvas = resizeFrame(frame.canvas, target, settings.fitMode);
    applyBackgroundRemoval(canvas, settings);
    return {
      canvas,
      duration: frame.duration,
      sourceIndex: frame.sourceIndex,
      sourceName: frame.sourceName,
      name: `frame_${String(index).padStart(4, "0")}`,
      sourceSize: { width: target.width, height: target.height },
      spriteSourceSize: { x: 0, y: 0, width: target.width, height: target.height }
    };
  });

  if (settings.cropMode === "global") {
    processed = cropGlobal(processed);
  } else if (settings.cropMode === "perFrame") {
    processed = processed.map(cropSingleFrame);
  }

  return processed;
}

async function processFramesWithProgress(frames, source, settings, report) {
  const target = targetSize(source, settings);
  let processed = [];

  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    const canvas = resizeFrame(frame.canvas, target, settings.fitMode);
    applyBackgroundRemoval(canvas, settings);
    processed.push({
      canvas,
      duration: frame.duration,
      sourceIndex: frame.sourceIndex,
      sourceName: frame.sourceName,
      name: `frame_${String(index).padStart(4, "0")}`,
      sourceSize: { width: target.width, height: target.height },
      spriteSourceSize: { x: 0, y: 0, width: target.width, height: target.height }
    });

    if (index % 6 === 0 || index === frames.length - 1) {
      report(`Processed ${index + 1} of ${frames.length} frames...`, (index + 1) / frames.length);
      await waitForUiPaint();
    }
  }

  if (settings.cropMode === "global") {
    report("Cropping transparent bounds...", 0.96);
    await waitForUiPaint();
    processed = cropGlobal(processed);
  } else if (settings.cropMode === "perFrame") {
    report("Cropping transparent bounds...", 0.96);
    await waitForUiPaint();
    processed = processed.map(cropSingleFrame);
  }

  return processed;
}

function targetSize(source, settings) {
  if (settings.sizeMode === "custom") {
    return { width: settings.frameWidth, height: settings.frameHeight };
  }
  if (settings.sizeMode === "multiplier") {
    return {
      width: Math.max(1, Math.round(source.width * settings.multiplier)),
      height: Math.max(1, Math.round(source.height * settings.multiplier))
    };
  }
  return { width: source.width, height: source.height };
}

function resizeFrame(sourceCanvas, target, fitMode) {
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  if (fitMode === "stretch") {
    ctx.drawImage(sourceCanvas, 0, 0, target.width, target.height);
    return canvas;
  }

  const scale = fitMode === "cover"
    ? Math.max(target.width / sourceCanvas.width, target.height / sourceCanvas.height)
    : Math.min(target.width / sourceCanvas.width, target.height / sourceCanvas.height);
  const drawWidth = Math.round(sourceCanvas.width * scale);
  const drawHeight = Math.round(sourceCanvas.height * scale);
  const x = Math.floor((target.width - drawWidth) / 2);
  const y = Math.floor((target.height - drawHeight) / 2);
  ctx.drawImage(sourceCanvas, x, y, drawWidth, drawHeight);
  return canvas;
}

function applyBackgroundRemoval(canvas, settings) {
  if (settings.backgroundMode === "none") return;

  const ctx = canvas.getContext("2d");
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const width = canvas.width;
  const height = canvas.height;
  const key = settings.backgroundMode === "corner"
    ? { r: data[0], g: data[1], b: data[2] }
    : settings.keyColor;
  const backgroundMask = buildConnectedBackgroundMask(data, width, height, key, settings.keyTolerance);
  let alphaMask = buildBackgroundAlphaMask(data, backgroundMask);

  alphaMask = refineBackgroundAlphaMask(data, alphaMask, backgroundMask, width, height, key, settings);

  for (let pixel = 0; pixel < backgroundMask.length; pixel += 1) {
    const index = pixel * 4;
    data[index + 3] = Math.round(data[index + 3] * alphaMask[pixel]);
  }

  removeLowAlphaNoise(data, settings.alphaNoiseThreshold);

  if (settings.edgeExtrusion || settings.cleanTransparentRgb) {
    bleedForegroundRgbIntoTransparentEdges(data, width, height, {
      rewriteSemiTransparent: true,
      fillFullyTransparent: settings.cleanTransparentRgb || settings.edgeExtrusion,
      fullCanvasExtrusion: settings.edgeExtrusion
    });
  } else {
    clearTransparentRgb(data);
  }

  if (settings.despillEdges) {
    despillEdgePixels(data, width, height, key, settings.keyTolerance);
  }

  ctx.putImageData(image, 0, 0);
}

function buildConnectedBackgroundMask(data, width, height, key, tolerance) {
  const total = width * height;
  const mask = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const enqueue = (pixel) => {
    if (mask[pixel]) return;
    const index = pixel * 4;
    if (!isBackgroundCandidate(data, index, key, tolerance)) return;
    mask[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);

    if (x > 0) enqueue(pixel - 1);
    if (x < width - 1) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y < height - 1) enqueue(pixel + width);
  }

  return mask;
}

function isBackgroundCandidate(data, index, key, tolerance) {
  if (data[index + 3] === 0) return true;
  return colorDistance(data, index, key) <= tolerance;
}

function colorDistance(data, index, key) {
  return Math.hypot(data[index] - key.r, data[index + 1] - key.g, data[index + 2] - key.b);
}

function buildBackgroundAlphaMask(data, backgroundMask) {
  const alphaMask = new Float32Array(backgroundMask.length);
  for (let pixel = 0; pixel < backgroundMask.length; pixel += 1) {
    alphaMask[pixel] = backgroundMask[pixel] ? 0 : 1;
    if (data[pixel * 4 + 3] === 0) alphaMask[pixel] = 0;
  }
  return alphaMask;
}

function refineBackgroundAlphaMask(data, alphaMask, backgroundMask, width, height, key, settings) {
  if (settings.matteRefine === "none") return alphaMask;

  const refined = new Float32Array(alphaMask);
  const tolerance = Math.max(1, settings.keyTolerance);
  const softLimit = tolerance * (settings.matteRefine === "tight" ? 1.15 : 1.55);

  for (let pixel = 0; pixel < backgroundMask.length; pixel += 1) {
    if (backgroundMask[pixel] || alphaMask[pixel] === 0) continue;
    if (!touchesTransparentMask(pixel, alphaMask, width, height)) continue;

    const distance = colorDistance(data, pixel * 4, key);
    if (settings.matteRefine === "tight" && distance <= softLimit) {
      refined[pixel] = 0;
    } else if (settings.matteRefine === "pixel" && distance <= softLimit) {
      refined[pixel] = smoothStep(tolerance * 0.72, softLimit, distance);
    } else if (settings.matteRefine === "soft" && distance <= softLimit) {
      refined[pixel] = smoothStep(tolerance * 0.55, softLimit, distance);
    }
  }

  if (settings.matteRefine === "soft") {
    return blurEdgeAlphaMask(refined, width, height);
  }

  return refined;
}

function smoothStep(edge0, edge1, value) {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}

function touchesTransparentMask(pixel, alphaMask, width, height) {
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  return (x > 0 && alphaMask[pixel - 1] < 1)
    || (x < width - 1 && alphaMask[pixel + 1] < 1)
    || (y > 0 && alphaMask[pixel - width] < 1)
    || (y < height - 1 && alphaMask[pixel + width] < 1);
}

function blurEdgeAlphaMask(alphaMask, width, height) {
  const blurred = new Float32Array(alphaMask);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (alphaMask[pixel] === 0 || alphaMask[pixel] === 1) continue;
      let sum = 0;
      let count = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          sum += alphaMask[pixel + oy * width + ox];
          count += 1;
        }
      }
      blurred[pixel] = sum / count;
    }
  }
  return blurred;
}

function removeLowAlphaNoise(data, alphaThreshold) {
  if (alphaThreshold <= 0) return;

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] > 0 && data[index + 3] <= alphaThreshold) {
      data[index + 3] = 0;
    }
  }
}

function despillEdgePixels(data, width, height, key, tolerance) {
  const channels = [key.r, key.g, key.b];
  const dominant = channels.indexOf(Math.max(...channels));
  const sorted = [...channels].sort((a, b) => b - a);
  if (sorted[0] - sorted[1] < 24) return;

  const total = width * height;
  for (let pixel = 0; pixel < total; pixel += 1) {
    const alpha = data[pixel * 4 + 3];
    if (alpha === 0 || alpha === 255 || !touchesTransparentPixel(pixel, data, width, height)) continue;
    const index = pixel * 4;
    if (colorDistance(data, index, key) > tolerance * 2.2) continue;

    const otherA = dominant === 0 ? data[index + 1] : data[index];
    const otherB = dominant === 2 ? data[index + 1] : data[index + 2];
    const spillLimit = Math.max(otherA, otherB) + 18;
    data[index + dominant] = Math.min(data[index + dominant], spillLimit);
  }
}

function bleedForegroundRgbIntoTransparentEdges(data, width, height, options) {
  const total = width * height;
  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;
  const seedAlpha = hasAlphaAtLeast(data, 250) ? 250 : hasAlphaAtLeast(data, 224) ? 224 : 1;

  for (let pixel = 0; pixel < total; pixel += 1) {
    if (data[pixel * 4 + 3] >= seedAlpha) {
      visited[pixel] = 1;
      queue[tail] = pixel;
      tail += 1;
    }
  }

  if (tail === 0) {
    clearTransparentRgb(data);
    return;
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const neighbors = [];
    if (x > 0) neighbors.push(pixel - 1);
    if (x < width - 1) neighbors.push(pixel + 1);
    if (y > 0) neighbors.push(pixel - width);
    if (y < height - 1) neighbors.push(pixel + width);

    for (const next of neighbors) {
      if (visited[next]) continue;
      visited[next] = 1;
      copyForegroundRgbIfNeeded(data, pixel, next, options, seedAlpha);
      queue[tail] = next;
      tail += 1;
    }
  }
}

function hasAlphaAtLeast(data, alpha) {
  for (let index = 3; index < data.length; index += 4) {
    if (data[index] >= alpha) return true;
  }
  return false;
}

function copyForegroundRgbIfNeeded(data, fromPixel, toPixel, options, seedAlpha) {
  const to = toPixel * 4;
  const alpha = data[to + 3];
  const shouldRewrite = options.fullCanvasExtrusion
    ? alpha < 255
    : (alpha === 0 && options.fillFullyTransparent) || (options.rewriteSemiTransparent && alpha > 0 && alpha < seedAlpha);

  if (!shouldRewrite) return;

  const from = fromPixel * 4;
  data[to] = data[from];
  data[to + 1] = data[from + 1];
  data[to + 2] = data[from + 2];
}

function touchesTransparentPixel(pixel, data, width, height) {
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  return (x > 0 && data[(pixel - 1) * 4 + 3] < 255)
    || (x < width - 1 && data[(pixel + 1) * 4 + 3] < 255)
    || (y > 0 && data[(pixel - width) * 4 + 3] < 255)
    || (y < height - 1 && data[(pixel + width) * 4 + 3] < 255);
}

function clearTransparentRgb(data) {
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
    }
  }
}

function cropGlobal(frames) {
  const union = frames.reduce((bounds, frame) => mergeBounds(bounds, findAlphaBounds(frame.canvas)), null);
  if (!union) return frames.map(makeOnePixelTransparent);
  return frames.map((frame) => cropFrameToBounds(frame, union));
}

function cropSingleFrame(frame) {
  const bounds = findAlphaBounds(frame.canvas);
  if (!bounds) return makeOnePixelTransparent(frame);
  return cropFrameToBounds(frame, bounds);
}

function findAlphaBounds(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const alpha = data[(y * canvas.width + x) * 4 + 3];
      if (alpha > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;
  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function mergeBounds(a, b) {
  if (!a) return b;
  if (!b) return a;
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

function cropFrameToBounds(frame, bounds) {
  const canvas = document.createElement("canvas");
  canvas.width = bounds.width;
  canvas.height = bounds.height;
  canvas.getContext("2d").drawImage(
    frame.canvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    0,
    0,
    bounds.width,
    bounds.height
  );
  return {
    ...frame,
    canvas,
    spriteSourceSize: {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    }
  };
}

function makeOnePixelTransparent(frame) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return {
    ...frame,
    canvas,
    spriteSourceSize: { x: 0, y: 0, width: 0, height: 0 }
  };
}

function removeDuplicateFrames(frames, threshold) {
  const kept = [];
  let lastSignature = null;

  for (const frame of frames) {
    const signature = makeSignature(frame.canvas);
    if (lastSignature && signatureDistance(lastSignature, signature) <= threshold) {
      kept[kept.length - 1].duration += frame.duration;
    } else {
      kept.push(frame);
      lastSignature = signature;
    }
  }

  return kept;
}

function makeSignature(canvas) {
  const size = 16;
  const tiny = document.createElement("canvas");
  tiny.width = size;
  tiny.height = size;
  const ctx = tiny.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(canvas, 0, 0, size, size);
  return ctx.getImageData(0, 0, size, size).data;
}

function signatureDistance(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index += 4) {
    total += Math.abs(a[index] - b[index]);
    total += Math.abs(a[index + 1] - b[index + 1]);
    total += Math.abs(a[index + 2] - b[index + 2]);
    total += Math.abs(a[index + 3] - b[index + 3]);
  }
  return total / (a.length / 4) / 4;
}

function packFrames(frames, decoded, settings) {
  const padding = settings.padding;
  const maxWidth = Math.max(...frames.map((frame) => frame.canvas.width));
  const maxHeight = Math.max(...frames.map((frame) => frame.canvas.height));
  const columns = settings.columns > 0
    ? Math.min(settings.columns, frames.length)
    : Math.ceil(Math.sqrt(frames.length * (maxHeight / Math.max(1, maxWidth))));
  const rows = Math.ceil(frames.length / columns);
  const width = columns * maxWidth + (columns + 1) * padding;
  const height = rows * maxHeight + (rows + 1) * padding;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);

  const packedFrames = frames.map((frame, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + column * (maxWidth + padding);
    const y = padding + row * (maxHeight + padding);
    drawFrameWithOptionalExtrusion(ctx, frame.canvas, x, y, settings.edgeExtrusion ? Math.max(0, Math.ceil(padding / 2)) : 0);
    return {
      ...frame,
      frame: {
        x,
        y,
        width: frame.canvas.width,
        height: frame.canvas.height
      },
      cell: {
        x,
        y,
        width: maxWidth,
        height: maxHeight
      },
      pivot: {
        x: settings.pivotX,
        y: settings.pivotY,
        pixelX: Math.round(frame.sourceSize.width * settings.pivotX),
        pixelY: Math.round(frame.sourceSize.height * settings.pivotY)
      }
    };
  });

  return {
    canvas,
    frames: packedFrames,
    columns,
    rows,
    cell: { width: maxWidth, height: maxHeight },
    source: decoded.source
  };
}

function drawFrameWithOptionalExtrusion(ctx, canvas, x, y, extrusion) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.drawImage(canvas, x, y);

  if (extrusion <= 0 || width === 0 || height === 0) return;

  ctx.drawImage(canvas, 0, 0, 1, height, x - extrusion, y, extrusion, height);
  ctx.drawImage(canvas, width - 1, 0, 1, height, x + width, y, extrusion, height);
  ctx.drawImage(canvas, 0, 0, width, 1, x, y - extrusion, width, extrusion);
  ctx.drawImage(canvas, 0, height - 1, width, 1, x, y + height, width, extrusion);
  ctx.drawImage(canvas, 0, 0, 1, 1, x - extrusion, y - extrusion, extrusion, extrusion);
  ctx.drawImage(canvas, width - 1, 0, 1, 1, x + width, y - extrusion, extrusion, extrusion);
  ctx.drawImage(canvas, 0, height - 1, 1, 1, x - extrusion, y + height, extrusion, extrusion);
  ctx.drawImage(canvas, width - 1, height - 1, 1, 1, x + width, y + height, extrusion, extrusion);
}

async function convertPixelArt() {
  if (!state.pixelFiles.length) return;

  const settings = getPixelSettings();
  revokePixelOutput();
  ui.pixelConvertBtn.disabled = true;
  showConversionBackdrop("Converting Pixel Art", "Preparing conversion...", 0);
  await waitForUiPaint();

  try {
    setPixelProgress("Converting images...");
    updateConversionBackdrop("Converting images...", 8);
    const canvases = [];
    for (let index = 0; index < state.pixelFiles.length; index += 1) {
      const decoded = await decodeFirstImageFrame(state.pixelFiles[index]);
      canvases.push(processPixelArtCanvas(decoded.frame.canvas, settings));
      if (index % 2 === 0 || index === state.pixelFiles.length - 1) {
        const message = `Converted ${index + 1} of ${state.pixelFiles.length} image${state.pixelFiles.length === 1 ? "" : "s"}...`;
        setPixelProgress(message);
        updateConversionBackdrop(message, 8 + ((index + 1) / state.pixelFiles.length) * 72);
        await waitForUiPaint();
      }
    }

    updateConversionBackdrop("Packing output...", 86);
    await waitForUiPaint();
    const output = canvases.length === 1 ? canvases[0] : packPixelCanvases(canvases, settings);
    drawPixelOutput(output);
    preparePixelDownload(output);
    ui.pixelSummary.innerHTML = [
      `<strong>${canvases.length}</strong> frame${canvases.length === 1 ? "" : "s"} converted.`,
      `Output: <strong>${output.width}x${output.height}</strong>.`,
      `Palette: ${["retrace", "adaptive", "kmeans"].includes(settings.paletteMode) ? `${settings.paletteSize} ${settings.paletteMode} colors` : settings.paletteMode}.`,
      `Object Mosaic: ${settings.objectMosaic ? `${Math.round(settings.mosaicStrength * 100)}%` : "off"}.`,
      `Human polish: ${Math.round(settings.polishStrength * 100)}%.`,
      "Workflow: shrink reference, redraw silhouette, reduce colors, define clusters, shade, highlight, cleanup."
    ].join(" ");
    updateConversionBackdrop("Done.", 100);
    setPixelProgress("Done.");
    await waitForUiPaint();
  } catch (error) {
    console.error(error);
    updateConversionBackdrop(error.message || "Pixel conversion failed.", 100);
    setPixelProgress(error.message || "Pixel conversion failed.", true);
  } finally {
    hideConversionBackdrop();
    ui.pixelConvertBtn.disabled = false;
  }
}

function processPixelArtCanvas(sourceCanvas, settings) {
  const sourceCtx = sourceCanvas.getContext("2d");
  const source = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const sourceEdges = computeEdgeMap(source.data, source.width, source.height);
  const preprocessed = edgeAwarePreprocess(source.data, source.width, source.height, sourceEdges);
  const reduced = shrinkReferenceToPixelGrid(preprocessed, source.width, source.height, settings.width, settings.height, sourceEdges, settings);
  removeLowAlphaNoise(reduced.data, settings.alphaThreshold);

  const silhouette = redrawPixelSilhouette(reduced, settings);
  const silhouetteEdges = computeEdgeMap(silhouette.data, silhouette.width, silhouette.height);
  const clusteredReference = settings.objectMosaic ? applyObjectMosaic(silhouette, settings, silhouetteEdges) : silhouette;
  const clusteredEdges = computeEdgeMap(clusteredReference.data, clusteredReference.width, clusteredReference.height);
  const colorReduced = reducePixelArtColors(clusteredReference, settings, clusteredEdges);
  defineMajorPixelClusters(colorReduced.data, colorReduced.width, colorReduced.height, settings, clusteredEdges);
  addSelectivePixelShading(colorReduced.data, colorReduced.width, colorReduced.height, settings, clusteredEdges);
  addSelectivePixelHighlights(colorReduced.data, colorReduced.width, colorReduced.height, settings, silhouette.data, clusteredEdges);
  reinforcePixelOutlines(colorReduced.data, colorReduced.width, colorReduced.height, settings.outlineStrength, settings.alphaThreshold, clusteredEdges);
  if (settings.paletteMode === "retrace") {
    tracePixelSilhouette(colorReduced.data, colorReduced.width, colorReduced.height, settings, clusteredEdges);
  }
  applyHumanPixelPolish(colorReduced.data, colorReduced.width, colorReduced.height, settings, clusteredEdges);
  cleanupNoisyPixelArtifacts(colorReduced.data, colorReduced.width, colorReduced.height, settings, clusteredEdges);
  bleedForegroundRgbIntoTransparentEdges(colorReduced.data, colorReduced.width, colorReduced.height, {
    rewriteSemiTransparent: true,
    fillFullyTransparent: true,
    fullCanvasExtrusion: false
  });

  return upscaleImageDataNearest(colorReduced, settings.upscale);
}

function shrinkReferenceToPixelGrid(data, sourceWidth, sourceHeight, targetWidth, targetHeight, edgeMap, settings) {
  return edgeAwareDownsample(data, sourceWidth, sourceHeight, targetWidth, targetHeight, edgeMap, settings.edgeStrength);
}

function redrawPixelSilhouette(imageData, settings) {
  const output = retracePixelForms(imageData, settings);
  const copy = new Uint8ClampedArray(output.data);
  const strength = settings.retraceStrength || 0;

  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const pixel = y * output.width + x;
      const index = pixel * 4;
      const alpha = copy[index + 3];
      const opaqueNeighbors = countOpaqueNeighbors(copy, output.width, output.height, x, y, settings.alphaThreshold);

      if (alpha <= settings.alphaThreshold && opaqueNeighbors >= 5 && strength > 0.45) {
        const color = dominantNeighborRgbForPixel(copy, output.width, output.height, x, y, settings.alphaThreshold);
        if (color) {
          output.data[index] = color[0];
          output.data[index + 1] = color[1];
          output.data[index + 2] = color[2];
          output.data[index + 3] = 255;
        }
        continue;
      }

      if (alpha <= settings.alphaThreshold || (alpha < 128 && opaqueNeighbors <= 1 && strength > 0.35)) {
        output.data[index + 3] = 0;
        continue;
      }

      const hardAlpha = alpha >= 128 ? 255 : 0;
      output.data[index + 3] = Math.round(alpha * (1 - strength * 0.45) + hardAlpha * strength * 0.45);
    }
  }

  return output;
}

function reducePixelArtColors(imageData, settings, edgeMap) {
  const palette = buildPixelPalette(imageData.data, settings);
  return quantizePixelData(imageData, palette, settings, edgeMap);
}

function applyObjectMosaic(imageData, settings, edgeMap) {
  const output = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  const { width, height } = output;
  const total = width * height;
  const visited = new Uint8Array(total);
  const stack = [];
  const component = [];
  const strength = settings.mosaicStrength;
  const threshold = 620 + strength * 5400;
  const minMass = Math.max(3, Math.round(3 + strength * 12));

  for (let start = 0; start < total; start += 1) {
    if (visited[start] || output.data[start * 4 + 3] <= settings.alphaThreshold) continue;

    component.length = 0;
    stack.length = 0;
    visited[start] = 1;
    stack.push(start);

    while (stack.length) {
      const pixel = stack.pop();
      component.push(pixel);
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      const index = pixel * 4;
      const neighbors = [];
      if (x > 0) neighbors.push(pixel - 1);
      if (x < width - 1) neighbors.push(pixel + 1);
      if (y > 0) neighbors.push(pixel - width);
      if (y < height - 1) neighbors.push(pixel + width);

      for (const next of neighbors) {
        if (visited[next] || output.data[next * 4 + 3] <= settings.alphaThreshold) continue;
        if (edgeMap[pixel] > 0.82 && edgeMap[next] > 0.82) continue;
        const nextIndex = next * 4;
        const distance = colorDistanceRgb(
          output.data[index],
          output.data[index + 1],
          output.data[index + 2],
          output.data[nextIndex],
          output.data[nextIndex + 1],
          output.data[nextIndex + 2]
        );
        if (distance > threshold) continue;
        visited[next] = 1;
        stack.push(next);
      }
    }

    if (component.length < minMass) continue;
    const color = averageComponentColor(output.data, component);
    const ramped = rampComponentColor(color, strength);
    for (const pixel of component) {
      const index = pixel * 4;
      if (edgeMap[pixel] > 0.78 && component.length < minMass * 2) continue;
      output.data[index] = Math.round(output.data[index] * (1 - strength) + ramped[0] * strength);
      output.data[index + 1] = Math.round(output.data[index + 1] * (1 - strength) + ramped[1] * strength);
      output.data[index + 2] = Math.round(output.data[index + 2] * (1 - strength) + ramped[2] * strength);
    }
  }

  return output;
}

function averageComponentColor(data, component) {
  let r = 0;
  let g = 0;
  let b = 0;
  for (const pixel of component) {
    const index = pixel * 4;
    r += data[index];
    g += data[index + 1];
    b += data[index + 2];
  }
  return [
    Math.round(r / component.length),
    Math.round(g / component.length),
    Math.round(b / component.length)
  ];
}

function rampComponentColor(color, strength) {
  const hsl = rgbToHsl(color[0], color[1], color[2]);
  const rgb = hslToRgb(
    Math.round(hsl.h * 14) / 14,
    Math.round(hsl.s * 4) / 4,
    snapToPixelRamp(hsl.l, 4, Math.max(0.65, strength))
  );
  return rgb;
}

function defineMajorPixelClusters(data, width, height, settings, edgeMap) {
  cleanupPixelClusters(data, width, height, settings.cleanupPasses, edgeMap, settings.alphaThreshold);
  collapseIntermediateTonePixels(data, width, height, settings, edgeMap);
  massifyPixelClusters(data, width, height, settings, edgeMap);
  mergeTinyColorIslands(data, width, height, Math.max(3, settings.cleanupPasses + 3 + Math.round(settings.retraceStrength * 5)), edgeMap, settings.alphaThreshold);
}

function addSelectivePixelShading(data, width, height, settings, edgeMap) {
  if (settings.paletteMode !== "retrace") return;
  celShadeRetracedPixels(data, width, height, settings, edgeMap);
  collapseIntermediateTonePixels(data, width, height, settings, edgeMap);
}

function addSelectivePixelHighlights(data, width, height, settings, referenceData, edgeMap) {
  if (settings.paletteMode !== "retrace" || settings.retraceStrength <= 0) return;
  const copy = new Uint8ClampedArray(data);
  const amount = Math.min(0.42, settings.retraceStrength * 0.34);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      const index = pixel * 4;
      if (copy[index + 3] <= settings.alphaThreshold || edgeMap[pixel] > 0.62) continue;

      const referenceLum = luminance(referenceData[index], referenceData[index + 1], referenceData[index + 2]);
      if (referenceLum < 172) continue;

      let neighborLum = 0;
      let neighborCount = 0;
      let brighterNeighbors = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const nextPixel = (y + oy) * width + x + ox;
          const next = nextPixel * 4;
          if (referenceData[next + 3] <= settings.alphaThreshold) continue;
          const nextLum = luminance(referenceData[next], referenceData[next + 1], referenceData[next + 2]);
          neighborLum += nextLum;
          neighborCount += 1;
          if (nextLum > referenceLum) brighterNeighbors += 1;
        }
      }

      const averageLum = neighborCount ? neighborLum / neighborCount : 0;
      if (referenceLum < averageLum + 18 || brighterNeighbors > 2) continue;

      data[index] = Math.round(copy[index] * (1 - amount) + 255 * amount);
      data[index + 1] = Math.round(copy[index + 1] * (1 - amount) + 255 * amount);
      data[index + 2] = Math.round(copy[index + 2] * (1 - amount) + 245 * amount);
    }
  }
}

function cleanupNoisyPixelArtifacts(data, width, height, settings, edgeMap) {
  cleanupPixelClusters(data, width, height, Math.max(1, settings.cleanupPasses), edgeMap, settings.alphaThreshold);
  massifyPixelClusters(data, width, height, settings, edgeMap);
  collapseIntermediateTonePixels(data, width, height, settings, edgeMap);
  mergeTinyColorIslands(data, width, height, Math.max(3, settings.cleanupPasses + 2), edgeMap, settings.alphaThreshold);
  hardenPixelAlphaResidue(data, width, height, settings);
  removeLowAlphaNoise(data, settings.alphaThreshold);
}

function applyHumanPixelPolish(data, width, height, settings, edgeMap) {
  const strength = settings.polishStrength || 0;
  if (strength <= 0) return;

  const passes = Math.max(1, Math.round(strength * 3));
  for (let pass = 0; pass < passes; pass += 1) {
    polishSilhouetteIntent(data, width, height, settings, edgeMap, strength);
    removeAwkwardBoundaryTeeth(data, width, height, settings, edgeMap, strength);
    regularizeIntentionalRamps(data, width, height, settings, edgeMap, strength);
  }
}

function polishSilhouetteIntent(data, width, height, settings, edgeMap, strength) {
  const copy = new Uint8ClampedArray(data);
  const fillThreshold = strength > 0.55 ? 5 : 6;
  const removeThreshold = strength > 0.65 ? 2 : 1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const index = pixel * 4;
      const alpha = copy[index + 3];
      const opaque8 = countOpaqueNeighbors(copy, width, height, x, y, settings.alphaThreshold);
      const opaque4 = countCardinalOpaqueNeighbors(copy, width, height, x, y, settings.alphaThreshold);

      if (alpha <= settings.alphaThreshold && opaque8 >= fillThreshold) {
        const color = dominantNeighborRgbForPixel(copy, width, height, x, y, settings.alphaThreshold);
        if (color) {
          data[index] = color[0];
          data[index + 1] = color[1];
          data[index + 2] = color[2];
          data[index + 3] = 255;
        }
        continue;
      }

      if (alpha <= settings.alphaThreshold) continue;
      const protectedDetail = edgeMap[pixel] > 0.84 && isDarkerThanNeighbors(copy, width, height, x, y);
      const diagonalCrumb = opaque8 <= 2 && opaque4 === 0;
      const weakResidue = alpha < 160 && opaque8 <= removeThreshold;
      if (!protectedDetail && (diagonalCrumb || weakResidue)) {
        data[index + 3] = 0;
      } else if (alpha > 160 || opaque8 >= 4) {
        data[index + 3] = 255;
      }
    }
  }
}

function removeAwkwardBoundaryTeeth(data, width, height, settings, edgeMap, strength) {
  const copy = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      const index = pixel * 4;
      if (copy[index + 3] <= settings.alphaThreshold || !touchesTransparentPixel8(pixel, copy, width, height, settings.alphaThreshold)) continue;
      if (edgeMap[pixel] > 0.82 && isDarkerThanNeighbors(copy, width, height, x, y)) continue;

      const same = sameColorNeighborCount(copy, width, height, x, y, settings.alphaThreshold);
      const opaque8 = countOpaqueNeighbors(copy, width, height, x, y, settings.alphaThreshold);
      const opaque4 = countCardinalOpaqueNeighbors(copy, width, height, x, y, settings.alphaThreshold);
      if (opaque8 <= 2 && opaque4 <= 1 && strength > 0.45) {
        data[index + 3] = 0;
        continue;
      }

      const replacement = dominantNeighborRgbForPixel(copy, width, height, x, y, settings.alphaThreshold);
      if (replacement && same <= 1 && opaque8 >= 4) {
        data[index] = Math.round(copy[index] * (1 - strength) + replacement[0] * strength);
        data[index + 1] = Math.round(copy[index + 1] * (1 - strength) + replacement[1] * strength);
        data[index + 2] = Math.round(copy[index + 2] * (1 - strength) + replacement[2] * strength);
      }
    }
  }
}

function regularizeIntentionalRamps(data, width, height, settings, edgeMap, strength) {
  const copy = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      const index = pixel * 4;
      if (copy[index + 3] <= settings.alphaThreshold || isProtectedPixelDetail(copy, width, height, x, y, edgeMap, settings.alphaThreshold)) continue;

      const same = sameColorNeighborCount(copy, width, height, x, y, settings.alphaThreshold);
      const aligned = hasRampAlignment(copy, width, height, x, y, settings.alphaThreshold);
      if (same >= 2 && aligned) continue;

      const currentLum = luminance(copy[index], copy[index + 1], copy[index + 2]);
      let low = 0;
      let high = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const next = ((y + oy) * width + x + ox) * 4;
          if (copy[next + 3] <= settings.alphaThreshold) continue;
          const nextLum = luminance(copy[next], copy[next + 1], copy[next + 2]);
          if (nextLum < currentLum - 12) low += 1;
          if (nextLum > currentLum + 12) high += 1;
        }
      }

      if (same <= 1 && low >= 2 && high >= 2) {
        const replacement = dominantNeighborRgbForPixel(copy, width, height, x, y, settings.alphaThreshold);
        if (!replacement) continue;
        data[index] = replacement[0];
        data[index + 1] = replacement[1];
        data[index + 2] = replacement[2];
      }
    }
  }
}

function collapseIntermediateTonePixels(data, width, height, settings, edgeMap) {
  if (settings.retraceStrength <= 0) return;
  const copy = new Uint8ClampedArray(data);
  const supportNeeded = settings.retraceStrength > 0.75 ? 3 : 4;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      const index = pixel * 4;
      if (copy[index + 3] <= settings.alphaThreshold || isProtectedPixelDetail(copy, width, height, x, y, edgeMap, settings.alphaThreshold)) continue;

      const currentKey = rgbKey(copy, index);
      const currentLum = luminance(copy[index], copy[index + 1], copy[index + 2]);
      const counts = new Map();
      let same = 0;
      let lowerLum = 0;
      let higherLum = 0;

      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const nextPixel = (y + oy) * width + x + ox;
          const next = nextPixel * 4;
          if (copy[next + 3] <= settings.alphaThreshold) continue;
          const key = rgbKey(copy, next);
          const nextLum = luminance(copy[next], copy[next + 1], copy[next + 2]);
          if (key === currentKey) same += 1;
          if (nextLum < currentLum - 10) lowerLum += 1;
          if (nextLum > currentLum + 10) higherLum += 1;
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      }

      const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
      const looksLikeTransition = lowerLum >= 2 && higherLum >= 2;
      if (!winner || winner[0] === currentKey) continue;
      if (winner[1] >= supportNeeded || (looksLikeTransition && same <= 2 && winner[1] >= 2)) {
        const color = winner[0].split(",").map(Number);
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
      }
    }
  }
}

function massifyPixelClusters(data, width, height, settings, edgeMap) {
  const passes = Math.max(1, Math.round(settings.retraceStrength * 3));
  for (let pass = 0; pass < passes; pass += 1) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const pixel = y * width + x;
        const index = pixel * 4;
        if (copy[index + 3] <= settings.alphaThreshold || isProtectedPixelDetail(copy, width, height, x, y, edgeMap, settings.alphaThreshold)) continue;

        const currentKey = rgbKey(copy, index);
        const counts = new Map();
        let same = 0;
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (ox === 0 && oy === 0) continue;
            const next = ((y + oy) * width + x + ox) * 4;
            if (copy[next + 3] <= settings.alphaThreshold) continue;
            const key = rgbKey(copy, next);
            if (key === currentKey) same += 1;
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        }

        const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        if (!winner || winner[0] === currentKey) continue;
        if (winner[1] >= 4 || (same <= 2 && winner[1] >= 3)) {
          const color = winner[0].split(",").map(Number);
          data[index] = color[0];
          data[index + 1] = color[1];
          data[index + 2] = color[2];
        }
      }
    }
  }
}

function hardenPixelAlphaResidue(data, width, height, settings) {
  const strength = settings.retraceStrength || 0;
  if (strength <= 0) return;
  const low = Math.max(settings.alphaThreshold, 72 + strength * 34);
  const high = 186 - strength * 42;

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const index = pixel * 4;
    const alpha = data[index + 3];
    if (alpha <= settings.alphaThreshold || alpha < low) {
      data[index + 3] = 0;
    } else if (alpha > high) {
      data[index + 3] = 255;
    } else {
      data[index + 3] = Math.round(alpha * (1 - strength * 0.55) + (alpha >= 128 ? 255 : 0) * strength * 0.55);
    }
  }
}

function isProtectedPixelDetail(data, width, height, x, y, edgeMap, alphaThreshold) {
  const pixel = y * width + x;
  const index = pixel * 4;
  if (touchesTransparentPixel8(pixel, data, width, height, alphaThreshold)) return true;
  return edgeMap[pixel] > 0.74 && isDarkerThanNeighbors(data, width, height, x, y);
}

function computeEdgeMap(data, width, height) {
  const luminance = new Float32Array(width * height);
  const edges = new Float32Array(width * height);
  let maxEdge = 0;

  for (let pixel = 0; pixel < luminance.length; pixel += 1) {
    const index = pixel * 4;
    luminance[pixel] = (0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2]) * (data[index + 3] / 255);
  }

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      const gx = -luminance[pixel - width - 1] - 2 * luminance[pixel - 1] - luminance[pixel + width - 1]
        + luminance[pixel - width + 1] + 2 * luminance[pixel + 1] + luminance[pixel + width + 1];
      const gy = -luminance[pixel - width - 1] - 2 * luminance[pixel - width] - luminance[pixel - width + 1]
        + luminance[pixel + width - 1] + 2 * luminance[pixel + width] + luminance[pixel + width + 1];
      const edge = Math.hypot(gx, gy);
      edges[pixel] = edge;
      maxEdge = Math.max(maxEdge, edge);
    }
  }

  if (maxEdge > 0) {
    for (let index = 0; index < edges.length; index += 1) {
      edges[index] = Math.min(1, edges[index] / maxEdge);
    }
  }

  return edges;
}

function edgeAwarePreprocess(data, width, height, edgeMap) {
  const output = new Uint8ClampedArray(data);
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (edgeMap[pixel] > 0.32) continue;

      const center = pixel * 4;
      let r = data[center];
      let g = data[center + 1];
      let b = data[center + 2];
      let a = data[center + 3];
      let count = 1;

      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const next = ((y + oy) * width + x + ox) * 4;
          const distance = Math.hypot(data[next] - data[center], data[next + 1] - data[center + 1], data[next + 2] - data[center + 2]);
          if (distance > 42) continue;
          r += data[next];
          g += data[next + 1];
          b += data[next + 2];
          a += data[next + 3];
          count += 1;
        }
      }

      output[center] = Math.round(r / count);
      output[center + 1] = Math.round(g / count);
      output[center + 2] = Math.round(b / count);
      output[center + 3] = Math.round(a / count);
    }
  }
  reinforcePreprocessEdges(output, data, width, height, edgeMap);
  return output;
}

function reinforcePreprocessEdges(output, source, width, height, edgeMap) {
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = y * width + x;
      if (edgeMap[pixel] < 0.38) continue;
      const index = pixel * 4;
      const currentLum = luminance(source[index], source[index + 1], source[index + 2]);
      let neighborLum = 0;
      let count = 0;
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const next = ((y + oy) * width + x + ox) * 4;
          neighborLum += luminance(source[next], source[next + 1], source[next + 2]);
          count += 1;
        }
      }
      if (currentLum < neighborLum / count) {
        output[index] = Math.round(source[index] * 0.86);
        output[index + 1] = Math.round(source[index + 1] * 0.86);
        output[index + 2] = Math.round(source[index + 2] * 0.86);
      }
    }
  }
}

function edgeAwareDownsample(data, sourceWidth, sourceHeight, targetWidth, targetHeight, edgeMap, edgeStrength) {
  const output = new ImageData(targetWidth, targetHeight);
  const target = output.data;

  for (let y = 0; y < targetHeight; y += 1) {
    const y0 = Math.floor(y * sourceHeight / targetHeight);
    const y1 = Math.max(y0 + 1, Math.ceil((y + 1) * sourceHeight / targetHeight));
    for (let x = 0; x < targetWidth; x += 1) {
      const x0 = Math.floor(x * sourceWidth / targetWidth);
      const x1 = Math.max(x0 + 1, Math.ceil((x + 1) * sourceWidth / targetWidth));
      let r = 0;
      let g = 0;
      let b = 0;
      let alphaWeighted = 0;
      let colorWeight = 0;
      let alphaWeight = 0;
      let edgeMax = 0;
      const samples = [];

      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const sourcePixel = sy * sourceWidth + sx;
          const index = sourcePixel * 4;
          const alpha = data[index + 3] / 255;
          const edge = edgeMap[sourcePixel];
          edgeMax = Math.max(edgeMax, edge);
          const edgeWeight = 1 + edge * edgeStrength * 5;
          const weight = Math.max(0.04, alpha) * edgeWeight;
          r += data[index] * weight;
          g += data[index + 1] * weight;
          b += data[index + 2] * weight;
          colorWeight += weight;
          alphaWeighted += data[index + 3] * edgeWeight;
          alphaWeight += edgeWeight;
          if (data[index + 3] > 0) {
            samples.push({
              r: data[index],
              g: data[index + 1],
              b: data[index + 2],
              a: data[index + 3],
              edge,
              weight
            });
          }
        }
      }

      const targetIndex = (y * targetWidth + x) * 4;
      const average = [r / colorWeight, g / colorWeight, b / colorWeight];
      const representative = chooseBlockRepresentative(samples, average, edgeMax, edgeStrength);
      target[targetIndex] = representative.r;
      target[targetIndex + 1] = representative.g;
      target[targetIndex + 2] = representative.b;
      target[targetIndex + 3] = Math.round(alphaWeighted / alphaWeight);
    }
  }

  return output;
}

function chooseBlockRepresentative(samples, average, edgeMax, edgeStrength) {
  if (!samples.length) return { r: 0, g: 0, b: 0 };

  let best = samples[0];
  let bestScore = Number.POSITIVE_INFINITY;
  for (const sample of samples) {
    const distance = colorDistanceRgb(sample.r, sample.g, sample.b, average[0], average[1], average[2]);
    const alphaBias = (255 - sample.a) * 2;
    const edgeBonus = edgeMax > 0.22 ? sample.edge * edgeStrength * 9000 : 0;
    const score = distance + alphaBias - edgeBonus;
    if (score < bestScore) {
      best = sample;
      bestScore = score;
    }
  }
  return best;
}

function retracePixelForms(imageData, settings) {
  const strength = settings.retraceStrength || 0;
  const output = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  if (strength <= 0) return output;

  const hueSteps = Math.max(12, Math.round(36 - strength * 20));
  const saturationSteps = Math.max(3, Math.round(5 - strength * 2));
  const lightnessSteps = Math.max(3, Math.round(5 - strength * 2.4));
  const alphaHarden = Math.min(0.86, strength * 0.76);

  for (let index = 0; index < output.data.length; index += 4) {
    const alpha = output.data[index + 3];
    if (alpha <= settings.alphaThreshold) {
      output.data[index + 3] = 0;
      continue;
    }

    const hsl = rgbToHsl(output.data[index], output.data[index + 1], output.data[index + 2]);
    const hue = Math.round(hsl.h * hueSteps) / hueSteps;
    const saturation = Math.round(hsl.s * saturationSteps) / saturationSteps;
    const lightness = snapToPixelRamp(hsl.l, lightnessSteps, strength);
    const rgb = hslToRgb(hue, saturation, lightness);

    output.data[index] = rgb[0];
    output.data[index + 1] = rgb[1];
    output.data[index + 2] = rgb[2];
    output.data[index + 3] = Math.round(alpha * (1 - alphaHarden) + (alpha >= 128 ? 255 : 0) * alphaHarden);
  }

  return output;
}

function buildPixelPalette(data, settings) {
  const fixed = fixedPalette(settings.paletteMode);
  if (fixed) return fixed;

  const pixels = [];
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] <= settings.alphaThreshold) continue;
    pixels.push([data[index], data[index + 1], data[index + 2]]);
  }

  if (!pixels.length) return [[0, 0, 0]];
  if (settings.paletteMode === "retrace") {
    return retracePalette(pixels, settings.paletteSize);
  }
  if (settings.paletteMode === "kmeans") {
    return kMeansPalette(pixels, settings.paletteSize);
  }
  return medianCutPalette(pixels, settings.paletteSize);
}

function fixedPalette(mode) {
  const palettes = {
    pico8: [[0, 0, 0], [29, 43, 83], [126, 37, 83], [0, 135, 81], [171, 82, 54], [95, 87, 79], [194, 195, 199], [255, 241, 232], [255, 0, 77], [255, 163, 0], [255, 236, 39], [0, 228, 54], [41, 173, 255], [131, 118, 156], [255, 119, 168], [255, 204, 170]],
    gameboy: [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]],
    nes: [[124, 124, 124], [0, 0, 252], [0, 0, 188], [68, 40, 188], [148, 0, 132], [168, 0, 32], [168, 16, 0], [136, 20, 0], [80, 48, 0], [0, 120, 0], [0, 104, 0], [0, 88, 0], [0, 64, 88], [0, 0, 0], [188, 188, 188], [248, 248, 248]],
    grayscale: [[0, 0, 0], [48, 48, 48], [96, 96, 96], [144, 144, 144], [192, 192, 192], [240, 240, 240]]
  };
  return palettes[mode] || null;
}

function medianCutPalette(pixels, size) {
  let boxes = [{ pixels }];
  while (boxes.length < size) {
    boxes.sort((a, b) => colorBoxRange(b.pixels) - colorBoxRange(a.pixels));
    const box = boxes.shift();
    if (!box || box.pixels.length <= 1) {
      if (box) boxes.push(box);
      break;
    }
    const channel = widestChannel(box.pixels);
    box.pixels.sort((a, b) => a[channel] - b[channel]);
    const middle = Math.floor(box.pixels.length / 2);
    boxes.push({ pixels: box.pixels.slice(0, middle) }, { pixels: box.pixels.slice(middle) });
  }
  return boxes.map((box) => averageColor(box.pixels));
}

function retracePalette(pixels, size) {
  const groups = new Map();
  for (const pixel of pixels) {
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);
    const hueGroup = hsl.s < 0.12 ? "gray" : Math.floor(hsl.h * 14);
    const saturationGroup = Math.floor(hsl.s * 4);
    const lightnessGroup = Math.floor(hsl.l * 6);
    const key = `${hueGroup}:${saturationGroup}:${lightnessGroup}`;
    const group = groups.get(key) || { r: 0, g: 0, b: 0, count: 0, lightness: 0 };
    group.r += pixel[0];
    group.g += pixel[1];
    group.b += pixel[2];
    group.lightness += hsl.l;
    group.count += 1;
    groups.set(key, group);
  }

  const palette = [...groups.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, size)
    .map((group) => [
      Math.round(group.r / group.count),
      Math.round(group.g / group.count),
      Math.round(group.b / group.count)
    ]);

  if (palette.length < size && palette.length > 0) {
    const darkest = [...palette].sort((a, b) => luminance(a[0], a[1], a[2]) - luminance(b[0], b[1], b[2]))[0];
    palette.unshift([
      Math.round(darkest[0] * 0.36),
      Math.round(darkest[1] * 0.34),
      Math.round(darkest[2] * 0.42)
    ]);
  }

  return palette.length ? palette.slice(0, size) : medianCutPalette(pixels, size);
}

function kMeansPalette(pixels, size) {
  const sampled = deterministicSamplePixels(pixels, 12000);
  let centers = medianCutPalette(sampled, Math.min(size, sampled.length)).map((color) => color.map(Number));
  if (!centers.length) return [[0, 0, 0]];

  for (let iteration = 0; iteration < 10; iteration += 1) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (const pixel of sampled) {
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (let index = 0; index < centers.length; index += 1) {
        const center = centers[index];
        const distance = colorDistanceRgb(pixel[0], pixel[1], pixel[2], center[0], center[1], center[2]);
        if (distance < bestDistance) {
          best = index;
          bestDistance = distance;
        }
      }
      sums[best][0] += pixel[0];
      sums[best][1] += pixel[1];
      sums[best][2] += pixel[2];
      sums[best][3] += 1;
    }

    centers = centers.map((center, index) => {
      const sum = sums[index];
      if (sum[3] === 0) return center;
      return [
        Math.round(sum[0] / sum[3]),
        Math.round(sum[1] / sum[3]),
        Math.round(sum[2] / sum[3])
      ];
    });
  }

  return centers;
}

function deterministicSamplePixels(pixels, limit) {
  if (pixels.length <= limit) return pixels;
  const stride = pixels.length / limit;
  const sampled = [];
  for (let index = 0; index < limit; index += 1) {
    sampled.push(pixels[Math.floor(index * stride)]);
  }
  return sampled;
}

function colorBoxRange(pixels) {
  const ranges = channelRanges(pixels);
  return Math.max(ranges[0], ranges[1], ranges[2]);
}

function widestChannel(pixels) {
  const ranges = channelRanges(pixels);
  return ranges.indexOf(Math.max(ranges[0], ranges[1], ranges[2]));
}

function channelRanges(pixels) {
  const min = [255, 255, 255];
  const max = [0, 0, 0];
  for (const pixel of pixels) {
    for (let channel = 0; channel < 3; channel += 1) {
      min[channel] = Math.min(min[channel], pixel[channel]);
      max[channel] = Math.max(max[channel], pixel[channel]);
    }
  }
  return [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
}

function averageColor(pixels) {
  const total = pixels.reduce((sum, pixel) => {
    sum[0] += pixel[0];
    sum[1] += pixel[1];
    sum[2] += pixel[2];
    return sum;
  }, [0, 0, 0]);
  return total.map((value) => Math.round(value / pixels.length));
}

function quantizePixelData(imageData, palette, settings, edgeMap) {
  const output = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  if (settings.ditherMode === "floyd") return floydSteinbergQuantize(output, palette, settings);
  if (settings.ditherMode === "ordered") return orderedDitherQuantize(output, palette, settings);

  for (let pixel = 0; pixel < output.width * output.height; pixel += 1) {
    const index = pixel * 4;
    if (output.data[index + 3] <= settings.alphaThreshold) {
      output.data[index + 3] = 0;
      continue;
    }
    const color = nearestPaletteColor(output.data[index], output.data[index + 1], output.data[index + 2], palette, edgeMap[pixel]);
    output.data[index] = color[0];
    output.data[index + 1] = color[1];
    output.data[index + 2] = color[2];
  }
  return output;
}

function nearestPaletteColor(r, g, b, palette, edgeBias = 0) {
  let best = palette[0];
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const color of palette) {
    const distance = colorDistanceRgb(r, g, b, color[0], color[1], color[2]) - edgeBias * luminanceDistance(r, g, b, color);
    if (distance < bestDistance) {
      best = color;
      bestDistance = distance;
    }
  }
  return best;
}

function colorDistanceRgb(r1, g1, b1, r2, g2, b2) {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function luminanceDistance(r, g, b, color) {
  const a = luminance(r, g, b);
  const c = luminance(color[0], color[1], color[2]);
  return Math.abs(a - c);
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: lightness };

  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue;
  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }
  return { h: hue / 6, s: saturation, l: lightness };
}

function hslToRgb(h, s, l) {
  if (s === 0) {
    const value = Math.round(l * 255);
    return [value, value, value];
  }

  const hueToRgb = (p, q, t) => {
    let next = t;
    if (next < 0) next += 1;
    if (next > 1) next -= 1;
    if (next < 1 / 6) return p + (q - p) * 6 * next;
    if (next < 1 / 2) return q;
    if (next < 2 / 3) return p + (q - p) * (2 / 3 - next) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255)
  ];
}

function snapToPixelRamp(value, steps, strength) {
  const ramp = steps <= 3
    ? [0.18, 0.42, 0.72]
    : steps <= 4
      ? [0.16, 0.34, 0.56, 0.78]
      : [0.12, 0.28, 0.44, 0.62, 0.82];
  let nearest = ramp[0];
  let distance = Math.abs(value - nearest);
  for (const stop of ramp) {
    const nextDistance = Math.abs(value - stop);
    if (nextDistance < distance) {
      nearest = stop;
      distance = nextDistance;
    }
  }
  return value * (1 - strength) + nearest * strength;
}

function celShadeRetracedPixels(data, width, height, settings, edgeMap) {
  const strength = settings.retraceStrength || 0;
  if (strength <= 0) return;

  const shadeBands = Math.max(3, Math.round(5 - strength * 2.2));
  const hueBands = Math.max(10, Math.round(18 - strength * 7));
  const groups = new Map();

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const index = pixel * 4;
    if (data[index + 3] <= settings.alphaThreshold) continue;
    const hsl = rgbToHsl(data[index], data[index + 1], data[index + 2]);
    const key = `${hsl.s < 0.1 ? "gray" : Math.floor(hsl.h * hueBands)}:${Math.floor(hsl.s * 4)}:${Math.floor(hsl.l * shadeBands)}`;
    const group = groups.get(key) || { r: 0, g: 0, b: 0, count: 0 };
    const edgeWeight = edgeMap[pixel] > 0.5 ? 2 : 1;
    group.r += data[index] * edgeWeight;
    group.g += data[index + 1] * edgeWeight;
    group.b += data[index + 2] * edgeWeight;
    group.count += edgeWeight;
    groups.set(key, group);
  }

  const colors = new Map();
  for (const [key, group] of groups.entries()) {
    colors.set(key, [
      Math.round(group.r / group.count),
      Math.round(group.g / group.count),
      Math.round(group.b / group.count)
    ]);
  }

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    const index = pixel * 4;
    if (data[index + 3] <= settings.alphaThreshold) continue;
    const hsl = rgbToHsl(data[index], data[index + 1], data[index + 2]);
    const key = `${hsl.s < 0.1 ? "gray" : Math.floor(hsl.h * hueBands)}:${Math.floor(hsl.s * 4)}:${Math.floor(hsl.l * shadeBands)}`;
    const color = colors.get(key);
    if (!color) continue;
    data[index] = Math.round(data[index] * (1 - strength) + color[0] * strength);
    data[index + 1] = Math.round(data[index + 1] * (1 - strength) + color[1] * strength);
    data[index + 2] = Math.round(data[index + 2] * (1 - strength) + color[2] * strength);
  }
}

function tracePixelSilhouette(data, width, height, settings, edgeMap) {
  const strength = Math.max(settings.outlineStrength, settings.retraceStrength * 0.82);
  if (strength <= 0) return;

  const copy = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const index = pixel * 4;
      if (copy[index + 3] <= settings.alphaThreshold) continue;

      const boundary = touchesTransparentPixel8(pixel, copy, width, height, settings.alphaThreshold);
      const contour = edgeMap[pixel] > 0.42 && isDarkerThanNeighbors(copy, width, height, x, y);
      if (!boundary && !contour) continue;

      const amount = boundary ? Math.min(0.92, strength) : Math.min(0.62, strength * 0.72);
      const outline = [
        Math.max(10, Math.round(copy[index] * 0.28)),
        Math.max(8, Math.round(copy[index + 1] * 0.26)),
        Math.max(14, Math.round(copy[index + 2] * 0.34))
      ];
      data[index] = Math.round(copy[index] * (1 - amount) + outline[0] * amount);
      data[index + 1] = Math.round(copy[index + 1] * (1 - amount) + outline[1] * amount);
      data[index + 2] = Math.round(copy[index + 2] * (1 - amount) + outline[2] * amount);
      data[index + 3] = copy[index + 3] >= 128 ? 255 : copy[index + 3];
    }
  }
}

function touchesTransparentPixel8(pixel, data, width, height, alphaThreshold = 254) {
  const x = pixel % width;
  const y = Math.floor(pixel / width);
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) return true;
      if (data[(ny * width + nx) * 4 + 3] <= alphaThreshold) return true;
    }
  }
  return false;
}

function countOpaqueNeighbors(data, width, height, x, y, alphaThreshold) {
  let count = 0;
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (data[(ny * width + nx) * 4 + 3] > alphaThreshold) count += 1;
    }
  }
  return count;
}

function countCardinalOpaqueNeighbors(data, width, height, x, y, alphaThreshold) {
  let count = 0;
  const offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [ox, oy] of offsets) {
    const nx = x + ox;
    const ny = y + oy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    if (data[(ny * width + nx) * 4 + 3] > alphaThreshold) count += 1;
  }
  return count;
}

function sameColorNeighborCount(data, width, height, x, y, alphaThreshold) {
  const index = (y * width + x) * 4;
  const key = rgbKey(data, index);
  let count = 0;
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = (ny * width + nx) * 4;
      if (data[next + 3] > alphaThreshold && rgbKey(data, next) === key) count += 1;
    }
  }
  return count;
}

function hasRampAlignment(data, width, height, x, y, alphaThreshold) {
  const index = (y * width + x) * 4;
  const key = rgbKey(data, index);
  const pairs = [
    [[-1, 0], [1, 0]],
    [[0, -1], [0, 1]],
    [[-1, -1], [1, 1]],
    [[1, -1], [-1, 1]]
  ];

  return pairs.some((pair) => pair.every(([ox, oy]) => {
    const nx = x + ox;
    const ny = y + oy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) return false;
    const next = (ny * width + nx) * 4;
    return data[next + 3] > alphaThreshold && rgbKey(data, next) === key;
  }));
}

function dominantNeighborRgbForPixel(data, width, height, x, y, alphaThreshold) {
  const counts = new Map();
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const index = (ny * width + nx) * 4;
      if (data[index + 3] <= alphaThreshold) continue;
      const key = rgbKey(data, index);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return winner ? winner[0].split(",").map(Number) : null;
}

function floydSteinbergQuantize(imageData, palette, settings) {
  const { width, height } = imageData;
  const work = Float32Array.from(imageData.data);
  const output = new ImageData(width, height);
  const strength = settings.ditherStrength;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = work[index + 3];
      if (alpha <= settings.alphaThreshold) {
        output.data[index + 3] = 0;
        continue;
      }
      const oldColor = [work[index], work[index + 1], work[index + 2]];
      const nextColor = nearestPaletteColor(oldColor[0], oldColor[1], oldColor[2], palette);
      output.data[index] = nextColor[0];
      output.data[index + 1] = nextColor[1];
      output.data[index + 2] = nextColor[2];
      output.data[index + 3] = Math.round(alpha);
      diffuseError(work, width, height, x + 1, y, oldColor, nextColor, 7 / 16 * strength);
      diffuseError(work, width, height, x - 1, y + 1, oldColor, nextColor, 3 / 16 * strength);
      diffuseError(work, width, height, x, y + 1, oldColor, nextColor, 5 / 16 * strength);
      diffuseError(work, width, height, x + 1, y + 1, oldColor, nextColor, 1 / 16 * strength);
    }
  }
  return output;
}

function diffuseError(work, width, height, x, y, oldColor, nextColor, amount) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const index = (y * width + x) * 4;
  for (let channel = 0; channel < 3; channel += 1) {
    work[index + channel] += (oldColor[channel] - nextColor[channel]) * amount;
  }
}

function orderedDitherQuantize(imageData, palette, settings) {
  const matrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];
  const output = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
  const amount = 72 * settings.ditherStrength;
  for (let y = 0; y < output.height; y += 1) {
    for (let x = 0; x < output.width; x += 1) {
      const index = (y * output.width + x) * 4;
      if (output.data[index + 3] <= settings.alphaThreshold) {
        output.data[index + 3] = 0;
        continue;
      }
      const offset = ((matrix[y % 4][x % 4] + 0.5) / 16 - 0.5) * amount;
      const color = nearestPaletteColor(
        clampNumber(output.data[index] + offset, 0, 255, output.data[index]),
        clampNumber(output.data[index + 1] + offset, 0, 255, output.data[index + 1]),
        clampNumber(output.data[index + 2] + offset, 0, 255, output.data[index + 2]),
        palette
      );
      output.data[index] = color[0];
      output.data[index + 1] = color[1];
      output.data[index + 2] = color[2];
    }
  }
  return output;
}

function cleanupPixelClusters(data, width, height, passes, edgeMap, alphaThreshold) {
  for (let pass = 0; pass < passes; pass += 1) {
    const copy = new Uint8ClampedArray(data);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const pixel = y * width + x;
        const index = pixel * 4;
        if (copy[index + 3] <= alphaThreshold || edgeMap[pixel] > 0.55) continue;
        const current = rgbKey(copy, index);
        const counts = new Map();
        let same = 0;
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            if (ox === 0 && oy === 0) continue;
            const next = ((y + oy) * width + x + ox) * 4;
            if (copy[next + 3] <= alphaThreshold) continue;
            const key = rgbKey(copy, next);
            if (key === current) same += 1;
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        }
        const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
        if (winner && same <= 1 && winner[1] >= 4) {
          const color = winner[0].split(",").map(Number);
          data[index] = color[0];
          data[index + 1] = color[1];
          data[index + 2] = color[2];
        }
      }
    }
  }
}

function mergeTinyColorIslands(data, width, height, minArea, edgeMap, alphaThreshold) {
  if (minArea <= 1) return;

  const total = width * height;
  const visited = new Uint8Array(total);
  const component = [];
  const stack = [];

  for (let start = 0; start < total; start += 1) {
    if (visited[start] || data[start * 4 + 3] <= alphaThreshold) continue;

    component.length = 0;
    stack.length = 0;
    const startIndex = start * 4;
    const key = rgbKey(data, startIndex);
    let maxEdge = 0;
    visited[start] = 1;
    stack.push(start);

    while (stack.length) {
      const pixel = stack.pop();
      component.push(pixel);
      maxEdge = Math.max(maxEdge, edgeMap[pixel]);
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      const neighbors = [];
      if (x > 0) neighbors.push(pixel - 1);
      if (x < width - 1) neighbors.push(pixel + 1);
      if (y > 0) neighbors.push(pixel - width);
      if (y < height - 1) neighbors.push(pixel + width);

      for (const next of neighbors) {
        if (visited[next] || data[next * 4 + 3] <= alphaThreshold || rgbKey(data, next * 4) !== key) continue;
        visited[next] = 1;
        stack.push(next);
      }
    }

    if (component.length > minArea || (maxEdge > 0.82 && component.length > Math.max(2, Math.floor(minArea / 2)))) continue;
    const replacement = dominantNeighborColor(data, width, height, component, key, alphaThreshold);
    if (!replacement) continue;
    for (const pixel of component) {
      const index = pixel * 4;
      data[index] = replacement[0];
      data[index + 1] = replacement[1];
      data[index + 2] = replacement[2];
    }
  }
}

function dominantNeighborColor(data, width, height, component, ownKey, alphaThreshold) {
  const counts = new Map();
  const componentSet = new Set(component);
  for (const pixel of component) {
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const neighbors = [];
    if (x > 0) neighbors.push(pixel - 1);
    if (x < width - 1) neighbors.push(pixel + 1);
    if (y > 0) neighbors.push(pixel - width);
    if (y < height - 1) neighbors.push(pixel + width);
    for (const next of neighbors) {
      if (componentSet.has(next) || data[next * 4 + 3] <= alphaThreshold) continue;
      const key = rgbKey(data, next * 4);
      if (key === ownKey) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  const winner = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return winner ? winner[0].split(",").map(Number) : null;
}

function rgbKey(data, index) {
  return `${data[index]},${data[index + 1]},${data[index + 2]}`;
}

function reinforcePixelOutlines(data, width, height, strength, alphaThreshold, edgeMap) {
  if (strength <= 0) return;
  const copy = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x;
      const index = pixel * 4;
      if (copy[index + 3] <= alphaThreshold) continue;
      const boundary = touchesTransparentPixel(pixel, copy, width, height);
      const internalDarkEdge = edgeMap[pixel] > 0.48 && isDarkerThanNeighbors(copy, width, height, x, y);
      if (!boundary && !internalDarkEdge) continue;
      const amount = boundary ? strength : strength * 0.68;
      data[index] = Math.round(copy[index] * (1 - amount) + 18 * amount);
      data[index + 1] = Math.round(copy[index + 1] * (1 - amount) + 16 * amount);
      data[index + 2] = Math.round(copy[index + 2] * (1 - amount) + 28 * amount);
    }
  }
}

function isDarkerThanNeighbors(data, width, height, x, y) {
  const pixel = y * width + x;
  const index = pixel * 4;
  const current = luminance(data[index], data[index + 1], data[index + 2]);
  let total = 0;
  let count = 0;
  for (let oy = -1; oy <= 1; oy += 1) {
    for (let ox = -1; ox <= 1; ox += 1) {
      if (ox === 0 && oy === 0) continue;
      const nx = x + ox;
      const ny = y + oy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const next = (ny * width + nx) * 4;
      if (data[next + 3] === 0) continue;
      total += luminance(data[next], data[next + 1], data[next + 2]);
      count += 1;
    }
  }
  return count > 0 && current + 16 < total / count;
}

function upscaleImageDataNearest(imageData, scale) {
  const canvas = document.createElement("canvas");
  canvas.width = imageData.width * scale;
  canvas.height = imageData.height * scale;
  const source = document.createElement("canvas");
  source.width = imageData.width;
  source.height = imageData.height;
  source.getContext("2d").putImageData(imageData, 0, 0);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function packPixelCanvases(canvases, settings) {
  const padding = settings.padding;
  const maxWidth = Math.max(...canvases.map((canvas) => canvas.width));
  const maxHeight = Math.max(...canvases.map((canvas) => canvas.height));
  const columns = settings.columns > 0 ? Math.min(settings.columns, canvases.length) : Math.ceil(Math.sqrt(canvases.length));
  const rows = Math.ceil(canvases.length / columns);
  const output = document.createElement("canvas");
  output.width = columns * maxWidth + (columns + 1) * padding;
  output.height = rows * maxHeight + (rows + 1) * padding;
  const ctx = output.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  canvases.forEach((canvas, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + column * (maxWidth + padding);
    const y = padding + row * (maxHeight + padding);
    drawFrameWithOptionalExtrusion(ctx, canvas, x, y, Math.max(0, Math.ceil(padding / 2)));
  });

  return output;
}

function drawPixelOutput(canvas) {
  ui.pixelCanvas.width = canvas.width;
  ui.pixelCanvas.height = canvas.height;
  ui.pixelCanvas.getContext("2d").drawImage(canvas, 0, 0);
  ui.pixelCanvas.style.display = "block";
  ui.pixelEmptyState.style.display = "none";
}

function revokePixelOutput() {
  if (state.pixelBlobUrl) URL.revokeObjectURL(state.pixelBlobUrl);
  state.pixelBlobUrl = null;
  ui.downloadPixelPng.disabled = true;
}

function preparePixelDownload(canvas) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    revokePixelOutput();
    state.pixelBlobUrl = URL.createObjectURL(blob);
    ui.downloadPixelPng.disabled = false;
  }, "image/png");
}

function buildMetadata(packed, decoded, settings, sourceFile) {
  return {
    meta: {
      app: "Sprite Sheets Maker",
      source: sourceFile,
      image: `${state.outputName}.png`,
      format: "RGBA8888",
      size: {
        width: packed.canvas.width,
        height: packed.canvas.height
      },
      scale: 1,
      frameCount: packed.frames.length,
      columns: packed.columns,
      rows: packed.rows,
      cell: packed.cell,
      decoder: decoded.decoder,
      generatedAt: new Date().toISOString()
    },
    frames: packed.frames.map((frame, index) => ({
      filename: frame.name,
      index,
      sourceIndex: frame.sourceIndex,
      sourceName: frame.sourceName || null,
      frame: frame.frame,
      rotated: false,
      trimmed: settings.cropMode !== "none",
      spriteSourceSize: frame.spriteSourceSize,
      sourceSize: frame.sourceSize,
      duration: frame.duration,
      pivot: frame.pivot
    }))
  };
}

function serializeMetadata(metadata, format) {
  if (format === "xml") return metadataToXml(metadata);
  if (format === "csv") return metadataToCsv(metadata);
  return JSON.stringify(metadata, null, 2);
}

function metadataToXml(metadata) {
  const frames = metadata.frames.map((frame) => {
    return [
      `  <frame name="${xmlEscape(frame.filename)}" sourceName="${xmlEscape(frame.sourceName || "")}" index="${frame.index}" sourceIndex="${frame.sourceIndex}" duration="${frame.duration}" rotated="${frame.rotated}" trimmed="${frame.trimmed}">`,
      `    <rect x="${frame.frame.x}" y="${frame.frame.y}" width="${frame.frame.width}" height="${frame.frame.height}" />`,
      `    <spriteSourceSize x="${frame.spriteSourceSize.x}" y="${frame.spriteSourceSize.y}" width="${frame.spriteSourceSize.width}" height="${frame.spriteSourceSize.height}" />`,
      `    <sourceSize width="${frame.sourceSize.width}" height="${frame.sourceSize.height}" />`,
      `    <pivot x="${frame.pivot.x}" y="${frame.pivot.y}" pixelX="${frame.pivot.pixelX}" pixelY="${frame.pivot.pixelY}" />`,
      "  </frame>"
    ].join("\n");
  }).join("\n");

  const meta = metadata.meta;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<spritesheet app="${xmlEscape(meta.app)}" source="${xmlEscape(meta.source)}" image="${xmlEscape(meta.image)}" frameCount="${meta.frameCount}">`,
    `  <size width="${meta.size.width}" height="${meta.size.height}" />`,
    `  <layout columns="${meta.columns}" rows="${meta.rows}" cellWidth="${meta.cell.width}" cellHeight="${meta.cell.height}" />`,
    frames,
    "</spritesheet>"
  ].join("\n");
}

function metadataToCsv(metadata) {
  const header = [
    "filename",
    "sourceName",
    "index",
    "sourceIndex",
    "x",
    "y",
    "width",
    "height",
    "duration",
    "pivotX",
    "pivotY",
    "pivotPixelX",
    "pivotPixelY",
    "sourceWidth",
    "sourceHeight",
    "spriteSourceX",
    "spriteSourceY",
    "spriteSourceWidth",
    "spriteSourceHeight"
  ];
  const rows = metadata.frames.map((frame) => [
    frame.filename,
    frame.sourceName || "",
    frame.index,
    frame.sourceIndex,
    frame.frame.x,
    frame.frame.y,
    frame.frame.width,
    frame.frame.height,
    frame.duration,
    frame.pivot.x,
    frame.pivot.y,
    frame.pivot.pixelX,
    frame.pivot.pixelY,
    frame.sourceSize.width,
    frame.sourceSize.height,
    frame.spriteSourceSize.x,
    frame.spriteSourceSize.y,
    frame.spriteSourceSize.width,
    frame.spriteSourceSize.height
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function csvEscape(value) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function drawSheet(packed) {
  ui.sheetCanvas.width = packed.canvas.width;
  ui.sheetCanvas.height = packed.canvas.height;
  ui.sheetCanvas.getContext("2d").drawImage(packed.canvas, 0, 0);
  ui.sheetCanvas.style.display = "block";
  ui.emptyState.style.display = "none";
}

function resetDownloads() {
  if (state.sheetBlobUrl) URL.revokeObjectURL(state.sheetBlobUrl);
  if (state.metadataBlobUrl) URL.revokeObjectURL(state.metadataBlobUrl);
  state.sheetBlobUrl = null;
  state.metadataBlobUrl = null;
  ui.downloadPng.disabled = true;
  ui.downloadMeta.disabled = true;
}

function prepareDownloads(canvas, metadataText, metadataFormat) {
  canvas.toBlob((blob) => {
    state.sheetBlobUrl = URL.createObjectURL(blob);
    ui.downloadPng.disabled = false;
  }, "image/png");

  const mime = metadataFormat === "json"
    ? "application/json"
    : metadataFormat === "xml"
      ? "application/xml"
      : "text/csv";
  const blob = new Blob([metadataText], { type: `${mime}; charset=utf-8` });
  state.metadataBlobUrl = URL.createObjectURL(blob);
  ui.downloadMeta.disabled = false;
}

function showSummary(decodedCount, duplicateCount, packed, format) {
  ui.summary.innerHTML = [
    `<strong>${packed.frames.length}</strong> frames packed into <strong>${packed.canvas.width}x${packed.canvas.height}</strong>.`,
    `Decoded ${decodedCount}; removed ${duplicateCount} duplicate${duplicateCount === 1 ? "" : "s"}.`,
    `Layout: ${packed.columns} columns x ${packed.rows} rows; metadata: ${format.toUpperCase()}.`
  ].join(" ");
}

function downloadUrl(url, filename) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

ui.fileInput.addEventListener("change", () => onFiles(ui.fileInput.files));
ui.backgroundFileInput.addEventListener("change", () => onFiles(ui.backgroundFileInput.files));
ui.pixelFileInput.addEventListener("change", () => onPixelFiles(ui.pixelFileInput.files));
ui.pixelFolderInput.addEventListener("change", () => onPixelFiles(ui.pixelFolderInput.files));
ui.pixelFolderBtn.addEventListener("click", () => ui.pixelFolderInput.click());
ui.convertBtn.addEventListener("click", convert);
ui.pixelConvertBtn.addEventListener("click", convertPixelArt);

ui.tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchPage(button.dataset.pageTarget));
});

[ui.useSourceFps, ui.useSourceFrameCount, ui.removeDuplicates].forEach((control) => {
  control.addEventListener("change", syncFrameControls);
});

[ui.sizeMode, ui.backgroundMode].forEach((control) => {
  control.addEventListener("change", () => {
    syncConditionalControls();
    scheduleFirstFramePreview();
  });
});

[ui.pixelPaletteMode, ui.pixelObjectMosaic].forEach((control) => {
  control.addEventListener("change", syncPixelControls);
});

[
  ui.frameWidth,
  ui.frameHeight,
  ui.multiplier,
  ui.fitMode,
  ui.keyColor,
  ui.keyTolerance,
  ui.alphaNoise,
  ui.matteRefine,
  ui.despillEdges,
  ui.cleanTransparentRgb,
  ui.edgeExtrusion,
  ui.cropMode
].forEach((control) => {
  control.addEventListener("input", scheduleFirstFramePreview);
  control.addEventListener("change", scheduleFirstFramePreview);
});

ui.downloadPng.addEventListener("click", () => {
  if (state.sheetBlobUrl) downloadUrl(state.sheetBlobUrl, `${state.outputName}.png`);
});

ui.downloadMeta.addEventListener("click", () => {
  if (state.metadataBlobUrl) downloadUrl(state.metadataBlobUrl, `${state.outputName}.${ui.metadataFormat.value}`);
});

ui.downloadBgPreview.addEventListener("click", () => {
  if (state.backgroundPreviewBlobUrl) downloadUrl(state.backgroundPreviewBlobUrl, `${state.outputName}_background_removed.png`);
});

ui.downloadPixelPng.addEventListener("click", () => {
  if (state.pixelBlobUrl) downloadUrl(state.pixelBlobUrl, `${state.outputName}_pixel_art.png`);
});

function bindDropZone(dropZone, onDrop) {
  ["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove("dragging");
    });
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    onDrop(event.dataTransfer.files);
  });
}

bindDropZone(ui.dropZone, onFiles);
bindDropZone(ui.backgroundDropZone, onFiles);
bindDropZone(ui.pixelDropZone, onPixelFiles);

setupRangeTooltips();
syncConditionalControls();
updateCodecStatus();
