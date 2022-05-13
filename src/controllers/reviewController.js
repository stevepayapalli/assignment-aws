const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')
const Validator= require("../validator/validation")

const createReviewByBookId = async function (req, res) {
    try {
        let bookId = req.params.bookId

        if(!bookId) return res.status(400).send({status: false, msg:"please give BookId"})

        if (!Validator.isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid Book id or not present ` })

        }
        if (!Validator.isValid(bookId)) {
            return res.status(400).send({ status: false, message: `${bookId} is not a valid Book id or not present ` })

        }

        let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!book) {
            return res.status(404).send({ status: false, message: `Book not found` })
        }

        let requestBody = req.body
        if (!Validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Review Details" })

        }
       
        const { reviewedBy, rating, review } = requestBody

       
        if (!Validator.isValid(rating)) {
            return res.status(400).send({ status: false, message: " please provide rating" })
        }

        if (!(rating == 1 || rating == 2 || rating == 3 || rating == 4 || rating == 5)) {
            return res.status(400).send({ status: false, message: ' please provide rating between 1 to 5' })
        }

        let createReviewdata = {
            bookId: bookId,
            reviewedBy: reviewedBy,
            reviewedAt: Date.now(),
            rating: rating,
            review: review
        }
        let reviewdata = await reviewModel.create(createReviewdata)

        await bookModel.findOneAndUpdate({ _id: bookId, isDeleted: false }, { $inc: { reviews: 1 } })

        let newdata = await reviewModel.find(reviewdata).select({ isDeleted: 0, updatedAt: 0, createdAt: 0, __v: 0 })

        res.status(201).send({ status: true, data: newdata })
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
}


const updateReviews = async function (req, res) {
    try {
      let bookId = req.params.bookId;
      let reviewId= req.params.reviewId
      let requestBody = req.body;
      const { review, rating, reviewedBy, reviewedAt } = requestBody;
  
      if (!Validator.isValidRequestBody(req.params)) {
        return res.status(400).send({status: false, message: "Invalid request parameters. Please provide query details"});
      }
  
      
      if (!Validator.isValidObjectId(bookId)) {
        return res.status(400).send({ status: false, message: `bookId is missing.` });
      }
      if (!Validator.isValidObjectId(reviewId)) {
        return res.status(400).send({ status: false, message: `reviewId is missing.` });
      }
  
      if (!Validator.isValidString(review)) {
        return res.status(400).send({ status: false, message: "Review is required for updatation." });
      }

  
      if (!(rating == 1 || rating == 2 || rating == 3 || rating == 4 || rating == 5)) {
        return res.status(400).send({ status: false, message: ' please provide rating between 1 to 5' })
    }

     
      if (!Validator.isValidString(reviewedBy)) {
        return res.status(400).send({ status: false, message: "reviewedBy is required for updatation." });
      }


     let deletedBook = await bookModel.findOne({_id:bookId, isDeleted:true})

     if (deletedBook) {
         return res.status(400).send({status:false, msg: "Book has already been deleted."})
     }
     
     let reviewById= await reviewModel.findOne({_id: reviewId, isDeleted:true})

     if (reviewById) {
        return res.status(400).send({status:false, msg: "Review has already been deleted."})
     }

     let isReviewId= await reviewModel.findById({_id: reviewId})

     if (bookId != isReviewId.bookId) {
        return res.status(400).send({status:false, msg: "This review not belongs to this particular book."})
     }


     const updatedTheReview = await reviewModel.findOneAndUpdate(
        { _id: req.params.reviewId },
        {
            review: review,
            rating: rating,
            reviewedBy: reviewedBy,
             reviewedAt: Date.now()//check this in review api why we use $set
         
        },
        { new: true }
      );

      return res.status(200).send({status: true,message: "Successfully updated review details",data: updatedTheReview});
      
    } catch (err) {
        console.log(err)
      res.status(500).send({status: false,Error: err.message, });
    }
  };


  const deleteBookById = async function (req, res) {
    try {
      let userIdFromToken = req.userId;
      let id = req.params.bookId;
  
      if (!Validator.isValidObjectId(id)) {
        return res.status(400).send({ status: false, message: `BookId is invalid.` });
      }
  
      let Book = await bookModel.findOne({ _id: id });
  
      if (!Book) {
        return res.status(400).send({ status: false, msg: "No such book found" });
      }
  
      if (Book.userId != userIdFromToken) { res.status(401).send({ status: false,message: `Unauthorized access! Owner info doesn't match` });
        return;
      }

      const alreadyDeleted= await bookModel.findOne({_id: id, isDeleted: true})

      if(alreadyDeleted) {
        return res.status(400).send({ status: false, msg: `${alreadyDeleted.title} is already been deleted.` })
      }

      
      
      let data = await bookModel.findOne({ _id: id });
      if (data.isDeleted == false) {
        let Update = await bookModel.findOneAndUpdate(
          { _id: id },
          { isDeleted: true, deletedAt: Date() },
          { new: true }
        );
        return res.status(200).send({status: true,message: "successfully deleted the book",data:Update});
      } 

    } catch (err) {
        console.log(err)
      res.status(500).send({ status: false, Error: err.message });
    }
  };



module.exports.updateReviews =updateReviews
module.exports.createReviewByBookId = createReviewByBookId