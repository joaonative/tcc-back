import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./routes/User";
import eventsRoutes from "./routes/Events";
import communitiesRoutes from "./routes/Community";

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
server.use("/events", eventsRoutes);
server.use("/communities", communitiesRoutes);

server.listen(process.env.PORT, () => {
  console.log(`running on port: ${process.env.PORT}`);
});

export default server;
