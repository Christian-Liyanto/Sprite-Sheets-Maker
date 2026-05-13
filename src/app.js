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
  downloadBgPreview: $("downloadBgPreview")
};

const state = {
  file: null,
  files: [],
  outputName: "spritesheet",
  previewTimer: null,
  previewRun: 0,
  backgroundPreviewBlobUrl: null,
  sheetBlobUrl: null,
  metadataBlobUrl: null
};

function setProgress(message, isWarning = false) {
  ui.progress.innerHTML = isWarning ? `<span class="warning">${message}</span>` : message;
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

  try {
    setProgress("Decoding frames...");
    const decoded = await decodeFrames(state.files, settings, (message) => setProgress(message));

    if (!decoded.frames.length) {
      throw new Error("No frames could be decoded from this file.");
    }

    setProgress(`Processing ${decoded.frames.length} frames...`);
    let frames = processFrames(decoded.frames, decoded.source, settings);

    const beforeDuplicates = frames.length;
    if (settings.removeDuplicates) {
      frames = removeDuplicateFrames(frames, settings.duplicateThreshold);
    }

    if (!frames.length) {
      throw new Error("All frames were removed. Lower the duplicate threshold or disable duplicate removal.");
    }

    setProgress("Packing sprite sheet...");
    const packed = packFrames(frames, decoded, settings);
    drawSheet(packed);
    const metadata = buildMetadata(packed, decoded, settings, state.files.length > 1 ? `${state.files.length} image sequence files` : state.file.name);
    const metadataText = serializeMetadata(metadata, settings.metadataFormat);

    prepareDownloads(packed.canvas, metadataText, settings.metadataFormat);
    showSummary(decoded.frames.length, beforeDuplicates - frames.length, packed, settings.metadataFormat);
    setProgress("Done.");
  } catch (error) {
    console.error(error);
    setProgress(error.message || "Conversion failed.", true);
  } finally {
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
    if (index % 10 === 0) report(`Decoded ${index + 1} sequence frames...`);
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
        if (index % 10 === 0) report(`Decoded ${index + 1} image frames...`);
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
      if (index % 10 === 0) report(`Decoded ${index + 1} video frames...`);
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

      if (frames.length % 10 === 0) report(`Decoded ${frames.length} source video frames...`);
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
ui.convertBtn.addEventListener("click", convert);

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

syncConditionalControls();
updateCodecStatus();
