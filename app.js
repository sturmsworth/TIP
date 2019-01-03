const express = require('express')
      _ = require('lodash')
      ejs = require('ejs')
      bodyParser = require('body-parser')
      request = require('request')
      mongoose = require('mongoose')
      keys = require(`./config/keys`)
      util = require(`util`)
      formidable = require(`formidable`)
      fs = require(`fs-extra`)
      sizeOf = require(`image-size`)
      Parser = require('rss-parser')
      passport = require('passport')
      Strategy = require('passport-local').Strategy


mongoose.connect(keys.connect.url, keys.connect.option)

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please enter a post title.']
    },
    content: {
        type: String,
        required: [true, 'Please enter post content.']
    },
    tags: {
        type: Array,
        required: [true, 'Enter at least 1 post tag']
    },
    img: {
        type: String,
        required: [true, `Images must be 800 x 300px. Images cannot be larger than 10MB`]
    },
    timestamp: Date
})

const userSchema = mongoose.Schema({
    email: String,
    password: String,
    posts: [postSchema]
})

const tagsSchema = mongoose.Schema({
    tags: Array
})

const PostModel = mongoose.model('Post', postSchema)
const TagModel = mongoose.model('Tag', tagsSchema)
const UserModel = mongoose.model('User', userSchema)

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(`public`))
app.set(`view engine`, `ejs`)

app.get('/', (req, res) => {
    const parser = new Parser()
    const feed = parser.parseURL('https://feeds-cdn.buzzsprout.com/128078.rss')
    PostModel.find({}, (err, posts) => {
        if(err) console.log(err)
        else res.render('home', { posts, feed })
    })
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

app.get(`/post-success`, (req, res) => {
    res.render('post-success')
})

app.get(`/post-failure`, (req, res) => {
    res.render('post-failure')
})

app.get(`/login`, (req, res) => {
    res.render('login')
})

app.get(`/post/:postId`, (req, res) => {
    const requestedPostId = req.params.postId
    PostModel.findOne({ _id: requestedPostId }, (err, post) => {
        const postTitle = post.title
        const postBody = post.content.replace(/\r\n\r\n/g, `\n`)
        const postImg = post.img
        const postDate = post.timestamp.toLocaleDateString('en-US')
        if (err) console.log(err)
        else res.render(`post`, {postTitle, postBody, postImg, postDate})
    })
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
                    FNAME: fName,
                    LNAME: lName
                }

            }
        ]
    }
    const JSONData = JSON.stringify(data)
    const options = {
        url: `https://us19.api.mailchimp.com/3.0/lists/99dc583253`,
        method: `POST`,
        headers: {
            "Authorization": keys.mailChimp
        },
        body: JSONData
    }
    
    request(options, (error, response, body) => {
        if (error) {
            console.log(error)
            res.render(`failure`)
        } else {
            if (response.statusCode === 200) {
                res.render(`post-success`)
            } else {
                res.render(`failure`)
            }
        }
    })
})

app.post('/login', (req, res) => {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
        console.log(fields)
    })
})

app.post("/create-post", (req, res) => {

    const form = new formidable.IncomingForm()
    form.uploadDir = `./public/files`
    form.keepExtensions = true
    form.maxFileSize = 10 * 1024 * 1024

    form.parse(req, (err, fields, files) => {

        const tags = fields.tags.split(`,`)
        const title = fields.title
        const img = (imgPath) => {
            const removePublic = imgPath.replace(`public/`, "")
            return removePublic
        }
        const dimensions = sizeOf(files.file.path)
        const content = fields.content
        const newPost = new PostModel({
            title,
            content,
            tags,
            img: img(files.file.path),
            timestamp: new Date()
        })

        if (err) {
            res.redirect('post-failure-error', { postError: err })
        } else {
            if (dimensions.width === 800 && dimensions.height === 300) {
                newPost.save((err) => {
                    if (err) console.log(err)
                    else res.redirect('/post-success')
                })
            } else {
                res.redirect('/post-failure')
            }
        }
    })
})

app.listen(3000, () => {
    console.log(`Port 3000: We're live!`)
})