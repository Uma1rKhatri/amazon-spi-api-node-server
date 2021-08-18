const { REGION,SPAPIURI } = require("../enum/index");

class SPAPIService {

    #region;
    refreshToken;
    accessToken;
    credential;

    constructor({ region }) {
        if (!region) {

        } else {
            this.#region = region;
        }
    }


    callAPI({ method, endpoint, path, query, body, headers }) {

        var url = new URL(SPAPIURI[this.#region]);
        //path will the required paramters for that endpoint
        url.pathname = `${endpoint}/${path}`;
        if (query) {
            var searchParams = new URLSearchParams();
            for (let key in query) {
                searchParams.append(key, query[key]);
            }
            url.searchParams = searchParams.toString();
        }
    }

    
}