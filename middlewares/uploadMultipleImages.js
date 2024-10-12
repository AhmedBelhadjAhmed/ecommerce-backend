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
    folder: 'productUploads',  // Specify a folder name in your Cloudinary account
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
    // Additional options can be passed here, e.g., transformations
  },
});

// Use memory storage to hold files temporarily in memory
const upload = multer({ storage: storage });

// Middleware to handle file uploads
const handleMultipleUploads = (req, res, next) => {
  return upload.array('images', 10)(req, res, (error) => { 
    if (error) {
      return res.status(400).send({ error: error.message });
    }
    next();
  });
};

// Function to delete image from Cloudinary by public_id (image name without extension)
const deleteFile = async (imageName) => {
  try {
    // Include the folder name in the public_id if your images are stored in a folder
    const publicId = `productUploads/${imageName}`;
    
    // Use Cloudinary's destroy method to delete the image by public_id
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result !== 'ok') {
      throw new Error(`Failed to delete image: ${publicId}`);
    }
    return result;
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error to be handled in the controller
  }
};


module.exports = {
  handleMultipleUploads,
  deleteFile
};
