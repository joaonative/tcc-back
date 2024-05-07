import { Schema, model } from "mongoose";

const communitySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    age_range: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    participantCount: { type: Number },
    participantLimit: { type: Number, required: true },
    participants: [{ type: String }],
    owner: { type: String, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

const Community = model("Community", communitySchema);
export default Community;
