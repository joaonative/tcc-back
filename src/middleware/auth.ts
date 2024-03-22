import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

async function validadeToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { jwt: token } = req.cookies;

    //if token was not provided, return unauthorized
    if (!token) {
      res.status(400).send({ message: "token não fornecido" });
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        //if validation fails, return unauthorized
        res
          .status(401)
          .send({ message: "validação falhou, por favor se autentique" });
        return;
      }
    });

    next();
  } catch (error) {
    throw new Error("Error validating token: " + error.message);
  }
}

export { validadeToken };
