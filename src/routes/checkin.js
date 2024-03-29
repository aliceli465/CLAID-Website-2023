const multer = require('multer');
const upload = multer();
const express = require('express');
const router = express.Router();
const { MongoClient, ServerApiVersion } = require('mongodb');

const { checkUserExists, checkEventExists, checkAlreadyCheckedIn, createUser, updateUser, getEventPoints } = require('../helpers');
const uri = process.env.MONGODB_URI;

router.post('/', upload.none(), async (req, res) => {
    try {
        const { name, email, event_code } = req.body;

        //initialize client
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        await client.connect();

        const userExists = await checkUserExists(client, email);
        const eventExists = await checkEventExists(client, event_code);
        const alreadyCheckedIn = await checkAlreadyCheckedIn(client, email, event_code);

        if(eventExists) {
            if(userExists) {
                if(!alreadyCheckedIn) {
                    await updateUser(client, email, event_code);
                    //update leader board here
                }
                else{
                    res.send("already checked in");
                }
            }
            else{
                await createUser(client, name, email, event_code);
            }
            res.send("success")
        }
        //event does not exist
        else{
            res.send("invalid event code");
        }

        await client.close();
    } catch (error) {
        res.send("failure")
    }
});

module.exports = router;