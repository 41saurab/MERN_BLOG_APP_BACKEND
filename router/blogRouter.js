import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";
import { blogPost, deleteBlog, getAllBlogs, getMyBlogs, getSingleBlog, updateBlog } from "../controllers/blogController.js";

const blogRouter = express.Router();

blogRouter.post("/post", isAuthenticated, isAuthorized("Author"), blogPost);
blogRouter.delete("/delete/:id", isAuthenticated, isAuthorized("Author"), deleteBlog);
blogRouter.get("/allBlogs", getAllBlogs);
blogRouter.get("/singleblog/:id", isAuthenticated, getSingleBlog);
blogRouter.get("/myblogs", isAuthenticated, isAuthorized("Author"), getMyBlogs);
blogRouter.put("/update/:id", isAuthenticated, isAuthorized("Author"), updateBlog);

export default blogRouter;
