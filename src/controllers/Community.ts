import { request, Request, Response } from "express";
import mongoose from "mongoose";
import Community from "../models/Community";
import User from "../models/User";

async function createCommunity(req: Request, res: Response) {
  const { name, description, age_range, participantCount, category } = req.body;
  const { id } = req.headers;

  if (!name || !description || !age_range || !participantCount || !category) {
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

  const duplicatedCommunity = await Community.findOne({
    owner: owner.id,
    name,
  });

  if (duplicatedCommunity) {
    res
      .status(400)
      .send({ message: "comunidade do mesmo criador com nome duplicado" });
    return;
  }

  const community = new Community({
    name,
    description,
    age_range,
    participantCount,
    category,
    owner: owner.id,
  });

  await community.save();

  res.status(201).json({ community });
}

async function deleteCommunity(req: Request, res: Response) {
  const { id } = req.headers;
  const { id: communityId } = req.params;

  if (!id || !communityId) {
    return res
      .status(400)
      .send({ message: "faltando parâmetros ou cabeçalho" });
  }

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(communityId)) {
    return res.status(400).send({ message: "formato de id inválido" });
  }
  const trashCommunity = await Community.findById(communityId);

  if (!trashCommunity) {
    return res.status(404).send({ message: "comunidade não encontrada" });
  }

  const trashUser = await User.findById(id);

  if (!trashUser) {
    return res.status(404).send({ message: "usuário não encontrado" });
  }

  if (trashUser.id !== trashCommunity.owner) {
    console.log(trashUser._id, trashCommunity.owner);
    return res
      .status(401)
      .send({ message: "você não está autorizado a deletar" });
  }
  await trashCommunity.deleteOne();
  res.status(204).end();
}

async function getCommunity(req: Request, res: Response) {
  const page = +req.query.page || 0;
  const limit = 9;
  if (isNaN(page) || page < 0) {
    res
      .status(400)
      .send({ message: "a paginação tem que ser um valor numérico" });
    return;
  }
  const skip = page * limit;
  const totalCommunities = await Community.countDocuments();
  const totalPages = Math.ceil(totalCommunities / limit);
  const communities = await Community.find().skip(skip).limit(limit);

  if (!communities) {
    return res.status(404).send({ message: "comunidades não encontradas" });
  }

  res.status(200).json({ communities });
}

async function joinCommunity(req: Request, res: Response) {
  const { id } = req.headers;
  const { id: communityId } = req.params;

  if (!id || !communityId) {
    return res
      .status(400)
      .send({ message: "faltando parâmetros ou cabeçalho" });
  }

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(communityId)) {
    return res.status(400).send({ message: "formato de id inválido" });
  }

  const community = await Community.findById(communityId);
  const user = await User.findById(id);

  if (!community) {
    return res.status(404).send({ message: "comunidade nao encontrado" });
  }

  if (community.participants.includes(user.id)) {
    return res.status(400).send({ message: "você já está participando" });
  }

  community.participants.push(user.id);
  community.participantCount += 1;
  await community.save();
  res.status(200).json({ community });
}

async function leaveCommunity(req: Request, res: Response) {
  const { id } = req.headers;
  const { communityId } = req.params;

  if (!id || !communityId) {
    return res
      .status(400)
      .send({ message: "faltando parâmetros ou cabeçalho" });
  }

  if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(communityId)) {
    return res.status(400).send({ message: "formato de id inválido" });
  }

  const community = await Community.findById(communityId);
  const user = await User.findById(id);

  if (!community) {
    return res.status(404).send({ message: "comunidade não encontrado" });
  }

  if (!user) {
    return res.status(404).send({ message: "usuário não encontrado" });
  }
  if (!community.participants.includes(user.id)) {
    return res
      .status(400)
      .send({ message: "você não está participando desta comunidade" });
  }

  const index = community.participants.indexOf(user.id);
  community.participants.splice(index, 1);
  community.participantCount -= 1;
  await community.save();

  res.status(200).json({ community });
}

export {
  createCommunity,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
};
