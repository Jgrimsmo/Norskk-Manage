/**
 * Client-side CORS Proxy Service
 * This utility provides various methods to load images despite CORS restrictions
 */

// List of public CORS proxy services
const CORS_PROXIES = [
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://cors-proxy.htmldriven.com/?url=',
];

/**
 * Attempts to load an image using various proxy services
 */
export const loadImageWithProxy = async (imageUrl) => {
  console.log(`Attempting to load image: ${imageUrl}`);
  
  // First try direct loading
  try {
    const directResult = await loadImageDirect(imageUrl);
    if (directResult) {
      console.log('✅ Direct loading successful');
      return directResult;
    }
  } catch (error) {
    console.warn('Direct loading failed:', error.message);
  }

  // Try using HTML canvas approach
  try {
    const canvasResult = await loadImageViaCanvas(imageUrl);
    if (canvasResult) {
      console.log('✅ Canvas loading successful');
      return canvasResult;
    }
  } catch (error) {
    console.warn('Canvas loading failed:', error.message);
  }

  // Try proxy services
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyResult = await loadImageViaProxy(imageUrl, proxy);
      if (proxyResult) {
        console.log(`✅ Proxy loading successful via ${proxy}`);
        return proxyResult;
      }
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error.message);
    }
  }

  throw new Error('All image loading methods failed');
};

/**
 * Direct image loading with CORS headers
 */
const loadImageDirect = async (imageUrl) => {
  const response = await fetch(imageUrl, {
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Accept': 'image/*,*/*;q=0.8',
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const blob = await response.blob();
  return blobToBase64(blob);
};

/**
 * Load image via HTML5 Canvas (can sometimes bypass CORS)
 */
const loadImageViaCanvas = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = imageUrl;
    
    // Timeout after 10 seconds
    setTimeout(() => reject(new Error('Canvas load timeout')), 10000);
  });
};

/**
 * Load image via proxy service
 */
const loadImageViaProxy = async (imageUrl, proxyUrl) => {
  const proxiedUrl = proxyUrl + encodeURIComponent(imageUrl);
  const response = await fetch(proxiedUrl, {
    method: 'GET',
    headers: {
      'Accept': 'image/*,*/*;q=0.8',
    }
  });
  
  if (!response.ok) {
    throw new Error(`Proxy HTTP ${response.status}`);
  }
  
  const blob = await response.blob();
  return blobToBase64(blob);
};

/**
 * Convert blob to base64
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Create a placeholder image when all loading methods fail
 */
export const createPlaceholderImage = (width = 400, height = 300, text = 'Image not available') => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  
  // Background
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  
  // Text
  ctx.fillStyle = '#666';
  ctx.font = '16px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2 - 10);
  ctx.fillText('(CORS restriction)', width / 2, height / 2 + 10);
  
  return canvas.toDataURL('image/png');
};

/**
 * Test if an image URL is accessible
 */
export const testImageAccess = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      mode: 'cors',
      credentials: 'omit'
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Enhanced image loading with multiple fallback strategies
 */
export const enhancedImageLoad = async (imageUrl, options = {}) => {
  const { 
    maxRetries = 3, 
    timeout = 15000,
    createPlaceholder = true,
    placeholderText = 'Image not available'
  } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Image load attempt ${attempt}/${maxRetries} for: ${imageUrl}`);
      
      const result = await Promise.race([
        loadImageWithProxy(imageUrl),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
      
      if (result) {
        console.log(`✅ Image loaded successfully on attempt ${attempt}`);
        return result;
      }
    } catch (error) {
      console.warn(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error(`💥 All ${maxRetries} attempts failed for image: ${imageUrl}`);
        
        if (createPlaceholder) {
          console.log('🖼️ Creating placeholder image');
          return createPlaceholderImage(400, 300, placeholderText);
        }
        
        throw new Error(`Failed to load image after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};
