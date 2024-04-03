import { request, Request, Response } from "express";
import mongoose, { now } from "mongoose";
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

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send({ message: "formato de id inválido" });
  }

  const owner = await User.findById(id);

  if (!owner) {
    res.status(404).send({ message: "dono não existe" });
    return;
  }

  const duplicatedEvent = await Event.findOne({ owner: owner._id, name });

  if (duplicatedEvent) {
    res
      .status(400)
      .send({ message: "evento do mesmo criador com nome duplicado" });
    return;
  }

  const participantCount = 1;
  const participants = [owner.id];

  const event = new Event({
    name,
    description,
    location,
    date,
    age_range,
    imageUrl,
    participantLimit,
    participantCount,
    participants,
    category,
    owner: owner.id,
  });

  if (event.date < now()) {
    return res
      .status(400)
      .send({ message: "a data do evento precisa ser válida" });
  }

  await event.save();

  res.status(201).json({ event });
}

async function deleteEvent(req: Request, res: Response) {
  const { id } = req.headers;
  const { id: eventId } = req.params;

  if (!id || !eventId) {
    return res
      .status(400)
      .send({ message: "faltando parâmetros ou cabeçalho" });
  }

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(eventId)) {
    return res.status(400).send({ message: "formato de id inválido" });
  }

  const trashEvent = await Event.findById(eventId);

  if (!trashEvent) {
    return res.status(404).send({ message: "evento não encontrado" });
  }

  const trashUser = await User.findById(id);

  if (!trashUser) {
    return res.status(404).send({ message: "usuário não encontrado" });
  }

  if (trashUser.id !== trashEvent.owner) {
    console.log(trashUser._id, trashEvent.owner);
    return res
      .status(401)
      .send({ message: "você não está autorizado a deletar" });
  }
  await trashEvent.deleteOne();
  res.status(204).end();
}

async function getEvents(req: Request, res: Response) {
  const events = await Event.find({ isExpired: false });
  const page = req.query.page || 0;
  const limit = 9;
  if (typeof page !== "number") {
    res
      .status(400)
      .send({ message: "a paginação tem que ser um valor numérico" });
    return;
  }
  const skip = (page - 1) * limit;
  const communities = await Event.find().skip(skip).limit(limit);

  if (!events) {
    return res.status(404).send({ message: "evento nâo encontrados" });
  }

  events.map(async (event) => {
    if (event.date < now()) {
      event.isExpired = true;
      await event.save();
    }
  });

  res.status(200).json({ events });
}

async function getEventById(req: Request, res: Response) {
  const { eventId } = req.params;

  if (!eventId) {
    return res
      .status(400)
      .send({ message: "faltando parâmetros de id do evento" });
  }

  const event = await Event.findById(eventId);

  if (!event) {
    return res.status(404).send({ message: "evento não envontrado" });
  }

  res.status(200).json({ event });
}

async function joinEvent(req: Request, res: Response) {
  const { id } = req.headers;
  const { eventId } = req.params;

  if (!id || !eventId) {
    return res
      .status(400)
      .send({ message: "faltando parâmetros ou cabeçalho" });
  }

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(eventId)) {
    return res.status(400).send({ message: "formato de id inválido" });
  }

  const event = await Event.findById(eventId);
  const user = await User.findById(id);

  if (!event) {
    return res.status(404).send({ message: "evento não encontrado" });
  }

  if (event.participantCount === event.participantLimit) {
    return res.status(400).send({ message: "evento lotado" });
  }

  if (event.participants.includes(user.id)) {
    return res.status(400).send({ message: "você já está participando" });
  }

  if (event.age_range >= user.age) {
    return res.status(400).send({
      message: "você não tem idade mínima para participar deste evento",
    });
  }

  if (event.isExpired) {
    return res.status(400).send({ message: "evento expirado" });
  }

  event.participants.push(user.id);
  event.participantCount += 1;
  await event.save();
  res.status(200).json({ event });
}

async function leaveEvent(req: Request, res: Response) {
  const { id } = req.headers;
  const { eventId } = req.params;

  if (!id || !eventId) {
    return res
      .status(400)
      .send({ message: "faltando parâmetros ou cabeçalho" });
  }

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(eventId)) {
    return res.status(400).send({ message: "formato de id inválido" });
  }

  const event = await Event.findById(eventId);
  const user = await User.findById(id);

  if (!event) {
    return res.status(404).send({ message: "evento não encontrado" });
  }

  if (!user) {
    return res.status(404).send({ message: "usuário não encontrado" });
  }
  if (!event.participants.includes(user.id)) {
    return res
      .status(400)
      .send({ message: "você não está participando deste evento" });
  }

  const index = event.participants.indexOf(user.id);
  event.participants.splice(index, 1);
  event.participantCount -= 1;
  await event.save();

  res.status(200).json({ event });
}

export {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  leaveEvent,
  deleteEvent,
};
