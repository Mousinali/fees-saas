import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBatch extends Document {
  ownerId: mongoose.Types.ObjectId;
  branchId?: string;
  courseId: mongoose.Types.ObjectId;

  name: string;

  status: "active" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
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

    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
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

const Batch: Model<IBatch> =
  mongoose.models.Batch ||
  mongoose.model<IBatch>("Batch", BatchSchema);

export default Batch;