import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide blog title"],
    minLength: [3, "Blog title must contain at least 3 characters"],
    maxLength: [32, "Blog title cannot exceed 32 characters"],
  },
  mainImage: {
    public_id: {
      type: String,
      required: true,
    },
    secure_url: {
      type: String,
      required: true,
    },
  },
  intro: {
    type: String,
    required: [true, "Please provide blog intro"],
    minLength: [3, "Blog intro must contain at least 3 characters"],
    maxLength: [256, "Blog intro cannot exceed 256 characters"],
  },
  paraOneImage: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  paraOneDescription: {
    type: String,
    minLength: [3, "Blog intro must contain at least 3 characters"],
    maxLength: [256, "Blog intro cannot exceed 256 characters"],
  },
  paraOneTitle: {
    type: String,
    minLength: [3, "Blog intro must contain at least 3 characters"],
    maxLength: [32, "Blog intro cannot exceed 32 characters"],
  },
  paraTwoImage: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  paraTwoDescription: {
    type: String,
    minLength: [3, "Blog intro must contain at least 3 characters"],
    maxLength: [256, "Blog intro cannot exceed 256 characters"],
  },
  paraTwoTitle: {
    type: String,
    minLength: [3, "Blog intro must contain at least 3 characters"],
    maxLength: [32, "Blog intro cannot exceed 32 characters"],
  },
  paraThreeImage: {
    public_id: {
      type: String,
    },
    secure_url: {
      type: String,
    },
  },
  paraThreeDescription: {
    type: String,
    minLength: [3, "Blog intro must contain at least 3 characters"],
    maxLength: [256, "Blog intro cannot exceed 256 characters"],
  },
  paraThreeTitle: {
    type: String,
    minLength: [3, "Blog intro must contain at least 3 characters"],
    maxLength: [32, "Blog intro cannot exceed 32 characters"],
  },

  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorAvatar: {
    type: String,
    required: true,
  },
  published: {
    type: String,
    default: false,
  },
});

export const Blog = mongoose.model("Blog", blogSchema);
