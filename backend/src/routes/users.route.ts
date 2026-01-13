import usersController from "../controllers/users.controller"; 
import express from "express";

const router = express.Router();

router.post("/create-user", usersController.createUser);

router.get("/get-all-users", usersController.getAllUsers);

router.get("/search/:query", usersController.searchUser);

export default router;
