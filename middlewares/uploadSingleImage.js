const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');  // Cloudinary storage for multer

require('dotenv').config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Set up multer storage using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatarUploads',  // Specify a folder for avatars
    allowedFormats: ['jpg', 'jpeg', 'png'],
    // Additional options can be passed here, e.g., transformations
  },
});

// Use multer with Cloudinary storage for single file uploads
const upload = multer({ storage: storage });

// Middleware to handle single file uploads (e.g., avatar upload)
const handleSingleUpload = (req, res, next) => {
  // Check if password exists and is valid
  if (!req.body.password || (req.body.password.length >= 6)) {
    return upload.single('avatar')(req, res, (error) => {
      if (error) {
        return res.status(400).send({ error: error.message });
      }
      next();
    });
  }

  // If password is invalid (e.g., "000"), log it and skip the upload
  console.log('invalid password');
  next();
};



// Function to delete avatar from Cloudinary by public_id (image name without extension)
const deleteAvatar = async (imageName) => {
  try {
    // Prepend the folder name "avatarUploads" to the image name
    const publicId = `avatarUploads/${imageName}`;
    
    // Use Cloudinary's destroy method to delete the image by public_id
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete avatar: ${publicId}`);
    }
    
    return result;
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to be handled in the controller
  }
};


module.exports = {
  handleSingleUpload,
  deleteAvatar
};
