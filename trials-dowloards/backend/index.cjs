//node index.js
const express = require('express')
const mysql = require("mysql");
const cors = require('cors')
const multer = require('multer') //http://expressjs.com/en/resources/middleware/multer.html npm install --save multer
 
const app = express()
app.use(cors())
app.use(express.json())
 
const con = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "nodejsdb"
})
 
con.connect(function(err) {
    if(err) {
        console.log("Error in Connection");
    } else {
        console.log("Connected");
    }
})
 
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "./public/images")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})
 
const upload = multer({storage})
 
//app.post('/upload', upload.single('file'), (req, res) => {
//  console.log(req.body)
//  console.log(req.file)
//  return res.json({Status: "Success"});
//})
 
app.post('/create',upload.single('file'), (req, res) => {
    const sql = "INSERT INTO employee (`name`,`email`,`address`, `salary`,`image`) VALUES (?)"; 
    const values = [
        req.body.name,
        req.body.email,
        req.body.address,
        req.body.salary, 
        req.file.filename
    ]
    con.query(sql, [values], (err, result) => {
        if(err) return res.json({Error: "Error singup query"});
        return res.json({Status: "Success"});
    })
})
 
app.listen(3001, () => {
  console.log("Server is running")
})