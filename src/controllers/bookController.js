const bookModel = require("../models/bookModel");
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel");
const { findById } = require("../models/userModel");
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
    const { title, excerpt, ISBN, userId, category, subcategory, reviews} = data


    if (!isValidRequestBody(data)) {
        return res.status(400).send({ status: false, msg: "please provide some data" })
    }

    if (!title) {
        return res.status(400).send({ status: false, msg: "please provide title field." })
    }

    if (!isValid(title)) {
        return res.status(400).send({ status: false, msg: "please provide valid title." })
    }

    const duplicateTitle= await bookModel.findOne({title:title}) 

    if(duplicateTitle) {
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

    const duplicateISBN= await bookModel.findOne({ISBN:ISBN}) 

    if(duplicateISBN) {
        return res.status(400).send({ status: false, msg: "ISBN already exists" })
    }

    if (!userId) {
        return res.status(400).send({ status: false, msg: "please provide userId field." })
    }

    if (!isValidObjectId(userId)) {
        return res.status(400).send({ status: false, msg: "please provide valid userId." })
    }

    const duplicateId= await userModel.findById({_id:userId}) 

    if(!duplicateId) {
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


    data.releasedAt= moment().format("YYYY-MM-DD")
    if(userId !==  req.userId){
    
        return res.status(400).send({
          status: false,
          message: 'Unauthorised Access. Please login again!',
        });
      }

    const newBook= await bookModel.create(data)
    return res.status(201).send({status:true, msg: "successful", data:newBook})

    } catch (err) {
        console.log(err)
        res.status(500).send({status: false, msg: err.message})
    }
    
}


const getBooks = async function (req, res) {
    try {
        let queryParams = req.query;
      let filterQuery = {...queryParams, isDeleted: false, deletedAt: null };

      const {userId, category, subcategory}=  queryParams
     
     
      if(!isValidString(userId)) {
        return res.status(400).send({ status: false, msg: "userId field cannot be empty" })
     }


     if (!isValidString(category)) {
        return res.status(400).send({ status: false, msg: "please provide category field." })
    }

    if (!isValidString(subcategory)) {
        return res.status(400).send({ status: false, msg: "please provide subcategory field." })
    }



      const books = await bookModel.find(filterQuery).select({title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1}).sort({title:1});
  
      if (!isValid(books)) {
        return res.status(404).send({ status: false, message: "No booksfound" });
      }
      res.status(200).send({ status: true, message: "Books list", data: books });
    } catch (error) {
      res.status(500).send({ status: false, Error: error.message });
    }
  };
  

module.exports.createBook=createBook;
module.exports.getBooks=getBooks;