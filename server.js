// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import { createTransport } from "nodemailer";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const client = new MongoClient(process.env.MONGO_URI);

app.use(cors());
app.use(express.json());

// In-memory storage for verification codes (in production, use a database)
const verificationCodes = new Map();

// Email configuration
const transporter = createTransport({
  service: "gmail",
  auth: {
    user: "nagulaneetigna@gmail.com",
    pass: "vlcg bnqv ffon vpxs",
  },
});

// Generate random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const verificationCode = generateVerificationCode();
    const sessionId = uuidv4();

    // Store verification code with expiration (5 minutes)
    verificationCodes.set(sessionId, {
      email,
      code: verificationCode,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    const mailOptions = {
      from: "nagulaneetigna@gmail.com",
      to: email,
      subject: "Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Email Verification</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 15px; margin-top: -10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 25px;">
              Hello! Here's your verification code to complete your login:
            </p>
            <div style="background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 10px; padding: 25px; text-align: center; margin: 25px 0;">
              <h2 style="font-size: 36px; color: #3b82f6; margin: 0; letter-spacing: 8px; font-weight: bold;">
                ${verificationCode}
              </h2>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              This code will expire in 5 minutes. If you didn't request this code, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "Verification code sent successfully",
      sessionId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

// Verify code
app.post("/verify-otp", (req, res) => {
  try {
    const { sessionId, code } = req.body;

    if (!sessionId || !code) {
      return res
        .status(400)
        .json({ error: "Session ID and code are required" });
    }

    const verification = verificationCodes.get(sessionId);

    if (!verification) {
      return res.status(400).json({ error: "Invalid session or code expired" });
    }

    if (Date.now() > verification.expires) {
      verificationCodes.delete(sessionId);
      return res.status(400).json({ error: "Verification code has expired" });
    }

    if (verification.code !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Clean up
    verificationCodes.delete(sessionId);

    res.json({
      success: true,
      message: "Email verified successfully",
      email: verification.email,
    });
  } catch (error) {
    console.error("Error verifying code:", error);
    res.status(500).json({ error: "Failed to verify code" });
  }
});

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

// Add a new client (designer invites client)
app.post("/clients", async (req, res) => {
  const db = client.db("Interiora");
  const clientData = req.body;

  // Generate a unique ID if not provided
  if (!clientData.id) {
    clientData.id = "client_" + Date.now();
  }

  // Insert client into clients collection
  await db.collection("clients").insertOne(clientData);

  // Try to add to credentials (ignore duplicate error)
  try {
    await db.collection("credentials").insertOne({
      id: clientData.id,
      email: clientData.email,
      name: clientData.name,
      role: "client",
      // No password at this stage
    });
  } catch (err) {
    // If duplicate key error (already exists), ignore
    if (err.code !== 11000) {
      return res
        .status(500)
        .json({ error: "Failed to add client credentials" });
    }
  }

  res.status(201).json({ data: clientData });
});

// Add a new credentials entry
app.post("/credentials", async (req, res) => {
  const db = client.db("Interiora");
  const { id, email, name, role, password } = req.body;

  if (!id || !email || !role) {
    return res.status(400).json({ error: "id, email, and role are required" });
  }

  // Check if credentials already exist for this email and role
  const existing = await db.collection("credentials").findOne({ email, role });
  if (existing) {
    return res.status(409).json({ error: "Credentials already exist" });
  }

  // Insert credentials (password is optional)
  await db.collection("credentials").insertOne({
    id,
    email,
    name,
    role,
    ...(password ? { password } : {}),
  });

  res.status(201).json({ success: true, message: "Credentials created" });
});

app.patch("/credentials", async (req, res) => {
  const { email, password, role } = req.body;
  const db = client.db("Interiora");
  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ error: "Email, password, and role are required" });
  }
  const cred = await db.collection("credentials").findOne({ email, role });
  if (!cred) {
    return res
      .status(400)
      .json({ error: "You are not invited. Contact your designer." });
  }
  if (cred.password) {
    return res
      .status(400)
      .json({ error: "Account already exists. Please login." });
  }
  await db
    .collection("credentials")
    .updateOne({ email, role }, { $set: { password } });
  res.json({ success: true });
});

// Role-based user fetch
app.get("/credentials/:role/:userId", async (req, res) => {
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

// Helper to recursively remove all _id fields
function removeMongoId(obj) {
  if (Array.isArray(obj)) {
    return obj.map(removeMongoId);
  } else if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (key !== "_id") {
        newObj[key] = removeMongoId(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

app.patch("/projects/:id", async (req, res) => {
  const { id } = req.params;
  let updateData = removeMongoId(req.body);

  try {
    const db = client.db("Interiora");
    const result = await db
      .collection("projects")
      .updateOne({ id: id }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Project not found or no change" });
    }

    const updated = await db.collection("projects").findOne({ id });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ error: "Error updating project" });
  }
});

app.delete("/projects/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("projects").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ error: "Error deleting project" });
  }
});

// Delete a designer by ID
app.delete("/designers/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("designers").deleteOne({ id: id });
    await db.collection("credentials").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Designer not found" });
    }
    res.json({ success: true, message: "Designer deleted" });
  } catch (err) {
    console.error("❌ Error deleting designer:", err);
    res.status(500).json({ error: "Error deleting designer" });
  }
});

// Delete a vendor by ID
app.delete("/vendors/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("vendors").deleteOne({ id: id });
    await db.collection("credentials").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json({ success: true, message: "Vendor deleted" });
  } catch (err) {
    console.error("❌ Error deleting vendor:", err);
    res.status(500).json({ error: "Error deleting vendor" });
  }
});

// Delete a client by ID
app.delete("/clients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("clients").deleteOne({ id: id });
    await db.collection("credentials").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    console.error("❌ Error deleting client:", err);
    res.status(500).json({ error: "Error deleting client" });
  }
});

app.post("/projects", async (req, res) => {
  const db = client.db("Interiora");
  const projectData = req.body;
  if (!projectData.id) {
    projectData.id = "project_" + Date.now();
  }
  await db.collection("projects").insertOne(projectData);

  // Add project ID to the client's projects array
  if (projectData.client_id) {
    await db
      .collection("clients")
      .updateOne(
        { id: projectData.client_id },
        { $addToSet: { projects: projectData.id } }
      );
  }

  res.status(201).json({ data: projectData });
});

//Post a new Schedule
app.post("/schedules", async (req, res) => {
  const db = client.db("Interiora");
  const scheduleData = req.body;

  // Generate a unique id if not provided
  if (!scheduleData.id) {
    scheduleData.id = "schedule_" + Date.now();
  }

  scheduleData.createdAt = new Date().toISOString();
  scheduleData.updatedAt = new Date().toISOString();

  await db.collection("schedules").insertOne(scheduleData);
  res.status(201).json({ data: scheduleData });
});

// Update a schedule by ID
app.patch("/schedules/:id", async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  delete updateData._id;

  try {
    const db = client.db("Interiora");
    const result = await db
      .collection("schedules")
      .updateOne({ id: id }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Schedule not found or no change" });
    }

    const updated = await db.collection("schedules").findOne({ id });
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating schedule:", err);
    res.status(500).json({ error: "Error updating schedule" });
  }
});

// Delete a schedule by ID
app.delete("/schedules/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("schedules").deleteOne({ id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json({ success: true, message: "Schedule deleted" });
  } catch (err) {
    console.error("❌ Error deleting schedule:", err);
    res.status(500).json({ error: "Error deleting schedule" });
  }
});

app.patch("/conversations/:id/messages", async (req, res) => {
  const { id } = req.params;
  const message = req.body;
  try {
    const db = client.db("Interiora");
    const result = await db.collection("conversations").updateOne(
      { id },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date().toISOString() },
      }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    res.json({ success: true, message });
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).json({ error: "Failed to add message" });
  }
});

// PATCH Designer (update in both designers and credentials)
app.patch("/designers/:id", async (req, res) => {
  const db = client.db("Interiora");
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Update designers collection
    await db.collection("designers").updateOne({ id }, { $set: updateData });

    // Update credentials collection (only fields that exist in credentials)
    await db
      .collection("credentials")
      .updateOne({ id, role: "designer" }, { $set: updateData });

    res.json({ success: true, message: "Designer updated" });
  } catch (err) {
    console.error("❌ Error updating designer:", err);
    res.status(500).json({ error: "Failed to update designer" });
  }
});

// PATCH Client (update in both clients and credentials)
// app.patch("/clients/:id", async (req, res) => {
//   const db = client.db("Interiora");
//   const { id } = req.params;
//   const updateData = req.body;

//   try {
//     await db.collection("clients").updateOne({ id }, { $set: updateData });
//     await db
//       .collection("credentials")
//       .updateOne({ id, role: "client" }, { $set: updateData });
//     res.json({ success: true, message: "Client updated" });
//   } catch (err) {
//     console.error("❌ Error updating client:", err);
//     res.status(500).json({ error: "Failed to update client" });
//   }
// });

// PATCH Vendor (update in both vendors and credentials)
app.patch("/vendors/:id", async (req, res) => {
  const db = client.db("Interiora");
  const { id } = req.params;
  const updateData = req.body;

  try {
    await db.collection("vendors").updateOne({ id }, { $set: updateData });
    await db
      .collection("credentials")
      .updateOne({ id, role: "vendor" }, { $set: updateData });
    res.json({ success: true, message: "Vendor updated" });
  } catch (err) {
    console.error("❌ Error updating vendor:", err);
    res.status(500).json({ error: "Failed to update vendor" });
  }
});

app.patch("/clients/:id", async (req, res) => {
  const db = client.db("Interiora");
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Remove _id if present
    let updateObj = { ...updateData };
    if (updateObj._id) delete updateObj._id;

    // Flatten company fields for MongoDB dot notation
    if (updateData.company && typeof updateData.company === "object") {
      for (const key in updateData.company) {
        updateObj[`company.${key}`] = updateData.company[key];
      }
      delete updateObj.company;
    }

    // Update clients collection
    const result = await db
      .collection("clients")
      .updateOne({ id }, { $set: updateObj });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Client not found" });
    }

    // Update credentials collection (only fields that exist in credentials)
    const credUpdate = {};
    if (updateData.name) credUpdate.name = updateData.name;
    if (updateData.phone) credUpdate.phone = updateData.phone;
    if (updateData.contact_person)
      credUpdate.contact_person = updateData.contact_person;
    if (updateData.total_spend !== undefined)
      credUpdate.total_spend = updateData.total_spend;
    if (updateData.avatar) credUpdate.avatar = updateData.avatar;

    if (Object.keys(credUpdate).length > 0) {
      await db
        .collection("credentials")
        .updateOne({ id, role: "client" }, { $set: credUpdate });
    }

    res.json({ success: true, message: "Client updated" });
  } catch (err) {
    console.error("❌ Error updating client:", err);
    res.status(500).json({ error: "Failed to update client" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
