const UserModel = require("../model/user.model");
const { NotFoundError, ConflictError } = require("../util/error");

class UserService {
    #id;
    #email;
    #user;
    
    constructor({id, email, user}){
        if(id)
        this.#id = id;
        if(email)
        this.#email = email
        if(user)
        this.#user = user;
    }
    static async checkUser(id){
        const user = UserModel.findOne({
            '$or' : [
                {
                    id : id
                }
            ]
        });
        if(!user){
            throw new NotFoundError({message : `user not found by ${id}`});
        }
        return new UserService({user : user, id : id})
    }

    async getUser(){
        const user = UserModel.findOne({
            '$or' : [
                {
                    id : this.#id
                },
                {
                    email : this.#email
                }
            ]
        });
        return user;
    }

    async #isEmailExist(email){
        return UserModel.exists({email : email});
    }

    async registration(payload){
        const {email} = payload;
        const isEmailExist = await this.#isEmailExist(email);
        if(isEmailExist){
            throw new ConflictError({message : `email already exist by ${email}`})
        }
        const user = new UserModel(payload);
        return user.save();
    }
}

module.exports = UserService;