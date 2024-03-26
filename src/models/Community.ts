import { Schema, model } from "mongoose";

const communitySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    age_range: { type: Number, required: true },
    participantCount: { type: Number, required: true },
    participantLimit: { type: Number, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

const Community = model("Community", communitySchema);
export default Community;
