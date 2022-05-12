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


module.exports.createReviewByBookId = createReviewByBookId