import admin from "firebase-admin";
import { TwitterApi } from "twitter-api-v2";
import _ from "lodash";
import cron from "node-cron";

const twitterClient = new TwitterApi({
	appKey: process.env.API_KEY,
	appSecret: process.env.API_SECRET_KEY,
	accessToken: process.env.ACCESS_TOKEN,
	accessSecret: process.env.ACCESS_TOKEN_SECRET,
	bearer_token: process.env.BEARER_TOKEN,
});

export const postTweet = async (req, res) => {
	try {
		const threads = await admin
			.firestore()
			.collection("threads")
			.orderBy("timeStamp", "desc")
			.get();
		const allThreads = threads.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		const tweetResponse = _.shuffle(allThreads)
			.slice(0, 4)
			.map(async (log) => {
				return { message: "Done" };
			});
		const threadIds = _.shuffle(allThreads).slice(0, 5);
		threadIds.forEach((log, index) => {
			const tweet = cron.schedule(
				`0 * * * *`,
				async () => {
					await twitterClient.v2.tweet(
						`Today's thread ${log.title} \n- 
						https://www.ihatereading.in/t/${log.id}/${log?.title?.replaceAll(
							" ",
							"-"
						)} \n #webdev #programming #ihatereading #${log[tags][0]} #${log[tags][1]}`
					);
				},
				{ scheduled: true, timezone: "IST" }
			);
			tweet.start();
		});
		Promise.all(tweetResponse)
			.then((data) => console.log(data, "data"))
			.catch((error) => console.log(error));
		res.send({
			status: true,
			message: "Tweet posted",
		});
	} catch (error) {
		console.log(error);
		res.send("Error");
	}
};

export const fetchTweetContent = async(req, res) =>{
	let response = {
		status: null,
		success: false,
		data: null,
		error: null
	}
	try {
		const { url } = req.body;
		const response = await twitterClient.v2.get(url);
		console.log(response, 'response')
		res.send(response.data);
	}catch(e){
		console.log(e, 'e')
		response.error = e;
		response.status = 400;
		res.send(response)
	}
}