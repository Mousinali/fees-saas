import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICourse extends Document {
  ownerId: mongoose.Types.ObjectId;
  branchId?: string;

  name: string;
  description?: string;
  duration?: string;
  defaultFee: number;
  feeType?: "monthly" | "total";

  isEmiAvailable?: boolean;
  emiType?: "monthly" | "quarterly" | "yearly" | null;
  emiDuration?: number | null;

  status: "active" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branchId: {
      type: String,
      required: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "",
    },

    defaultFee: {
      type: Number,
      required: true,
      default: 0,
    },

    feeType: {
      type: String,
      enum: ["monthly", "total"],
      default: "total",
    },

    isEmiAvailable: {
      type: Boolean,
      default: false,
    },

    emiType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
    },

    emiDuration: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Course: Model<ICourse> =
  mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);

export default Course;