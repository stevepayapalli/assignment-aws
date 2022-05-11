const express=require('express')
const router = express.Router()


const UserController= require("../controllers/userController")
const LoginController= require("../controllers/loginUser")
const BookController= require("../controllers/bookController")
const Middleware= require("../middleware/authorization")

router.post("/register",UserController.createUser)
router.post("/login", LoginController.loginUser)
router.post("/books",Middleware.loginCheck, BookController.createBook )//1

//**************************************GET API*****************************************************/

router.get("/books", Middleware.loginCheck, BookController.getBooks)//2
router.get("/books/:bookId",  Middleware.loginCheck,BookController.getBookDetailsById )//3




module.exports= router;