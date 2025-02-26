const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
if (process.env.NODE_ENV == "production") {
    console.log = function () { };
}
app.get("/", (req, res) => {
    res.send("Hello Pawan Sharma Project!");
});

// app.use('/invoices', express.static(path.join(__dirname, './controllers/invoices')))
app.use('/invoices', express.static(path.join(__dirname, 'controllers', 'invoices')));


require('./routes/userRoute')(app);
require('./routes/adminRoutes')(app);
require('./routes/vendorRoute')(app);
require('./routes/categoryRoute')(app);
require('./routes/productRoute')(app);
require('./routes/subCategoryRoute')(app);
require('./routes/cartRoute')(app);
require('./routes/couponRoute')(app);
require('./routes/addressRoute')(app);
require('./routes/orderRoute')(app);
require('./routes/paymentRoute')(app);
require('./routes/walletRoute')(app);
require('./routes/OfferRoute')(app);
require('./routes/notificationRoute')(app);
require('./routes/referrRoute')(app);


mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, }).then((data) => {
    console.log(`Mongodb connected with server: ${data.connection.host}`);
});

app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}!`);
});

module.exports = app;