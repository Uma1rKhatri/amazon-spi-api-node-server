"use strict";
const request = require('request');
const { ForbiddenError, InternalServerError } = require('../util/error');

class RequestService {
    #method;
    #url;
    #params;
    #body;
    #headers;
    constructor({ method, url, params, body, headers }) {
        if (!(method && url)) {
            throw new ForbiddenError({ message: 'You must pass method & url' });
        }
        this.#method = method;
        this.#url = url;
        this.#params = params;
        this.#body = body;
        this.#headers = headers;
    }

    async sendHTTPRequest() {

        let option = {
            'method': this.#method,
            'url': this.#url,
            'headers': this.#headers,
        }
        if (this.#method == 'POST') {
            switch (this.#headers['content-type']) {
                case 'application/x-www-form-urlencoded': {
                    option['form'] = this.#body;
                    break;
                }
                case 'application/json': {
                    option['body'] = this.#body;
                    // option['json'] = true;
                    break;
                }
                default: {
                    option['body'] = this.#body;
                    // option['json'] = true;
                    break;
                    // throw new InternalServerError({ message: 'Invalid content-type of the request' });
                }
            }
        }

        return await new Promise((resolve, reject) => {
            request(option, (error, response, body) => {
                if (error) {
                    reject(new InternalServerError({ message: 'send http request error', data: error }));
                } else {
                    resolve(body);
                }

            })
        })

    }

}

module.exports = RequestService;