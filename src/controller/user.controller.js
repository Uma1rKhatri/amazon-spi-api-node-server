const express = require("express");
const route = express.Router({strict : true});
const UserService = require("../service/user.service");
const { InternalServerError, BadRequestError } = require("../util/error");
const { OKSuccess, CreatedSuccess } = require("../util/success");
const passport = require("passport");

route.post("/", async (req, res) => {
    try {
        const { body } = req;
        const userService = new UserService({});
        await userService.registration(body);
        res.status(CreatedSuccess.status).send(new CreatedSuccess({
            data: `user registered successfully`
        }));
    }
    catch (err) {
        console.log('err', err);
        res.status(err.status ? err.status : InternalServerError.status).send(err);
    }
})

route.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userService = new UserService({ id: id });
        res.status(OKSuccess.status).send(new OKSuccess({
            data: await userService.getUser()
        }));
    }
    catch (err) {
        res.status(err.status ? err.status : InternalServerError.status).send(err);
    }
})

route.post('/login', passport.authenticate('local', { session: false }), async (req, res) => {
    const { body } = req;
    const { email, password } = body;
    console.log('req.user', req.user);
    res.status(OKSuccess.status).send(new OKSuccess({
        data: {
            jwt: req.user.createLoginJWT()
        }
    }))
}, function (err) {
    console.log('err', err);
})

route.post('/authorize/region/:id', async (req, res) => {
    try {
        const { params, body } = req;
        const { id } = params;
        const userService = await UserService.checkUser(id);
        const { region } = body;
        if(!region){
            throw new BadRequestError({message : `region is not define`});
        }
        await userService.authorizeRegion(region);
        res.status(OKSuccess.status).send(new OKSuccess({
            data: {
                url: userService.generateRedirectURL(region)
            }
        }));
    }
    catch (err) {
        console.log('err',err);
        res.status(err.status ? err.status : InternalServerError.status).send(err);
    }
})

route.get('/authorize/redirect', passport.authenticate('region-authorization', { session: false }), async (req, res) => {
    try {
        const { query } = req;
        console.log('req.user',req.user);
        if (req.user){
            var { user, region } = req.user;
        }
        const userService = await UserService.checkUser(user);
        await userService.setOAuthCredential(query, region);
        // on successfully saving the OAuth credentials you can redirect to your application
        res.redirect(`https://advisell-ui.netlify.app/auth/sign-in`);
    }
    catch (err) {
        console.log('err',err);
        res.status(err.status ? err.status : InternalServerError.status).send(err);
    }
})

module.exports = route;