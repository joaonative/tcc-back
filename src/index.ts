import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/User";

const server = express();
server.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      "https://iparque.vercel.app",
    ],
    credentials: true,
  })
);

server.use(express.json());

mongoose.connect(process.env.MONGO_URL);

server.use("/users", userRoutes);

server.listen(process.env.PORT, () => {
  console.log(`running on port: ${process.env.PORT}`);
});

export default server;
