import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Order from "../models/Order.js";
import generateInvoice from "../utils/invoiceGenerator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const filePath = path.join(__dirname, "..", "invoices", `${orderId}.pdf`);

    // If invoice file doesn't exist (or was cleaned), regenerate it
    if (!fs.existsSync(filePath)) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });
      await generateInvoice(order);
    }

    // Android/Gmail viewers are picky; set explicit headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="AK GARMENTS-Invoice-${orderId}.pdf"`
    );
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    return res.sendFile(filePath, (err) => {
      if (err) {
        res.status(404).json({ message: "Invoice not found" });
      }
    });
  } catch (err) {
    next(err);
  }
};

