import express from "express";
import { getAllAuthors, getMyProfile, login, logout, register } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/logout", isAuthenticated, logout);
userRouter.get("/myprofile", isAuthenticated, getMyProfile);
userRouter.get("/authors", getAllAuthors);

export default userRouter;
