import { MongoClient, GridFSBucket } from "mongodb";

let client;
let database;
let firmwareBucket;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  database = process.env.MONGODB_DB
    ? client.db(process.env.MONGODB_DB)
    : client.db();
  firmwareBucket = new GridFSBucket(database, { bucketName: "firmwareFiles" });

  await Promise.all([
    database.collection("admins").createIndex({ username: 1 }, { unique: true }),
    database.collection("devices").createIndex({ name: 1 }, { unique: true }),
    database.collection("devices").createIndex({ apiKey: 1 }, { unique: true }),
    database.collection("firmware").createIndex({ version: 1 }, { unique: true }),
  ]);

  return database;
}

export function getDatabase() {
  if (!database) throw new Error("MongoDB has not been connected");
  return database;
}

export function getFirmwareBucket() {
  if (!firmwareBucket) throw new Error("MongoDB has not been connected");
  return firmwareBucket;
}

export async function closeDatabase() {
  await client?.close();
  client = undefined;
  database = undefined;
  firmwareBucket = undefined;
}
