'use strict';

const
    bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    data = require('./src/data.js'),
    apiWebHook = require('./src/ApiWebHook.js'),
    facebookReply = require('./src/FacebookReply.js');

const
    fastrackSummaryDetails = apiWebHook.fastrackSummaryDetails,
    apiWebHookHandler = apiWebHook.apiWebHookHandler,
    sendMessage = facebookReply.sendMessage,
    senderAction = facebookReply.senderAction;

const app = express();
const ClientValidationToken = config.get('validationToken');
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
app.get('/summary', function (req, res) {
    let index = parseInt(req.query.q, 10);

    let html_data = "<form id='redir' action='https://et2-m-virgintrains.ttlnonprod.com/buy/purchase_ticket_request' method='POST'>" +
        "<textarea rows='15' cols='50' name='journey' style='display: none'>" + data.getPostData(fastrackSummaryDetails.summaryList[index]).toString() +
        "</textarea>" +
        "</form>" +
        "<script>document.getElementById('redir').submit()</script>";
    res.send(html_data);
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
                console.log(event);
                let sender = event.sender.id;
                let text = getText(event);
                if (text) {
                    senderAction(sender);
                    sendMessage(sender, text);
                }
            });
        });
        res.status(200).end();
    }
});

app.post('/ai', apiWebHookHandler);