/**
 * Seed products from a local styles.csv (Kaggle Fashion Product Images Small).
 * Download: https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small
 * 1. Download the dataset (Kaggle API or manual), extract the zip.
 * 2. Place styles.csv at backend/data/fashion-product-images-small/styles.csv
 *    (or set KAGGLE_CSV_PATH to the CSV path).
 * 3. Run: node scripts/seedFromKaggleCsv.js
 * Filters: Men's Apparel only. Uses product names and image URLs/paths from CSV.
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CSV_PATH = path.join(
  __dirname,
  "..",
  "data",
  "fashion-product-images-small",
  "styles.csv"
);

const DEFAULT_IMAGES_CSV_PATH = path.join(
  __dirname,
  "..",
  "data",
  "fashion-product-images-small",
  "images.csv"
);

// Map dataset articleType to our 8 store categories
const ARTICLE_TO_CATEGORY = {
  Shirts: "Shirts",
  Shirt: "Shirts",
  Waistcoat: "Shirts",
  Tshirts: "T-Shirts",
  Tshirt: "T-Shirts",
  Sweatshirts: "T-Shirts",
  "Sweat Shirts": "T-Shirts",
  Polo: "T-Shirts",
  Jeans: "Jeans",
  Trousers: "Pants",
  "Track Pants": "Track Pants",
  "Track pants": "Track Pants",
  Cargos: "Pants",
  "Formal Trousers": "Pants",
  Shorts: "Shorts",
  Bermudas: "Shorts",
  Briefs: "Inners",
  Boxers: "Inners",
  "Innerwear Vests": "Inners",
  Vests: "Inners",
  Trunk: "Inners",
  Kurtas: "Ethnic",
  Kurta: "Ethnic",
  Dhoti: "Ethnic",
  "Lycra Shorts": "Shorts",
  "Night suits": "Nightwear",
};
const OUR_CATEGORIES = new Set([
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Ethnic",
  "Inners",
  "Shorts",
  "Track Pants",
  "Pants",
  "Nightwear",
]);

const SIZES = ["S", "M", "L", "XL", "XXL"];
const FITS = ["slim", "regular", "relaxed"];

function mapToCategory(articleType) {
  if (!articleType) return "Shirts";
  const t = String(articleType).trim();
  return ARTICLE_TO_CATEGORY[t] || "Shirts";
}

function getRow(row, ...keys) {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function rowToProduct(row, index, imageUrlFromMap) {
  const id = getRow(row, "id", "ID") || index;
  const name =
    getRow(row, "productDisplayName", "product_display_name", "ProductDisplayName") ||
    `Product ${id}`;

  const category = mapToCategory(
    getRow(row, "articleType", "article_type", "ArticleType")
  );

  if (!OUR_CATEGORIES.has(category)) return null;

  const baseSlug = slugify(name).slice(0, 30) || "product";
  const slug = `${baseSlug}-${id}`.toLowerCase().replace(/--+/g, "-");

  const basePrice = 699 + (Number(id) % 25) * 100;
  const price = Math.min(3999, basePrice);
  const discountedPrice = index % 4 === 0 ? price - 150 : undefined;

  const colour = getRow(row, "baseColour", "base_colour", "BaseColour") || "Navy";
  const usage = (getRow(row, "usage", "Usage") || "Casual").toLowerCase();
  const fit = usage === "formal" ? "slim" : FITS[index % FITS.length];

  let imageUrl = imageUrlFromMap;
  if (!imageUrl) {
    // Fall back to image field or a neutral placeholder based on product name
    const rawImage = getRow(row, "image", "Image");
    if (rawImage && rawImage.startsWith("http")) {
      imageUrl = rawImage;
    } else {
      const label = encodeURIComponent(name.slice(0, 40));
      imageUrl = `https://via.placeholder.com/600x750.png?text=${label}`;
    }
  }

  return {
    name: name.slice(0, 120),
    slug,
    description: `${name}. Premium men's ${category.toLowerCase()} from the Fashion Product Images dataset.`,
    category,
    subcategory: row.subCategory || row.sub_category || category,
    brand: "AK GARMENTS",
    price,
    discountedPrice,
    sizes: SIZES.map((s) => ({
      size: s,
      stock: 8 + (Number(id) % 7),
    })),
    colors: [colour],
    fit,
    fabric: "Cotton Blend",
    style: usage === "formal" ? "formal" : "casual",
    images: imageUrl ? [imageUrl] : [],
    tags: index % 5 === 0 ? ["New Arrivals"] : ["Core"],
    isActive: true,
    isDeleted: false,
  };
}

async function main() {
  const csvPath = process.env.KAGGLE_CSV_PATH || DEFAULT_CSV_PATH;

  if (!fs.existsSync(csvPath)) {
    console.error(
      `CSV not found at ${csvPath}. Download the dataset from https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small and extract styles.csv to backend/data/fashion-product-images-small/styles.csv (or set KAGGLE_CSV_PATH).`
    );
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const rawRows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    trim: true,
    bom: true,
  });

  const rows = rawRows.filter((r) => {
    const gender = getRow(r, "gender", "Gender").toLowerCase();
    const master = getRow(r, "masterCategory", "master_category", "MasterCategory").toLowerCase();
    if (gender !== "men" || master !== "apparel") return false;

    const name = getRow(
      r,
      "productDisplayName",
      "product_display_name",
      "ProductDisplayName"
    ).toLowerCase();
    // Extra safety: skip obvious women/girls catalogue rows
    if (
      name.includes(" women ") ||
      name.startsWith("women ") ||
      name.includes("girls") ||
      name.includes("girls'")
    ) {
      return false;
    }
    return true;
  });

  console.log(`Found ${rows.length} men's apparel rows in CSV.`);

  const products = [];
  const seenSlugs = new Set();

  // Map of id -> image URL from images.csv if available
  const imageMap = new Map();
  const imagesCsvPath = process.env.IMAGES_CSV_PATH || DEFAULT_IMAGES_CSV_PATH;
  if (fs.existsSync(imagesCsvPath)) {
    const imagesContent = fs.readFileSync(imagesCsvPath, "utf-8");
    const imageRows = parse(imagesContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    });
    imageRows.forEach((r) => {
      const filename = getRow(r, "filename", "Filename");
      const link = getRow(r, "link", "Link", "url", "URL");
      if (!filename || !link) return;
      const id = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");
      imageMap.set(id, link);
      imageMap.set(Number(id), link);
    });
    // eslint-disable-next-line no-console
    console.log(
      `Loaded ${imageMap.size / 2} image URLs from images.csv for products`
    );
  }

  for (let i = 0; i < rows.length; i += 1) {
    const id = getRow(rows[i], "id", "ID") || i;
    const mappedImage = imageMap.get(String(id)) || imageMap.get(Number(id));
    const product = rowToProduct(rows[i], i, mappedImage);
    if (!product) continue;
    if (seenSlugs.has(product.slug)) continue;
    seenSlugs.add(product.slug);
    products.push(product);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  await Product.deleteMany({});
  if (products.length > 0) {
    await Product.insertMany(products);
  }
  await mongoose.disconnect();

  console.log(`Seeded ${products.length} products.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});