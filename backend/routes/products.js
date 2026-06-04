const router = require("express").Router();
const { authenticate, requireAuth, requireRoles } = require("../middleware/authenticate");
const ctrl = require("../controllers/productController");

router.get("/", ctrl.listProducts);
router.get("/count", ctrl.countProducts);
router.get("/featured", ctrl.featuredProducts);
router.get("/:product_id", ctrl.getProduct);

router.post("/", ...requireRoles("admin", "seller"), ctrl.createProduct);
router.put("/:product_id", ...requireRoles("admin", "seller"), ctrl.updateProduct);
router.delete("/:product_id", ...requireRoles("admin", "seller"), ctrl.deleteProduct);

module.exports = router;
