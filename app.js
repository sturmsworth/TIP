const express = require('express')
const _ = require('lodash')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const request = require('request')
const mongoose = require('mongoose')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(`public`))
app.set(`view engine`, `ejs`)

// mongoose.connect('REPLACE-ME-1', { useNewUrlParser: true })

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [ true, 'Please enter a post title.']
    },
    content: {
        type: String,
        required: [true, 'Please enter post content.']
    },
    tags: {
        type: Array,
        required: [true, 'Enter at least 1 post tag']
    }
})

const Post = mongoose.model('Post', postSchema)

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/success', (req, res) => {
    res.render('success')
})

app.get('/failure', (req, res) => {
    res.render('failure')
})

app.get('/blog', (req, res) => {
    res.render('blog')
})

app.get('/create-post', (req, res) => {
    res.render('create-post')
})

app.post('/', (req, res) => {
    const fName = req.body.fName
    const lName = req.body.lName
    const email = req.body.email
    const data = {
        members: [
            {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: req.body.fName,
                    LNAME: req.body.lName
                }

            }
        ]
    }
    const JSONData = JSON.stringify(data)
    const options = {
        // REPLACE-ME-2
    }
    
    request(options, (error, response, body) => {
        if (error) {
            res.render(`failure`)
        } else {
            if (response.statusCode === 200) {
                res.render(`success`)
            } else {
                res.render(`failure`)
            }
        }
    })
})

app.post("/create-post", (req, res) => {
    const newPost = new Post ({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags
    })

    newPost.save((err, newPost) => {
        if (err) console.log(err)
        console.log(newPost)
    })

    res.render('success')
})

app.listen(3000, () => {
    console.log(`We're live!`)
})