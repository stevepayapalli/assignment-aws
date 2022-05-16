const express = require('express');
const bodyParser = require('body-parser');
const route = require("./Route/route.js")
const { default: mongoose } = require('mongoose');
const { Route } = require('express');
const app = express();


app.use(bodyParser.json());




mongoose.connect("mongodb+srv://Aditya1998:aadi1998@cluster0.zl7lv.mongodb.net/OurProject-3?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);


app.listen(3000)
    console.log('Express app running on port ' + (3000))
