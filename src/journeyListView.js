const config = require('config');

serverURL = process.env.serverURL || config.serverURL;

function showJourneyList(ListViewData){
    let list_len=ListViewData.journeyList.length;
    let journeys=ListViewData.journeyList;
    elementList=[];
    let banner= {
        "title": "Outbound",
        "image_url": "https://invitationdigital-res-2.cloudinary.com/image/upload/f_auto,fl_strip_profile,w_628,c_crop/w_628,h_384,c_fill/trainline_up_to_43_off_tickets_with_advance_bookings_at_trainline_premium_offer_image.jpg",
        "subtitle":ListViewData.source+" >>> "+ListViewData.destination+"\n"+ListViewData.seats+" Passengers\n" ,
    };
    elementList.push(banner);
    for (let i = 0; i < 3; i++){
        let url = serverURL + "summary?q=";
        format={
            "title":journeys[i].duration.toString(),
            "subtitle": "Start:"+journeys[i].start+"\n"+"End:"+journeys[i].end+"\n"+"Fare:"+journeys[i].fare+"\n",
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
    console.log(elementList);
    return elementList;
}

function getSearchURL(searchParameters) {
    let searchURL = "https://et2-m-virgintrains.ttlnonprod.com/dataPassedIn?Origin="+
                    searchParameters.origin+"&Destination="+
                    searchParameters.destination+"&OutboundDate="+
                    searchParameters.outboundDate+"&OutboundTime="+
                    searchParameters.outboundTime+"&NumberOfAdults="+
                    searchParameters.numberOfAdults;
    console.log(searchURL);
    return searchURL;
}
module.exports={
    showJourneyList : showJourneyList,
    getSearchURL : getSearchURL
};