import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/User";
import { validadeToken } from "./middleware/auth";

const server = express();
server.use(
  cors({
    origin: "http://localhost:5173", // Permitir solicitações do front-end em localhost:5173
    credentials: true, // Permitir o envio de cookies
  })
);
server.use(cookieParser());
server.use(express.json());

mongoose.connect(process.env.MONGO_URL);

server.use("/users", userRoutes);

server.use("/protected", validadeToken, (req: Request, res: Response) => {
  res.send("this is an protected route");
});

server.listen(process.env.PORT, () => {
  console.log(`running on port: ${process.env.PORT}`);
});

export default server;
