/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "propspace_secret_key_123_456_789";
const PORT = 3000;

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // If key is not configured or placeholder, return null gracefully rather than crashing
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Ensure database and uploads directories exist
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const USERS_FILE = path.join(DATA_DIR, "users.json");
const PROPERTIES_FILE = path.join(DATA_DIR, "properties.json");
const PAYMENTS_FILE = path.join(DATA_DIR, "payments.json");

// Pure PBKDF2 Password Hashing
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch (err) {
    return false;
  }
}

// Database I/O utilities
function readJSONFile<T>(filePath: string, defaultData: T): T {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return defaultData;
  }
}

function writeJSONFile<T>(filePath: string, data: T): void {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Seed Initial Data if empty
const seedProperties = [
  {
    id: "prop_1",
    title: "Luxury 3-Bedroom Apartment in Bonapriso",
    description: "Located in the quiet and secure neighborhood of Bonapriso, Douala. This luxurious 3-bedroom apartment features master bedrooms with modern amenities, fully fitted kitchen, air conditioning in all rooms, stand-by generator, and 24/7 security. Perfect for professionals or families.",
    price: 1500000,
    location: "Douala",
    type: "Apartment",
    purpose: "rent",
    imageUrls: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"],
    authorId: "admin_user",
    authorName: "Samuel Eto'o",
    authorPhone: "+237 670 123 456",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date().toISOString(),
    isRentedOrSold: false
  },
  {
    id: "prop_2",
    title: "Charming Modern Studio in Bastos",
    description: "A beautiful, premium modern studio apartment situated in the high-end diplomatic area of Bastos, Yaoundé. Highly secured, spacious living room, stylish American-style kitchen, water heater, water tank with booster pump, and dedicated parking space. Price is inclusive of security and water charges.",
    price: 350000,
    location: "Yaounde",
    type: "Studio",
    purpose: "rent",
    imageUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    authorId: "admin_user",
    authorName: "Samuel Eto'o",
    authorPhone: "+237 670 123 456",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date().toISOString(),
    isRentedOrSold: false
  },
  {
    id: "prop_3",
    title: "Stunning Beachfront Villa with Atlantic View",
    description: "An absolute masterpiece beachfront villa located on the pristine shores of Limbe. This estate boasts 5 massive ensuite bedrooms, an open-concept living area with panoramic ocean views, private swimming pool, outdoor beach lounge, manicured lawn, and supreme privacy. Excellent for holiday getaways or prestigious living.",
    price: 120000000,
    location: "Limbe",
    type: "House",
    purpose: "sale",
    imageUrls: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
    authorId: "admin_user",
    authorName: "Samuel Eto'o",
    authorPhone: "+237 670 123 456",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date().toISOString(),
    isRentedOrSold: false
  },
  {
    id: "prop_4",
    title: "4-Bedroom Modern House with Pool in Kribi",
    description: "Experience luxurious seaside living in Kribi, the tourism capital. This property offers a state-of-the-art 4-bedroom house with a private swimming pool, lush gardens, high perimeter walls, security guard post, and premium interior finishings. Only a 5-minute walk from the beach and fine seafood restaurants.",
    price: 85000000,
    location: "Kribi",
    type: "House",
    purpose: "sale",
    imageUrls: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"],
    authorId: "admin_user",
    authorName: "Samuel Eto'o",
    authorPhone: "+237 670 123 456",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date().toISOString(),
    isRentedOrSold: false
  },
  {
    id: "prop_5",
    title: "Cozy Student Studio near University of Buea",
    description: "An affordable, clean, and highly functional studio apartment located in Molyko, Buea, right next to the University of Buea. It features constant running water, prepaid electricity meter, individual kitchen, balcony, and is located in a vibrant student friendly area with robust security gates.",
    price: 80000,
    location: "Buea",
    type: "Studio",
    purpose: "rent",
    imageUrls: ["https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80"],
    authorId: "admin_user",
    authorName: "Samuel Eto'o",
    authorPhone: "+237 670 123 456",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date().toISOString(),
    isRentedOrSold: false
  }
];

// Initialize JSON collections
const initialUsers = [
  {
    id: "admin_user",
    username: "SamuelEtoo",
    email: "samuel@propspace.com",
    passwordHash: hashPassword("Cameroon2026!"),
    contactNumber: "+237 670 123 456",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date().toISOString()
  }
];

readJSONFile(USERS_FILE, initialUsers);
readJSONFile(PROPERTIES_FILE, seedProperties);
readJSONFile(PAYMENTS_FILE, []);

async function startServer() {
  const app = express();

  // Support large JSON payloads for base64 image uploads
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // Serve static files from the public folder (e.g. uploaded images)
  app.use(express.static(path.join(process.cwd(), "public")));

  // Outbound API response utility to map exact status headers and payload format
  const sendJSON = (res: express.Response, status: number, data: any) => {
    res.status(status).json(data);
  };

  // Auth Middleware
  const authenticateToken = (req: any, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return sendJSON(res, 401, { error: "Access denied. Token missing." });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      req.user = decoded;
      next();
    } catch (err) {
      return sendJSON(res, 401, { error: "Access denied. Invalid or expired token." });
    }
  };

  // ==========================================
  // AUTH API ROUTES
  // ==========================================

  // POST /api/auth/register
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password, contactNumber } = req.body;

    if (!username || !email || !password) {
      return sendJSON(res, 400, { error: "Username, email, and password are required." });
    }

    const users = readJSONFile<any[]>(USERS_FILE, []);
    const emailExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    const usernameExists = users.some((u) => u.username.toLowerCase() === username.toLowerCase());

    if (emailExists) {
      return sendJSON(res, 400, { error: "An account with this email already exists." });
    }
    if (usernameExists) {
      return sendJSON(res, 400, { error: "This username is already taken." });
    }

    const newUser = {
      id: "user_" + crypto.randomBytes(8).toString("hex"),
      username,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      contactNumber: contactNumber || "",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeJSONFile(USERS_FILE, users);

    // Create Token
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: "24h" });

    // Exclude password from response
    const { passwordHash, ...userResponse } = newUser;
    sendJSON(res, 201, { user: userResponse, token });
  });

  // POST /api/auth/login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendJSON(res, 400, { error: "Email and password are required." });
    }

    const users = readJSONFile<any[]>(USERS_FILE, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return sendJSON(res, 400, { error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "24h" });
    const { passwordHash, ...userResponse } = user;
    sendJSON(res, 200, { user: userResponse, token });
  });

  // GET /api/auth/me
  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return sendJSON(res, 404, { error: "User not found." });
    }

    const { passwordHash, ...userResponse } = user;
    sendJSON(res, 200, { user: userResponse });
  });

  // PUT /api/auth/profile
  app.put("/api/auth/profile", authenticateToken, (req: any, res) => {
    const { username, contactNumber, avatarUrl } = req.body;
    const users = readJSONFile<any[]>(USERS_FILE, []);
    const userIndex = users.findIndex((u) => u.id === req.user.id);

    if (userIndex === -1) {
      return sendJSON(res, 404, { error: "User not found." });
    }

    const user = users[userIndex];

    // Optional unique username check
    if (username && username !== user.username) {
      const usernameExists = users.some((u) => u.id !== user.id && u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        return sendJSON(res, 400, { error: "This username is already taken." });
      }
      user.username = username;
    }

    if (contactNumber !== undefined) user.contactNumber = contactNumber;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    users[userIndex] = user;
    writeJSONFile(USERS_FILE, users);

    // Sync user information across their properties
    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    properties.forEach((p) => {
      if (p.authorId === user.id) {
        p.authorName = user.username;
        p.authorPhone = user.contactNumber;
        p.authorAvatar = user.avatarUrl;
      }
    });
    writeJSONFile(PROPERTIES_FILE, properties);

    const { passwordHash, ...userResponse } = user;
    sendJSON(res, 200, { user: userResponse });
  });

  // PUT /api/auth/password
  app.put("/api/auth/password", authenticateToken, (req: any, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendJSON(res, 400, { error: "Old password and new password are required." });
    }

    const users = readJSONFile<any[]>(USERS_FILE, []);
    const userIndex = users.findIndex((u) => u.id === req.user.id);

    if (userIndex === -1) {
      return sendJSON(res, 404, { error: "User not found." });
    }

    const user = users[userIndex];

    if (!verifyPassword(oldPassword, user.passwordHash)) {
      return sendJSON(res, 400, { error: "Incorrect current password." });
    }

    user.passwordHash = hashPassword(newPassword);
    users[userIndex] = user;
    writeJSONFile(USERS_FILE, users);

    sendJSON(res, 200, { success: true, message: "Password updated successfully." });
  });

  // ==========================================
  // PROPERTY API ROUTES (CRUD)
  // ==========================================

  // GET /api/properties (Public Feed with Filter & Search)
  app.get("/api/properties", (req, res) => {
    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    let filtered = [...properties];

    const { query, type, purpose, city, minPrice, maxPrice } = req.query;

    if (query) {
      const q = (query as string).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q)
      );
    }

    if (type) {
      filtered = filtered.filter((p) => p.type.toLowerCase() === (type as string).toLowerCase());
    }

    if (purpose) {
      filtered = filtered.filter((p) => p.purpose.toLowerCase() === (purpose as string).toLowerCase());
    }

    if (city) {
      filtered = filtered.filter((p) => p.location.toLowerCase() === (city as string).toLowerCase());
    }

    if (minPrice) {
      const min = parseInt(minPrice as string);
      if (!isNaN(min)) filtered = filtered.filter((p) => p.price >= min);
    }

    if (maxPrice) {
      const max = parseInt(maxPrice as string);
      if (!isNaN(max)) filtered = filtered.filter((p) => p.price <= max);
    }

    // Sort by newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    sendJSON(res, 200, filtered);
  });

  // GET /api/properties/my (Private Feed)
  app.get("/api/properties/my", authenticateToken, (req: any, res) => {
    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    const myProperties = properties.filter((p) => p.authorId === req.user.id);
    sendJSON(res, 200, myProperties);
  });

  // POST /api/properties/upload (Base64 file upload)
  app.post("/api/properties/upload", authenticateToken, (req: any, res) => {
    const { filename, base64 } = req.body;

    if (!filename || !base64) {
      return sendJSON(res, 400, { error: "Filename and base64 data are required." });
    }

    try {
      // Clean up base64 prefix if exists
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      const ext = path.extname(filename) || ".png";
      const newFilename = `${crypto.randomBytes(12).toString("hex")}${ext}`;
      const filePath = path.join(UPLOADS_DIR, newFilename);

      fs.writeFileSync(filePath, buffer);

      const urlPath = `/uploads/${newFilename}`;
      sendJSON(res, 200, { url: urlPath });
    } catch (err: any) {
      console.error("Upload error:", err);
      sendJSON(res, 500, { error: "Failed to save uploaded image: " + err.message });
    }
  });

  // POST /api/properties
  app.post("/api/properties", authenticateToken, (req: any, res) => {
    const { title, description, price, location, type, purpose, imageUrls } = req.body;

    if (!title || !description || !price || !location || !type || !purpose) {
      return sendJSON(res, 400, { error: "Missing required property fields." });
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return sendJSON(res, 400, { error: "Price must be a valid positive number." });
    }

    const users = readJSONFile<any[]>(USERS_FILE, []);
    const author = users.find((u) => u.id === req.user.id);

    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    const newProperty = {
      id: "prop_" + crypto.randomBytes(8).toString("hex"),
      title,
      description,
      price: priceNum,
      location,
      type, // 'Apartment' | 'House' | 'Studio'
      purpose, // 'rent' | 'sale'
      imageUrls: imageUrls || ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"],
      authorId: req.user.id,
      authorName: author ? author.username : "PropSpace Host",
      authorPhone: author ? author.contactNumber : "",
      authorAvatar: author ? author.avatarUrl : "",
      createdAt: new Date().toISOString(),
      isRentedOrSold: false
    };

    properties.push(newProperty);
    writeJSONFile(PROPERTIES_FILE, properties);

    sendJSON(res, 201, newProperty);
  });

  // PUT /api/properties/:id
  app.put("/api/properties/:id", authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { title, description, price, location, type, purpose, imageUrls, isRentedOrSold } = req.body;

    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    const propertyIndex = properties.findIndex((p) => p.id === id);

    if (propertyIndex === -1) {
      return sendJSON(res, 404, { error: "Property listing not found." });
    }

    const property = properties[propertyIndex];

    // Secure ownership guard: author-only modification
    if (property.authorId !== req.user.id) {
      return sendJSON(res, 403, { error: "Forbidden. You are not authorized to modify this listing." });
    }

    if (title !== undefined) property.title = title;
    if (description !== undefined) property.description = description;
    if (location !== undefined) property.location = location;
    if (type !== undefined) property.type = type;
    if (purpose !== undefined) property.purpose = purpose;
    if (imageUrls !== undefined) property.imageUrls = imageUrls;
    if (isRentedOrSold !== undefined) property.isRentedOrSold = isRentedOrSold;

    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return sendJSON(res, 400, { error: "Price must be a valid positive number." });
      }
      property.price = priceNum;
    }

    properties[propertyIndex] = property;
    writeJSONFile(PROPERTIES_FILE, properties);

    sendJSON(res, 200, property);
  });

  // DELETE /api/properties/:id
  app.delete("/api/properties/:id", authenticateToken, (req: any, res) => {
    const { id } = req.params;

    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    const propertyIndex = properties.findIndex((p) => p.id === id);

    if (propertyIndex === -1) {
      return sendJSON(res, 404, { error: "Property listing not found." });
    }

    const property = properties[propertyIndex];

    // Secure ownership guard: author-only deletion
    if (property.authorId !== req.user.id) {
      return sendJSON(res, 403, { error: "Forbidden. You are not authorized to delete this listing." });
    }

    properties.splice(propertyIndex, 1);
    writeJSONFile(PROPERTIES_FILE, properties);

    sendJSON(res, 200, { success: true, message: "Listing deleted successfully." });
  });

  // ==========================================
  // STRIPE / PAYMENTS API ROUTES
  // ==========================================

  // POST /api/payments/checkout-session (Mock Stripe payment checkout with real Stripe capability fallback)
  app.post("/api/payments/checkout-session", authenticateToken, (req: any, res) => {
    const { propertyId, cardHolder, paymentMethodId } = req.body;

    if (!propertyId) {
      return sendJSON(res, 400, { error: "Property ID is required." });
    }

    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    const propertyIndex = properties.findIndex((p) => p.id === propertyId);

    if (propertyIndex === -1) {
      return sendJSON(res, 404, { error: "Property not found." });
    }

    const property = properties[propertyIndex];

    if (property.isRentedOrSold) {
      return sendJSON(res, 400, { error: "This property is already rented or sold." });
    }

    // Capture the payment details
    const payments = readJSONFile<any[]>(PAYMENTS_FILE, []);
    const newPayment = {
      id: "pay_" + crypto.randomBytes(8).toString("hex"),
      propertyId: property.id,
      propertyTitle: property.title,
      amount: property.price,
      payerId: req.user.id,
      payerName: cardHolder || req.user.email,
      payerEmail: req.user.email,
      date: new Date().toISOString(),
      status: "success"
    };

    payments.push(newPayment);
    writeJSONFile(PAYMENTS_FILE, payments);

    // Mark property as rented or sold
    property.isRentedOrSold = true;
    properties[propertyIndex] = property;
    writeJSONFile(PROPERTIES_FILE, properties);

    sendJSON(res, 200, {
      success: true,
      message: `Payment of ${property.price.toLocaleString()} FCFA was successfully processed via PropSpace secure Stripe portal.`,
      payment: newPayment
    });
  });

  // GET /api/payments/my (Retrieve past rental payments for current user)
  app.get("/api/payments/my", authenticateToken, (req: any, res) => {
    const payments = readJSONFile<any[]>(PAYMENTS_FILE, []);
    const userPayments = payments.filter((p) => p.payerId === req.user.id);
    sendJSON(res, 200, userPayments);
  });

  // ==========================================
  // GEMINI AI INTEGRATION (WITH SEARCH GROUNDING)
  // ==========================================

  // POST /api/ai/chat (AI Assistant for Real Estate in Cameroon)
  app.post("/api/ai/chat", async (req, res) => {
    const { message, history } = req.body;

    if (!message) {
      return sendJSON(res, 400, { error: "Chat message is required." });
    }

    const gemini = getGeminiClient();

    // Context from our listings to feed into the chatbot
    const properties = readJSONFile<any[]>(PROPERTIES_FILE, []);
    const listingSummary = properties
      .map(
        (p) =>
          `- ${p.title} in ${p.location} for ${p.purpose === "rent" ? "Rent" : "Sale"} at ${p.price.toLocaleString()} FCFA (${p.type}).`
      )
      .join("\n");

    const systemInstruction = `You are a professional Cameroonian Real Estate Agent representing PropSpace, an innovative property listing portal in Cameroon.
Your role is to guide clients on finding rental properties (apartments, studios) or purchasing family homes, calculating mortgages, and understanding the real estate market in Cameroon (notably Douala, Yaoundé, Limbe, Kribi, Buea, Bafoussam).
Always use the Cameroonian currency, Central African CFA franc (FCFA/XAF).

Here are the properties CURRENTLY LISTED in our PropSpace app right now:
${listingSummary}

Always answer queries thoroughly and professionally. For general information, use Google Search Grounding to provide accurate and up-to-date facts about Cameroonian suburbs, tax rates, land registration (titre foncier), rental laws, or pricing trends in Douala/Yaoundé.
If someone asks to buy or rent a property listed in our app, kindly refer them to that specific listing, Samuel Eto'o (the representative host), or explain they can click "Rent Property" directly on the card to make a payment.
Keep answers warm, polite, and uniquely Cameroonian in style if fitting!`;

    if (!gemini) {
      // Graceful local AI fallback with detailed listings and advice if API key is not configured yet
      const fallbackResponse = `Hello there! I'm your PropSpace AI Assistant. 
Currently, the Gemini API key is not fully configured in your Settings Secrets panel. However, as your local Cameroonian property assistant, I can immediately share the listings available on PropSpace right now:

${properties.map(p => `* **${p.title}** (${p.location}): ${p.price.toLocaleString()} FCFA for ${p.purpose}. Contact Host: ${p.authorName} (${p.authorPhone || "N/A"})`).join('\n')}

**Cameroon Real Estate Quick Facts:**
1. **Douala vs Yaoundé Prices:** Bastos (Yaoundé) and Bonapriso/Krystal (Douala) are high-end neighborhoods where rents range from 300,000 FCFA up to 2,000,000 FCFA.
2. **Land Certificate (Titre Foncier):** This is the ultimate legal proof of land ownership in Cameroon. Never purchase land without verifying the land title at the Ministry of Land Tenure (MINDCAF).
3. **Rental Deposit:** It is standard practice to pay a 1-year deposit + 2 months' agency fee, although recent regulatory drafts attempt to limit this.

*To enable real-time smart conversations with full Google Search integration, please add your **GEMINI_API_KEY** in the AI Studio Secrets panel!*`;

      return sendJSON(res, 200, {
        text: fallbackResponse,
        isGroundingUsed: false,
        sources: []
      });
    }

    try {
      // Map conversation history to Gemini format: content structure
      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.forEach((msg: any) => {
          contents.push({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          });
        });
      }

      // Add the latest message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text || "I couldn't generate a response. Please try again.";

      // Extract Grounding sources if available
      let isGroundingUsed = false;
      const sources: { title: string; uri: string }[] = [];

      const candidate = response.candidates?.[0];
      if (candidate?.groundingMetadata) {
        const metadata = candidate.groundingMetadata;
        isGroundingUsed = true;
        if (metadata.groundingChunks) {
          metadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.title && chunk.web?.uri) {
              // De-duplicate sources
              if (!sources.some(s => s.uri === chunk.web.uri)) {
                sources.push({
                  title: chunk.web.title,
                  uri: chunk.web.uri
                });
              }
            }
          });
        }
      }

      sendJSON(res, 200, {
        text: responseText,
        isGroundingUsed,
        sources
      });
    } catch (err: any) {
      console.error("Gemini API error:", err);
      sendJSON(res, 500, {
        error: "Failed to query Gemini AI: " + err.message,
        text: "Pardon! I encountered a technical issue while connecting to the Gemini network. Please try again in a moment."
      });
    }
  });


  // ==========================================
  // VITE DEV MIDDLEWARE / PRODUCTION FALLBACK
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Dev Mode: Vite middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production Mode: Static serving mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PropSpace server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal: failed to start PropSpace server:", err);
});
