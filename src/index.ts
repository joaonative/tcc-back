import express, { Request, Response } from "express";
import mongoose from "mongoose";

import userRoutes from "./routes/User";

const server = express();
server.use(express.json());

mongoose.connect(process.env.MONGO_URL);

server.use("/users", userRoutes);

server.listen(process.env.PORT, () => {
  console.log(`running on port: ${process.env.PORT}`);
});
