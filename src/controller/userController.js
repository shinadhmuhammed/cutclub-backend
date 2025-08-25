import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Service from "../models/serviceModal.js";
import expenseModel from "../models/expenseModel.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      role: "staff",
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User created successfully",
      user: { id: user._id, username, email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Email, password and role are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (user.role !== role) {
      return res.status(403).json({ error: "Unauthorized: incorrect role" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "360d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "staff" }).select("-password");

    res.json({ employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, amount, paymentType } = req.body;

    if (!type || !amount || !paymentType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newService = new Service({
      userId,
      type,
      amount,
      paymentType: paymentType.toLowerCase(),
    });

    await newService.save();

    res.status(201).json({
      message: "Service added successfully",
      service: newService,
    });
  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).json({ error: "Server error, could not add service" });
  }
};

export const getServicesForEachStaffForToday = async (req, res) => {
  const staffId = req.user.id;
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const services = await Service.find({
      userId: staffId,
      date: { $gte: startOfDay, $lt: endOfDay },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Services fetched successfully",
      services,
    });
  } catch (error) {
    console.error("Error fetching staff services for today:", error);
    res.status(500).json({ error: "Server error, could not fetch services" });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const page = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await Service.countDocuments();

    // Fetch services with pagination
    const allServices = await Service.find({})
      .populate("userId", "username email")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: latest first

    if (!allServices || allServices.length === 0)
      return res.status(404).json({ message: "Services not found!" });

    res.status(200).json({
      message: "Services fetched successfully",
      services: allServices,
      total, // total number of services for frontend pagination
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Server error, could not fetch services" });
  }
};


export const createExpenses = async (req, res) => {
  try {
    const expense = new expenseModel(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getExpenses = async (req, res) => {
  try {
    const expense = await expenseModel.find()
      if (!expense)
      return res.status(404).json({ message: "expenses not found..!!" });
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getMonthlyProfit = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    const totalExpensesAgg = await expenseModel.aggregate([
      { $match: { year: yearNum, month: monthNum } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenses =
      totalExpensesAgg.length > 0 ? totalExpensesAgg[0].total : 0;

    // 2️⃣ Total Service Income for that month
    const totalServicesAgg = await Service.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(yearNum, monthNum - 1, 1), // first day
            $lt: new Date(yearNum, monthNum, 1), 
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalServices =
      totalServicesAgg.length > 0 ? totalServicesAgg[0].total : 0;

    const profit = totalServices - totalExpenses;

    res.json({
      month: monthNum,
      year: yearNum,
      totalServices,
      totalExpenses,
      profit,
    });
  } catch (err) {
    console.error("Error calculating monthly profit:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};