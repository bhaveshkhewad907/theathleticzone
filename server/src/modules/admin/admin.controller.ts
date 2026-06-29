import { Request, Response, NextFunction, RequestHandler } from "express";
import { getAdminDashboard } from "./adminDashboard.service";
import User from "../../modules/user/user.model";
import Assessment from "../../modules/assessment/assessment.model";

export const dashboard: RequestHandler = async (_req, res, next) => {
  try {
    const data = await getAdminDashboard();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 🚀 UPDATED: Implemented Server-Side Pagination & Search
export const getAthletesRoster: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Get pagination parameters from the query string (defaults to page 1, 10 items)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // 2. Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // 3. Search logic (if a search term is provided)
    const searchTerm = (req.query.search as string) || "";
    const searchFilter = searchTerm
      ? {
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
            { email: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};

    // 4. Combine role filter with search filter
    const query = { role: "ATHLETE", ...searchFilter };

    // 5. Execute both queries in parallel for maximum performance
    const [athletes, totalAthletes] = await Promise.all([
      User.find(query)
        .select("name email profileImage platformState createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: athletes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAthletes / limit),
        totalItems: totalAthletes,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🚀 UPDATED: Fetch Assessment History Array
export const getAthleteAssessmentForAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    // Fetch ALL assessments for this athlete, sorted by newest first
    const assessments = await Assessment.find({ userId: id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: assessments, // This is now returning the full Array []
    });
  } catch (error) {
    next(error);
  }
};
