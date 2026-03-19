import { validationResult } from "express-validator";
import Product from "../models/Product.js";
import { Parser } from "json2csv";

export const listProducts = async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      size,
      color,
      fit,
      brand,
      tags,
      minPrice,
      maxPrice,
      search,
      sort,
      page,
      limit,
    } = req.query;

    const filter = { isDeleted: false, isActive: true };

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (size) filter["sizes.size"] = size;
    if (color) filter.colors = color;
    if (fit) filter.fit = fit;
    if (brand) filter.brand = brand;
    if (tags) filter.tags = { $in: tags.split(",") };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 24;
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(filter);
    let items;

    if (sort === "price_asc" || sort === "price_desc") {
      const direction = sort === "price_asc" ? 1 : -1;

      const pipeline = [
        { $match: filter },
        {
          $addFields: {
            effectivePrice: {
              $ifNull: ["$discountedPrice", "$price"],
            },
          },
        },
        { $sort: { effectivePrice: direction, _id: 1 } },
        { $skip: skip },
        { $limit: limitNum },
      ];

      items = await Product.aggregate(pipeline);
    } else {
      const sortOptions = {};
      if (sort === "newest" || !sort) {
        sortOptions.createdAt = -1;
      }

      items = await Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);
    }

    res.json({
      items,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    next(err);
  }
};

export const listCategories = async (req, res, next) => {
  try {
    const [categories, subcategories] = await Promise.all([
      Product.distinct("category", {
        isDeleted: false,
        isActive: true,
      }),
      Product.distinct("subcategory", {
        isDeleted: false,
        isActive: true,
      }),
    ]);

    const all = [...categories, ...subcategories].filter(Boolean);
    const unique = Array.from(new Set(all));
    unique.sort((a, b) => String(a).localeCompare(String(b)));

    res.json(unique);
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, isDeleted: false });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    res.json({ message: "Product deleted" });
  } catch (err) {
    next(err);
  }
};

export const toggleProductActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const exportProductsCsv = async (req, res, next) => {
  try {
    const products = await Product.find({ isDeleted: false }).lean();
    const fields = [
      "_id",
      "name",
      "slug",
      "category",
      "subcategory",
      "brand",
      "price",
      "discountedPrice",
      "isActive",
      "createdAt",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(products);

    res.header("Content-Type", "text/csv");
    res.header(
      "Content-Disposition",
      'attachment; filename="ak-garments-products.csv"'
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
};