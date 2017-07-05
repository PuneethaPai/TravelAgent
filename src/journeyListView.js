const config = require('config');

serverURL = config.serverURL;

function showJourneyList(ListViewData){
    list_len=ListViewData.length;
    elementList=[];
    for (let i = 1; i < list_len; i++){
        let url = serverURL + "summary?q=";
        format={
            "title":ListViewData[i].duration.toString(),
            "subtitle": "Start:"+ListViewData[i].start+"\n"+"End:"+ListViewData[i].end+"\n"+"Fare:"+ListViewData[i].fare+"\n",
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
exports.showJourneyList = showJourneyList;