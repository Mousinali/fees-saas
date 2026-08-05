import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStudent extends Document {
  ownerId: mongoose.Types.ObjectId;
  branchId?: string;
  courseId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;

  photo?: string;
  fullName: string;
  phone: string;
  
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  
  aadhaarNumber?: string;
  guardianName?: string;
  guardianPhone: string;

  admissionDate: Date;
  customFee?: number;
  balance: number;
  
  isEmiEnrolled?: boolean;

  status: "active" | "inactive";

  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
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
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    photo: {
      type: String,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: Date,
    aadhaarNumber: {
      type: String,
    },
    guardianName: {
      type: String,
    },
    guardianPhone: {
      type: String,
      required: true,
    },
    admissionDate: {
      type: Date,
      default: Date.now,
    },
    customFee: Number,
    balance: {
      type: Number,
      default: 0,
    },
    isEmiEnrolled: {
      type: Boolean,
      default: false,
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

const Student: Model<IStudent> =
  mongoose.models.Student ||
  mongoose.model<IStudent>("Student", StudentSchema);

export default Student;