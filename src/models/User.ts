import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true },
    adm: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
