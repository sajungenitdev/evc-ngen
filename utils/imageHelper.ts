// utils/imageHelper.ts

// utils/imageHelper.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const getImageUrl = (imagePath: string): string | null => {
    if (!imagePath || imagePath.trim() === '') {
        return null;
    }

    let trimmedPath = imagePath.trim();

    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
        return trimmedPath;
    }

    // ✅ Remove /api from the path
    if (trimmedPath.startsWith('/api')) {
        trimmedPath = trimmedPath.replace('/api', '');
    }

    // ✅ Use the base URL without /api
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');

    if (trimmedPath.startsWith('/uploads')) {
        return `${baseUrl}${trimmedPath}`;
    }

    return `${baseUrl}/uploads/products/${trimmedPath}`;
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
 * Check if image is a default/placeholder image
 * @param imagePath - The image path
 * @returns boolean
 */
export const isDefaultImage = (imagePath: string): boolean => {
    if (!imagePath) return true;
    const path = imagePath.toLowerCase();
    return path.includes('default-product.jpg') ||
        path.includes('placeholder') ||
        path.includes('default.png') ||
        path.includes('no-image') ||
        path === 'default' ||
        path.trim() === '';
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
 * Get all image URLs from a product
 * @param product - The product object
 * @returns Object with main image and gallery images
 */
export const getProductImages = (product: any) => {
    const images = {
        main: product?.imageUrl ? getImageUrl(product.imageUrl) : null,
        gallery: product?.galleryImages?.map((img: string) => getImageUrl(img)).filter(Boolean) || [],
        all: [] as string[]
    };

    // Combine all images
    if (images.main) {
        images.all.push(images.main);
    }
    if (images.gallery.length > 0) {
        images.all.push(...images.gallery);
    }

    return images;
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

    // For external URLs, return as-is (or use a service like imgix)
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
 * Extract and validate image paths from a product
 * @param product - The product object
 * @returns Object with valid image paths
 */
export const extractProductImages = (product: any) => {
    const result = {
        mainImage: null as string | null,
        galleryImages: [] as string[],
        hasImages: false
    };

    if (!product) return result;

    // Get main image
    if (product.imageUrl) {
        const url = getImageUrl(product.imageUrl);
        if (url) {
            result.mainImage = url;
            result.hasImages = true;
        }
    }

    // Get gallery images
    if (product.galleryImages && Array.isArray(product.galleryImages)) {
        product.galleryImages.forEach((img: string) => {
            const url = getImageUrl(img);
            if (url) {
                result.galleryImages.push(url);
                result.hasImages = true;
            }
        });
    }

    return result;
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
 * Get image size in bytes from a URL
 * @param imageUrl - The image URL
 * @returns Promise with image size in bytes
 */
export const getImageSize = (imageUrl: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        if (!imageUrl) {
            reject(new Error('No image URL provided'));
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', imageUrl, true);
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const contentLength = xhr.getResponseHeader('Content-Length');
                    if (contentLength) {
                        resolve(parseInt(contentLength, 10));
                    } else {
                        resolve(0);
                    }
                } else {
                    reject(new Error(`Failed to get image size: ${xhr.status}`));
                }
            }
        };
        xhr.send();
    });
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
 * Clean an image path by removing /api if present
 * @param imagePath - The image path to clean
 * @returns Cleaned path
 */
export const cleanImagePath = (imagePath: string): string => {
    if (!imagePath) return '';
    let cleaned = imagePath.trim();
    if (cleaned.startsWith('/api')) {
        cleaned = cleaned.replace('/api', '');
    }
    return cleaned;
};

// Export default object for easier imports
const imageHelper = {
    getImageUrl,
    getImageFilename,
    isDefaultImage,
    getImageDimensions,
    getProductImages,
    isImageValid,
    getFallbackImage,
    getThumbnailUrl,
    getImageWithCacheBust,
    extractProductImages,
    getImageMimeType,
    isValidImageType,
    getImageSize,
    formatFileSize,
    cleanImagePath
};

export default imageHelper;