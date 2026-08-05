// backend/controllers/siteController.js
import SiteSettings from "../models/SiteSettings.js";

const publicSettings = (settings) => ({
  websiteName: settings?.websiteName || "Khethomorr",
  websiteUrl: settings?.websiteUrl || "",
  phone: settings?.phone || "",
  address: settings?.address || "",
  facebook: settings?.facebook || "",
  instagram: settings?.instagram || "",
  twitter: settings?.twitter || "",
  announcement: settings?.announcement || "",
  businessHours: settings?.businessHours || "Mon - Sat: 9:00 AM - 8:00 PM",
});

const getPublicSiteSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne().lean();
    res.json(publicSettings(settings));
  } catch (error) {
    res.status(500).json({ message: "Unable to load website settings" });
  }
};

export { getPublicSiteSettings };