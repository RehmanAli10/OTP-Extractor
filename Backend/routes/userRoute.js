const express = require("express");
const router = express.Router();
const {
  createUserController,
  updateUserController,
  deleteUserController,
  resetUserController,
} = require("../controllers/userController");
const sharedKeyAuth = require("../middlewares/sharedKeyAuth");

router.post("/create", sharedKeyAuth, createUserController);

router.patch("/update/:email", sharedKeyAuth, updateUserController);

router.delete("/delete/:email", sharedKeyAuth, deleteUserController);

router.patch("/reset/:email", sharedKeyAuth, resetUserController);

module.exports = router;
