/**
 * Utility functions for image processing in the face recognition application
 */

// Image compression settings
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // Reduce to 5MB max
export const COMPRESSION_QUALITY = 0.85; // Slightly reduce quality for better performance
export const MAX_DIMENSION = 800; // Smaller max dimension
export const OPTIMAL_FACE_DIMENSION = 400; // Smaller optimal dimension for faster processing

/**
 * Try to use WebGL for faster image processing when available
 * @param canvas - The canvas element to get WebGL context from
 * @returns WebGL rendering context or null if not available
 */
export const tryGetWebGLContext = (
  canvas: HTMLCanvasElement
): WebGLRenderingContext | null => {
  try {
    // Try to get WebGL context first for better performance
    const glContext = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (glContext) {
      console.log("Using WebGL for image processing (faster)");
      return glContext;
    }
  } catch {
    console.log("WebGL not available, falling back to Canvas 2D");
  }
  return null;
};

/**
 * Compress an image to optimize size and dimensions for face recognition
 * @param file - The image file to compress
 * @returns Promise that resolves to the compressed file
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    // Skip compression for very small images
    if (file.size <= 50 * 1024) { // 50KB is already small enough
      console.log("Image is already small, skipping compression");
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Always resize to optimal dimensions for face recognition
        if (width > height) {
          if (width > OPTIMAL_FACE_DIMENSION) {
            height = Math.round((height * OPTIMAL_FACE_DIMENSION) / width);
            width = OPTIMAL_FACE_DIMENSION;
          }
        } else {
          if (height > OPTIMAL_FACE_DIMENSION) {
            width = Math.round((width * OPTIMAL_FACE_DIMENSION) / height);
            height = OPTIMAL_FACE_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        // Use standard 2D context for better compatibility
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          resolve(file);
          return;
        }

        // Fill with white background 
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Determine quality based on file size
        let quality = COMPRESSION_QUALITY;
        if (file.size > MAX_IMAGE_SIZE) {
          quality = 0.7; // Lower quality for very large files
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            const newFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            console.log(
              `Compressed: ${(file.size / 1024).toFixed(1)}KB → ${(
                newFile.size / 1024
              ).toFixed(1)}KB (${width}x${height})`
            );
            resolve(newFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

/**
 * Process large images efficiently
 * @param file - The image file to process
 * @returns Promise that resolves to the processed file
 */
export const processLargeImage = async (file: File): Promise<File> => {
  // Compress all images for consistency
  return compressImage(file);
};

/**
 * Convert a data URL to a File object
 * @param dataUrl - The data URL to convert
 * @param filename - The filename to use for the created file
 * @returns Promise that resolves to the created File
 */
export const dataUrlToFile = async (
  dataUrl: string,
  filename: string
): Promise<File> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
};
