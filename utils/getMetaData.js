import axios from "axios";
import { load } from "cheerio";

export default async function getMetaData(link) {
	const data = await axios.get(link);
	const $ = load(data.data, { xmlMode: true });

	const items = [];

	$("meta").each((index, element) => {
		if (element.name === "meta") {
			items.push({
				name: element.attribs.name || element.attribs.property,
				value: element.attribs.content,
			});
		} else {
			return null;
		}
	});
	return items;
}
