# Fashion Product Images – Men's wear seed

**styles.csv** (required) and optional **images.csv** go in this folder.

## With full-dataset image links (recommended for better quality)

If you have **images.csv** (or unzipped **images.csv.zip**) from the [full Fashion Product Images Dataset](https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-dataset):

1. Put **images.csv** here: `backend/data/fashion-product-images-small/images.csv`
2. When you run the seed, the script will use the `link` column (high-res image URLs) for each product. No need to download the image files.

## Steps

1. **styles.csv** → `backend/data/fashion-product-images-small/styles.csv`
2. **images.csv** (optional, from full dataset) → `backend/data/fashion-product-images-small/images.csv`
3. Run: `npm run seed:products:kaggle --prefix backend` or from backend: `node scripts/seedFromKaggleCsv.js`

The script uses only **Men's Apparel** and maps to store categories (Shirts, T-Shirts, Jeans, etc.). If **images.csv** is present, product images use its URLs; otherwise they use local `/product-images/{id}.jpg` if you have an `images` folder.
