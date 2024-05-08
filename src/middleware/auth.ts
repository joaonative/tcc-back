import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

async function validadeToken(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers["authorization"];

    if (!auth) {
      res.status(400).send({ message: "Token não fornecido" });
      return;
    }

    const [, token] = auth.split(" ");

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        res
          .status(401)
          .send({ message: "validação falhou, por favor se autentique" });
        return;
      }

      next();
    });
  } catch (error) {
    throw new Error("Error validating token: " + error.message);
  }
}

export { validadeToken };
