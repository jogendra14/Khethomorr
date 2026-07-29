import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
  {
    image: { type: String, required: true,},
    brand: { type: String, required: true,},
    price: { type: Number, required: true },
    title: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;
