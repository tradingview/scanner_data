var requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../cfd.json";
const groups =[
    "http://hub1.tradingview.com:8094//symbols/dxy",
    "http://hub1.tradingview.com:8094//symbols/us_chicago_indices",
    "http://hub1.tradingview.com:8094//symbols/us_ny_indices",
    "http://hub1.tradingview.com:8094//symbols/japan_indices",
    "http://hub1.tradingview.com:8094//symbols/china_indices",
    "http://hub1.tradingview.com:8094//symbols/european_indices",
    "http://hub1.tradingview.com:8094//symbols/british_indices",
    "http://hub1.tradingview.com:8094//symbols/spanish_indices",
    "http://hub1.tradingview.com:8094//symbols/government_bonds",
    "http://hub1.tradingview.com:8094//symbols/euro_bonds",
    "http://hub1.tradingview.com:8094//symbols/forex_tvc",
    "http://hub1.tradingview.com:8094/symbols/oanda"
];

const types = {
    "cfd":true,
    "index":true
};

var symbols = [];
groups.forEach(function(path){
    var response = requestSync("GET", path);
    if (response.statusCode != 200) {
        throw Error(path + ':' + response.statusCode);
    }
    JSON.parse(response.getBody()).symbols.forEach(function(s){
        if (types[s.f[1]]){
            symbols.push(s);
        }
    });
});

function tryDetectCategory(f){
    if (f[1] === "index"){
        return "index";
    }
    if (f[5].indexOf("BOND")>=0){
        return "bond";
    }
    return ""; // TODO
}

var dstSymbols = [];
symbols.forEach(function(s){
    var dst = {f:[]};
    dst.s = s.s;
    dst.f[0] = tryDetectCategory(s.f);
    dstSymbols.push(dst);
});

fs.writeFileSync(dstPath, JSON.stringify(
    {"time": new Date().toISOString()+'', "fields": ["sector"], "symbols": dstSymbols}, null, 2));