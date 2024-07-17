import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Blog } from "../models/blogSchema.js";
import cloudinary from "cloudinary";

export const blogPost = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Main Image is Mandatory", 400));
  }
  const { mainImage, paraOneImage, paraTwoImage, paraThreeImage } = req.files;
  if (!mainImage) {
    return next(new ErrorHandler("Main Image is Mandatory", 400));
  }
  const allowedFormates = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedFormates.includes(mainImage.mimetype) || (paraOneImage && !allowedFormates.includes(paraOneImage.mimetype)) || (paraTwoImage && !allowedFormates.includes(paraTwoImage.mimetype)) || (paraThreeImage && !allowedFormates.includes(paraThreeImage.mimetype))) {
    return next(new ErrorHandler("Invalid File Format. Only PNG/JPEG/WEB[ Formates Are Allowed", 400));
  }

  const { title, intro, category, paraOneDescription, paraOneTitle, paraTwoDescription, paraTwoTitle, paraThreeDescription, paraThreeTitle, published } = req.body;

  const createdBy = req.user._id;
  const authorName = req.user.name;
  const authorAvatar = req.user.avatar.secure_url;

  if (!title || !intro || !category) {
    return next(new ErrorHandler("Please provide blog title, intro and category", 400));
  }

  const uploadPromises = [
    cloudinary.uploader.upload(mainImage.tempFilePath),
    paraOneImage ? cloudinary.uploader.upload(paraOneImage.tempFilePath) : Promise.resolve(null),
    paraTwoImage ? cloudinary.uploader.upload(paraTwoImage.tempFilePath) : Promise.resolve(null),
    paraThreeImage ? cloudinary.uploader.upload(paraThreeImage.tempFilePath) : Promise.resolve(null),
  ];

  const [mainImageRes, paraOneImageRes, paraTwoImageRes, paraThreeImageRes] = await Promise.all(uploadPromises);

  if (!mainImageRes || mainImageRes.error || (paraOneImageRes && (!paraOneImageRes || paraOneImageRes.error)) || (paraTwoImageRes && (!paraTwoImageRes || paraTwoImageRes.error)) || (paraThreeImageRes && (!paraThreeImageRes || paraThreeImageRes.error))) {
    return next(new ErrorHandler("Error occured while uploading one or more images", 500));
  }

  const blogData = {
    title,
    intro,
    paraOneDescription,
    paraOneTitle,
    paraTwoDescription,
    paraTwoTitle,
    paraThreeDescription,
    paraThreeTitle,
    category,
    createdBy,
    authorAvatar,
    authorName,
    published,
    mainImage: {
      public_id: mainImageRes.public_id,
      secure_url: mainImageRes.secure_url,
    },
  };
  if (paraOneImageRes) {
    blogData.paraOneImage = {
      public_id: paraOneImageRes.public_id,
      secure_url: paraOneImageRes.secure_url,
    };
  }
  if (paraTwoImageRes) {
    blogData.paraTwoImage = {
      public_id: paraTwoImageRes.public_id,
      secure_url: paraTwoImageRes.secure_url,
    };
  }
  if (paraThreeImageRes) {
    blogData.paraThreeImage = {
      public_id: paraThreeImageRes.public_id,
      secure_url: paraThreeImageRes.secure_url,
    };
  }
  const blog = await Blog.create(blogData);
  res.status(200).json({
    success: true,
    message: "Blog created successfully",
    blog,
  });
});

export const deleteBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return next(new Error("Blog not found", 404));
  }
  await blog.deleteOne();
  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});

export const getAllBlogs = catchAsyncErrors(async (req, res, next) => {
  const blogs = await Blog.find({ published: true });
  res.status(200).json({
    success: true,
    blogs,
  });
});

export const getSingleBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);
  if (!blog) {
    return next(new ErrorHandler("Blog not found", 404));
  }
  res.status(200).json({
    success: true,
    blog,
  });
});

export const getMyBlogs = catchAsyncErrors(async (req, res, next) => {
  const createdBy = req.user._id;
  const blogs = await Blog.find({ createdBy });
  res.status(200).json({
    success: true,
    blogs,
  });
});

export const updateBlog = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  let blog = await Blog.findById(id);
  if (!blog) {
    return next(new ErrorHandler("Blog not found!", 404));
  }
  const newBlogData = {
    title: req.body.title,
    intro: req.body.intro,
    category: req.body.category,
    paraOneTitle: req.body.paraOneTitle,
    paraOneDescription: req.body.paraOneDescription,
    paraTwoTitle: req.body.paraTwoTitle,
    paraTwoDescription: req.body.paraTwoDescription,
    paraThreeTitle: req.body.paraThreeTitle,
    paraThreeDescription: req.body.paraThreeDescription,
    published: req.body.published,
  };
  if (req.files) {
    const { mainImage, paraOneImage, paraTwoImage, paraThreeImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if ((mainImage && !allowedFormats.includes(mainImage.mimetype)) || (paraOneImage && !allowedFormats.includes(paraOneImage.mimetype)) || (paraTwoImage && !allowedFormats.includes(paraTwoImage.mimetype)) || (paraThreeImage && !allowedFormats.includes(paraThreeImage.mimetype))) {
      return next(new ErrorHandler("Invalid file format. Only PNG, JPG and WEBp formats are allowed.", 400));
    }
    if (req.files && mainImage) {
      const blogMainImageId = blog.mainImage.public_id;
      await cloudinary.uploader.destroy(blogMainImageId);
      const newBlogMainImage = await cloudinary.uploader.upload(mainImage.tempFilePath);
      newBlogData.mainImage = {
        public_id: newBlogMainImage.public_id,
        url: newBlogMainImage.secure_url,
      };
    }

    if (req.files && paraOneImage) {
      if (blog.paraOneImage && blog.paraOneImage.public_id) {
        const blogParaOneImageId = blog.paraOneImage.public_id;
        await cloudinary.uploader.destroy(blogParaOneImageId);
      }
      const newBlogParaOneImage = await cloudinary.uploader.upload(paraOneImage.tempFilePath);
      newBlogData.paraOneImage = {
        public_id: newBlogParaOneImage.public_id,
        url: newBlogParaOneImage.secure_url,
      };
    }
    if (req.files && paraTwoImage) {
      if (blog.paraTwoImage && blog.paraTwoImage.public_id) {
        const blogParaTwoImageId = blog.paraTwoImage.public_id;
        await cloudinary.uploader.destroy(blogParaTwoImageId);
      }
      const newBlogParaTwoImage = await cloudinary.uploader.upload(paraTwoImage.tempFilePath);
      newBlogData.paraTwoImage = {
        public_id: newBlogParaTwoImage.public_id,
        url: newBlogParaTwoImage.secure_url,
      };
    }
    if (req.files && paraThreeImage) {
      if (blog.paraThreeImage && blog.paraThreeImage.public_id) {
        const blogParaThreeImageId = blog.paraThreeImage.public_id;
        await cloudinary.uploader.destroy(blogParaThreeImageId);
      }
      const newBlogParaThreeImage = await cloudinary.uploader.upload(paraThreeImage.tempFilePath);
      newBlogData.paraThreeImage = {
        public_id: newBlogParaThreeImage.public_id,
        url: newBlogParaThreeImage.secure_url,
      };
    }
  }
  blog = await Blog.findByIdAndUpdate(id, newBlogData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    message: "Blog Updated!",
    blog,
  });
});
