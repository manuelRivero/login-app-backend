import { Schema, model } from "mongoose";

const User = Schema(
  {
    name: {
      type: String,
    },
    lastName: {
      type: String,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    avatar: {
      type: String,
    },
    provider: {
      type: String,
      default: "web",
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

export default model("User", User);
