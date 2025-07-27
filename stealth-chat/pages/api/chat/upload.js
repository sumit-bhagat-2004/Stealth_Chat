import multer from 'multer';
import { requireAuth } from '../../../lib/auth';
import { uploadImage, uploadVideo, uploadAudio, uploadDocument } from '../../../lib/cloudinary';
import { MESSAGE_TYPES, UPLOAD_CONSTRAINTS } from '../../../utils/constants';
import { generateRandomString, sanitizeFilename } from '../../../utils/helpers';

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: UPLOAD_CONSTRAINTS.MAX_FILE_SIZE,
  },
});

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    
    // Determine file type and upload accordingly
    let uploadResult;
    let messageType;
    const filename = `${generateRandomString()}_${sanitizeFilename(originalname)}`;

    if (UPLOAD_CONSTRAINTS.ALLOWED_IMAGE_TYPES.includes(mimetype)) {
      uploadResult = await uploadImage(buffer, filename);
      messageType = MESSAGE_TYPES.IMAGE;
    } else if (UPLOAD_CONSTRAINTS.ALLOWED_VIDEO_TYPES.includes(mimetype)) {
      uploadResult = await uploadVideo(buffer, filename);
      messageType = MESSAGE_TYPES.VIDEO;
    } else if (UPLOAD_CONSTRAINTS.ALLOWED_AUDIO_TYPES.includes(mimetype)) {
      uploadResult = await uploadAudio(buffer, filename);
      messageType = MESSAGE_TYPES.AUDIO;
    } else if (UPLOAD_CONSTRAINTS.ALLOWED_DOCUMENT_TYPES.includes(mimetype)) {
      uploadResult = await uploadDocument(buffer, filename);
      messageType = MESSAGE_TYPES.DOCUMENT;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.status(200).json({
      success: true,
      fileUrl: uploadResult.secure_url,
      fileName: originalname,
      fileSize: size,
      messageType,
      publicId: uploadResult.public_id
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export default requireAuth(handler);
