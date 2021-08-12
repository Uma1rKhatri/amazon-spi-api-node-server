"use strict";

const { LWA, AWS } = require("../config/aws.config");
const awssdk = require("aws-sdk");
const { ForbiddenError, InternalServerError } = require('../util/error');
const RequestService = require("./request.service");
const {SPAPIENDPOINT} = require("../constant/index");

class AWSService{

    accessToken;
    #refreshToken;
    #authorizationCode;
    temporaryAccessKey;
    temporarySecretKey;
    sessionToken;
    clientCredential;

    constructor({ refreshToken, authorizationCode }) {
        if (!(refreshToken || authorizationCode)) {
          throw new ForbiddenError({ message: "you must provide seller authorization code or refresh token value" });
        } else {
          this.#refreshToken = refreshToken;
          this.#authorizationCode = authorizationCode;
        }
        if (
          !(
            AWS.ACCESS_KEY &&
            AWS.SECRET_KEY &&
            AWS.ROLE_ARN &&
            AWS.POLICY_ARN
          )
        ) {
          throw new ForbiddenError({ message: "you must define aws access key, secret key, policy & role arn values" }
          );
        }
        if (
          !(
            LWA.GRANT_TYPE &&
            LWA.CLIENT_ID &&
            LWA.CLIENT_SECRET
          )
        ) {
          throw new ForbiddenError({ message: "you must define grantType, clientId, clientSecret" }
          );
        }
      }
    
      async loginWithAmazonAccessToken() {
        try {
          const response = await new RequestService({
            method: "POST",
            url: SPAPIENDPOINT.LWA,
            body: {
              grant_type: LWA.GRANT_TYPE.REFRESH_TOKEN,
              client_id: LWA.CLIENT_ID,
              client_secret: LWA.CLIENT_SECRET,
              refresh_token: this.#refreshToken,
            },
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
          }).sendHTTPRequest();
          const { access_token } = JSON.parse(response);
          if (access_token) {
            this.accessToken = access_token;
          }
        } catch (err) {
          throw new InternalServerError({ message: `Error in loginWithAmazonAccessToken`, data: err });
        }
      }
    
      async loginWithAmazonRefreshToken() {
        try {
          const response = await new RequestService({
            method: "POST",
            url: SPAPIENDPOINT.LWA,
            body: {
              grant_type: LWA.GRANT_TYPE.AUTHORIZATION_CODE,
              code: this.#authorizationCode,
              client_id: LWA.CLIENT_ID,
              client_secret: LWA.CLIENT_SECRET,
            },
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
          }).sendHTTPRequest();
          const { refresh_token } = JSON.parse(response);
          if (refresh_token) {
            return refresh_token;
          }
        } catch (err) {
          throw new InternalServerError({ message: `Error in loginWithAmazonRefreshToken`, data: err });
        }
      }
    
      async getTemporaryCredential() {
        try {
          const sts = new awssdk.STS({
            accessKeyId: AWS.ACCESS_KEY,
            secretAccessKey: AWS.SECRET_KEY,
          });
          const { Credentials } = await new Promise((resolve, reject) => {
            sts.assumeRole(
              {
                RoleArn: AWS.ROLE_ARN,
                PolicyArns: [
                  {
                    arn: AWS.POLICY_ARN,
                  },
                ],
                RoleSessionName: AWS.ROLE_SESSION_NAME,
                DurationSeconds: AWS.TEMPORARY_CREDENTIAL_DURATION,
              },
              (err, data) => {
                if (err) {
                  console.error('abc error',err);
                  reject(new InternalServerError({ message: `Error in getTemporaryCredential`, data: err }));
                }
                resolve(data);
              }
            );
          });
          if (Credentials.AccessKeyId)
            this.temporaryAccessKey = Credentials.AccessKeyId;
          if (Credentials.SecretAccessKey)
            this.temporarySecretKey = Credentials.SecretAccessKey;
          if (Credentials.SessionToken)
            this.sessionToken = Credentials.SessionToken;
          const { temporaryAccessKey, sessionToken, temporarySecretKey } = this;
          if (temporaryAccessKey && sessionToken && temporarySecretKey) {
            this.clientCredential = new awssdk.Credentials({
              accessKeyId: temporaryAccessKey,
              secretAccessKey: temporarySecretKey,
              sessionToken: sessionToken,
            });
          }
        } catch (err) {
          throw new InternalServerError({ message: `Error in get getTemporaryCredential`, data: err });
        }
      }
}

module.exports = AWSService;
