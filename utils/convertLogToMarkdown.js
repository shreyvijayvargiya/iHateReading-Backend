const admin = require("firebase-admin");
const TurndownService = require("turndown");

const convertLogToMarkdown = async({ logId }) => {
	const dbRef = await admin.database().ref(`articles/publish/${logId}`);
	const log = await (await dbRef.once("value")).val();
	const turndownService = new TurndownService();
  let finalLog = "";
  log.data.map(item => {
    if(item.type === 'paragraph' || item.type === 'header'){
      const markdown = turndownService.turndown(item.data.text);
      finalLog = finalLog + markdown + '. <br /> ';
    }else if(item.type === 'list') {
      
    }
  })
	console.log(finalLog, "markdown");
	return log;
};

module.exports = convertLogToMarkdown;
