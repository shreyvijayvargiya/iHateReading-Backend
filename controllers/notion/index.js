import { Client } from "@notionhq/client";

export const getNotionData = async(req, res) => {
  const notion = new Client({
    auth: process.env.NOTION_TOKEN 
  });
  const data = await notion.pages.retrieve({
		page_id: "8fc3147ff12a49f0892857f56e06d567",
	});
  res.send(data);
}

// automate the notion table creating process


// Take user input in JSON, Yaml or simple text format for forms and create notion table out of it and even store it in database 