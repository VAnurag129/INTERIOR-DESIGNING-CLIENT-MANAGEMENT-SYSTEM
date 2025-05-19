// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Error connecting to MongoDB:", err);
  }
}
connectDB();

// Collections array
const collections = [
  "projects",
  "admins",
  "clients",
  "conversations",
  "credentials",
  "designers",
  "orders",
  "payments",
  "productCategories",
  "products",
  "schedules",
  "tests",
  "users",
  "vendors",
];

// Auto-generate routes
collections.forEach((collectionName) => {
  app.get(`/${collectionName}`, async (req, res) => {
    try {
      const db = client.db("Interiora");
      const data = await db.collection(collectionName).find({}).toArray();
      res.json(data);
    } catch (err) {
      console.error(`❌ Error fetching ${collectionName}:`, err);
      res.status(500).json({ error: `Error fetching ${collectionName}` });
    }
  });

  // Add POST routes for each collection
  app.post(`/${collectionName}`, async (req, res) => {
    try {
      const db = client.db("Interiora");
      const result = await db.collection(collectionName).insertOne(req.body);
      res.status(201).json({
        success: true,
        message: `${collectionName} created successfully`,
        id: req.body.id,
        data: req.body,
      });
    } catch (err) {
      console.error(`❌ Error creating ${collectionName}:`, err);
      res.status(500).json({ error: `Error creating ${collectionName}` });
    }
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to the Interiora API!");
});

// Role-based user fetch
app.get("/users/:role/:userId", async (req, res) => {
  const { role, userId } = req.params;
  const db = client.db("Interiora");

  try {
    const result = await db.collection(`${role}s`).findOne({ id: userId });
    if (!result) return res.status(404).json({ error: "User not found" });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Generic resource fetch
app.get("/resources/:resourceType/:id", async (req, res) => {
  const { resourceType, id } = req.params;

  if (!collections.includes(resourceType)) {
    return res
      .status(404)
      .json({ error: `Collection '${resourceType}' not found` });
  }

  try {
    const db = client.db("Interiora");
    const doc = await db.collection(resourceType).findOne({ id: id });
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update designer vendor connections
app.patch("/designers/:designerId/vendor-connections", async (req, res) => {
  const { designerId } = req.params;
  const { vendorId } = req.body;

  if (!designerId || !vendorId) {
    return res
      .status(400)
      .json({ error: "Designer ID and Vendor ID are required" });
  }

  try {
    const db = client.db("Interiora");
    const designer = await db
      .collection("designers")
      .findOne({ id: designerId });

    if (!designer) {
      return res.status(404).json({ error: "Designer not found" });
    }

    // Make sure vendor_connections is an array
    const vendorConnections = designer.vendor_connections || [];

    // Add the vendor ID if it doesn't already exist
    if (!vendorConnections.includes(vendorId)) {
      const result = await db
        .collection("designers")
        .updateOne(
          { id: designerId },
          { $push: { vendor_connections: vendorId } }
        );

      return res.json({
        success: true,
        message: "Vendor connection added successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Vendor already connected",
      });
    }
  } catch (err) {
    console.error("❌ Error updating vendor connections:", err);
    res.status(500).json({ error: "Error updating vendor connections" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
