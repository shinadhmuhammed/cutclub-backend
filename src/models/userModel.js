import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["staff", "admin"],
    },
    status: {
      type: String,
      required: true,
      default: "active",
      enum: ["active", "inactive"],
    },
    password: { type: String, required: true, minlength: 6 },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
