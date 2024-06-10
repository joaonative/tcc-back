import { request, Request, Response } from "express";
import mongoose, { now } from "mongoose";
import Event from "../models/Event";
import User from "../models/User";
import Community from "../models/Community";

async function createEvent(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      location,
      date,
      age_range,
      imageUrl,
      mapUrl,
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
      !mapUrl ||
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
      mapUrl,
      participantLimit,
      participantCount,
      participants,
      category,
      owner: owner.id,
    });

    if (event.date < date) {
      return res
        .status(400)
        .send({ message: "a data do evento precisa ser válida" });
    }

    await event.save();

    res.status(201).json({ event });
  } catch (error) {
    console.log(" erro ao criar evento", error);
  }
}

async function createEventByCommunity(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      location,
      date,
      age_range,
      imageUrl,
      mapUrl,
      participantLimit,
      category,
      communityId,
    } = req.body;
    const { id } = req.headers;

    if (
      !name ||
      !description ||
      !location ||
      !date ||
      !age_range ||
      !imageUrl ||
      !mapUrl ||
      !participantLimit ||
      !category ||
      !communityId
    ) {
      res.status(400).send({ message: "preencha todos os campos" });
      return;
    }
    if (!id) {
      res.status(400).send({ message: "cabeçalho de id de usuário faltando" });
      return;
    }

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(communityId)
    ) {
      return res.status(400).send({
        message: "formato de id de usuário ou id de comunidade inválido",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).send({ message: "dono não existe" });
      return;
    }

    const community = await Community.findById(communityId);

    if (!community) {
      res.status(404).send({ message: "comunidade não existe" });
      return;
    }

    const duplicatedEvent = await Event.findOne({ owner: communityId, name });

    if (duplicatedEvent) {
      res
        .status(400)
        .send({ message: "evento da mesma comunidade com nome duplicado" });
      return;
    }

    const participantCount = 1;
    const participants = [user.id];

    const event = new Event({
      name,
      description,
      location,
      date,
      age_range,
      imageUrl,
      mapUrl,
      participantLimit,
      participantCount,
      participants,
      category,
      owner: user.id,
      community: community._id,
    });

    if (event.date < date) {
      return res
        .status(400)
        .send({ message: "a data do evento precisa ser válida" });
    }

    await event.save();

    return res.status(201).json({ event });
  } catch (error) {}
}

async function getEventByCommunity(req: Request, res: Response) {
  try {
    const { communityId } = req.params;
    if (!communityId) {
      return;
    }
    const events = await Event.find({
      community: communityId,
      isExpired: false,
    }).sort({ createdAt: -1 });
    if (!events) {
      return res
        .status(404)
        .send({ message: "eventos deste criador não encontrados" });
    }

    events.map(async (event) => {
      if (event.date < now()) {
        event.isExpired = true;
        await event.save();
      }
    });

    return res.status(200).json({ events });
  } catch (error) {
    console.log("Erro ao pegar evento por dono", error);
  }
}

async function deleteEvent(req: Request, res: Response) {
  try {
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
    return res.status(204).end();
  } catch (error) {
    console.log(" Erro ao deletar evento", error);
  }
}

async function getEventsByOwner(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) {
      return;
    }
    const events = await Event.find({ owner: id, isExpired: false });
    if (!events) {
      return res
        .status(404)
        .send({ message: "eventos deste criador não encontrados" });
    }

    events.map(async (event) => {
      if (event.date < now()) {
        event.isExpired = true;
        await event.save();
      }
    });

    return res.status(200).json({ events });
  } catch (error) {
    console.log("Erro ao pegar evento por dono", error);
  }
}

async function getEvents(req: Request, res: Response) {
  try {
    const page = +req.query.page || 0;
    const limit = 9;
    if (isNaN(page) || page < 0) {
      return res
        .status(400)
        .send({ message: "a paginação tem que ser um valor numérico" });
    }
    const skip = page * limit;
    const totalEvents = await Event.countDocuments({ isExpired: false });
    const totalPages = Math.ceil(totalEvents / limit);
    const events = await Event.find({ isExpired: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (!events) {
      return res.status(404).send({ message: "evento nâo encontrados" });
    }

    events.map(async (event) => {
      if (event.date < now()) {
        event.isExpired = true;
        await event.save();
      }
    });

    return res.status(200).json({ events, totalPages });
  } catch (error) {
    console.log("Erro ao pegar eventos", error);
  }
}

async function getEventById(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return res
        .status(400)
        .send({ message: "faltando parâmetros de id do evento" });
    }

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).send({ message: "formato de id inválido" });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).send({ message: "evento não encontrado" });
    }

    const participants = [];

    const owner = await User.findById(event.owner);
    const community = await Community.findById(event.owner);

    if (!owner && !community) {
      return res.status(404).send({ message: "criador não encontrado" });
    }

    for (const participant of event.participants) {
      const user = await User.findById(participant);
      if (user) {
        participants.push({
          id: user.id,
          name: user.name,
          imageUrl: user.imageUrl,
        });
      }
    }

    return res.status(200).json({
      event,
      participants,
      owner: community ? `Comunidade ${community.name}` : owner.name,
    });
  } catch (error) {
    console.log("Erro ao pegar evento por id", error);
  }
}

async function getEventsIsParticipanting(req: Request, res: Response) {
  try {
    const { id } = req.headers;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "formato de id inválido" });
    }

    const events = await Event.find({
      participants: { $elemMatch: { $eq: id } },
    });

    return res.status(200).json({ events });
  } catch (error) {
    console.log("Erro ao mostrar eventos que está participando", error);
  }
}

async function joinEvent(req: Request, res: Response) {
  try {
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

    if (event.age_range > user.age) {
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
    return res.status(200).json({ event });
  } catch (error) {
    console.log("Erro ao entrar no evento", error);
  }
}

async function leaveEvent(req: Request, res: Response) {
  try {
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

    return res.status(200).json({ event });
  } catch (error) {
    console.log("Erro ao sair do evento", error);
  }
}

async function searchEventsByName(req: Request, res: Response) {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res
        .status(400)
        .send({ message: "Por favor, forneça um termo de pesquisa" });
    }

    const events = await Event.find({
      name: { $regex: new RegExp(`.*${searchTerm}.*`, "i") },
    }).sort({ createdAt: -1 });

    return res.status(200).json({ events });
  } catch (error) {
    console.log("Erro ao buscar eventos por nome", error);
    return res.status(500).send({ message: "Erro interno do servidor" });
  }
}

export {
  createEvent,
  createEventByCommunity,
  getEventByCommunity,
  getEvents,
  getEventById,
  joinEvent,
  leaveEvent,
  deleteEvent,
  getEventsByOwner,
  getEventsIsParticipanting,
  searchEventsByName,
};
