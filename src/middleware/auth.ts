import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

async function validadeToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    //if token was not provided, return unauthorized
    if (!token) {
      return res.status(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        //if validation fails, return unauthorized
        return res.status(401);
      }
    });

    next();
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
}

export { validadeToken };
