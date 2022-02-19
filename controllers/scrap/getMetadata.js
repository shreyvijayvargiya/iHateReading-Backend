const urlMetaData = require("url-metadata");

const getMetaData = async(req, res) => {
    const response = {
        data: null,
        message: '',
        error: false
    };
    const link = req.body.link;   
    if(!link){
        response.error = true;
        response.message = 'Please send link';
        res.send(response)
    }else {
        const metadata = await urlMetaData(link);
        response.data = {
            title: metadata?.title,
            thumbnail: metadata.image,
            description: metadata?.description,
            author: metadata.author,
            link: link
        }
        res.send(response)
    }
}

module.exports = getMetaData;
