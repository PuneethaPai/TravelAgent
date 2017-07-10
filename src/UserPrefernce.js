function extractUserPreferedTrain(summary, preference) {
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

            let hr = train.duration.split(' ')[0].match(/\d/g);
            hr = hr.join("");
            let min = train.duration.split(' ')[1].match(/\d/g);
            min = min.join("");

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
    extractUserPreferedTrain : extractUserPreferedTrain
};