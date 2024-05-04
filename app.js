import express from 'express'
import dotenv from 'dotenv'
import connect from './db.js'
import cookieParser from 'cookie-parser'
import methodOverride from 'method-override'
import pageRoute from './routes/pageRoute.js'
import photoRoute from './routes/photoRoute.js'
import userRoute from './routes/userRoute.js'
import { checkUser } from './middleware/authMiddleware.js'
import fileUpload from 'express-fileupload'
import {v2 as cloudinary} from 'cloudinary'

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET, 
})

//Connection DB
connect()

const app = express()
const PORT = process.env.PORT

//ejs template engine
app.set("view engine", "ejs")

//static files middleware
app.use(express.static("public"))
app.use(express.json())
app.use(express.urlencoded({extended: true})) //form içindeki verilerin parse edilmesi için
app.use(cookieParser())
app.use(fileUpload({useTempFiles: true})) //cloudinary'e yüklediğimiz dosyalar için geçici tmp dosyası oluşturur.
app.use(methodOverride("_method", {
    methods: ["POST", "GET"],
}))

// app.get("/", (req, res) => {
//     // res.send("Index Sayfası")
//     res.render("index") 
// })

// app.get("/about", (req, res) => {
//     res.render("about")
// })




//routes
app.use("*", checkUser)
app.use("/", pageRoute)
app.use("/photos", photoRoute)
app.use("/users", userRoute)

 
app.listen(PORT, () => {
    console.log(`Server is connected on PORT:${PORT}`);
})
