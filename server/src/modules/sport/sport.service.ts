import Sport from "./sport.model";
import ApiError from "../../utils/apiError";

// 🛡️ THE FIX: Accept the full object including description and imageUrl
export const createSport = async (data: {
  name: string;
  description: string;
  imageUrl: string;
}) => {
  const existing = await Sport.findOne({ name: data.name });

  if (existing) {
    throw new ApiError(400, "Sector already exists");
  }

  // Pass the entire data object to Mongoose
  const sport = await Sport.create(data);
  return sport;
};

// 🛡️ Public View: Only returns active sectors for Athletes
export const getAllSports = async () => {
  return Sport.find({ isActive: true }).sort({ createdAt: -1 });
};

// 🛡️ Admin View: Returns EVERYTHING
export const getAllSportsAdmin = async () => {
  return Sport.find().sort({ createdAt: -1 });
};

// 🛡️ Toggle Logic
export const toggleSportStatus = async (id: string) => {
  const sport = await Sport.findById(id);

  if (!sport) {
    throw new ApiError(404, "Sector not found");
  }

  sport.isActive = !sport.isActive;
  await sport.save();

  return sport;
};
