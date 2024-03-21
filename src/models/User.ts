import { Schema, Document, model, Model } from "mongoose";
import bcrypt from "bcrypt";

interface User {
  name: string;
  age?: number;
  email: string;
  password: string;
  phone?: string;
  adm: boolean;
}

interface UserModel extends Model<UserDocument> {
  login(password: string, user: User): Promise<UserDocument>;
}

interface UserDocument extends User, Document {}

const userSchema = new Schema<UserDocument, UserModel>(
  {
    name: { type: String, required: true },
    age: { type: Number },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, unique: true },
    adm: { type: Boolean, default: false },
  },
  {
    statics: {
      async login(password: string, user: User) {
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return false;
        }
        return user;
      },
    },
  }
);

const User = model<UserDocument, UserModel>("User", userSchema);

export default User;
