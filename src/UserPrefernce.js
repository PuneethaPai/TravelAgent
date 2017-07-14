let preferedTrain = {};
function extractUserPreferedTrain(summary, preference) {
    function PreferenceDetailExtract(index) {
        preferedTrain.start = summary.journeyList[index].start;
        preferedTrain.end = summary.journeyList[index].end;
        preferedTrain.duration = summary.journeyList[index].duration;
        preferedTrain.fare = parseInt(summary.journeyList[index].fare, 10) * summary.seats;
        preferedTrain.index = index;
        console.log(preferedTrain);
        return {
            speech: "Confirm",
            displayText: "Confirm",
            source: 'book_ticket'
        };
    }

    let itin_length = summary.journeyList.length;

    if (preference === "earliest") {
        return PreferenceDetailExtract(0);
    }
    if (preference === "cheapest") {
        let min_cost = 1000;
        let cheapest = 0;
        for (i = 0; i < itin_length; i++) {
            let train = summary.journeyList[i];
            let cost = parseInt(train.fare, 10);
            if (min_cost > cost) {
                min_cost = cost;
                cheapest = i;
            }
        }
        return PreferenceDetailExtract(cheapest);
    }
    if (preference === "fastest") {
        let min_dur = 1000;
        let fastest = 0;
        for (i = 0; i < itin_length; i++) {
            let train = summary.journeyList[i];

            let hr="0";
            let min="0";

            let firstPart = train.duration.split(' ')[0];

            if(firstPart.indexOf("hr") > -1)
            {
                let hr1=firstPart.match(/\d/g);
                hr = hr1.join("");
                min = train.duration.split(' ')[1].match(/\d/g);
                min = min.join("");
            }

            else {
                min = firstPart.match(/\d/g).join("");
            }
            const dur = parseInt(hr, 10) * 60 + parseInt(min, 10);

            if (min_dur > dur) {
                min_dur = dur;
                fastest = i;
            }
        }
        return PreferenceDetailExtract(fastest);
    }
}

module.exports = {
    preferedTrain:preferedTrain,
    extractUserPreferedTrain : extractUserPreferedTrain
};