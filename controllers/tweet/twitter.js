import Twitter from 'twitter';

const twitterClient = new Twitter({
	consumer_key: process.env.API_KEY,
	consumer_secret: process.env.API_SECRET_KEY,
	access_token_key: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
	bearer_token: process.env.BEARER_TOKEN,
});


const postTweet = async(req, res) => {
  twitterClient.post("Hello world");
  res.send("Tweet posted")
}