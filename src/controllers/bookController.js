const bookModel = require("../models/bookModel");
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel");
const { findById, findOne } = require("../models/userModel");
var moment = require('moment');
const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
};

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};


const isValidString = function (value) {
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};



const createBook = async function (req, res) {

    try {

        let data = req.body
        const { title, excerpt, ISBN, userId, category, subcategory, reviews } = data


        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }

        if (!title) {
            return res.status(400).send({ status: false, msg: "please provide title field." })
        }

        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "please provide valid title." })
        }

        const duplicateTitle = await bookModel.findOne({ title: title })

        if (duplicateTitle) {
            return res.status(400).send({ status: false, msg: "Title already exists." })
        }

        if (!excerpt) {
            return res.status(400).send({ status: false, msg: "please provide excerpt field." })
        }

        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, msg: "please provide valid excerpt." })
        }

        if (!ISBN) {
            return res.status(400).send({ status: false, msg: "please provide ISBN field." })
        }

        if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)) {
            return res.status(400).send({ status: false, msg: "ISBN is not correct." })
        }

        const duplicateISBN = await bookModel.findOne({ ISBN: ISBN })

        if (duplicateISBN) {
            return res.status(400).send({ status: false, msg: "ISBN already exists" })
        }

        if (!userId) {
            return res.status(400).send({ status: false, msg: "please provide userId field." })
        }

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "please provide valid userId." })
        }

        const duplicateId = await userModel.findById({ _id: userId })

        if (!duplicateId) {
            return res.status(400).send({ status: false, msg: "userId doesn't exist" })
        }

        if (!category) {
            return res.status(400).send({ status: false, msg: "please provide category field." })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "please provide valid category." })
        }

        if (!subcategory) {
            return res.status(400).send({ status: false, msg: "please provide subcategory." })
        }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                const uniqueSubcategoryArr = [...new Set(subcategory)];
                data["subcategory"] = uniqueSubcategoryArr; //Using array constructor here
            }
        }


        data.releasedAt = moment().format("YYYY-MM-DD")

        if (userId !== req.userId) {

            return res.status(400).send({
                status: false,
                message: 'Unauthorised Access. Please login again!',
            });
        }

        const newBook = await bookModel.create(data)
        return res.status(201).send({ status: true, msg: "successful", data: newBook })

    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }

}


const getBooks = async function (req, res) {
    try {
        let queryParams = req.query;

        if (!isValidRequestBody(queryParams)) return res.status(400).send({ status: false, msg: "Please Provide Data in params" })

        let filterQuery = { ...queryParams, isDeleted: false, deletedAt: null };

        const { userId, category, subcategory } = queryParams


        if (!isValidString(userId)) {
            return res.status(400).send({ status: false, msg: "userId field cannot be empty" })
        }


        if (!isValidString(category)) {
            return res.status(400).send({ status: false, msg: "please provide category field." })
        }

        if (!isValidString(subcategory)) {
            return res.status(400).send({ status: false, msg: "please provide subcategory field." })
        }

        let validUserId = await bookModel.findOne({ $or: [ { userId: userId }, { category: category }, {subcategory: subcategory} ] })

        //console.log(validUserId)

        if (validUserId.userId != req.userId) {

            return res.status(400).send({
                status: false,
                message: 'Unauthorised Access. Please login again!',
            });
        }



        const books = await bookModel.find(filterQuery).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });

        if (!isValid(books)) {
            return res.status(404).send({ status: false, message: "No booksfound" });
        }
        res.status(200).send({ status: true, message: "Books list", data: books });
    } catch (error) {
        res.status(500).send({ status: false, Error: error.message });
    }
};

const getBookDetailsById = async (req, res) => {
    try {
        const bookId = req.params.bookId

    

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid bookId' })
        }

        if(!isValidRequestBody(bookId)) return res.status(400).send({status: false, msg:"Please Provide Data in params"})

        const book = await bookModel.findOne({ _id: bookId, isDeleted: false }).select({ ISBN: 0, __v: 0 })
        // console.log(book)
        if (!book) {
            return res.status(404).send({ status: false, message: 'No book found' })
        }

        if (book.userId != req.userId) {

            return res.status(400).send({
                status: false,
                message: 'Unauthorised Access. Please login again!',
            });
        }

       let {...data} = book._doc

       data.reviewsData = [] 

        return res.status(200).send({ status: true, message: 'Books list', data: data})
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message });
    }
}



const updateDetails = async function (req, res) {
    try {
      let userIdFromToken = req.userId;
      let bookId = req.params.bookId;
      let requestBody = req.body;
      const { title, excerpt, releasedAt, ISBN } = requestBody;
  
      if (!isValidRequestBody(req.params)) {
        return res.status(400).send({status: false, message: "Invalid request parameters. Please provide query details"});
      }
  
      
      if (!isValidObjectId(bookId)) {
        return res
          .status(400)
          .send({ status: false, message: `bookId is invalid.` });
      }
  
      if (!isValidString(title)) {
        return res
          .status(400)
          .send({ status: false, message: "Title is required for updatation." });
      }

      const duplicateTitle = await bookModel.findOne({ title: title })

      if (duplicateTitle) {
          return res.status(400).send({ status: false, msg: `${title} already exists` })
      }

  
      if (!isValidString(excerpt)) {
        return res
          .status(400)
          .send({ status: false, message: "excerpt is required for updatation." });
      }

  
     
      if (!isValidString(releasedAt)) {
        return res
          .status(400)
          .send({ status: false, message: "releasedAt is required for updatation." });
      }

     
      if (!isValidString(ISBN)) {
        return res
          .status(400)
          .send({ status: false, message: "ISBN is required for updatation." });
      }


      const duplicateISBN = await bookModel.findOne({ ISBN: ISBN })

      if (duplicateISBN) {
          return res.status(400).send({ status: false, msg: "ISBN already exists" })
      }


      let Book = await bookModel.findOne({ _id: bookId });
      if (!Book) {
        return res.status(400).send({ status: false, msg: "No such book found" });
      }
      if (Book.userId != userIdFromToken) {
        res.status(401).send({
          status: false,
          message: `Unauthorized access! author's info doesn't match`,
        });
        return;
      }
      if (
        req.body.title ||
        req.body.exerpt ||
        req.body.releasedAt ||
        req.body.ISBN
      ) {
        const title = req.body.title;
        const excerpt = req.body.excerpt;
        const releasedAt = req.body.releasedAt;
        const ISBN = req.body.ISBN;



  
        const updatedBook = await bookModel.findOneAndUpdate(
          { _id: req.params.bookId },
          {
            title: title,
            excerpt: excerpt,
            releasedAt: releasedAt,
            $set: {  ISBN: ISBN },
           
          },
          { new: true }
        );
        
    
        return res.status(200).send({
          status: true,
          message: "Successfully updated book details",
          data: updatedBook,
        });
      } else {
        return res
          .status(400)
          .send({ status: false, msg: "Please provide book details to update" });
      }
    } catch (err) {
      res.status(500).send({
        status: false,
        Error: err.message,
      });
    }
  };

  const deleteBookById = async function (req, res) {
    try {
      let userIdFromToken = req.userId;
      let id = req.params.bookId;
  
      if (!isValidObjectId(id)) {
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



module.exports.createBook = createBook;
module.exports.getBooks = getBooks;
module.exports.getBookDetailsById = getBookDetailsById;
module.exports.updateDetails = updateDetails;
module.exports.deleteBookById = deleteBookById;