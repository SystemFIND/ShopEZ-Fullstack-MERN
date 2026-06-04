const router = require("express").Router();
const { authenticate, requireAuth } = require("../middleware/authenticate");
const ctrl = require("../controllers/wishlistController");

router.use(authenticate, requireAuth);

router.get("/", ctrl.getWishlist);
router.post("/:product_id", ctrl.addToWishlist);
router.delete("/:product_id", ctrl.removeFromWishlist);

module.exports = router;
