import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import Ferry from "../models/Ferry.js";
import Route from "../models/Route.js";
import Schedule from "../models/Schedule.js";
import User from "../models/User.js";
import { portConnections } from "../utils/portConnections.js";

const routeDefaults = {
  "Mumbai|Mandwa": [45, 150],
  "Mumbai|Alibaug": [75, 220],
  "Mumbai|Elephanta Island": [60, 200],
  "Goa|Kochi": [720, 2100],
  "Kochi|Lakshadweep": [840, 2500],
  "Chennai|Port Blair": [3600, 4200],
  "Port Blair|Havelock Island": [90, 850],
  "Port Blair|Neil Island": [75, 750],
  "Havelock Island|Neil Island": [60, 650],
  "Kolkata|Gangasagar": [210, 450],
  "Diu|Okha": [360, 900],
  "Okha|Beyt Dwarka": [30, 50]
};

const getDefaults = (source, destination) =>
  routeDefaults[`${source}|${destination}`] ||
  routeDefaults[`${destination}|${source}`] ||
  [120, 500];

const ferries = [
  ["Ocean Pearl", "FP-OP-01", 120],
  ["Sea Breeze", "FP-SB-02", 100],
  ["Coastal Queen", "FP-CQ-03", 140],
  ["Blue Horizon", "FP-BH-04", 90],
  ["Island Express", "FP-IE-05", 110],
  ["Aqua Rider", "FP-AR-06", 80],
  ["Marine Star", "FP-MS-07", 130],
  ["Konkan Voyager", "FP-KV-08", 100]
];

const pad = (value) => String(value).padStart(2, "0");
const dateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const run = async () => {
  try {
    await connectDatabase();
    const admin = await User.findOne({ role: "admin" });
    if (!admin) throw new Error("Run npm run seed:admin before seeding ferry data.");

    for (const [name, ferryCode, totalCapacity] of ferries) {
      await Ferry.updateOne(
        { ferryCode },
        {
          $setOnInsert: {
            name, ferryCode, totalCapacity,
            description: "Passenger Ferry",
            facilities: ["Life jackets", "First aid", "Reserved seating"],
            status: "active",
            createdBy: admin._id
          }
        },
        { upsert: true }
      );
    }

    for (const [source, destinations] of Object.entries(portConnections)) {
      for (const destination of destinations) {
        const [estimatedDuration, basePrice] = getDefaults(source, destination);
        await Route.updateOne(
          { source, destination },
          {
            $setOnInsert: {
              source, destination, estimatedDuration, basePrice,
              distance: Math.max(10, Math.round(estimatedDuration * 0.55)),
              status: "active",
              createdBy: admin._id
            }
          },
          { upsert: true }
        );
      }
    }

    const allFerries = await Ferry.find({ status: "active" }).sort("ferryCode");
    const routes = await Route.find({ status: "active" }).sort("source destination");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (let dayOffset = 0; dayOffset < 30; dayOffset += 1) {
      const travel = new Date(tomorrow);
      travel.setDate(tomorrow.getDate() + dayOffset);
      const travelDate = dateString(travel);

      for (let index = 0; index < routes.length; index += 1) {
        const route = routes[index];
        const ferry = allFerries[(index + dayOffset) % allFerries.length];
        const departureTime = route.estimatedDuration >= 720 ? "18:00" : index % 2 ? "15:30" : "08:00";
        const departureDateTime = new Date(`${travelDate}T${departureTime}:00`);
        const arrivalDateTime = new Date(departureDateTime.getTime() + route.estimatedDuration * 60 * 1000);
        const arrivalTime = `${pad(arrivalDateTime.getHours())}:${pad(arrivalDateTime.getMinutes())}`;

        await Schedule.updateOne(
          { route: route._id, departureDateTime },
          {
            $setOnInsert: {
              ferry: ferry._id,
              route: route._id,
              travelDate,
              departureTime,
              arrivalTime,
              departureDateTime,
              arrivalDateTime,
              totalSeats: ferry.totalCapacity,
              availableSeats: ferry.totalCapacity,
              ticketPrice: route.basePrice,
              taxPercent: 5,
              serviceCharge: 20,
              convenienceFee: 10,
              discountPercent: 0,
              bookingEnabled: true,
              status: "scheduled",
              createdBy: admin._id
            }
          },
          { upsert: true }
        );
      }
    }

    console.log(`Seed complete: ${allFerries.length} ferries, ${routes.length} routes, future schedules ready.`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error("Data seed failed:", error.message);
  process.exitCode = 1;
});
