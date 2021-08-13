const passport = require("passport");
const {Strategy} = require("passport-local");
const UserService = require("../service/user.service");
const { UnauthorizedError, BadRequestError } = require('./error');

passport.use("local",new Strategy({usernameField : "email"},async(username, password, done) => {
    try{
        console.log("inside passport");
        const userService = new UserService({ email: username });
        const user = await userService.login({password : password});
        console.log('user',user);
        const isMatch = await user.verifyPassword(password);
        if (!isMatch) {
            return done(new UnauthorizedError({ message: 'Invalid email or password' }));
        }
        return done(null, user);
    }
    catch(err){
        console.log('err',err);
        return done(err);
    }
}))

module.exports = passport;