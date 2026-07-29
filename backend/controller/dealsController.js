import Deal from "../models/Deal.js";
import cloudinary from "../config/cloudinary.js";

const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({});
    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

const getDealsById = async (req, res) => {
  try {
    const deals = await Deal.findById(req.params.id);
    if (deals) {
      res.json(deals);
    } else {
      res.status(404).json({ message: "Deal not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

const createDeals = async (req, res) => {
  try {
    const { title, price, brand,  } = req.body;
    let image="";

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path);
    image = result.secure_url;
}
    const deal = new Deal({
      title,
      price,
      brand,
      image,
    });
    const createdDeal = await deal.save();
    res.status(201).json(createdDeal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeals = async (req, res) => {
  try {
    const { title, price, brand } = req.body;
    const deal = await Deal.findById(req.params.id);
    if (deal) {
      deal.title = title || deal.title;
      deal.price = price || deal.price;
      deal.brand = brand || deal.brand;
      
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        deal.image = result.secure_url;
      }

      const updatedDeal = await deal.save();
      res.json(updatedDeal);
    } else {
      res.status(404).json({ message: "Deal not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDeals = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (deal) {
      await deal.deleteOne();
      res.json({ message: "Deal removed" });
    } else {
      res.status(404).json({ message: "Deal not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getDeals, getDealsById, createDeals, updateDeals, deleteDeals };
