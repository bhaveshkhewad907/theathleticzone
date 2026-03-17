import { Router } from "express";
import { runSessionLifecycle } from "./system.controller";

const router = Router();

// This route is protected by a secret API key in the headers
router.post("/trigger-session-completion", runSessionLifecycle);

export default router;
