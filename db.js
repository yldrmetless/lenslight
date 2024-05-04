import mongoose from 'mongoose'

const connect = () => {
    mongoose.connect(process.env.MONGO, {
        dbName: "lenslight"
    }).then(() => {
        console.log("Connected to the DB successfully");
    })
    .catch((err) => {
        console.log(`DB Connection error: ${err}`);
    }) 
}
 
export default connect