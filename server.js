import express from 'express'
import morgan from 'morgan'
import path from 'path'
import mongoose from 'mongoose'
import session from 'express-session'
import bodyParser from 'body-parser'
import User from './src/models/User'
import colors from 'colors/safe'

const mongo = mongoose.connect('mongodb://localhost/mongo_local',{useMongoClient: true},(err) => {
if(err) console.warn(`Couldn't connect to database`)    
else console.log('Connected to mongo database')
})
mongo.Promise = global.Promise
const db = mongoose.connection
db.on('error',(err) => {
    console.warn(`Mongo caused error`)
})
const app = express()
const PORT = process.env.PORT  || 3000
app.use(express.static(path.resolve(__dirname,'build')))
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000,secure: false }
  }))
app.put('/user',(req,res) => {
    console.log(req.body)
User.findOne({name: req.body.name},(err,user) => {  
if(err) res.json({name:"Error", job: "Sleep destroyer", age:3000})  
if(user) res.json({name:user.name, job: user.job, age: user.age})  
else res.json({name:"Jake", job: "Mc'Error", age:3000})  
})    
})  
app.put('/update',(req, res) => {
User.update({name:req.body.name},{$set:{job: req.body.job, age:req.body.age}},(err, raw) => {
    if(err) res.send(JSON.stringify({err}))
    res.send(JSON.stringify({ok:raw}))
})
})
app.put('/count',(req, res) => {
    User.count({},(err,count) => {
        if(err)  res.send(JSON.stringify({err}))
        res.send(JSON.stringify({count}))
    })
})
app.put('/delete',(req, res) => {
User.remove({name:req.body.name},(err) => {
    if(err) res.send(JSON.stringify({result:"err"}))
    res.send(JSON.stringify({result: "ok"}))
})
})
app.put('/create',(req, res) => {
   User.create([
       {name: req.body.name, age:req.body.age,job: req.body.job}
    ])
       .then(arr => {
           res.send(JSON.stringify({result:"ok"}))
       })
       .catch(err => {
        res.send(JSON.stringify({result:err}))
       })
})
app.get( '*', (req,res) => {
res.sendFile(path.resolve(__dirname,'build/index.html'))    
})
const server = app.listen(PORT,() => {
    console.log(colors.blue(`Magic is happening on port ${server.address().port}`))
})