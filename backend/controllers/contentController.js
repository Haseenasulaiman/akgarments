import Banner from "../models/Banner.js";
import Page from "../models/Page.js";

export const listBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

export const adminListBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    next(err);
  }
};

export const adminUpsertBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    let banner;
    if (id === "new") {
      banner = await Banner.create(req.body);
    } else {
      banner = await Banner.findByIdAndUpdate(id, req.body, { new: true });
    }
    res.json(banner);
  } catch (err) {
    next(err);
  }
};

export const adminDeleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    await banner.deleteOne();
    res.json({ message: "Banner deleted" });
  } catch (err) {
    next(err);
  }
};

export const getPage = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug, isActive: true });
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.json(page);
  } catch (err) {
    next(err);
  }
};

export const adminUpsertPage = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const page = await Page.findOneAndUpdate(
      { slug },
      req.body,
      { new: true, upsert: true }
    );
    res.json(page);
  } catch (err) {
    next(err);
  }
};

