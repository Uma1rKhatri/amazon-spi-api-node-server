const express = require("express");
const route = express.Router({ strict: true });
const SPAPIService = require("../service/sp-api-service");
const { InternalServerError, BadRequestError } = require("../util/error");
const { OKSuccess, CreatedSuccess } = require("../util/success");
const UserService = require("../service/user.service");


route.get("/:id/:region", async (req, res) => {
    try {
        const { params,query } = req;
        const { id, region } = params;
        // const {MarketplaceIds, CreatedAfter} = query;
        const userService = await UserService.checkUser(id);
        if(!region){
            return res.status(BadRequestError.status).send(new BadRequestError({message : `region is not define`}));
        }
        const regionExist = userService.isRegionExist(region);
        if (!regionExist) {
            return res.status(BadRequestError.status).send(new BadRequestError({ message: `region ${region} doesn't exist` }));
        }
        if(!(regionExist["isAuthorized"] && regionExist["refreshToken"])){
            return res.status(BadRequestError.status).send(new BadRequestError({ message: `region ${region} is not authorized by user` }));
        }
        const spApiService = new SPAPIService({
            refreshToken: regionExist["refreshToken"],
            region: regionExist["region"]
        });
        const response = await spApiService.callAPI({
            method: "GET",
            endpoint: "/fba/inventory/v1/summaries",
            // path: {
            //     orderId : "114-6408901-7137035"
            // },
            // query: {
            //     MarketplaceIds: "A2EUQ1WTGCTBG2",
            //     CreatedAfter : "2020-12-01T08:02:32Z",
            //     // LastUpdatedAfter: "2020-12-01T08:02:32Z"
            // },
            query : query,
            headers: {
                "content-type": "application/json"
            }
        })
        res.status(OKSuccess.status).send(new OKSuccess({
            data : response
        }));
    }
    catch (err) {
        console.log('err',err);
        res.status(err.status ? err.status : InternalServerError.status).send(err);
    }
})

module.exports = route;


