import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User";

const maxAge = 7 * 24 * 60 * 60;

async function getUserData(req: Request, res: Response) {
  try {
  } catch (error) {
    throw new Error("Error fetching users: " + error.message);
  }
}

async function createUser(req: Request, res: Response) {
  try {
    const { email, password, name, age, phone } = req.body;

    if (!email || !password || !name || !age || !phone) {
      //sending bad request if dont recive userdata
      return res.status(400).send();
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      //returnig bad request if user existis
      return res.status(400).send();
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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });

    //sending status created and setting cookie
    res
      .status(201)
      .cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
}

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send();
    }

    const userToVerify = await User.findOne({ email });

    if (!userToVerify) {
      //returning not found in case we dont find that email in db
      return res.status(404).send();
    }

    const user = await User.login(password, userToVerify);

    if (!user) {
      //returning unauthorized in case user fails
      return res.status(401).send();
    }

    const userData = {
      id: user._id,
      name: user.name,
      age: user.age,
      email: user.email,
      phone: user.phone,
    };

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });

    //sending status ok and setting cookie
    //set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });

    //send response with user data and status OK
    res.status(200).json({ userData });
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
}

async function logout(req: Request, res: Response) {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).send();
}

async function checkSession(req: Request, res: Response) {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Cookie não encontrado" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Token inválido" });
      } else {
        return res.status(200).send();
      }
    });
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
}

export { getUserData, createUser, login, logout, checkSession };
