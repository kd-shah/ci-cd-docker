import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prismaClient";
import redisClient from "../lib/redisClient";

/**
 * CREATE USER
 */
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phoneNumber } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 1. Save to DB
    const user = await prisma.user.create({
      data: { firstName, lastName, email, phoneNumber },
    });

    // 2. Cache user individually
    await redisClient.set(
      `user:${user.id}`,
      JSON.stringify(user),
      { EX: 3600 } // 1 hour TTL
    );

    // 3. Add user ID to index
    await redisClient.sAdd("users:ids", user.id.toString());

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET ALL USERS
 */
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Get all user IDs
    const userIds = await redisClient.sMembers("users:ids");

    // 2. Cache hit
    if (userIds.length > 0) {
      const cachedUsers = await Promise.all(
        userIds.map(id => redisClient.get(`user:${id}`))
      );

      const users = cachedUsers
        .filter(Boolean)
        .map(user => JSON.parse(user!));

      return res.status(200).json({
        source: "cache",
        users: users,
      });
    }

    // 3. Cache miss → fetch from DB
    const usersFromDB = await prisma.user.findMany();

    // 4. Populate cache
    for (const user of usersFromDB) {
      await redisClient.set(
        `user:${user.id}`,
        JSON.stringify(user),
        { EX: 3600 }
      );
      await redisClient.sAdd("users:ids", user.id.toString());
    }

    return res.status(200).json({
      source: "database",
      users: usersFromDB,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * GET USER BY Search
 */
const searchUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.params;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    // 1. Search in DB
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // 2. Cache matched users
    for (const user of users) {
      await redisClient.set(
        `user:${user.id}`,
        JSON.stringify(user),
        { EX: 3600 }
      );
      await redisClient.sAdd("users:ids", user.id.toString());
    }

    return res.status(200).json({
      source: "database",
      users: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export default {
  createUser,
  getAllUsers,
  searchUser,
};
