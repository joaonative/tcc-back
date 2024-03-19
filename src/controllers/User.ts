import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(404).send("You need to provide user data.");
    }

    await prisma.user.create({
      data: {
        email,
        name,
      },
    });

    res.sendStatus(201);
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
}

export { getUsers, createUser };
