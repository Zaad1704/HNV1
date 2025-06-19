import { Router } from "express";

const router = Router();

// Simple IP-based or default language detection (customize as needed)
router.get('/detect', (req, res) => {
  // For now, always return 'en' as the default language
  res.json({ language: "en" });
});

export default router;
