const express = require('express')
const app = express()

app.use(express.json())
const port = process.env.PORT

const { socketRoute } = require('./socket/socketRoutes')

const https = require('http')

const cors = require('cors')
app.use(cors("*"))

const mongoose = require('mongoose')
const dbUrl = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
mongoose.connect(dbUrl, option)
    .then(() => {
        console.log('----------------------------db connected successfully-----------------------------');
        const httpsServer = https.createServer(app);
        const server = httpsServer.listen(port, function () {
            console.log('-----------------------------------------', `http://localhost:${process.env.PORT}`, '----------------------------------------------------');
            socketRoute(this)
        });
        module.exports = server;
    }).catch((err) => {
        console.log('Error connecting to database:', err);
        process.exit(1);
    });

// const ratelimiter = require('express-rate-limit')
// const limiter = ratelimiter(
//     {
//         limit: 100,
//         max: 100, 
//         message: 'Too many login attempts, please try again later.'
//     }
// )
// app.use(limiter)


const route = require('./routes/router')
app.use('/user', route)

app.get("/", (req, res, next) => {
    res.status(200).json({ status: 200, message: "Hello from servers" });
});

// app.listen((process.env.PORT, function () {
//     console.log('-----------------------------------------', `http://localhost:${process.env.PORT}`, '----------------------------------------------------');
// }))