const router = require("express").Router();
const { requireRoles } = require("../middleware/authenticate");
const ctrl = require("../controllers/categoryController");

router.get("/", ctrl.listCategories);
router.post("/", ...requireRoles("admin"), ctrl.createCategory);
router.put("/:category_id", ...requireRoles("admin"), ctrl.updateCategory);
router.delete("/:category_id", ...requireRoles("admin"), ctrl.deleteCategory);

module.exports = router;
