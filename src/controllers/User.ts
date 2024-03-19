import User from "../models/User";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      //sending bad request if dont recive userid
      return res.status(400).send("You need to provide user id.");
    }

    const user = await User.findById(id);

    if (!user) {
      //sending not found if dont find user
      return res.status(404);
    }

    const userdata = {
      id: user.id,
      name: user.name,
      age: user.age,
      phone: user.phone,
    };

    res.json(userdata);
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const { email, password, name, age, phone } = req.body;

    if (!email || !password || !name || !age || !phone) {
      //sending bad request if dont recive userdata
      return res.status(400).send("You need to provide complete user data.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: email,
      name: name,
      password: hashedPassword,
      age: age,
      phone: phone,
    });

    await user.save();

    //sending status created
    res.sendStatus(201);
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
}

/* 

async function passowrdMatches(req: Request, res: Response) {
  const { password, id } = req.body;

  if (!id || !password) {
    return res.status(400).send("You need to provide user id and password.");
  }

  const user = await prisma.user.findUnique({ where: { id: id } });

  if (!user) {
    return res.status(404);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).send("Incorrect password.");
  }

  res.sendStatus(200);
}

*/

export { getUserById, createUser };
