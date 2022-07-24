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
		const threads = await admin.firestore().collection("threads").get();
		const allThreads = threads.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));
		const tweetResponse = _.shuffle(allThreads)
			.slice(0, 4)
			.map(async (log) => {
				return { message: "Done" };
			});
		const threadIds = _.shuffle(allThreads).slice(0, 4);
		const firstTweet = cron.schedule(
			` 0 21 * * * *`,
			async () => {
        const log = threadIds[0];
				await twitterClient.v2.tweet(
					`https://www.ihatereading.in/t/${log.id}/${log?.title?.replaceAll(
						" ",
						"-"
					)} \n #writerslift #programming #ihatereading #webdev #javascript #blogger #design`
				);
			},
			{ scheduled: true, timezone: "IST" }
		);
		const secondTweet = cron.schedule(
			` 0 22 * * * *`,
			async () => {
        const log = threadIds[1];
				await twitterClient.v2.tweet(
					`https://www.ihatereading.in/t/${log.id}/${log?.title?.replaceAll(
						" ",
						"-"
					)} \n #writerslift #programming #ihatereading #webdev #javascript #blogger #design`
				);
			},
			{ scheduled: true, timezone: "IST" }
		);
		const thirdTweet = cron.schedule(
			` 0 23 * * * *`,
			async () => {
        const log = threadIds[2];
				await twitterClient.v2.tweet(
					`https://www.ihatereading.in/t/${log.id}/${log?.title?.replaceAll(
						" ",
						"-"
					)} \n #writerslift #programming #ihatereading #webdev #javascript #blogger #design`
				);
			},
			{ scheduled: true, timezone: "IST" }
		);
		const fourthTweet = cron.schedule(
			` 3 0 * * * *`,
			async () => {
        const log = threadIds[3];
				await twitterClient.v2.tweet(
					`https://www.ihatereading.in/t/${log.id}/${log?.title?.replaceAll(
						" ",
						"-"
					)} \n #writerslift #programming #ihatereading #webdev #javascript #blogger #design`
				);
			},
			{ scheduled: true, timezone: "IST" }
		);
		firstTweet.start();
		secondTweet.start();
		thirdTweet.start();
		fourthTweet.start();
		Promise.all(tweetResponse)
			.then((data) => console.log(data, "data"))
			.catch((error) => console.log(error));
		res.send("Tweet posted");
	} catch (error) {
		console.log(error);
		res.send("Error");
	}
};
