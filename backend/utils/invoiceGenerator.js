import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureInvoicesDir = () => {
  const dir = path.join(__dirname, "..", "invoices");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const generateInvoice = (order) => {
  const invoicesDir = ensureInvoicesDir();
  const filePath = path.join(invoicesDir, `${order._id}.pdf`);

  const doc = new PDFDocument({ margin: 40 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const formatMoney = (n) => `Rs ${Math.round(Number(n || 0))}`;

  const addr = order.shippingAddress || {};
  const created = order.createdAt ? new Date(order.createdAt) : new Date();

  // Header / branding
  doc
    .fillColor("#0b1120")
    .fontSize(20)
    .text("AK GARMENTS", { align: "left" });

  doc
    .fontSize(9)
    .fillColor("#4b5563")
    .text("Premium Men's Clothing", { align: "left" })
    .text("AK Garments, Main Street, Coimbatore, Tamil Nadu", {
      align: "left",
    })
    .text("GSTIN: 33AAAAA0000A1Z5 (sample)", { align: "left" });

  doc.moveDown(0.8);

  // Invoice meta
  doc
    .fontSize(11)
    .fillColor("#111827")
    .text(`Invoice No : ${order._id}`, { continued: true })
    .text(`    Date : ${created.toLocaleDateString("en-IN")}`, {
      align: "left",
    });

  doc
    .fontSize(10)
    .fillColor("#4b5563")
    .text(`Order Status : ${order.status || "Processing"}`, {
      align: "left",
    })
    .text(`Payment : ${order.paymentMethod || "COD"} (${order.paymentStatus})`, {
      align: "left",
    });

  doc.moveDown(0.8);

  // Customer block
  const leftX = doc.x;
  const midX = leftX + 250;

  doc
    .fontSize(10)
    .fillColor("#111827")
    .text("Bill To", leftX, doc.y, { underline: true });

  doc
    .fontSize(9)
    .fillColor("#374151")
    .text(addr.name || "", leftX, doc.y)
    .text(addr.line1 || "", leftX, doc.y)
    .text(addr.line2 || "", leftX, doc.y)
    .text(
      `${addr.city || ""}, ${addr.state || ""} ${addr.pincode || ""}`,
      leftX,
      doc.y
    )
    .text(addr.phone || "", leftX, doc.y);

  doc
    .fontSize(10)
    .fillColor("#111827")
    .text("Ship To", midX, doc.y - 45, { underline: true });

  doc
    .fontSize(9)
    .fillColor("#374151")
    .text(addr.name || "", midX, doc.y)
    .text(addr.line1 || "", midX, doc.y)
    .text(addr.line2 || "", midX, doc.y)
    .text(
      `${addr.city || ""}, ${addr.state || ""} ${addr.pincode || ""}`,
      midX,
      doc.y
    )
    .text(addr.phone || "", midX, doc.y);

  doc.moveDown();

  // Items table header
  doc.moveDown(0.5);
  const tableTop = doc.y;
  const col1 = leftX;
  const col2 = leftX + 30;
  const col3 = leftX + 240;
  const col4 = leftX + 300;
  const col5 = leftX + 360;
  const col6 = leftX + 430;

  doc
    .fontSize(10)
    .fillColor("#111827")
    .text("S.No", col1, tableTop)
    .text("Item", col2, tableTop)
    .text("Size", col3, tableTop)
    .text("Qty", col4, tableTop, { width: 30, align: "right" })
    .text("Price", col5, tableTop, { width: 60, align: "right" })
    .text("Amount", col6, tableTop, { width: 70, align: "right" });

  doc
    .moveTo(col1, tableTop + 12)
    .lineTo(col6 + 70, tableTop + 12)
    .strokeColor("#e5e7eb")
    .stroke();

  let rowY = tableTop + 16;

  doc.fontSize(9).fillColor("#374151");
  order.items.forEach((item, index) => {
    const amount = item.subtotal || item.priceSnapshot * item.quantity;

    doc.text(String(index + 1), col1, rowY);
    doc.text(item.nameSnapshot || "", col2, rowY, { width: 200 });
    doc.text(item.size || "-", col3, rowY);
    doc.text(String(item.quantity || 0), col4, rowY, {
      width: 30,
      align: "right",
    });
    doc.text(formatMoney(item.priceSnapshot || 0), col5, rowY, {
      width: 60,
      align: "right",
    });
    doc.text(formatMoney(amount || 0), col6, rowY, {
      width: 70,
      align: "right",
    });

    rowY += 14;
  });

  doc.moveDown(2);

  // Totals / summary block
  const { subtotal, discount, tax, shipping, grandTotal } = order.totals;
  const summaryX = col5;
  let summaryY = rowY + 4;

  doc
    .fontSize(10)
    .fillColor("#111827")
    .text("Subtotal:", summaryX, summaryY, { width: 80, align: "right" });

  doc.text(formatMoney(subtotal), summaryX + 82, summaryY, {
    width: 80,
    align: "right",
  });

  summaryY += 12;

  doc
    .fillColor("#4b5563")
    .text("Discount:", summaryX, summaryY, { width: 80, align: "right" });

  doc.text(`- ${formatMoney(discount)}`, summaryX + 82, summaryY, {
    width: 80,
    align: "right",
  });

  summaryY += 12;

  doc
    .fillColor("#4b5563")
    .text("Tax:", summaryX, summaryY, { width: 80, align: "right" });

  doc.text(formatMoney(tax), summaryX + 82, summaryY, {
    width: 80,
    align: "right",
  });

  summaryY += 12;

  doc
    .fillColor("#4b5563")
    .text("Shipping:", summaryX, summaryY, { width: 80, align: "right" });

  doc.text(formatMoney(shipping), summaryX + 82, summaryY, {
    width: 80,
    align: "right",
  });

  summaryY += 14;

  doc
    .moveTo(summaryX, summaryY)
    .lineTo(summaryX + 162, summaryY)
    .strokeColor("#e5e7eb")
    .stroke();

  summaryY += 6;

  doc
    .fontSize(11)
    .fillColor("#111827")
    .text("Grand Total:", summaryX, summaryY, {
      width: 80,
      align: "right",
    });

  doc
    .fontSize(11)
    .fillColor("#111827")
    .text(formatMoney(grandTotal), summaryX + 82, summaryY, {
      width: 80,
      align: "right",
    });

  doc.moveDown(3);

  // Footer / notes
  doc
    .fontSize(9)
    .fillColor("#6b7280")
    .text(
      "Thank you for shopping with AK GARMENTS. This is a system-generated invoice and does not require a signature.",
      leftX,
      doc.y,
      { width: 400 }
    )
    .moveDown(0.4)
    .text(
      "Returns: Items are eligible for return within 7 days of delivery, subject to our return policy.",
      leftX,
      doc.y,
      { width: 400 }
    );

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      const publicPath = `/invoices/${order._id}.pdf`;
      resolve(publicPath);
    });
    stream.on("error", reject);
  });
};

export default generateInvoice;