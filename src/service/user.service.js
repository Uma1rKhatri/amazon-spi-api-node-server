"use strict";

const UserModel = require("../model/user.model");
const { NotFoundError, ConflictError, BadRequestError, ForbiddenError } = require("../util/error");
const { REGION } = require("../enum/index");
const AWSService = require("../service/aws.service");

class UserService {
    #id;
    #email;
    #user;

    constructor({ id, email, user }) {
        if (id)
            this.#id = id;
        if (email)
            this.#email = email
        if (user)
            this.#user = user;
    }
    static async checkUser(id) {
        const user = await UserModel.findOne({
            '$or': [
                {
                    id: id
                }
            ]
        });
        if (!user) {
            throw new NotFoundError({ message: `user not found by ${id}` });
        }
        return new UserService({ user: user, id: id })
    }

    async getUser() {
        const user = UserModel.findOne({
            '$or': [
                {
                    id: this.#id
                },
                {
                    email: this.#email
                }
            ]
        });
        return user;
    }

    async #isEmailExist(email) {
        return UserModel.exists({ email: email });
    }

    async registration(payload) {
        const { email } = payload;
        const isEmailExist = await this.#isEmailExist(email);
        if (isEmailExist) {
            throw new ConflictError({ message: `email already exist by ${email}` })
        }
        const user = new UserModel(payload);
        return user.save();
    }

    async login(payload) {
        const { password } = payload;
        this.#user = await this.getUser();
        if (!this.#user) {
            throw new BadRequestError({ message: `The email address ${this.#email} is not associated with any account.` });
        }
        if (!this.#user.isActive) {
            throw new ForbiddenError({ message: `Seller account has been deactivated ${this.#email}` });
        }
        return this.#user;
    }

    async authorizeRegion(region) {
        if(!Object.values(REGION).includes(region)){
            throw new BadRequestError({message : `region value is incorrect`});
        }
        if (this.isRegionExist(region)) {
            throw new BadRequestError({ message: `region ${region} already authorized for user ${this.#user.id}` });
        }
        this.#user.authorization = [...this.#user.authorization,{region : region}];
        return this.#user.save();
    }

    isRegionExist(region) {
        if (this.#user.authorization && this.#user.authorization.length > 0)
            return this.#user.authorization.find((f) => f.region == region);
        this.#user.authorization = [];
    }

    generateRedirectURL(region) {
        const token = this.#user.createRegionAuthorizationJWT(region);
        let redirectURL;
        switch (region) {
            case REGION.NORTH_AMERICA: {
                redirectURL = `https://sellercentral.amazon.com/apps/authorize/consent?application_id=amzn1.sellerapps.app.b46c0843-2b1b-48b8-99f6-2aa713bba376&state=${token}&version=beta`;
                break;
            }
            case REGION.EUROPE: {
                redirectURL = `https://sellercentral-europe.amazon.com/apps/authorize/consent?application_id=amzn1.application-oa2-client.2c26482ec53e40eeaf8102b201018cf1&state=${token}&version=beta`;
                break;
            }
            case REGION.FAR_EAST: {
                redirectURL = `https://sellercentral.amazon.com.au/apps/authorize/consent?application_id=amzn1.application-oa2-client.2c26482ec53e40eeaf8102b201018cf1&state=${token}&version=beta`;
                break;
            }
            default: {
                throw new BadRequestError({ message: `invalid region ${region}` })
            }
        }
        return redirectURL;
    }

    async setOAuthCredential(queryParams, region) {
        const { spapi_oauth_code, state, selling_partner_id } = queryParams;
        const regionExist = this.isRegionExist(region);
        if (!regionExist) {
            throw new BadRequestError({ message: `region ${region} doesn't exist` });
        }
        regionExist["credential"] = {
            authCode: spapi_oauth_code,
            state: state,
            sellingPartnerId: selling_partner_id
        };
        regionExist["isAuthorized"] = true;
        const awsService = new AWSService({ authorizationCode: spapi_oauth_code });
        const { refresh_token } = await awsService.loginWithAmazonRefreshToken();
        regionExist["refreshToken"] = refresh_token;
        return this.#user.save();
    }
}

module.exports = UserService;