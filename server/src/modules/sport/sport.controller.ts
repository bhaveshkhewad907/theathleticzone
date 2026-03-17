import { Request, Response, NextFunction } from "express";
import { createSportSchema } from "./sport.validation";
import {
  createSport,
  getAllSports,
  getAllSportsAdmin,
  toggleSportStatus,
} from "./sport.service";
import ApiError from "../../utils/apiError";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createSportSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    // 🛡️ THE FIX: Extract the new fields and pass them to the service
    const { name, description, imageUrl } = parsed.data;

    // Pass them as an object to your service layer
    const sport = await createSport({ name, description, imageUrl });

    res.status(201).json({ success: true, data: sport });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sports = await getAllSports();
    res.status(200).json({ success: true, data: sports });
  } catch (error) {
    next(error);
  }
};

export const getAdminAll = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sports = await getAllSportsAdmin();
    res.status(200).json({ success: true, data: sports });
  } catch (error) {
    next(error);
  }
};

export const toggleStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sport = await toggleSportStatus(req.params.id as string);
    res.status(200).json({ success: true, data: sport });
  } catch (error) {
    next(error);
  }
};
