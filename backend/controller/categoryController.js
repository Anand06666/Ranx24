import path from 'path';
import fs from 'fs';
import Category from '../model/Category.js';
import Worker from '../model/Worker.js';
import City from '../model/City.js';
import cacheService, { cacheKeys, cacheTTL } from '../utils/cacheService.js';

// @desc    Get all categories (with optional location filter)
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance, city: cityName } = req.query;

    // 1. Priority: Admin Assignments by City
    if (cityName) {
      const cityConfig = await City.findOne({ name: { $regex: new RegExp(`^${cityName}$`, 'i') } });

      if (cityConfig && cityConfig.assignedCategories?.length > 0) {
        const adminAllowedCategories = cityConfig.assignedCategories.map(ac => ac.category);

        const categories = await Category.find({
          name: { $in: adminAllowedCategories }
        });

        return res.json(categories);
      }
    }

    // 2. Fallback: Filter by available workers (Geo or City Name match)
    if ((latitude && longitude) || cityName) {

      const promises = [];

      // Find workers by Geo
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const distance = maxDistance ? Number(maxDistance) * 1000 : 50000; // Default 50km

        promises.push(Worker.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distance',
              maxDistance: distance,
              query: { status: 'approved', isAvailable: true }, // Only active workers
              spherical: true
            }
          },
          { $unwind: '$categories' }, // Unwind categories array
          {
            $group: {
              _id: '$categories', // Group by category name
              workerCount: { $sum: 1 },
            }
          }
        ]).then(res => res.map(r => r._id)));
      }

      // Find workers by City (if city config didn't exist above)
      if (cityName) {
        promises.push(Worker.find({
          city: { $regex: new RegExp(`^${cityName}$`, 'i') },
          status: 'approved',
          isAvailable: true
        }).select('categories').then(workers => [...new Set(workers.flatMap(w => w.categories))]));
      }

      const results = await Promise.all(promises);
      let availableCategoryNames = [...new Set(results.flat())];

      // Fetch full category details for these names
      const categories = await Category.find({
        name: { $in: availableCategoryNames }
      });

      return res.json(categories);
    }

    // Default: Return all categories if no location provided
    // Try to get from cache
    const categories = await cacheService.wrap(
      cacheKeys.categories(),
      async () => await Category.find({}),
      cacheTTL.long // Cache for 30 minutes
    );

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: error.message || 'Server Error', error: error.toString() });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Admin
export const createCategory = async (req, res) => {
  const { name } = req.body;
  let imagePath = '';

  if (req.file) {
    imagePath = req.file.path;
  }

  try {
    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
      // If category exists and an image was uploaded, delete the uploaded image
      if (imagePath) {
        // Assuming imagePath is relative to the project root or a known uploads folder
        // You might need to adjust this path based on your server setup
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      image: imagePath, // Save the image path
    });

    const createdCategory = await category.save();

    // Invalidate cache
    cacheService.delete(cacheKeys.categories());

    res.status(201).json(createdCategory);
  } catch (error) {
    console.error('Error creating category:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Admin
export const updateCategory = async (req, res) => {
  const { name } = req.body;
  let newImagePath = '';

  if (req.file) {
    newImagePath = req.file.path;
  }

  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      // Update name if provided
      if (name) {
        category.name = name;
      }

      // Handle image update
      if (newImagePath) {
        // If there's an old image, delete it
        if (category.image) {
          const oldImagePath = path.join(process.cwd(), category.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        category.image = newImagePath; // Set new image path
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error updating category:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: req.params.id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { latitude, longitude, maxDistance, city: cityName } = req.query;

    // 1. Priority: Admin Assignments by City
    if (cityName) {
      const cityConfig = await City.findOne({ name: { $regex: new RegExp(`^${cityName}$`, 'i') } });

      if (cityConfig) {
        const categoryConfig = cityConfig.assignedCategories?.find(ac => ac.category === category.name);

        if (categoryConfig && categoryConfig.subCategories?.length > 0) {
          // Return ONLY the subcategories assigned by Admin
          const filteredSubCategories = category.subCategories.filter(sub =>
            categoryConfig.subCategories.includes(sub.name)
          );

          const categoryObj = category.toObject();
          categoryObj.subCategories = filteredSubCategories;
          return res.json(categoryObj);
        }
      }
    }

    // 2. Fallback: Filter by available workers
    if ((latitude && longitude) || cityName) {

      const promises = [];

      // Find workers by Geo
      if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const distance = maxDistance ? Number(maxDistance) * 1000 : 50000; // Default 50km

        promises.push(Worker.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distance',
              maxDistance: distance,
              query: {
                status: 'approved',
                isAvailable: true,
                categories: category.name // Filter by this category
              },
              spherical: true
            }
          },
          { $unwind: '$services' }, // Unwind services array
          {
            $group: {
              _id: '$services', // Group by service name (subcategory)
            }
          }
        ]).then(res => res.map(r => r._id)));
      }

      // Find workers by City
      if (cityName) {
        promises.push(Worker.find({
          city: { $regex: new RegExp(`^${cityName}$`, 'i') },
          status: 'approved',
          isAvailable: true,
          categories: category.name
        }).select('services').then(workers => [...new Set(workers.flatMap(w => w.services))]));
      }

      const results = await Promise.all(promises);
      let availableServices = [...new Set(results.flat())];

      // Filter category.subCategories
      const filteredSubCategories = category.subCategories.filter(sub =>
        availableServices.includes(sub.name)
      );

      // Return category with filtered subcategories
      const categoryObj = category.toObject();
      categoryObj.subCategories = filteredSubCategories;
      return res.json(categoryObj);
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a sub-category
// @route   POST /api/categories/:id/subcategories
// @access  Admin
export const createSubCategory = async (req, res) => {
  const { name } = req.body;
  let imagePath = '';

  if (req.file) {
    imagePath = req.file.path;
  }

  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      const subCategoryExists = category.subCategories.find(
        (sub) => sub.name === name
      );

      if (subCategoryExists) {
        if (imagePath) {
          const fullPath = path.join(process.cwd(), imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
        return res.status(400).json({ message: 'Sub-category already exists' });
      }

      const subCategory = { name, image: imagePath };
      category.subCategories.push(subCategory);
      await category.save();
      res.status(201).json(category);
    } else {
      if (imagePath) {
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    if (imagePath) {
      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a sub-category
// @route   PUT /api/categories/:id/subcategories/:subId
// @access  Admin
export const updateSubCategory = async (req, res) => {
  const { name } = req.body;
  let newImagePath = '';

  if (req.file) {
    newImagePath = req.file.path;
  }

  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      const subCategory = category.subCategories.id(req.params.subId);

      if (subCategory) {
        if (name) {
          subCategory.name = name;
        }

        if (newImagePath) {
          if (subCategory.image) {
            const oldImagePath = path.join(process.cwd(), subCategory.image);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
          subCategory.image = newImagePath;
        }

        await category.save();
        res.json(category);
      } else {
        if (newImagePath) {
          const fullPath = path.join(process.cwd(), newImagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
        res.status(404).json({ message: 'Sub-category not found' });
      }
    } else {
      if (newImagePath) {
        const fullPath = path.join(process.cwd(), newImagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    if (newImagePath) {
      const fullPath = path.join(process.cwd(), newImagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a sub-category
// @route   DELETE /api/categories/:id/subcategories/:subId
// @access  Admin
export const deleteSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      const subCategory = category.subCategories.id(req.params.subId);

      if (subCategory) {
        await subCategory.deleteOne();
        await category.save();
        res.json(category);
      } else {
        res.status(404).json({ message: 'Sub-category not found' });
      }
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
// @desc    Get sub-categories for a category
// @route   GET /api/categories/:id/subcategories
// @access  Public
export const getSubCategories = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      res.json(category.subCategories);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
