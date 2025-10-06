const express = require("express");
const router = express.Router();
const {
  createUserController,
  updateUserController,
  deleteUserController,
  resetUserController,
  getAllUserController,
} = require("../controllers/userController");
const sharedKeyAuth = require("../middlewares/sharedKeyAuth");

router.get("/users", sharedKeyAuth, getAllUserController);

router.post("/create-user", sharedKeyAuth, createUserController);

router.patch("/update-user/:email", sharedKeyAuth, updateUserController);

router.delete("/delete-user/:email", sharedKeyAuth, deleteUserController);

router.patch("/reset-user/:email", sharedKeyAuth, resetUserController);

module.exports = router;
