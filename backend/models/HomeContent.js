import mongoose from "mongoose";

const contentItemSchema = new mongoose.Schema(
  {
    imageKey: String,
    iconKey: String,
    title: { type: String, required: true },
    highlight: String,
    description: String,
    subtitle: String,
  },
  { _id: false },
);

const homeContentSchema = new mongoose.Schema(
  {
    heroSlides: { type: [contentItemSchema], default: [] },
    features: { type: [contentItemSchema], default: [] },
    services: { type: [contentItemSchema], default: [] },
    trustFeatures: { type: [contentItemSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model("HomeContent", homeContentSchema);
