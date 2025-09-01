import { Router } from "express";
import { addServices, changeStatusOfStaff, createExpenses, getAllServices, getEmployees, getExpenses, getGraphResult, getMonthlyProfit, getServicesForEachStaffForToday, getWaterDetails, login, pourWater, signup } from "../controller/userController.js";
import { authMiddleware } from "../Middleware/auth.middleware.js";

const router = Router();

router.get("/employees",getEmployees)
router.get("/services",authMiddleware,getServicesForEachStaffForToday)
router.get("/all-services",authMiddleware,getAllServices)
router.get("/graph-services",authMiddleware,getGraphResult)
router.get("/all-expenses",authMiddleware,getExpenses)
router.get("/profit",authMiddleware,getMonthlyProfit)
router.get("/water-details",authMiddleware,getWaterDetails)


router.post("/signup", signup);
router.post("/login", login);
router.post("/services",authMiddleware, addServices);
router.post("/expenses",authMiddleware, createExpenses);
router.post("/water",authMiddleware, pourWater);


router.patch("/status/:id",authMiddleware, changeStatusOfStaff);


export default router;
