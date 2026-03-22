// utils/fileValidators.js

/**
 * Auto-corrects a non-square image to square by cropping or padding.
 * Returns a new File object ready for upload.
 *
 * @param {File} file - The original image file
 * @param {"crop" | "pad"} strategy
 *   - "crop": center-crops to the shorter dimension (good for filled-frame products)
 *   - "pad": adds neutral padding to reach the longer dimension (preserves full product)
 * @param {string} padColor - CSS color for padding background (default: white)
 * @returns {Promise<File>} - A new square image File
 */
export async function squareifyImage(file, strategy = "pad", padColor = "#FFFFFF") {
  const imageDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageDataUrl;
  });

  const { width, height } = image;

  // Already square — skip processing
  if (width === height) return file;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (strategy === "crop") {
    // Center-crop to the shorter side
    const size = Math.min(width, height);
    canvas.width = size;
    canvas.height = size;

    const offsetX = (width - size) / 2;
    const offsetY = (height - size) / 2;

    ctx.drawImage(image, offsetX, offsetY, size, size, 0, 0, size, size);

  } else {
    // Pad to the longer side
    const size = Math.max(width, height);
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = padColor;
    ctx.fillRect(0, 0, size, size);

    const offsetX = (size - width) / 2;
    const offsetY = (size - height) / 2;

    ctx.drawImage(image, offsetX, offsetY);
  }

  // Convert canvas back to a File
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error("Canvas toBlob failed"));
        // Preserve original filename; mark it so you can track auto-corrections
        const correctedFile = new File([blob], file.name, { type: file.type });
        resolve(correctedFile);
      },
      file.type,
      0.92 // Quality for JPEG; ignored for PNG
    );
  });
}


/**
 * Validate an image before upload.
 * Non-square images are no longer rejected — use squareifyImage() before calling this.
 *
 * @param {File} file - The image file
 * @param {Object} options - Validation settings
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateImage(file, options = {}) {
  const {
    maxSizeMB = 2,
    minResolution = 400,
    maxResolution = 1800,
    checkBackground = false,
  } = options;
  // NOTE: mustBeSquare removed — squareifyImage() handles this upstream

  let errors = [];

  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File size exceeds ${maxSizeMB}MB`);
  }

  const imageDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageDataUrl;
  });

  const { width, height } = image;

  if (width < minResolution || height < minResolution) {
    errors.push(`Image must be at least ${minResolution}px on each side`);
  }
  if (width > maxResolution || height > maxResolution) {
    errors.push(`Image must not exceed ${maxResolution}px on each side`);
  }

  if (checkBackground) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0);

    const corners = [
      ctx.getImageData(0, 0, 1, 1).data,
      ctx.getImageData(width - 1, 0, 1, 1).data,
      ctx.getImageData(0, height - 1, 1, 1).data,
      ctx.getImageData(width - 1, height - 1, 1, 1).data,
    ];

    const isPlainBackground = corners.every(
      ([r, g, b]) =>
        (r > 200 && g > 200 && b > 200) ||
        (Math.abs(r - g) < 10 && Math.abs(g - b) < 10)
    );

    if (!isPlainBackground) {
      errors.push("Image background must be plain (preferably white)");
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function validateVideo(file, options = {}) {
  const {
    maxSizeMB = 10,
    maxDuration = 30, // seconds
    minResolution = [640, 480], // [width, height]
    maxResolution = [1920, 1080],
  } = options;

  let errors = [];

  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`Video size exceeds ${maxSizeMB}MB`);
  }

  const videoMeta = await new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => reject("Error loading video metadata");

    video.src = URL.createObjectURL(file);
  });

  // ✅ Duration
  if (videoMeta.duration > maxDuration) {
    errors.push(`Video duration exceeds ${maxDuration} seconds`);
  }

  // ✅ Resolution
  if (
    videoMeta.width < minResolution[0] ||
    videoMeta.height < minResolution[1]
  ) {
    errors.push(
      `Video must be at least ${minResolution[0]}x${minResolution[1]}`
    );
  }
  if (
    videoMeta.width > maxResolution[0] ||
    videoMeta.height > maxResolution[1]
  ) {
    errors.push(
      `Video must not exceed ${maxResolution[0]}x${maxResolution[1]}`
    );
  }

  return { valid: errors.length === 0, errors };
}
