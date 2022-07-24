import { CourierClient } from "@trycourier/courier";
import dotenv from "dotenv";

dotenv.config();
const { COURIER_AUTH_TOKEN } = process.env;
export const courier = CourierClient({
	authorizationToken: COURIER_AUTH_TOKEN,
});
