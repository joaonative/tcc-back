import { Schema, model } from "mongoose";

const eventSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    age_range: { type: Number, required: true },
    participantCount: { type: Number, required: true },
    participantLimit: { type: Number, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

const Event = model("Event", eventSchema);
export default Event;
