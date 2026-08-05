import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const serverDirectory = path.resolve(scriptDirectory, "..");
const environmentPath = path.join(serverDirectory, ".env");
const examplePath = path.join(serverDirectory, ".env.example");

if (!fs.existsSync(environmentPath)) {
  fs.copyFileSync(examplePath, environmentPath);
  console.error("Created server/.env from .env.example.");
  console.error("Add your MongoDB Atlas URI, JWT secret, and admin password, then run npm run dev again.");
  process.exit(1);
}

const values = Object.fromEntries(
  fs.readFileSync(environmentPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trimStart().startsWith("#") && line.includes("="))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    })
);

const invalid = [
  !values.MONGO_URI || values.MONGO_URI.includes("your_mongodb") ? "MONGO_URI" : null,
  !values.JWT_SECRET || values.JWT_SECRET.includes("your_long") ? "JWT_SECRET" : null,
  !values.ADMIN_PASSWORD || values.ADMIN_PASSWORD.includes("your_secure") ? "ADMIN_PASSWORD" : null
].filter(Boolean);

if (invalid.length) {
  console.error(`Update these values in server/.env before starting: ${invalid.join(", ")}`);
  process.exit(1);
}

console.log("Backend environment configuration found.");
