import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    notes: {
      type: String,
      trim: true,
    },
   month: { type: Number, required: true }, 
    year: { type: Number, required: true },  
  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Expense", expenseSchema);
