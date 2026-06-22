// config/db.js
// One job: connect our server to MongoDB using Mongoose.
//
// Mongoose is the helper that talks to MongoDB for us. `mongoose.connect()`
// opens the connection using the secret address from our .env file.

import mongoose from "mongoose";

// We wrap it in a function so server.js can call it on startup.
// `async` because connecting takes time (it goes over the internet to Atlas),
// and `await` lets us wait for it to finish before moving on.
export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    // If we can't reach the database, the app is useless — so log why
    // and stop the server instead of running half-broken.
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
