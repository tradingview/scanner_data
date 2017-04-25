var requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../cfd.json";
const groups =[
    "http://hub1.tradingview.com:8094/symbols/dxy_idc2",
    "http://hub1.tradingview.com:8094/symbols/us_chicago_indices",
    "http://hub1.tradingview.com:8094/symbols/us_ny_indices",
    "http://hub1.tradingview.com:8094/symbols/japan_indices",
    "http://hub1.tradingview.com:8094/symbols/china_indices",
    "http://hub1.tradingview.com:8094/symbols/european_indices",
    "http://hub1.tradingview.com:8094/symbols/british_indices",
    "http://hub1.tradingview.com:8094/symbols/spanish_indices",
    "http://hub1.tradingview.com:8094/symbols/government_bonds",
    "http://hub1.tradingview.com:8094/symbols/euro_bonds",
    "http://hub1.tradingview.com:8094/symbols/forex_tvc",
    {
        url:"http://hub1.tradingview.com:8094/symbols/oanda",
        include:[
            "OANDA:CH20CHF","OANDA:SG30SGD","OANDA:HK33HKD","OANDA:UK10YBGBP","OANDA:CORNUSD",
            "OANDA:USB30YUSD","OANDA:XCUUSD","OANDA:NATGASUSD","OANDA:NL25EUR","OANDA:US30USD",
            "OANDA:USB05YUSD","OANDA:USB02YUSD","OANDA:SUGARUSD","OANDA:USB10YUSD","OANDA:AU200AUD",
            "OANDA:DE30EUR","OANDA:WHEATUSD","OANDA:SOYBNUSD"
        ]
    }
];

const types = {
    "cfd":true,
    "index":true
};

var symbols = [];
groups.forEach(function(path){
    var url = path;
    var include;
    var exclude;
    if (typeof path !== "string" && path.url){
        url = path.url;
        if (path.include){
            include = {};
            path.include.forEach(function(val){include[val] = true;});
        }
        if (path.exclude){
            exclude = {};
            path.exclude.forEach(function(val){exclude[val] = true;});
        }
    }

    var response = requestSync("GET", url + '?fields=name,type,description');
    if (response.statusCode != 200) {
        throw Error(path + ':' + response.statusCode);
    }
    JSON.parse(response.getBody()).symbols.forEach(function(s){
        if (types[s.f[1]]){
            var skip = false;
            if (include && !include[s.s]){
                skip = true;
            }
            if (exclude && exclude[s.s]){
                skip = true;
            }
            if (!skip) {
                symbols.push(s);
            }
        }
    });
});

var bondsMarks = [
    "TREASURY NOTE", "BOND", "Bond", "T-Note", "EURO BUND", "UK 10Y Gilt"
];

var indexMarks = [
    "INDEX", "NASDAQ", "RUSSELL", "S&P", "DOW JONES", "STOXX", "Australia", "Swiss", "Germany", "Europe", "France",
    "Hong Kong", "Japan", "Netherlands", "NIKKEI", "FTSE", "Singapore", "CAC", "HANG SENG", "SHANGHAI COMPOSITE", "NYSE COMPOSITE",
    "Bund","IBEX 35","DAX PERFORMANCE","US Wall St 30","US Nas 100","UK 100","US Russ 2000","AEX","US SPX 500"
];

var commoditiesMarks = [
    "Brent", "BRENT CRUDE OIL", "WTI", "West Texas Oil", "GOLD", "Gold", "SILVER", "Silver", "Sugar", "Corn", "Gas", "PALLADIUM", "Palladium",
    "PLATINUM", "Platinum", "Soybeans", "Copper", "Wheat"
];

function matches(s, values){
    for (var i = 0; i < values.length; i++){
        if (s.indexOf(values[i])>=0){
            return true;
        }
    }
    return false;
}

function tryDetectCategory(f){
    if (f[1] === "index" || matches(f[2], indexMarks)){
        return "index";
    }
    if (matches(f[2], bondsMarks)){
        return "bond";
    }
    if (matches(f[2], commoditiesMarks)){
        return "commodity";
    }
    return ""; // TODO
}

var emptyCategoryCount = 0;
var dstSymbols = [];
symbols.forEach(function(s){
    var dst = {f:[]};
    dst.s = s.s;
    var cat = tryDetectCategory(s.f);
    if (!cat){
        emptyCategoryCount++;
    }
    dst.f[0] = cat;
    dstSymbols.push(dst);
});

dstSymbols.sort(function(l,r){
    return l.s.localeCompare(r.s);
});

console.info("Symbols with empty category is " + emptyCategoryCount);

fs.writeFileSync(dstPath, JSON.stringify(
    {"time": new Date().toISOString()+'', "fields": ["sector"], "symbols": dstSymbols}, null, 2));
