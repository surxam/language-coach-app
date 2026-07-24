const express = require("express");
const multer = require("multer");
const {
  startConversation,
  respond,
  endConversation,
  listConversations,
  getConversation,
  deleteConversation,
} = require("../controllers/conversation.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const router = express.Router();

router.use(requireAuth);

router.get("/", listConversations);
router.post("/", startConversation);
router.get("/:id", getConversation);
router.post("/:id/respond", upload.single("audio"), respond);
router.patch("/:id/end", endConversation);
router.delete("/:id", deleteConversation);


module.exports = router;
