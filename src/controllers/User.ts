import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User";
import mongoose from "mongoose";
import Verification from "../models/Verification";

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

    const alreadyUsingPhone = await User.findOne({ phone });

    if (alreadyUsingPhone) {
      //returnig bad request if user existis
      res
        .status(400)
        .send({ message: "número de telefone cadastrado em outra conta" });
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });

    const userData = {
      id: user._id,
      name: user.name,
      age: user.age,
      email: user.email,
      phone: user.phone,
      imageUrl: user.imageUrl,
      token: token,
    };

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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: maxAge,
    });

    const userData = {
      id: user._id,
      name: user.name,
      age: user.age,
      email: user.email,
      phone: user.phone,
      imageUrl: user.imageUrl,
      token: token,
    };

    //send response with user data and status OK
    res.status(200).json({ userData });
  } catch (error) {
    throw new Error("Error logging user: " + error.message);
  }
}

async function generateCode(req: Request, res: Response) {
  const { email } = req.body;

  if (!email) {
    res.status(400).send({ message: "email não enviado" });
    return;
  }
  const user = await User.find({ email });
  if (!user) {
    res.status(404).send({ message: "usuário não encontrado" });
    return;
  }

  await sendVerificationCode(email);
  return res.status(200).end();
}

async function validateCode(req: Request, res: Response, next: NextFunction) {
  const { code, email } = req.body;
  const hashedCode = await bcrypt.hash(code, 5);

  const validCode = await Verification.find({
    email,
    verificationCode: hashedCode,
  });

  if (!validCode) {
    res.status(401).send({ message: "código inválido" });
    return;
  }
  next();
}

async function changePassword(req: Request, res: Response) {
  const { email, newPassword } = req.body;

  const hashPassword = await bcrypt.hash(newPassword, 10);

  try {
    await User.findOneAndUpdate(email, { password: hashPassword });
  } catch (error) {
    res
      .status(500)
      .send({ message: "erro ao encontrar usuário e atualiza-lo", error });
  }
  res.status(200).end();
}

async function sendVerificationCode(email: string) {
  const verificationCode = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  const hashedCode = await bcrypt.hash(verificationCode, 5);
  await Verification.create({ email, hashedCode });

  const transporter = nodemailer.createTransport({
    // Configure seu serviço de e-mail aqui (por exemplo, SMTP)
  });

  const mailOptions = {
    from: "seuemail@gmail.com",
    to: email,
    subject: "Código de Verificação",
    text: `Seu código de verificação é: ${verificationCode}`,
  };

  await transporter.sendMail(mailOptions);
}

async function logout(req: Request, res: Response) {
  res.status(200).end();
}

async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newData = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, newData, {
      new: true,
    });

    if (!updatedUser) {
      res.status(404).send({ message: "usuário não encontrado" });
      return;
    }

    const token = jwt.sign(
      { userId: updatedUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: maxAge,
      }
    );

    const userData = {
      id: updatedUser._id,
      name: updatedUser.name,
      age: updatedUser.age,
      email: updatedUser.email,
      phone: updatedUser.phone,
      imageUrl: updatedUser.imageUrl,
      token: token,
    };

    res.status(200).json({ userData });
  } catch (error) {
    throw new Error("Erro ao atualizar usuário: " + error.message);
  }
}

async function getUserImageUrl(req: Request, res: Response) {
  const { id } = req.params;

  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "forneca o id a ser procurado" });
  }
  const user = await User.findById(id);
  if (!user) {
    return;
  }

  const imageUrl = user.imageUrl;

  res.status(200).json({ imageUrl });
}

export { createUser, login, logout, updateUser, getUserImageUrl };
