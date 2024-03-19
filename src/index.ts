import express from "express";

const server = express();

server.listen(process.env.PORT, () => {
  console.log(`running on port: ${process.env.PORT}`);
});
