const { ForbiddenError } = require('../util/error');
const {Request} = require("node-fetch");
const request = require('request');
const {URL, URLSearchParams} = require("url");
const crypto = require("crypto-js");

class AWSSignV4Service{

    AwsSignerHelper;
    #clientCredential;

    constructor({clientCredential}){
        if(!(clientCredential)){
            throw new ForbiddenError({ message: "aws client credential is not define" });
        }else{
            this.#clientCredential = clientCredential;
        }
    }

    sign(){

    }

    #createCanonicalRequest({request, signedHeaders}){
        let url = new URL(request.url);
        
        var canonicalizedRequest = new Array();
        // request method
        canonicalizedRequest.push(`${request.method}\n`);
        // request uri parameters
        canonicalizedRequest.push(`${url.pathname}\n`);
        // request query string
        canonicalizedRequest.push(`${url.searchParams.toString()}\n`);
        // request headers
        canonicalizedRequest.push(`${request.headers}\n`);
        // signed headers
        canonicalizedRequest.push(`${signedHeaders}\n`);
        // hash(digest) request body payload
        canonicalizedRequest.push(`${this.#hashRequestPayload(request.body)}`)

        const canonicalRequest = canonicalizedRequest.join("").toString();

        // create hash(digest) of canonical request
        return crypto.SHA256(canonicalRequest).toString(crypto.enc.Hex);
    }

    #hashRequestPayload(body){
        const value = body ? body.toString() : "";
        return crypto.SHA256(value).toString(crypto.enc.Hex);
    }
}