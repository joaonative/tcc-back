import { Schema, Document, model, Model } from "mongoose";

interface Verification {
  email: string;
  verificationCode: string;
}

interface VerificationModel extends Model<VerificationDocument> {}

interface VerificationDocument extends Verification, Document {}

const verificationSchema = new Schema({
  email: { type: String, required: true },
  verificationCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "5m" }, // Define um tempo de expiração para o código (por exemplo, 5 minutos)
});

const Verification = model<VerificationDocument, VerificationModel>(
  "Verification",
  verificationSchema
);

export default Verification;
