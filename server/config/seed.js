import "dotenv/config";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import connectDB from "./db.js";

const sampleProducts = [
  {
    name: "ACID LOGO HEAVYWEIGHT TEE",
    description: "Cut from 280GSM pre-shrunk organic cotton. Features custom high-density screenprint branding at the chest. Dropped shoulders, relaxed fit, thick ribbed collar.",
    price: 45,
    category: "tops",
    images: [
      "/images/products/acid-logo-heavyweight-tee.jpg",
    ],
    sizes: [
      { size: "S", stock: 12 },
      { size: "M", stock: 20 },
      { size: "L", stock: 15 },
      { size: "XL", stock: 8 },
    ],
    featured: true,
  },
  {
    name: "VOID OVERSIZED HOODIE",
    description: "450GSM loopback cotton jersey. Pigment dyed for a faded wash look. Double-layered hood, kangaroo pocket, dropped armholes, tonal embroidery on sleeve.",
    price: 85,
    category: "tops",
    images: [
      "/images/products/void-oversized-hoodie.jpg",
    ],
    sizes: [
      { size: "S", stock: 8 },
      { size: "M", stock: 15 },
      { size: "L", stock: 18 },
      { size: "XL", stock: 10 },
    ],
    featured: true,
  },
  {
    name: "TACTICAL RIPSTOP CARGO PANTS",
    description: "Engineered from cotton-nylon ripstop blend. Eight-pocket utility configuration with custom hardware. Adjustable ankle drawstrings and integrated webbed belt.",
    price: 110,
    category: "bottoms",
    images: [
      "/images/products/tactical-ripstop-cargo-pants.jpg",
    ],
    sizes: [
      { size: "S", stock: 5 },
      { size: "M", stock: 12 },
      { size: "L", stock: 10 },
      { size: "XL", stock: 4 },
    ],
    featured: true,
  },
  {
    name: "STREET UTILITY FLIGHT JACKET",
    description: "Premium nylon flight satin outer shell with lightweight warm polyfill lining. Utility sleeve pocket, interior snap pockets, heavy-duty metal double-zipper closure.",
    price: 165,
    category: "outerwear",
    images: [
      "/images/products/street-utility-flight-jacket.jpg",
    ],
    sizes: [
      { size: "S", stock: 4 },
      { size: "M", stock: 8 },
      { size: "L", stock: 8 },
      { size: "XL", stock: 5 },
    ],
    featured: true,
  },
  {
    name: "VOID REFLECTIVE BEANIE",
    description: "Double-layered acrylic knit with interwoven retroreflective fibers. High-visibility branding patch stitched on the folding cuff.",
    price: 28,
    category: "accessories",
    images: [
      "/images/products/beanie.jpg",
    ],
    sizes: [
      { size: "S", stock: 15 },
      { size: "M", stock: 25 },
      { size: "L", stock: 25 },
      { size: "XL", stock: 10 },
    ],
    featured: false,
  },
  {
    name: "GRAFFITI LOGO TRUCKER CAP",
    description: "5-panel construction featuring foam front, breathable mesh back, and custom screenprint graphic. Adjustable snapback closure.",
    price: 32,
    category: "accessories",
    images: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop",
    ],
    sizes: [
      { size: "S", stock: 10 },
      { size: "M", stock: 20 },
      { size: "L", stock: 20 },
      { size: "XL", stock: 10 },
    ],
    featured: false,
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany();
    console.log("Cleared existing products.");

    // Insert new products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${createdProducts.length} products.`);

    process.exit(0);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
