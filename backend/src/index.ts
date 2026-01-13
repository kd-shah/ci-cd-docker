import "dotenv/config";
import { prisma } from "./lib/prismaClient";
import { app } from "./app";

const port = process.env.PORT || 5000;

async function start() {
  try {

    // Ensure DB connection works before starting server
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
