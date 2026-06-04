const router = require("express").Router();
const { requireRoles } = require("../middleware/authenticate");
const ctrl = require("../controllers/adminController");

// Stats & orders — admin or seller
router.get("/stats", ...requireRoles("admin", "seller"), ctrl.stats);
router.get("/orders", ...requireRoles("admin", "seller"), ctrl.listAllOrders);
router.put("/orders/:order_id/status", ...requireRoles("admin", "seller"), ctrl.updateOrderStatus);

// User management — admin only
router.get("/users", ...requireRoles("admin"), ctrl.listUsers);
router.put("/users/:user_id/role", ...requireRoles("admin"), ctrl.updateUserRole);
router.delete("/users/:user_id", ...requireRoles("admin"), ctrl.deleteUser);

module.exports = router;
