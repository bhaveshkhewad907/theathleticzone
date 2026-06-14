import { Request, Response, NextFunction } from "express";
import { Step, Template, CoursePlan } from "./courseArchitect.model";

// ==============================
// CONTENT VAULT (STEPS)
// ==============================
export const createStep = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const step = await Step.create(req.body);
    res.status(201).json({ success: true, data: step });
  } catch (error) {
    next(error);
  }
};

export const getSteps = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const steps = await Step.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    next(error);
  }
};

export const updateStep = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const step = await Step.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, data: step });
  } catch (error) {
    next(error);
  }
};

// ==============================
// PROTOCOL BUILDER (TEMPLATES)
// ==============================
export const createTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

export const getTemplates = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const templates = await Template.find()
      .populate("steps")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

// ==============================
// COURSE ARCHITECT (PLANS)
// ==============================
export const saveCoursePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, days } = req.body;
    const plan = await CoursePlan.findOneAndUpdate(
      { courseId },
      { courseId, days },
      { new: true, upsert: true }, // Creates it if it doesn't exist, updates if it does
    );
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const getCoursePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plan = await CoursePlan.findOne({
      courseId: req.params.courseId,
    }).populate("days.templateId");

    // We explicitly return null if no plan is found so the frontend knows to show an empty canvas
    res.status(200).json({ success: true, data: plan || null });
  } catch (error) {
    next(error);
  }
};
