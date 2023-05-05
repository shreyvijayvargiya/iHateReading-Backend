import Twitter from "twitter";
import admin from "firebase-admin";
import { TwitterApi } from "twitter-api-v2";
import _ from "lodash";
import cron from "node-cron";

const client = new Twitter({
	consumer_key: process.env.API_KEY,
	consumer_secret: process.env.API_SECRET_KEY,
	access_token_key: process.env.ACCESS_TOKEN,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET,
	bearer_token: process.env.BEARER_TOKEN,
});

const twitterClient = new TwitterApi({
	appKey: process.env.API_KEY,
	appSecret: process.env.API_SECRET_KEY,
	accessToken: process.env.ACCESS_TOKEN,
	accessSecret: process.env.ACCESS_TOKEN_SECRET,
	bearer_token: process.env.BEARER_TOKEN,
});

export const postTweet = async (req, res) => {
	try {
		const threads = await admin.firestore().collection("threads").orderBy('timeStamp', "desc").get();
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
		const times = [19, 20, 21, 22, 23];
		threadIds.forEach((log, index) => {
			const tweet = cron.schedule(
				`1 ${times[index]} * * *
				 `,
				async () => {
					await twitterClient.v2.tweet(
						`Sharing an interesting thread: ${log.title} \n- 
						https://www.ihatereading.in/t/${log.id}/${log?.title?.replaceAll(
							" ",
							"-"
						)} \n #writerslift #programming #ihatereading #webdev #javascript #Blog #writerlift #Coding #Blog #Blogging  `
					);
				},
				{ scheduled: true, timezone: "IST" }
			);
			tweet.start();
		});

		Promise.all(tweetResponse)
			.then((data) => console.log(data, "data"))
			.catch((error) => console.log(error));
		res.send("Tweet posted");
	} catch (error) {
		console.log(error);
		res.send("Error");
	}
};
