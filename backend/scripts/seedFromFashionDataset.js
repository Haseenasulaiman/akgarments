/**
 * Seed products from Fashion Product Images (Small) dataset.
 * Data source: https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small
 * Fetched via Hugging Face mirror: mecha2019/fashion-product-images-small
 * Filters: Men's Apparel only. Uses real product names and image URLs from the dataset.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

const HF_API_BASE =
  "https://datasets-server.huggingface.co/rows";
const DATASET = "mecha2019/fashion-product-images-small";
const CONFIG = "default";
const SPLIT = "train";
const ROWS_PER_PAGE = 100;

// Map dataset articleType to our store categories (Shirts, T-Shirts, Jeans, etc.)
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
  Trousers: "Lycra Pants",
  "Track Pants": "Lycra Pants",
  "Track pants": "Lycra Pants",
  Cargos: "Lycra Pants",
  "Formal Trousers": "Lycra Pants",
  Shorts: "Shorts",
  Bermudas: "Shorts",
  Briefs: "Inners",
  Boxers: "Inners",
  "Innerwear Vests": "Inners",
  Vests: "Inners",
  Trunk: "Inners",
  Kurtas: "Ethnic",
  Kurta: "Ethnic",
  "Kurtis (no dupes for men)": "Ethnic",
  Dhoti: "Ethnic",
  "Lycra Shorts": "Shorts",
  "Capris (no dupes for men)": "Shorts",
};
const OUR_CATEGORIES = new Set([
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Ethnic",
  "Inners",
  "Shorts",
  "Lycra Shirts",
  "Lycra Pants",
]);

const SIZES = ["S", "M", "L", "XL", "XXL"];
const FITS = ["slim", "regular", "relaxed"];

function mapToCategory(articleType) {
  if (!articleType) return "Shirts";
  const trimmed = String(articleType).trim();
  return ARTICLE_TO_CATEGORY[trimmed] || "Shirts";
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchPage(offset, length = ROWS_PER_PAGE, retries = 3) {
  const url = new URL(HF_API_BASE);
  url.searchParams.set("dataset", DATASET);
  url.searchParams.set("config", CONFIG);
  url.searchParams.set("split", SPLIT);
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("length", String(length));

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const res = await fetch(url.toString());
    if (res.ok) return res.json();
    if (attempt < retries && res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
      continue;
    }
    throw new Error(`HF API error: ${res.status} ${res.statusText}`);
  }
}

async function fetchAllMensApparel(maxRowsToScan = 15000) {
  const allRows = [];
  let offset = 0;

  while (offset < maxRowsToScan) {
    const data = await fetchPage(offset, ROWS_PER_PAGE);
    const rows = data.rows || [];
    if (rows.length === 0) break;

    for (const r of rows) {
      const row = r.row || r;
      const gender = (row.gender || "").trim();
      const masterCategory = (row.masterCategory || "").trim();
      if (gender !== "Men" || masterCategory !== "Apparel") continue;
      allRows.push(row);
    }

    offset += ROWS_PER_PAGE;
    if (rows.length < ROWS_PER_PAGE) break;
    // Delay to avoid rate limiting (429)
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  return allRows;
}

function rowToProduct(row, index) {
  const id = row.id != null ? row.id : index;
  const name = (row.productDisplayName || `Product ${id}`).trim();
  const category = mapToCategory(row.articleType);
  if (!OUR_CATEGORIES.has(category)) return null;

  const baseSlug = slugify(name).slice(0, 30) || "product";
  const slug = `${baseSlug}-${id}`.toLowerCase().replace(/--+/g, "-");
  const basePrice = 699 + (id % 25) * 100;
  const price = Math.min(3999, basePrice);
  const discountedPrice = index % 4 === 0 ? price - 150 : undefined;
  const colour = (row.baseColour || "Navy").trim();
  const usage = (row.usage || "Casual").toLowerCase();
  const fit = usage === "formal" ? "slim" : FITS[index % FITS.length];

  return {
    name: name.slice(0, 120),
    slug,
    description: `${name}. Premium men's ${category.toLowerCase()} from the Fashion Product Images dataset.`,
    category,
    subcategory: row.subCategory || category,
    brand: "AK GARMENTS",
    price,
    discountedPrice,
    sizes: SIZES.map((s) => ({
      size: s,
      stock: 8 + (id % 7),
    })),
    colors: [colour],
    fit,
    fabric: "Cotton Blend",
    style: usage === "formal" ? "formal" : "casual",
    images: row.image ? [row.image] : [],
    tags: index % 5 === 0 ? ["New Arrivals"] : ["Core"],
    isActive: true,
    isDeleted: false,
  };
}

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Fetching men's apparel from Fashion Product Images (Small) dataset...");
  const rows = await fetchAllMensApparel(
    Number(process.env.SEED_MAX_ROWS) || 12000
  );
  console.log(`Found ${rows.length} men's apparel items.`);

  const products = [];
  const seenSlugs = new Set();

  for (let i = 0; i < rows.length; i += 1) {
    const product = rowToProduct(rows[i], i);
    if (!product) continue;
    if (seenSlugs.has(product.slug)) continue;
    seenSlugs.add(product.slug);
    products.push(product);
  }

  await Product.deleteMany({});
  if (products.length > 0) {
    await Product.insertMany(products);
  }

  console.log(`Seeded ${products.length} products with real names and images.`);
  await mongoose.disconnect();
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
