const router = require("express").Router();
const { authenticate, requireAuth } = require("../middleware/authenticate");
const ctrl = require("../controllers/orderController");

router.use(authenticate, requireAuth);

router.post("/checkout", ctrl.checkout);
router.get("/", ctrl.listMyOrders);
router.get("/:order_id", ctrl.getOrder);
router.post("/:order_id/cancel", ctrl.cancelOrder);

module.exports = router;
