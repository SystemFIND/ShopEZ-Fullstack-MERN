const router = require("express").Router();
const { authenticate, requireAuth } = require("../middleware/authenticate");
const ctrl = require("../controllers/userController");

router.put("/me", authenticate, requireAuth, ctrl.updateMe);

module.exports = router;
