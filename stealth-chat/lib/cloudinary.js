import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
export const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'stealth-chat',
          ...options,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Generate optimized URL
export const getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  });
};

// Upload image with optimizations
export const uploadImage = async (fileBuffer, filename) => {
  return uploadToCloudinary(fileBuffer, {
    public_id: `images/${filename}`,
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  });
};

// Upload video with optimizations
export const uploadVideo = async (fileBuffer, filename) => {
  return uploadToCloudinary(fileBuffer, {
    public_id: `videos/${filename}`,
    resource_type: 'video',
    video_codec: 'auto',
    quality: 'auto'
  });
};

// Upload audio files
export const uploadAudio = async (fileBuffer, filename) => {
  return uploadToCloudinary(fileBuffer, {
    public_id: `audio/${filename}`,
    resource_type: 'video' // Cloudinary treats audio as video
  });
};

// Upload documents
export const uploadDocument = async (fileBuffer, filename) => {
  return uploadToCloudinary(fileBuffer, {
    public_id: `documents/${filename}`,
    resource_type: 'raw'
  });
};

export default cloudinary;
