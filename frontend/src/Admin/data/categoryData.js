export const categoryData = {
  Fans: {
    subCategories: ["Classic", "Designer", "BLDC", "Antique", "Chandelier"],
    brands: ["Orient", "Crompton", "Atomberg", "Jonshon", "Rally", "Havells", "Ramy", "Sturlight", "Polycab", "Bajaj", "V-Guard"],
    template: "Fans"
  },
  Lighting: {
    subCategories: ["LED Bulbs", "Tube Lights", "Panel Lights", "Flood Lights"],
    brands: ["Philips", "Havells", "Syska", "Wipro", "Orient"],
    template: "Lighting"
  },
  Electricals: {
    subCategories: ["Switches", "Sockets", "MCB", "Wires", "Regulator"],
    brands: ["Anchor", "Havells", "Legrand", "GM", "Polycab"],
    template: "Electricals"
  },
  KitchenAppliances: {
    subCategories: ["Chimney", "Water Purifier", "CookTop", "Hobs", "Mixer Grinder", "Vaccum Cleaner", "Rice Cooker", "Steam Iron", "Iron" ],
    brands: ["Preethi", "Atomberg", "Puriet", "Ao Smith", "Eureka Forbes", "Rally", "Havells", "Bajaj",  "Elica", "Faber", "Pigeon", "Bosch", "Sujata"],
    template: "KitchenAppliances"
  },
  BathroomAppliances: {
    subCategories: [""],
    brands: ["Preethi", "Atomberg", "Puriet", "Ao Smith", "Eureka Forbes", "Rally", "Havells", "Bajaj",  "Elica", "Faber", "Pigeon", "Bosch", "Sujata"],
    template: "BathroomAppliances"
  },
  "Solar Product": {
    subCategories: ["Solar Panel", "Solar Inverter", "Solar Battery"],
    brands: ["Luminous", "Su-Kam", "Exide", "Microtek", "V-Guard"],
    template: "Solar Product"
  },
  "Smart Home": {
    subCategories: ["Smart Switch", "Smart Plug", "Smart Camera"],
    brands: ["Xiaomi", "TP-Link", "Wipro", "Syska", "Havells"],
    template: "Smart Home"
  },
  "Safety & Security": {
    subCategories: ["CCTV", "Door Lock", "Video Door Phone"],
    brands: ["CP Plus", "Hikvision", "Dahua", "Godrej", "Yale"],
    template: "Safety & Security"
  },
  Others: {
    subCategories: ["Accessories", "Spare Parts"],
    brands: ["Generic", "Local", "Premium"],
    template: "Others"
  }
};

// Get template name from category
export const getTemplateForCategory = (category) => {
  return categoryData[category]?.template || "Others";
};