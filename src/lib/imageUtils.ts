/**
 * Utility functions for image processing
 */

/**
 * Converts an image to AVIF format for better compression and quality
 * @param file Original image file
 * @returns Promise resolving to a new File object in AVIF format
 */
export async function convertToAvif(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Create a FileReader to read the image file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      // Create an image element to load the file
      const img = new Image();
      
      img.onload = () => {
        // Create a canvas to draw and convert the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to AVIF with high quality
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to AVIF'));
              return;
            }
            
            // Create a new file with AVIF extension
            const fileName = file.name.split('.')[0] + '.avif';
            const newFile = new File([blob], fileName, {
              type: 'image/avif',
              lastModified: Date.now()
            });
            
            resolve(newFile);
          },
          'image/avif',
          0.9 // High quality (90%)
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      // Set the image source to the file data
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read the file as a data URL
    reader.readAsDataURL(file);
  });
}

/**
 * Fallback function for browsers that don't support AVIF
 * Converts image to WebP format instead
 * @param file Original image file
 * @returns Promise resolving to a new File object in WebP format
 */
export async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image to WebP'));
              return;
            }
            
            const fileName = file.name.split('.')[0] + '.webp';
            const newFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            
            resolve(newFile);
          },
          'image/webp',
          0.9
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Converts an image to the best available format (AVIF or WebP)
 * Tries AVIF first, falls back to WebP if browser doesn't support AVIF
 * @param file Original image file
 * @returns Promise resolving to a new File object in AVIF or WebP format
 */
export async function convertToBestFormat(file: File): Promise<File> {
  try {
    // Check if browser supports AVIF
    const canvas = document.createElement('canvas');
    const supportsAvif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    
    if (supportsAvif) {
      return await convertToAvif(file);
    } else {
      console.log('AVIF not supported by this browser, falling back to WebP');
      return await convertToWebP(file);
    }
  } catch (error) {
    console.error('Error converting image:', error);
    // Return original file if conversion fails
    return file;
  }
}
