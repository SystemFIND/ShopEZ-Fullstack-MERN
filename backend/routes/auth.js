const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { authenticate, requireAuth } = require("../middleware/authenticate");
const ctrl = require("../controllers/authController");

router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("name").notEmpty().withMessage("Name required"),
  ],
  validate,
  ctrl.register
);

router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  validate,
  ctrl.login
);

router.post("/logout", ctrl.logout);

router.get("/me", authenticate, requireAuth, ctrl.me);

router.post("/refresh", ctrl.refresh);

router.post(
  "/forgot-password",
  [body("email").isEmail()],
  validate,
  ctrl.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty(),
    body("new_password").isLength({ min: 6 }),
  ],
  validate,
  ctrl.resetPassword
);

module.exports = router;
