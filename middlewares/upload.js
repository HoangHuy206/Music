import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the upload directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter validation
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audioFile') {
    const ext = path.extname(file.originalname).toLowerCase();
    // Allow audio MIME types (.mp3, .wav, .m4a, .ogg) and MP4 video format
    if (
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'video/mp4' ||
      file.mimetype === 'application/octet-stream' ||
      ext === '.mp4' ||
      ext === '.mp3'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files and MP4 videos are allowed for audioFile!'), false);
    }
  } else if (
    file.fieldname === 'coverImage' ||
    file.fieldname === 'avatarFile' ||
    file.fieldname === 'avatar'
  ) {
    // Allow image MIME types (.jpg, .jpeg, .png, .webp, .gif)
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, GIF, WEBP) are allowed!'), false);
    }
  } else {
    cb(new Error(`Unexpected field: ${file.fieldname}`), false);
  }
};

// Initialize multer instance with limits (e.g. 50MB for audio files)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
});

// Middleware configured for audioFile & coverImage
export const uploadSongMedia = upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]);

// Middleware configured for user avatar upload (supports GIF, PNG, JPG, WEBP)
export const uploadAvatarMedia = upload.single('avatarFile');

