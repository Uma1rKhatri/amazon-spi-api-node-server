const {REGION} = require('../enum/index');


const signatureURI = Object.freeze({
    [REGION.NORTH_AMERICA] : 'https://sellingpartnerapi-na.amazon.com',
    [REGION.EUROPE] : 'https://sellingpartnerapi-eu.amazon.com',
    [REGION.FAR_EAST] : 'https://sellingpartnerapi-fe.amazon.com'
})

module.exports = signatureURI;