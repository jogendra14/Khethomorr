import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    websiteName: { type: String, trim: true, default: "Khethomorr" },
    websiteUrl: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    announcement: { type: String, trim: true, default: "" },
    businessHours: { type: String, trim: true, default: "Mon - Sat: 9:00 AM - 8:00 PM" },
  },
  { timestamps: true },
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
