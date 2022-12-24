import Twitter from 'twitter';
import axios from 'axios';
import { TwitterApi } from "twitter-api-v2";


const keys = {
	consumer_key: process.env.API_KEY,
	consumer_secret: process.env.API_SECRET_KEY,
	access_token_key: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
	bearer_token: process.env.BEARER_TOKEN,
};

const twitterClient = new TwitterApi({
	appKey: process.env.API_KEY,
	appSecret: process.env.API_SECRET_KEY,
	accessToken: process.env.ACCESS_TOKEN,
	accessSecret: process.env.ACCESS_TOKEN_SECRET,
	bearer_token: process.env.BEARER_TOKEN,
});

const url = "https://api.twitter.com/1.1/users/search.json";

export const connectTwitter = async(req, res) => {
	const data = await twitterClient.v2.usersByUsernames("soc")
	console.log(data, "data");
  res.send("Twitter API connected")
};
