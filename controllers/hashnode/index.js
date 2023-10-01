import axios from "axios";

const getHashnodePosts = async() => {
  const token = process.env.HASHNODE_TOKEN;
  const data = await axios.post("https://api.hashnode.com/", {
		headers: {
			"Content-Type": "application/json",
		},
    body: {
      query
    }
	});
  console.log(data.data);

}