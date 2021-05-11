// server.js
// Added all import
const express = require('express')
const bodyParser= require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('bson')

// init connection with database
MongoClient.connect('mongodb+srv://root:toor@cluster0.7sq0l.mongodb.net/Cluster0?retryWrites=true&w=majority',  {
    useUnifiedTopology: true
})
.then(client => {
    console.log('Connected to Database')
    // connect to database cluster0
    const db = client.db('Cluster0')
    // load blogs data
    const blogsCollection = db.collection('blogs')
    // load comments data
    const commentsCollection = db.collection('comments')
    // module for better lisibility of form
    app.use(bodyParser.urlencoded({ extended: true }))
    // set view engine
    app.set('view engine', 'ejs');

    // begin to listen (process.env.PORT is recquired to deploy on heroku because he choose on wich port is host the server)
    app.listen(process.env.PORT || 3000, function() {
        // display which port is used for the user
        if (process.env.PORT != undefined)
            console.log("listening on " + process.env.PORT);
        else
            console.log("listening on 3000");
    })

    // the home page
    app.get('/', (req, res) => {
        blogsCollection.find().toArray()
        .then(results => {
            res.render("pages/index", {results : results})
        })
        .catch(error => console.error(error))
    })

    // create blog subject interface
    app.get('/create', (req, res) => {
        res.render("pages/create")
    })

    // create blog subject request
    app.post('/create', (req, res) => {
        blogsCollection.insertOne(req.body).then(result => {
            res.redirect("/")
        })
        .catch(error => console.error(error))
    })

    // page of comment (load from specific blog subject)
    app.get('/blog', (req, res) => {
        blogsCollection.findOne(ObjectId(req.query.id))
        .then(blog => {
            commentsCollection.find({"blog_id" : req.query.id}).toArray()
            .then(comments => {
                res.render("pages/blog", {blog: blog, comments: comments})
            })
            .catch(error => console.error(error))
        })
        .catch(error => console.error(error))
    })

    // create new comment interface
    app.get('/new_comment', (req, res) => {
        res.render("pages/new_comment", {blog_id : req.query.blog_id})
    })

    // create new comment request
    app.post('/new_comment', (req, res) => {
        commentsCollection.insertOne(req.body).then(result => {
            res.redirect("/blog?id=" + req.body.blog_id)
        })
        .catch(error => console.error(error))
    })

    // update comment interface
    app.get('/edit_comment', (req, res) => {
        commentsCollection.findOne(ObjectId(req.query.comment_id))
        .then(comment => {
            res.render("pages/edit_comment", {comment : comment})            
        })
        .catch(error => console.error(error))
    })

    // update comment request
    app.post('/edit_comment', (req, res) => {
        commentsCollection.updateOne({"_id" : new ObjectId(req.body.comment_id)}, 
        {$set: {"author" : req.body.author, "comment" : req.body.comment, "blog_id" : req.body.blog_id}})
        .then(result => {
            res.redirect("/blog?id=" + req.body.blog_id)
        })
        .catch(error => console.error(error))
    })

    // delete commment request
    app.get('/delete_comment', (req, res) => {
        commentsCollection.deleteOne({"_id" : new ObjectId(req.query.comment_id)}) 
        .then(result => {
            res.redirect("/blog?id=" + req.query.blog_id)
        })
        .catch(error => console.error(error))
    })

})
.catch(error => console.error(error))