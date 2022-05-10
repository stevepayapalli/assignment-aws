const express=require('express')
const router = express.Router()


const UserController= require("../controllers/userController")
const LoginController= require("../controllers/loginUser")

router.post("/register",UserController.createUser)
router.post("/login", LoginController.loginUser)









module.exports= router;