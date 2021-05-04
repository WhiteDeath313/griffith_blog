// server.js

const express = require('express')
const bodyParser= require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('bson')

MongoClient.connect('mongodb+srv://root:toor@cluster0.7sq0l.mongodb.net/Cluster0?retryWrites=true&w=majority',  {
    useUnifiedTopology: true
})
.then(client => {
    console.log('Connected to Database')
    const db = client.db('Cluster0')
    const blogsCollection = db.collection('blogs')
    const commentsCollection = db.collection('comments')
    app.use(bodyParser.urlencoded({ extended: true }))
    app.set('view engine', 'ejs');

    app.listen(process.env.PORT || 3000, function() {
        console.log('listening on 3000')
    })

    app.get('/', (req, res) => {
        blogsCollection.find().toArray()
        .then(results => {
            res.render("pages/index", {results : results})
        })
        .catch(error => console.error(error))
    })

    app.get('/create', (req, res) => {
        res.render("pages/create")
    })

    app.post('/create', (req, res) => {
        blogsCollection.insertOne(req.body).then(result => {
            res.redirect("/")
        })
        .catch(error => console.error(error))
    })

    app.get('/blog', (req, res) => {
        blogsCollection.findOne(ObjectId(req.query.id))
        .then(blog => {
            // NEED BLOG info
            // NEED COMMENTS info
            commentsCollection.find({"blog_id" : req.query.id}).toArray()
            .then(comments => {
                res.render("pages/blog", {blog: blog, comments: comments})
            })
            .catch(error => console.error(error))
        })
        .catch(error => console.error(error))
    })

    app.get('/new_comment', (req, res) => {
        res.render("pages/new_comment", {blog_id : req.query.blog_id})
    })

    app.post('/new_comment', (req, res) => {
        commentsCollection.insertOne(req.body).then(result => {
            res.redirect("/blog?id=" + req.body.blog_id)
        })
        .catch(error => console.error(error))
    })

    app.get('/edit_comment', (req, res) => {
        commentsCollection.findOne(ObjectId(req.query.comment_id))
        .then(comment => {
            res.render("pages/edit_comment", {comment : comment})            
        })
        .catch(error => console.error(error))
    })

    app.post('/edit_comment', (req, res) => {
        commentsCollection.updateOne({"_id" : new ObjectId(req.body.comment_id)}, 
        {$set: {"author" : req.body.author, "comment" : req.body.comment, "blog_id" : req.body.blog_id}})
        .then(result => {
            res.redirect("/blog?id=" + req.body.blog_id)
        })
        .catch(error => console.error(error))
    })

    app.get('/delete_comment', (req, res) => {
        commentsCollection.deleteOne({"_id" : new ObjectId(req.query.comment_id)}) 
        .then(result => {
            res.redirect("/blog?id=" + req.query.blog_id)
        })
        .catch(error => console.error(error))
    })

})
.catch(error => console.error(error))