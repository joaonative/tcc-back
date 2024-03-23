import { Request, Response } from "express";
import Event from "../models/Event";
import User from "../models/User";

async function createEvent(req: Request, res: Response) {
  const {
    name,
    description,
    location,
    date,
    age_range,
    imageUrl,
    participantLimit,
    category,
  } = req.body;
  const { id } = req.headers;

  if (
    !name ||
    !description ||
    !location ||
    !date ||
    !age_range ||
    !imageUrl ||
    !participantLimit ||
    !category
  ) {
    res.status(400).send({ message: "preencha todos os campos" });
    return;
  }

  if (!id) {
    res.status(400).send({ message: "cabeçalho de id de usuário faltando" });
    return;
  }

  const owner = await User.findById(id);

  if (!owner) {
    res.status(404).send({ message: "dono não existe" });
    return;
  }

  const duplicatedEvent = await Event.findOne({ owner: owner.id, name });

  if (duplicatedEvent) {
    res
      .status(400)
      .send({ message: "evento do mesmo criador com nome duplicado" });
    return;
  }

  const event = new Event({
    name,
    description,
    location,
    date,
    age_range,
    imageUrl,
    participantLimit,
    category,
    owner: owner.id,
  });

  await event.save();

  res.status(201).json({ event });
}

export { createEvent };
