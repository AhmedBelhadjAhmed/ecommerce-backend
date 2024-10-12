
const User = require('../models/userModel')
const { deleteAvatar } = require('../middlewares/uploadSingleImage')
const bcrypt = require('bcryptjs')

// get all users
const getAll = async (req, res) => {
    try {
        // Find all users using Mongoose's `find` method
        const users = await User.find();
        
        // Respond with the list of users
        res.status(200).json(users);
    } catch (error) {
        console.log(error);

        // Send error response if something goes wrong
        res.status(400).send({ error: error.message });
    }
};

//get users by id
const getById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the userId from the token matches the requested user ID
        if (req.userId !== id) {
            return res.status(401).send({ error: 'Unauthorized!' });
        }

        // Find user by ID and exclude the password field
        const user = await User.findById(id).select('-password'); // Exclude password

        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: error.message });
    }
};

// get users except admin
const getAllExceptAdmin = async (req, res) => {
  try {
    // Find all users except those with the role of 'admin'
    const users = await User.find({ role: { $ne: 'admin' } }) // Exclude users with the role 'admin'
      .select('-password -resetToken -expireIn') // Exclude sensitive fields
      .sort({ createdAt: -1 }); // Sort by newest to oldest (descending order)

    if (!users || users.length === 0) {
      return res.status(404).send({ error: "No users found!" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
};

  
// //delete user by id
const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      
      // Find the user by ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).send({ error: "User not found!" });
      }
  
      // Extract the image name from the avatar URL
      const avatarUrl = user.avatar; 
      if (avatarUrl) {
        // Extract the image filename without extension and folder from the URL
        const imageName = avatarUrl.split('/').pop().split('.')[0]; // Get the public_id
        console.log(`Attempting to delete avatar with image name: ${imageName}`);
        
        // Call deleteAvatar function to remove the avatar from Cloudinary
        await deleteAvatar(imageName);
      }
  
      // Delete the user from the database
      await User.findByIdAndDelete(id);
  
      // Send success response
      res.status(200).send({ success: "User deleted successfully" });
  
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(400).send({ error: error.message });
    }
  };
  

//update user by id
// Update user by id
const UpdateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) return res.status(404).send({ error: "User not found!" });

    const { firstname, lastname, password } = req.body;

    // Initialize the updated user data
    const updatedUserData = {
      firstname,
      lastname,
    };

    // Password validation
    if (password && password.length > 0) {
      if (password.length < 6) {
        // If password is invalid, delete the newly uploaded image (if it exists)
        if (req.file) {
          const avatarName = req.file.filename.split('/').pop(); // Get just the image name (last part)
          await deleteAvatar(avatarName); // Delete the new uploaded image
        }
        return res.status(400).send({ error: "Password must be at least 6 characters" });
      }
      // Password hashing
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      updatedUserData.password = hash; // Add hashed password to update data
    }

    // Handle avatar update
    if (req.file) {
      // If the user has an existing avatar, delete it from Cloudinary
      if (user.avatar) {
        const existingAvatarName = user.avatar.split('/').pop().split('.')[0]; // Extract only the image name (without extension)
        await deleteAvatar(existingAvatarName); // Delete the existing avatar
      }

      // Store the new avatar URL after upload
      updatedUserData.avatar = req.file.path; // Get the Cloudinary URL for the new avatar
    } else {
      // If no new avatar is uploaded, retain the existing avatar
      updatedUserData.avatar = user.avatar;
    }

    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(id, updatedUserData, { new: true }).select('-password');

    res.status(200).send(updatedUser);
  } catch (error) {
    console.error(error);

    // If there was an issue with file uploads, delete any new files uploaded
    if (req.file) {
      const avatarName = req.file.filename.split('/').pop(); // Get just the image name (last part)
      await deleteAvatar(avatarName); // Ensure to clean up if necessary
    }
    res.status(400).send({ error: error.message });
  }
};

// Search users by name
const searchUsersByName = async (req, res) => {
  try {
    const { name } = req.query;

    // If no name provided, return a 400 error
    if (!name) {
      return res.status(400).send({ error: "Search term 'name' is required" });
    }

    // Find users whose firstname or lastname contains the search term, excluding admin
    const users = await User.find({
      role: { $ne: 'admin' }, // Exclude users with the role 'admin'
      $or: [
        { firstname: { $regex: name, $options: 'i' } }, // Case-insensitive search
        { lastname: { $regex: name, $options: 'i' } }
      ]
    })
    .select('-password -resetToken -expireIn') // Exclude sensitive fields
    .sort({ createdAt: -1 }); // Sort from newest to oldest

    if (!users || users.length === 0) {
      return res.status(404).send({ error: "No users found!" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: error.message });
  }
};

module.exports = {
    getAll,
    getById,
    deleteUser,
    UpdateUser,
    getAllExceptAdmin,
    searchUsersByName
}