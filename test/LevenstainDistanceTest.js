var levenshtein = require('fast-levenshtein');
var stations=require("./assets/stations.json")

var distance = levenshtein.get('Blozwich', 'BLOXWICH Station',{ useCollator: true});
console.log(distance)