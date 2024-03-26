import {Request, Response} from "express";
import User from "../models/User";
import Community from "../models/Community";

async function createCommunity(req: Request, res: Response){
const {
 name,
 description,
 age_range,
 participantCount,
 participantLimit,
 category,

} = req.body;
const {id} = req.headers;

if(
    !name ||
 !description ||
 !age_range ||
 !participantCount ||
 !participantLimit ||
 !category
)
{
    res.status(404).send({message: "preencha os campos"});
    return;
}
/* if (age_range<1 && age_range>100){
    res.status(400).send({message: "não brinque com sua idade"}) //nao sabia oque colocar e nem se tava certo, depois altere , a idade minima tb se quiser alterar

}

const participantLimit = await Community.findById(id); no caso ele veria o id do limite 
const participantCount = await Community.findById(id); buscaria o id das pessoas na comunidade
if (participantCount>participantLimit){
    res.send({"a comunidade lotou"})
} e nao sei como travaria a entrada de participantes, porem acho que seria bom colocar
*/

const ownerCommunity = await User.findById(id);

if (!ownerCommunity) {
  res.status(404).send({ message: "dono não existe" });
  return;
}

const duplicatedCommunity = await Community.findOne({ ownerCommunity: ownerCommunity.id, name });

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
 participantLimit,
 category,
 owner: ownerCommunity.id,
});

await community.save();
res.status(201).json({community});
};

async function getCommunity(req: Request, res: Response) {
    const communitys = await Community.find();
    if (!communitys) {
      res.status(404).send({ message: "comunidades nâo encontrados" });
      return;
    }
  
    res.status(200).json({ communitys });
  
  


   
  }
  
  


export {createCommunity, getCommunity};
