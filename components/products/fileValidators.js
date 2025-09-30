// utils/fileValidators.js

/**
 * Validate an image before upload
 * @param {File} file - The image file
 * @param {Object} options - Validation settings
 * @returns {Promise<{ valid: boolean, errors: string[] }>}
 */
export async function validateImage(file, options = {}) {
  const {
    maxSizeMB = 2,
    minResolution = 700,
    maxResolution = 1200,
    mustBeSquare = true,
    checkBackground = false,
  } = options;

  let errors = [];

  // ✅ Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`File size exceeds ${maxSizeMB}MB`);
  }

  // ✅ Load image
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

  // ✅ Resolution checks
  if (width < minResolution || height < minResolution) {
    errors.push(`Image must be at least ${minResolution}px on each side`);
  }
  if (width > maxResolution || height > maxResolution) {
    errors.push(`Image must not exceed ${maxResolution}px on each side`);
  }

  // ✅ Square check
  if (mustBeSquare && width !== height) {
    errors.push("Image must be square (equal width and height)");
  }

  // ✅ Background check (approximate - checks corner pixel colors)
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

    const isPlainBackground = corners.every(([r, g, b]) =>
      (r > 200 && g > 200 && b > 200) || // white-ish
      (Math.abs(r - g) < 10 && Math.abs(g - b) < 10) // plain color-ish
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

  // ✅ File size
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`Video size exceeds ${maxSizeMB}MB`);
  }

  // ✅ Load video metadata
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
