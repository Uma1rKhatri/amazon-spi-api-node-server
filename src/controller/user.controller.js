const express = require("express");
const route = express.Router({caseSensitive : true});
const UserService = require("../service/user.service");
const {InternalServerError} = require("../util/error");
const { OKSuccess, CreatedSuccess } = require("../util/success");
const passport = require("passport");

route.post("/",async(req,res) => {
    try{
        const {body} = req;
        const userService = new UserService({});
        await userService.registration(body);
        res.status(CreatedSuccess.status).send(new CreatedSuccess({
            data : `user registered successfully`}));
    }
    catch(err){
        console.log('err',err);
        res.status(err.status ? err.status : InternalServerError.status).send(err);
    }
})

route.get("/:id",async(req,res) => {
    try{
        const {id} = req.params;
        const userService = new UserService({id : id});
        res.status(OKSuccess.status).send(new OKSuccess({
            data : await userService.getUser()
        }));
    }
    catch(err){
        res.status(err.status ? err.status : InternalServerError.status).send(err);
    }
})

route.post('/login',passport.authenticate('local',{session : false}), async(req,res) => {
    const {body} = req;
    const {email,password} = body;
    console.log('req.user',req.user);
    res.status(OKSuccess.status).send(new OKSuccess({
        data : {
            jwt : req.user.createLoginJWT()
        }
    }))
},function(err) {
    console.log('err',err);
})

module.exports = route;