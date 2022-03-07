const courier = require('../../utils/CourierClient');
const admin = require("firebase-admin");
const { lists } = require('../../utils/CourierClient');

const sendLogEmail = async(req, res) => {
    const { logIds } = req.body;
    const db = admin.database().ref("articles/publish");
    const data = (await db.once("value")).val();

    const logsData = [];
    
    const filterLogs = async() => {
        await logIds.forEach(item => {
            if((Object.keys(data)).includes(item)) {
                const title = data[item].title.replaceAll(" ", "-")
                const newObj = {
                    ...data[item],
                    id: item,
                    link: `https://www.ihatereading.in/log?id=${item}&title=${title}`
                };
                logsData.push(newObj)
            }
        });
    };
    filterLogs();
    try{ 
        const { requestId } = await courier.send({
            message: {
                data: {
                    logsData: logsData
                },
                to: [
                    {
                        email: 'shreyvijayvargiya26@gmail.com'
                    }
                ],
                template: 'GCPDH98BDX4APJG7G18VNQRAKNYF',
            },
        });
        res.send({
            success: true,
            data: requestId,
            error: false,
            message: null
        });
    }catch(e){
        console.log(e, 'error in sending messaged')
        res.send({
            success: false,
            data: null,
            error: true,
            message: e
        })
    }
};

const sendListToCourier = async(req, res) => {
    const db = admin.database().ref("users");
    const users = (await db.once("value")).val();
    const usersKeys = Object.keys(users);
    const lists = usersKeys.map(key => {
        if(users[key].userEmail){
            const email = users[key].userEmail;
            const list_id = users[key].userId;
            return { name: email, id: list_id }
        }
    });
    try{
        lists.map(async(item) => {
            await courier.lists.put(item.email, {
                name: "Emails lists ",
                id: item.id
            });
        })
        res.send('Done');
    }catch(e){
        console.log(e);
        res.send({ error: e, data: null })
    }
};

const getLists = async(req, res) => {
    const lists = await courier.lists.list();
    res.send(lists);
};

const addUserInList = async(req, res) => {
    const email = req.body.email;
    try {
        await courier.lists.put('Dummy-Emails', { name: email });
        res.send("Added in the lists")
    }catch(e) {
        console.log(e,'error');
        res.send('Error in adding email in the lists')
    }
}

const sendSignUpEmail = async(req, res) => {
    const { email } = req.body;
    try {
        const { requestId } = await courier.send({
            message: {
                to: {
                    email: email
                },
                template: 'GCPDH98BDX4APJG7G18VNQRAKNYF',
            }
        });
        res.send({ 
            data: requestId,
            success: true,
            error: false,
            message: ''
        })

    }catch(e){
        console.log(e, 'e');
        res.send({
            data: null,
            message: e,
            error: true,
        });
    }
};
const sendFirstEmail = async(req, res) => {
    const { userName, userEmail } = req.body.data;
    try{ 
        const { requestId } = await courier.send({
            message: {
                data: {
                        receiptName: userName
                    },
                to: {
                    email: userEmail
                },
                template: 'EKZZAQHHN5MY70KEJWYVBNCE8Y85',
            },
        });
        res.send({
            success: true,
            data: requestId,
            error: false,
            message: null
        });
    }catch(e){
        console.log(e, 'error in sending messaged')
        res.send({
            success: false,
            data: null,
            error: true,
            message: e
        })
    }
}
const subscribeLists = async(req, res) => {
    try{
        const data = await courier.lists.postSubscriptions("Dummy-Emails", [{ recipientId: '' }] );
        res.send("Done")
    }catch(e){
        console.log(e, 'e');
        res.send("Error")
    }
};

const addRecipient = async(req, res) => {
    const { status: recipientId } = await courier.replaceProfile({ recipientId: req.body.id, profile: { email: req.body.email }})
    res.send({
        success: true,
        message: "User added",
        data: recipientId,
        error: false
    })
}



module.exports = { sendLogEmail, sendListToCourier, addUserInList, getLists, sendSignUpEmail, subscribeLists, addRecipient, sendFirstEmail };
