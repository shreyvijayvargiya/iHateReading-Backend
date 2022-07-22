const { CourierClient } = require("@trycourier/courier");
const dotenv = require("dotenv");

dotenv.config();
const { COURIER_AUTH_TOKEN } = process.env
const courier = CourierClient({
    authorizationToken: COURIER_AUTH_TOKEN
});
module.exports = courier;

