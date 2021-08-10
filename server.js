require("dotenv").config({
    path: `./.env`,
});

const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(
    bodyParser.urlencoded({extended : true})
);
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Custom-header"
    );
    // in case we need to use our custom created header in application
    res.header("Access-Control-Expose-Headers", "X-Custom-header");
    next();
});

app.listen(process.env.PORT,() => {
    console.log(`server running at port ${process.env.PORT}`);
})
require("./src/config/db.config");