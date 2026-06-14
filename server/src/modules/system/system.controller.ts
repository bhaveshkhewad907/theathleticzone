import { Request, Response } from "express";

export const runSessionLifecycle = async (req: Request, res: Response) => {
  const systemKey = req.headers["x-system-key"];

  if (systemKey !== process.env.INTERNAL_SYSTEM_KEY) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized Trigger" });
  }

  // Deprecated: Session lifecycle job removed in architectural purge.
  // Returning 200 OK so existing external triggers don't fail loudly.
  res.status(200).json({
    success: true,
    message: "System online. Legacy lifecycle ignored.",
  });
};
