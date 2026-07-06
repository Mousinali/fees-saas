import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  role: "super_admin" | "user";
  accountType: "teacher" | "coaching_center";

  fullName: string;
  coachingName?: string;

  email: string;
  phone: string;
  password: string;

  profileImage?: string;

  isVerified: boolean;
  isBlocked: boolean;

  lastLogin?: Date;
  branches?: { _id?: string; name: string }[];
  
  invoiceSettings?: {
    themeColor?: string;
    customNote?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["super_admin", "user"],
      default: "user",
    },

    accountType: {
      type: String,
      enum: ["teacher", "coaching_center"],
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    coachingName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },

    branches: [
      {
        name: { type: String, required: true },
      },
    ],

    invoiceSettings: {
      themeColor: { type: String, default: "#1d4ed8" }, // default blue-700
      customNote: { type: String, default: "Thank you for your payment!" },
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;