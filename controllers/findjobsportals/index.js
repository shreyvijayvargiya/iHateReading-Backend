import axios from "axios";
import { load } from "cheerio";

const fetchData = async (link) => {
	let items = [];
	const data = await axios.get(link);
	const $ = load(data.data, { xmlMode: true });
  if(data){
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
  }
	return items;
};
export const resumeBuildingWebsite = async (req, res) => {
	try {
		const { websites } = req.body;
		const requests = websites.map(async (item) => {
      const metadata = await fetchData(item.website);
      if(metadata){
        return metadata
      }else {
        return null
      }
    });
    const results = await Promise.all(requests);
		res.send(results);
	} catch (e) {
		console.log(e, "error");
		res.send("Error");
	}
};
