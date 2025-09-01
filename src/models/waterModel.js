import mongoose from "mongoose";

const waterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
  },
  { timestamps: true }
);


waterSchema.index({ userId: 1, date: 1 }, { unique: true });

const Water = mongoose.model("Water", waterSchema);
export default Water;
