import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICourse extends Document {
  ownerId: mongoose.Types.ObjectId;
  branchId?: string;

  name: string;
  description?: string;

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