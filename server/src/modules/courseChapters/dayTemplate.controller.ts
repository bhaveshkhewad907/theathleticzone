import { RequestHandler } from "express";
import DayTemplate from "./dayTemplate.model";

// POST: Create a new reusable day template
export const createTemplate: RequestHandler = async (req, res, next) => {
  try {
    const { name, description, steps } = req.body;

    const template = await DayTemplate.create({
      name,
      description,
      steps, // Array of Step ObjectIds
    });

    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

// GET: Fetch all templates (with populated steps)
export const getTemplates: RequestHandler = async (req, res, next) => {
  try {
    const templates = await DayTemplate.find()
      .populate("steps")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};
