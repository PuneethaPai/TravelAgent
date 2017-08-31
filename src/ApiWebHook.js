const
    request = require('request'),
    config = require('config'),
    stations = require("../assets/stations.json"),
    extractUserPreferenceTrain = require('./UserPrefernce.js').extractUserPreferedTrain,
    dayTimeMap = {
        "morning": '06:00',
        "afternoon": '12:00',
        "evening": '16:00',
        "night": '20:00'
    };

let
    serverURL = process.env.serverURL || config.serverURL,
    listViewDetails = require('./GetTrainlineScheduleView.js').listViewDetails,
    searchParameters = {},
    journey = {};


function apiWebHookHandler(req, res) {

    function validate(stationName) {
        let station = stationName.toLowerCase();
        if (!stations[station]) {
            return res.json({
                speech: "The " + station + " is not a Valid Station",
                displayText: "The " + station + " is not a Valid Station",
                source: 'fetch_schedule'
            });
        }
    }

    let
        action = req.body.result.action,
        parameters = req.body.result.parameters,
        journeyTime = dayTimeMap[parameters['time']],
        source = parameters['source'],
        destination = parameters['destination'],
        date = parameters['journey-date'],
        seat = parseInt(parameters['seats'], 10);

    if (action === 'fetch_schedule') {
        if (source !== "") {
            validate(source);
        }
        if (destination !== "") {
            validate(destination);
        }
        if (source !== "" && destination !== "") {
            let source_code = stations[source.toLowerCase()];
            let destination_code = stations[destination.toLowerCase()];
            if (destination_code === source_code) {
                return res.json({
                    speech: "Great I guess You Are Already There\nHave a great time",
                    displayText: "... Great I guess You Are Already There\nHave a great time",
                    source: 'fetch_schedule'
                });
            }
        }
        if (date === "" || !/^[2][0][1][7]-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/.test(date)) {
            console.log("Ask date");
            date = "";
            return res.json({
                speech: "Ask Date",
                displayText: "Ask Date",
                source: 'fetch_schedule'
            });
        }
        if (journeyTime === undefined) {
            console.log("Ask Time");
            return res.json({
                speech: "Ask Time",
                displayText: "Ask Time",
                source: 'fetch_schedule'
            });
        }

        let source_code = stations[source.toLowerCase()];
        let destination_code = stations[destination.toLowerCase()];
        journey.source = source;
        journey.destination = destination;
        searchParameters.source = source_code;
        searchParameters.destination = destination_code;
        searchParameters.date = date;
        searchParameters.time = journeyTime;
        searchParameters.numberOfAdults = seat;
        console.log("Search Parameters:-");
        console.log(searchParameters);
        let url = serverURL + "schedule/?source=" + source_code + "&destination=" + destination_code + "&day=" + date + "&time=" + journeyTime + "&seats=" + seat;
        console.log(url);
        let options = {
            url: url,
            method: 'GET',
        };
        request(options, (err, response) => {
            if (!err && response.statusCode === 200) {
                let json = JSON.parse(response.body);
                journey.schedule = json.schedule;
                return res.json({
                    speech: "Schedule",
                    displayText: "Schedule",
                    source: 'fetch_schedule'
                });
            } else {
                console.log("Failed to get Schedule");
                return res.status(400).json({
                    status: {
                        code: 400,
                        errorType: 'I failed to look up the Schedule'
                    }
                });
            }
        });
    }

    let preference = parameters['Preferences'];

    if (action === 'apply_preferences' && preference !== "" && listViewDetails.journeyList.length > 0) {
        return res.json(extractUserPreferenceTrain(listViewDetails, preference, seat))
    }
}

module.exports = {
    apiWebHookHandler: apiWebHookHandler,
    searchParameters: searchParameters,
    journey: journey
};