'use strict';

const
    bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    apiWebHook = require('./src/ApiWebHook.js'),
    facebookReply = require('./src/FacebookReply.js');

const
    apiWebHookHandler = apiWebHook.apiWebHookHandler,
    senderAction = facebookReply.senderAction;

const app = express();
const ClientValidationToken = process.env.validationToken || config.validationToken;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/', (req, res) => {
    res.send("The Server Is Hot");
});

app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === ClientValidationToken) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
    }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
    function getText(event) {
        if (event.postback) {
            return event.postback.payload;
        }
        return event.message.text;
    }

    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                let sender = event.sender.id;
                let text = getText(event);
                if (text) {
                    senderAction(sender, text);
                }
            });
        });
        res.status(200).end();
    }
});

app.post('/ai', apiWebHookHandler);