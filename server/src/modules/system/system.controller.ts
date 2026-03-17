import { Request, Response } from "express";
import { processSessionLifecycle } from "../../jobs/sessionCompletion.job";

export const runSessionLifecycle = async (req: Request, res: Response) => {
  const systemKey = req.headers["x-system-key"];

  if (systemKey !== process.env.INTERNAL_SYSTEM_KEY) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized Trigger" });
  }

  try {
    const results = await processSessionLifecycle(); // We'll refactor your job to export this
    res.status(200).json({ success: true, processed: results });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Internal processing failure" });
  }
};
