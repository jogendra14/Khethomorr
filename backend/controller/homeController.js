import homeContent from "../data/homeContent.js";
import HomeContent from "../models/HomeContent.js";

const getHomeContent = async (req, res) => {
  try {
    const savedContent = await HomeContent.findOne().lean();
    res.json(savedContent || homeContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHomeContent = async (req, res) => {
  try {
    const { heroSlides, features, services, trustFeatures } = req.body;
    const updatedContent = await HomeContent.findOneAndUpdate(
      {},
      { heroSlides, features, services, trustFeatures },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    res.json(updatedContent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getHomeContent, updateHomeContent };
