const router = require("express").Router();
const { authenticate, requireAuth } = require("../middleware/authenticate");
const ctrl = require("../controllers/cartController");

router.use(authenticate, requireAuth);

router.get("/", ctrl.getCart);
router.post("/items", ctrl.addItem);
router.put("/items/:product_id", ctrl.updateItem);
router.delete("/items/:product_id", ctrl.removeItem);
router.delete("/", ctrl.clearCart);

module.exports = router;
