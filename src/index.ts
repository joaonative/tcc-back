import express from "express";

import userRoutes from "./routes/User";

const server = express();
server.use(express.json());

server.use("/users", userRoutes);

server.listen(process.env.PORT, () => {
  console.log(`running on port: ${process.env.PORT}`);
});
