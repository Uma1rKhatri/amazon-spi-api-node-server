const express = require("express");
const route = express.Router({caseSensitive : true});
const UserService = require("../service/user.service");
const {InternalServerError} = require("../util/error");
const { OKSuccess, CreatedSuccess } = require("../util/success");

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

module.exports = route;