const config = require('config');

serverURL = process.env.serverURL || config.serverURL;

function showJourneyList(ListViewData){
    let list_len=ListViewData.journeyList.length;
    let journeys=ListViewData.journeyList;
    elementList=[];
    let banner= {
        "title": ListViewData.source+"  >>>  "+ListViewData.destination,
        "image_url": "https://mvp.tribesgds.com/dyn/UQ/OE/UQOE-wK-8g0/_/tIIyubfFgL0/Bqnr/trainline-logo.png",
        "subtitle":ListViewData.date+"\n"+ListViewData.seats+" Passenger" ,
    };
    elementList.push(banner);
    for (let i = 0; i < 3; i++){
        let url = serverURL + "summary?q=";
        format={
            "title":journeys[i].duration.toString(),
            "subtitle": "Start:"+journeys[i].start+"\n"+"End:"+journeys[i].end+"\n"+"Fare: £"+journeys[i].fare+"\n",
            "buttons": [
                {
                    "title": "Book",
                    "type": "web_url",
                    "url": url+i,
                }
            ]
        };
        elementList.push(format);
    }
    return elementList;
}

function getSearchURL(searchParameters) {
    let searchURL = "https://et2-m-virgintrains.ttlnonprod.com/dataPassedIn?Origin="+
                    searchParameters.origin+"&Destination="+
                    searchParameters.destination+"&OutboundDate="+
                    searchParameters.outboundDate+"&OutboundTime="+
                    searchParameters.outboundTime+"&NumberOfAdults="+
                    searchParameters.numberOfAdults;
    console.log("Schedule sent with URL:-" + searchURL);
    return searchURL;
}
module.exports={
    showJourneyList : showJourneyList,
    getSearchURL : getSearchURL
};