import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../models/User";

const maxAge = 7 * 24 * 60 * 60;

async function createUser(req: Request, res: Response) {
  try {
    const { email, password, name, age, phone, imageUrl } = req.body;

    if (!email || !password || !name || !age || !phone || !imageUrl) {
      //sending bad request if dont recive userdata
      res.status(400).send({ message: "por favor preencha todos os campos" });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      //returnig bad request if user existis
      res.status(400).send({ message: "usuário já cadastrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email: email,
      name: name,
      password: hashedPassword,
      age: age,
      phone: phone,
      imageUrl: imageUrl,
    });

    await user.save();

    const userData = {
      id: user._id,
      name: user.name,
      age: user.age,
      email: user.email,
      phone: user.phone,
      imageUrl: user.imageUrl,
    };

    //sending status created
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });

    //sending status created and setting cookie
    //set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });

    //send response with user data and status created
    res.status(201).json({ userData });
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
}

async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send();
      return;
    }

    const userToVerify = await User.findOne({ email });

    if (!userToVerify) {
      //returning not found in case we dont find that email in db
      res.status(404).send({ message: "usuário com email não encontrado" });
      return;
    }

    const user = await User.login(password, userToVerify);

    if (!user) {
      //returning unauthorized in case user fails
      res.status(404).send({ message: "senha inválida" });
      return;
    }

    const userData = {
      id: user._id,
      name: user.name,
      age: user.age,
      email: user.email,
      phone: user.phone,
      imageUrl: user.imageUrl,
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
    throw new Error("Error logging user: " + error.message);
  }
}

async function logout(req: Request, res: Response) {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).send();
}

export { createUser, login, logout };
