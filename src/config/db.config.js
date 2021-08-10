const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URI,
    {
        useNewUrlParser : true,
        useUnifiedTopology : true,
        useFindAndModify : true,
        useCreateIndex : true
    }).then(() => {
        console.log('mongodb connected successfully');
    }).catch((err) => {
        console.error('error while connecting mongodb',err);
    })