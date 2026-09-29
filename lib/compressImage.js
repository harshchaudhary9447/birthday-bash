/**
 * Client-side image compression utility.
 * Compresses images greater than maxSizeKB (default 500 KB) using HTML5 Canvas.
 */
export async function compressImage(file, maxSizeKB = 500) {
  if (typeof window === "undefined" || !file) return file;

  // If already under or equal to max size, skip compression
  if (file.size <= maxSizeKB * 1024) {
    return file;
  }

  // Non-image files skip compression
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Downscale very large photos while preserving aspect ratio
        const maxDimension = 1600;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Iteratively reduce quality until under maxSizeKB or minimum quality reached
        const tryQuality = (quality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              if (blob.size <= maxSizeKB * 1024 || quality <= 0.4) {
                const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                const compressedFile = new File([blob], newFileName, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                tryQuality(Math.max(0.35, quality - 0.15));
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryQuality(0.82);
      };

      img.onerror = () => resolve(file);
      img.src = readerEvent.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
