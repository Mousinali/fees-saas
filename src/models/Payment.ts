import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPayment extends Document {
  ownerId: mongoose.Types.ObjectId;
  branchId?: string;
  studentId: mongoose.Types.ObjectId;
  batchId: mongoose.Types.ObjectId;

  amount: number;
  discount: number;
  fine: number;

  paymentMethod: "cash" | "upi" | "bank" | "card" | "debit_card" | "credit_card";

  month: number;
  year: number;

  feeOption: string;
  isAdvance?: boolean;
  message?: string;

  receiptNumber: string;

  status: "paid" | "partial";

  paymentDate: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
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

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    fine: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "bank", "card", "debit_card", "credit_card"],
      default: "cash",
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    feeOption: {
      type: String,
      required: true,
    },

    isAdvance: {
      type: Boolean,
      default: false,
    },

    message: {
      type: String,
    },

    receiptNumber: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["paid", "partial"],
      default: "paid",
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;