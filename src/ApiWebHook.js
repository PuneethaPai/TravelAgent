const
    request = require('request'),
    stations = require("../assets/stations.json"),
    extractUserPreferenceTrain = require('./UserPrefernce.js').extractUserPreferedTrain,
    dayTimeMap = {
        "morning": '06-00',
        "afternoon": '12-00',
        "evening": '16-00',
        "night": '20-00'
    };

let
    listViewDetails = require('./GetTrainlineScheduleView.js').listViewDetails,
    searchParameters = {},
    journey = {};


function apiWebHookHandler(req, res) {

    function validate(stationName, Label) {
        if (!stations[stationName.toUpperCase()]) {
            return res.json({
                speech: "The " + Label + " is Incorrect",
                displayText: "The " + Label + " is Incorrect",
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
            validate(source, "Source");
        }
        if (destination !== "") {
            validate(destination, "Destination");
        }
        if (source !== "" && destination !== "") {
            let source_code = stations[source.toUpperCase()];
            let destination_code = stations[destination.toUpperCase()];
            if (destination_code === source_code) {
                return res.json({
                    speech: "Great I guess You Are Already There\nHave a great time",
                    displayText: "... Great I guess You Are Already There\nHave a great time",
                    source: 'fetch_schedule'
                });
            }
        }
        if (source !== "" && destination !== "" && date === "") {
            console.log("Ask date");
            return res.json({
                speech: "Ask Date",
                displayText: "Ask Date",
                source: 'fetch_schedule'
            });
        }
        if (source !== "" && destination !== "" && date !== "" && journeyTime === undefined) {
            console.log("Ask Time");
            return res.json({
                speech: "Ask Time",
                displayText: "Ask Time",
                source: 'fetch_schedule'
            });
        }
        if (source !== "" && destination !== "" && date !== "" && journeyTime !== "") {
            let source_code = stations[source.toUpperCase()];
            let destination_code = stations[destination.toUpperCase()];

            journey.source = source;
            journey.destination = destination;
            searchParameters.origin = source_code;
            searchParameters.destination = destination_code;
            searchParameters.outboundDate = date;
            searchParameters.outboundTime = journeyTime;
            searchParameters.numberOfAdults = seat;
            console.log("Search Parameters:-");
            console.log(searchParameters);
            let options = {
                url: 'https://et2-fasttrackapi.ttlnonprod.com/v1/Search',
                method: 'GET',
                qs: {
                    'journeyRequest': searchParameters
                },
                headers: {
                    "Accept": "application/json",
                    "TocIdentifier": "vtMobileWeb"
                }
            };
            request(options, (err, response) => {
                if (!err && response.statusCode === 200) {
                    let json = JSON.parse(response.body);
                    journey.summary = json.OutboundJournies;
                    return res.json({
                        speech: "Schedule",
                        displayText: "Schedule",
                        source: 'fetch_schedule'
                    });
                } else {
                    return res.status(400).json({
                        status: {
                            code: 400,
                            errorType: 'I failed to look up the Schedule'
                        }
                    });
                }
            })
        }
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