const router = require("express").Router({ mergeParams: true });
const { authenticate, requireAuth } = require("../middleware/authenticate");
const ctrl = require("../controllers/reviewController");

router.get("/", ctrl.listReviews);
router.post("/", authenticate, requireAuth, ctrl.createReview);
router.delete("/:review_id", authenticate, requireAuth, ctrl.deleteReview);

module.exports = router;
