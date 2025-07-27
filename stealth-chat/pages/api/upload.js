import { v2 as cloudinary } from 'cloudinary';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });
    
    const [fields, files] = await form.parse(req);
    
    let file = files.file;
    if (Array.isArray(file)) {
      file = file[0];
    }
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.filepath, {
        folder: 'stealth-chat',
        resource_type: 'auto',
        transformation: [
          { width: 400, height: 400, crop: 'limit' },
          { quality: 'auto' }
        ]
      });

      // Clean up temporary file
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }

      res.status(200).json({
        success: true,
        url: result.secure_url,
        public_id: result.public_id
      });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      
      // Clean up temporary file
      if (fs.existsSync(file.filepath)) {
        fs.unlinkSync(file.filepath);
      }
      
      res.status(500).json({ error: 'Failed to upload to Cloudinary', details: uploadError.message });
    }
  } catch (error) {
    console.error('Upload API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
