var requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../forex.json";
const symbologyPath = "http://idc.tradingview.com/udf_proxy/symbols/forex";

var response = requestSync("GET", symbologyPath);
if (response.statusCode != 200) {
    throw Error(response.statusCode);
}

var regions = {
    "USD": "Americas",
    "EUR": "European",
    "GBP": "British",
    "CAD": "Canadian",
    "CHF": "Swiss",
    "AUD": "Australian",
};
function detectRegion(name){
    var firstCur = name.substr(0,3);
    return regions[firstCur] || "";
}

var majors = [
"AUDCAD",
"AUDCHF",
"AUDEUR",
"AUDGBP",
"AUDJPY",
"AUDUSD",
"EURAUD",
"EURCAD",
"EURCHF",
"EURGBP",
"EURJPY",
"EURUSD",
"GBPAUD",
"GBPCAD",
"GBPCHF",
"GBPEUR",
"GBPJPY",
"GBPUSD",
"USDAUD",
"USDCAD",
"USDCHF",
"USDEUR",
"USDGBP",
"USDJPY",
"JPYAUD",
"JPYCAD",
"JPYCHF",
"JPYEUR",
"JPYGBP",
"JPYUSD",
"CADAUD",
"CADCHF",
"CADEUR",
"CADGBP",
"CADJPY",
"CADUSD",
"CHFAUD",
"CHFCAD",
"CHFEUR",
"CHFGBP",
"CHFUSD",
"CHFJPY"
];
function detectMajor(name){
    return majors.indexOf(name) >= 0 ? "major" : "";
}

var dstSymbols = [];
var symbols = JSON.parse(response.getBody());
symbols.symbols.forEach(function(s){
    var dst = {f:[]};
    dst.s = s.s;
    dst.f[0] = detectRegion(s.f[0]);
    dst.f[1] = detectMajor(s.f[0]);
    dstSymbols.push(dst);
});

fs.writeFileSync(dstPath, JSON.stringify(
    {"time": new Date().toISOString()+'', "fields": ["country","sector"], "symbols": dstSymbols}, null, 2));