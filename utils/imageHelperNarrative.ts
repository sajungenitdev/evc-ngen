// utils/imageHelperNarrative.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';

// Map of display names to actual uploaded filenames
const ACTUAL_IMAGE_FILES: { [key: string]: string } = {
    // About page images
    'who-we-are.webp': 'about-1788168271374-441663082.webp',
    // Add your mission image filename here
    // 'mission.webp': 'about-[actual-mission-filename].webp',
    
    // Partner logos - map display names to actual uploaded files
    // Update these with the actual filenames from your uploads
    // 'voltgrid.jpg': 'voltgrid-1234567890.jpg',
    // 'chargepoint.png': 'chargepoint-1234567890.png',
    // 'greenmotion.png': 'greenmotion-1234567890.png',
    // 'ecodrive.webp': 'ecodrive-1234567890.webp',
    // 'ecopower.png': 'ecopower-1234567890.png',
    // 'futurevolt.jpg': 'futurevolt-1234567890.jpg',
};

/**
 * Get the full image URL from a path
 * @param imagePath - The image path (can be full URL, relative path, or filename)
 * @returns The full URL or null if invalid
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath || imagePath.trim() === '') {
        return null;
    }

    let trimmedPath = imagePath.trim();

    // If it's already a full URL
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
        return trimmedPath;
    }

    // If it's a data URL (base64)
    if (trimmedPath.startsWith('data:image')) {
        return trimmedPath;
    }

    // Remove /api if present
    if (trimmedPath.startsWith('/api')) {
        trimmedPath = trimmedPath.replace('/api', '');
    }

    // Clean up duplicate slashes
    trimmedPath = trimmedPath.replace(/\/+/g, '/');

    const baseUrl = API_BASE_URL.replace(/\/api$/, '');

    // Extract filename from path
    const filename = trimmedPath.split('/').pop() || '';

    // Check if the filename is in the mapping
    if (ACTUAL_IMAGE_FILES[filename]) {
        // If it's a partner logo (contains partners in path)
        if (trimmedPath.includes('/partners/') || trimmedPath.includes('/images/partners/')) {
            return `${baseUrl}/uploads/about/partners/${ACTUAL_IMAGE_FILES[filename]}`;
        }
        // For about images
        return `${baseUrl}/uploads/about/${ACTUAL_IMAGE_FILES[filename]}`;
    }

    // If it starts with /uploads, prepend the base URL
    if (trimmedPath.startsWith('/uploads')) {
        return `${baseUrl}${trimmedPath}`;
    }

    // If it's a partner logo path (starts with /images/partners/ or /partners/)
    if (trimmedPath.includes('/partners/') || trimmedPath.includes('/images/partners/')) {
        // Try to use the filename as is
        return `${baseUrl}/uploads/about/partners/${filename}`;
    }

    // If it's an about image
    if (trimmedPath.includes('who-we-are') || trimmedPath.includes('mission')) {
        return `${baseUrl}/uploads/about/${filename}`;
    }

    // If it's a simple filename (no path), assume it's in /uploads/about/
    if (!trimmedPath.includes('/')) {
        return `${baseUrl}/uploads/about/${trimmedPath}`;
    }

    // Default: try to use the path as is
    return `${baseUrl}${trimmedPath.startsWith('/') ? '' : '/'}${trimmedPath}`;
};

/**
 * Check if image is a default/placeholder image
 * @param imagePath - The image path to check
 * @returns boolean
 */
export const isDefaultImage = (imagePath: string | null | undefined): boolean => {
    if (!imagePath) return true;
    const path = imagePath.toLowerCase();
    return path.includes('default-product.jpg') ||
        path.includes('placeholder') ||
        path.includes('default.png') ||
        path.includes('no-image') ||
        path === 'default' ||
        path.trim() === '' ||
        path.includes('who-we-are.webp') ||
        path.includes('mission.webp');
};

/**
 * Get the filename from a path
 * @param imagePath - The image path
 * @returns The filename or empty string
 */
export const getImageFilename = (imagePath: string): string => {
    if (!imagePath) return '';
    const parts = imagePath.split('/');
    return parts[parts.length - 1] || '';
};

/**
 * Add a new image mapping
 * @param displayName - The display name (e.g., 'who-we-are.webp')
 * @param actualFileName - The actual uploaded file name (e.g., 'about-1788168271374-441663082.webp')
 */
export const addImageMapping = (displayName: string, actualFileName: string): void => {
    ACTUAL_IMAGE_FILES[displayName] = actualFileName;
};

/**
 * Get all image mappings
 * @returns The current image mappings
 */
export const getImageMappings = (): { [key: string]: string } => {
    return { ...ACTUAL_IMAGE_FILES };
};

/**
 * Remove an image mapping
 * @param displayName - The display name to remove
 */
export const removeImageMapping = (displayName: string): void => {
    delete ACTUAL_IMAGE_FILES[displayName];
};

/**
 * Check if an image URL is valid
 * @param imageUrl - The image URL to check
 * @returns Promise with boolean
 */
export const isImageValid = (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!imageUrl) {
            resolve(false);
            return;
        }

        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageUrl;
    });
};

/**
 * Get image dimensions from a URL (async)
 * @param imageUrl - The image URL
 * @returns Promise with image dimensions
 */
export const getImageDimensions = (imageUrl: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        if (!imageUrl) {
            reject(new Error('No image URL provided'));
            return;
        }

        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            reject(new Error(`Failed to load image: ${imageUrl}`));
        };
        img.src = imageUrl;
    });
};

/**
 * Get a fallback image URL
 * @returns The fallback image URL
 */
export const getFallbackImage = (): string => {
    return '/images/fallback-product.jpg';
};

/**
 * Generate a thumbnail URL from a full image URL
 * @param imageUrl - The full image URL
 * @param size - The thumbnail size (e.g., 100, 200, 400)
 * @returns The thumbnail URL
 */
export const getThumbnailUrl = (imageUrl: string, size: number = 200): string | null => {
    if (!imageUrl) return null;

    // If it's a local URL, add size parameter
    if (imageUrl.includes(API_BASE_URL)) {
        const hasQuery = imageUrl.includes('?');
        return `${imageUrl}${hasQuery ? '&' : '?'}w=${size}&h=${size}&fit=crop`;
    }

    // For external URLs, return as-is
    return imageUrl;
};

/**
 * Get image URL with cache busting
 * @param imageUrl - The image URL
 * @returns The image URL with cache busting parameter
 */
export const getImageWithCacheBust = (imageUrl: string): string | null => {
    if (!imageUrl) return null;
    const hasQuery = imageUrl.includes('?');
    return `${imageUrl}${hasQuery ? '&' : '?'}_=${Date.now()}`;
};

/**
 * Get the MIME type from a filename or URL
 * @param imagePath - The image path or URL
 * @returns The MIME type or null
 */
export const getImageMimeType = (imagePath: string): string | null => {
    if (!imagePath) return null;

    const ext = imagePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'bmp': 'image/bmp',
        'ico': 'image/x-icon',
        'tiff': 'image/tiff',
        'tif': 'image/tiff'
    };

    return ext && mimeTypes[ext] ? mimeTypes[ext] : null;
};

/**
 * Check if an image is a valid image type
 * @param imagePath - The image path or URL
 * @returns boolean
 */
export const isValidImageType = (imagePath: string): boolean => {
    if (!imagePath) return false;
    const mimeType = getImageMimeType(imagePath);
    return mimeType !== null;
};

/**
 * Format file size in bytes to human readable format
 * @param bytes - File size in bytes
 * @returns Formatted string
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Clean an image path by removing /api if present and duplicate slashes
 * @param imagePath - The image path to clean
 * @returns Cleaned path
 */
export const cleanImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    let cleaned = imagePath.trim();
    if (cleaned.startsWith('/api')) {
        cleaned = cleaned.replace('/api', '');
    }
    // Remove duplicate slashes
    cleaned = cleaned.replace(/\/+/g, '/');
    return cleaned;
};

// Export default object for easier imports
const imageHelperNarrative = {
    getImageUrl,
    getImageFilename,
    isDefaultImage,
    addImageMapping,
    getImageMappings,
    removeImageMapping,
    isImageValid,
    getImageDimensions,
    getFallbackImage,
    getThumbnailUrl,
    getImageWithCacheBust,
    getImageMimeType,
    isValidImageType,
    formatFileSize,
    cleanImagePath
};

export default imageHelperNarrative;