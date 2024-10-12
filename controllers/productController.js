const Product = require('../models/productModel');  // Mongoose Model
const { deleteFile } = require('../middlewares/uploadMultipleImages');  // Dropbox deletion middleware


//create a product
const create = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;

        // Use the file URLs provided by Multer after the images have been uploaded to Cloudinary
        let fileUrls = [];
        if (req.files && req.files.length > 0) {
            // Multer provides the secure URLs in `req.files`
            fileUrls = req.files.map(file => file.path);  // Use `file.path`, which is the Cloudinary URL
        }

        // Build the product object with the provided data and uploaded image URLs
        const product = {
            name,
            price,
            description,
            category,
            images: fileUrls  // Use Cloudinary file URLs here
        };

        // Save the product in the database
        const productRes = await Product.create(product);
        res.status(200).send(productRes);

    } catch (error) {
        console.error(error);

        // Handle any errors during the product creation
        if (req.files) {
            req.files.forEach(file => {
                deleteFile(file.filename);  // Delete any uploaded files if there is an error
            });
        }

        res.status(400).send({ error: error.message });
    }
};

//get all
const getAll = async (req, res) => {
    try {
        // Find all products and populate the category field
        const products = await Product.find()
            .populate('category')  // Populates the category field with the Category document
            .sort({ createdAt: -1 });  // Sort by createdAt in descending order

        // Send the response
        res.status(200).send(products);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

//get by id 
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the product by its ID and populate the 'category' field
        const product = await Product.findById(id)
            .populate('category');  // Populates the category field with the Category document

        // Check if the product exists
        if (!product) {
            return res.status(404).send({ error: "Product not found!" });
        }

        // Send the response
        res.status(200).send(product);
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};

// delete product
const deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) return res.status(404).send({ error: "Product not found!" });
  
      // Delete associated images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          const imageName = image.split('/').pop().split('.')[0];  // Extract public_id from image URL
          await deleteFile(imageName);  // Delete each image by its name (public_id)
        }
      }
  
      // Delete the product from the database
      await Product.findByIdAndDelete(id);
      res.status(200).send({ success: "Product and its images deleted successfully" });
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: error.message });
    }
  };
  

// //delete multiple products 
const deleteMultipleProducts = async (req, res) => {
    try {
        const { ids } = req.body; // expecting an array of product IDs in the request body

        // Check if the array is provided and not empty
        if (!ids || ids.length === 0) {
            return res.status(400).send({ error: "No product IDs provided!" });
        }

        // Loop through each product ID and delete the product and its images
        for (const id of ids) {
            const product = await Product.findById(id);  // Use Mongoose's findById method
            if (!product) {
                console.log(`Product with ID ${id} not found! Skipping...`);
                continue;
            }

            // Delete associated images from Cloudinary
            if (product.images && product.images.length > 0) {
                for (const image of product.images) {
                    const imageName = image.split('/').pop().split('.')[0];  // Extract public_id from image URL
                    await deleteFile(imageName);  // Delete each image by its public_id
                }
            }

            // Delete the product from MongoDB
            await Product.findByIdAndDelete(id);  // Use Mongoose's findByIdAndDelete method
        }

        res.status(200).send({ success: "Products deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).send({ error: error.message });
    }
};


// //delete All products with their files
const deleteAllProducts = async (req, res) => {
    try {
        // Fetch all products from the database using Mongoose
        const products = await Product.find();

        if (!products || products.length === 0) {
            return res.status(404).send({ error: "No products found!" });
        }

        // Loop through each product and delete their images from Cloudinary
        for (const product of products) {
            if (product.images && product.images.length > 0) {
                for (const image of product.images) {
                    const imageName = image.split('/').pop().split('.')[0];  // Extract public_id from image URL
                    await deleteFile(imageName);  // Delete each associated image file
                }
            }
        }

        // Delete all products from the MongoDB database
        await Product.deleteMany({});  // Use Mongoose's deleteMany to delete all products

        res.status(200).send({ success: "All products and associated images deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: error.message });
    }
};

// // Search products by name contains
const searchByName = async (req, res) => {
    try {
        const { name } = req.query;

        let condition = {};

        // If 'name' query parameter is provided and not empty, use it in the search condition
        if (name) {
            condition = {
                name: {
                    $regex: new RegExp(name, 'i') // Use a regex for case-insensitive search
                }
            };
        }

        // Find products with the condition (if no name, return all products)
        const products = await Product.find(condition).populate('category'); // Populate related Category model

        res.status(200).send(products);
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: error.message });
    }
};

//pagination 
const getAllPagination = async (req, res) => {
    try {
        // Extract page and limit from query parameters with default values
        const page = parseInt(req.query.page) || 1;  // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 products per page

        // Calculate the total number of products
        const totalProducts = await Product.countDocuments();

        // Calculate the total pages
        const totalPages = Math.ceil(totalProducts / limit);

        // Calculate the offset
        const skip = (page - 1) * limit;

        // Find products with pagination and sort them by 'createdAt' in descending order
        const products = await Product.find()
            .populate('category') // Populate related Category model
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .skip(skip) // Skip the documents to paginate
            .limit(limit); // Limit the number of documents returned

        // Return the products along with pagination info
        res.status(200).send({
            totalProducts: totalProducts,
            totalPages: totalPages,
            currentPage: page,
            products: products
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: error.message });
    }
};

//update product
const UpdateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
  
      // Check if the product exists
      if (!product) return res.status(404).send({ error: "Product not found!" });
  
      const { name, price, description, category } = req.body;
  
      let fileUrls = [];
      
      // If no files are uploaded, retain existing images
      if (!req.files || req.files.length === 0) {
        fileUrls = product.images || []; // Retain old images if no new files are uploaded
        console.log("Retaining old images:", product.images);
      } else {
        // Delete old images from Cloudinary
        if (product.images && product.images.length > 0) {
          for (const image of product.images) {
            const imageName = image.split('/').pop().split('.')[0];  // Extract public_id from the URL
            await deleteFile(imageName);  // Delete each image from Cloudinary
          }
        }
  
        // Store new images uploaded to Cloudinary
        fileUrls = req.files.map(file => file.path);  // Get Cloudinary URLs
      }
  
      // Construct the updated product object
      const updatedProductData = {
        name,
        price,
        description,
        category,
        images: fileUrls,  // Use new or retained image URLs
      };
  
      // Update the product in the database
      const updatedProduct = await Product.findByIdAndUpdate(id, updatedProductData, { new: true });
  
      res.status(200).send(updatedProduct);
    } catch (error) {
      console.error(error);
  
      // If files were uploaded but an error occurred, delete them
      if (req.files) {
        req.files.forEach(file => {
          deleteFile(file.filename);
        });
      }
      res.status(400).send({ error: error.message });
    }
  };
  
const getProductsByCategoryWithPagination = async (req, res) => {
    try {
        const { categoryId } = req.body; // Extract the categoryId from the request body
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 products per page
        const skip = (page - 1) * limit; // Calculate the skip for pagination

        // Build the query to find products by categoryId
        const query = categoryId !== undefined ? { category: categoryId } : {};

        // Count total products for the given category
        const totalProducts = await Product.countDocuments(query);

        // Find products by categoryId with pagination and ordering
        const products = await Product.find(query)
            .populate('category') // Populate related Category model
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .skip(skip) // Skip the documents to paginate
            .limit(limit); // Limit the number of documents returned

        // Return the products along with pagination info
        res.status(200).send({
            totalProducts: totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products: products,
        });
    } catch (error) {
        console.error(error);
        res.status(400).send({ error: error.message });
    }
};




module.exports = {
    create,
    getAll,
    getById,
    deleteProduct,
    UpdateProduct,
    deleteMultipleProducts,
    searchByName,
    getAllPagination,
    deleteAllProducts,
    getProductsByCategoryWithPagination
}