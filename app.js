const express = require('express')
const _ = require('lodash')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(`public`))
app.set(`view engine`, `ejs`)

app.get('/', (req, res) => {
    res.render('home')
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
        url: `https://us19.api.mailchimp.com/3.0/lists/99dc583253`,
        method: `POST`,
        headers: {
            "Authorization": `terror1 17b6b62da4337a036729e72f6919dc9b-us19`
        },
        body: JSONData
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

app.listen(3000, () => {
    console.log(`We're live!`)
})