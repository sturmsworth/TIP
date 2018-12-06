const express = require('express')
const _ = require('lodash')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.set(`view engine`, `ejs`)

app.get('/', (req, res) => {
    res.render('home')
})

app.listen(3000, () => {
    console.log(`We're live!`)
})