import { Router } from "express";
import { addServices, createExpenses, getAllServices, getEmployees, getExpenses, getMonthlyProfit, getServicesForEachStaffForToday, login, signup } from "../controller/userController.js";
import { authMiddleware } from "../Middleware/auth.middleware.js";

const router = Router();

router.get("/employees",getEmployees)
router.get("/services",authMiddleware,getServicesForEachStaffForToday)
router.get("/all-services",authMiddleware,getAllServices)
router.get("/all-expenses",authMiddleware,getExpenses)
router.get("/profit",authMiddleware,getMonthlyProfit)


router.post("/signup", signup);
router.post("/login", login);
router.post("/services",authMiddleware, addServices);
router.post("/expenses",authMiddleware, createExpenses);

export default router;
