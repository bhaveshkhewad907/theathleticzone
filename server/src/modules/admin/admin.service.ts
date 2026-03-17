import User from "../user/user.model";
import Sport from "../sport/sport.model";

export const getAllCoaches = async () => {
  return User.find({ role: "COACH" })
    .select("name email sport profileImage")
    .populate("sport", "name")
    .lean();
};

export const getAllSports = async () => {
  return Sport.find().select("name").lean();
};
