const mongoose = require("mongoose");
const uuid = require("uuid");
const {USERSTATUS} = require("../enum/index");

const schemaOptions = {
    timestamps : true,
    toJSON : {
        virtuals : true
    }
}

const schema = new mongoose.Schema({
    id : {
        type : String,
        required : true,
        index : true,
        default : () => {
            return uuid.v4();
        }
    },
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase : true,
        index : true
    },
    password : {
        type : String,
        required : true
    },
    status : {
        type : String,
        required : true,
        enums : Object.values(USERSTATUS),
        default : USERSTATUS.REGISTRATION
    },
    isActive : {
        type : Boolean,
        default : true
    },
    isDelete : {
        type : Boolean,
        default : false
    }
},schemaOptions);

const User = mongoose.model('user',schema);
module.exports = User;