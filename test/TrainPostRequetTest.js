let post_data = "%3C%3Fxml+version%3D%221.0%22+encoding%3D%22UTF-8%22+standalone%3D%22yes%22%3F%3E%3CpurchaseTicketRequest+xmlns%3D%22http%3A%2F%2Fojp.nationalrail.co.uk%2Fschemas%2FFulfilmentHandoff%22%3E%3CrequestId%3E154f7b89-14f5-40b7-b33a-a5bc2428294f%3C%2FrequestId%3E%3CoriginCrs%3EEUS%3C%2ForiginCrs%3E%3CoriginName%3E%3C%2ForiginName%3E%3CoriginNlc%3E%3C%2ForiginNlc%3E%3CdestinationCrs%3EMAN%3C%2FdestinationCrs%3E%3CdestinationName%3EManchester+Piccadilly%3C%2FdestinationName%3E%3CdestinationNlc%3E%3C%2FdestinationNlc%3E%3CoutboundJourney%3E%3CdepartureDateTime%3E2017-08-10T12%3A20%3A00.000%2B01%3A00%3C%2FdepartureDateTime%3E%3CarrivalDateTime%3E2017-08-10T14%3A28%3A00.000%2B01%3A00%3C%2FarrivalDateTime%3E%3C%2FoutboundJourney%3E%3CoutboundFares%3E%3CTicketTypeDescription%3E%3C%2FTicketTypeDescription%3E%3CtotalFare%3E2200%3C%2FtotalFare%3E%3CticketType%3EVDS%3C%2FticketType%3E%3CadultFullFare%3E%3C%2FadultFullFare%3E%3CchildFullFare%3E0%3C%2FchildFullFare%3E%3CadultDiscountFare%3E0%3C%2FadultDiscountFare%3E%3CchildDiscountFare%3E0%3C%2FchildDiscountFare%3E%3CnumberOfFullFareAdults%3E1%3C%2FnumberOfFullFareAdults%3E%3CnumberOfFullFareChildren%3E0%3C%2FnumberOfFullFareChildren%3E%3CnumberOfDiscountFareAdults%3E0%3C%2FnumberOfDiscountFareAdults%3E%3CnumberOfDiscountFareChildren%3E0%3C%2FnumberOfDiscountFareChildren%3E%3CnumberOfRailcards%3E0%3C%2FnumberOfRailcards%3E%3CrouteCode%3E00474%3C%2FrouteCode%3E%3CfareOriginNlc%3E%3C%2FfareOriginNlc%3E%3CfareDestinationNlc%3E%3C%2FfareDestinationNlc%3E%3C%2FoutboundFares%3E%3C%2FpurchaseTicketRequest%3E"

const
    request = require('request'),
    express = require('express');

app = express()

app.listen(3000, function(){
    console.log('Listening To Port 3000');
});

app.get('/', function(req, res){
    let options = {
        uri : "https://m.buytickets.virgintrains.co.uk/buy/purchase_ticket_request",
        method : 'POST',
        formData : post_data
    }
    request(options, function(error, response, body){
        console.log(body);
        res.body = body;
        res.redirect('https://m.buytickets.virgintrains.co.uk/journeySummaryPage');
    })
});