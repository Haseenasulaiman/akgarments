import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const baseProducts = [];

  const categories = [
    {
      key: "Shirts",
      baseSlug: "shirt",
      brand: "AK GARMENTS FORMAL",
      fits: ["slim", "regular"],
    },
    {
      key: "T-Shirts",
      baseSlug: "tee",
      brand: "AK GARMENTS CASUAL",
      fits: ["regular", "relaxed"],
    },
    {
      key: "Jeans",
      baseSlug: "denim",
      brand: "AK GARMENTS DENIM",
      fits: ["slim", "regular", "relaxed"],
    },
    {
      key: "Ethnic",
      baseSlug: "ethnic",
      brand: "AK GARMENTS ETHNIC",
      fits: ["regular"],
    },
    {
      key: "Inners",
      baseSlug: "inner",
      brand: "AK GARMENTS INNERWEAR",
      fits: ["slim", "regular"],
    },
    {
      key: "Shorts",
      baseSlug: "short",
      brand: "AK GARMENTS ATHLETIC",
      fits: ["regular", "relaxed"],
    },
    {
      key: "Lycra Shirts",
      baseSlug: "lycra-shirt",
      brand: "AK GARMENTS LYCRA",
      fits: ["slim", "regular"],
    },
    {
      key: "Lycra Pants",
      baseSlug: "lycra-pant",
      brand: "AK GARMENTS LYCRA",
      fits: ["slim", "regular"],
    },
  ];

  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = ["Navy", "Black", "White", "Olive", "Charcoal"];
  const fabrics = ["Cotton", "Linen", "Cotton Blend", "Stretch Cotton"];

  categories.forEach((cat) => {
    for (let i = 1; i <= 50; i += 1) {
      const name = `${cat.key} ${i.toString().padStart(2, "0")}`;
      const slug = `${cat.baseSlug}-${i}`.toLowerCase();
      const price = 999 + (i % 10) * 100;
      const discountedPrice = i % 3 === 0 ? price - 200 : undefined;

      const label = encodeURIComponent(`${cat.key} ${i}`);
      const imageUrl = `https://via.placeholder.com/600x750.png?text=${label}`;

      baseProducts.push({
        name,
        slug,
        description: `AK GARMENTS ${cat.key} ${i}, tailored for modern Indian menswear with a clean, versatile silhouette.`,
        category: cat.key,
        subcategory: cat.key,
        brand: cat.brand,
        price,
        discountedPrice,
        sizes: sizes.map((s) => ({
          size: s,
          stock: 10 + (i % 5) * 2,
        })),
        colors,
        fit: cat.fits[i % cat.fits.length],
        fabric: fabrics[i % fabrics.length],
        style:
          cat.key === "Ethnic"
            ? "festive"
            : i % 2 === 0
            ? "casual"
            : "formal",
        images: [imageUrl],
        tags: [
          i <= 10 ? "New Arrivals" : "Core",
          i % 7 === 0 ? "Limited Stock" : "",
        ].filter(Boolean),
        isActive: true,
        isDeleted: false,
      });
    }
  });

  await Product.deleteMany({});
  await Product.insertMany(baseProducts);

  // eslint-disable-next-line no-console
  console.log("Seeded products:", baseProducts.length);

  await mongoose.disconnect();
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

