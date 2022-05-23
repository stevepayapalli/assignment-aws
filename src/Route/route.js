const express=require('express')
const router = express.Router()
const aws = require('aws-sdk')


const UserController= require("../controllers/userController")
const BookController= require("../controllers/bookController")
const Middleware= require("../middleware/authorization")
const ReviewController= require("../controllers/reviewController")

router.post("/register",UserController.createUser)
router.post("/login", UserController.loginUser)
router.post("/books",Middleware.loginCheck, BookController.createBook)//1
router.post("/books/:bookId/review", ReviewController.createReviewByBookId)//1
router.put("/books/:bookId/review/:reviewId", ReviewController.updateReviews)

//**************************************GET API*****************************************************/

router.get("/books", Middleware.loginCheck, BookController.getBooks)//2
router.get("/books/:bookId",  Middleware.loginCheck,BookController.getBookDetailsById)//3
router.put("/books/:bookId",  Middleware.loginCheck,BookController.updateDetails)//3
router.delete("/books/:bookId",  Middleware.loginCheck,BookController.deleteBookById)//3
router.delete("/books/:bookId/review/:reviewId", ReviewController.deleteReview)

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})







module.exports= router;