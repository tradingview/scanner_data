var requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../cfd.json";
const groups =[
    { url:"http://hub1.tradingview.com:8094/symbols/dxy_idc2", region:"Americas" },
    { url:"http://hub1.tradingview.com:8094/symbols/us_chicago_indices", region:"Americas" },
    { url:"http://hub1.tradingview.com:8094/symbols/us_ny_indices" },
    { url:"http://hub1.tradingview.com:8094/symbols/japan_indices", region:"Asia" },
    { url:"http://hub1.tradingview.com:8094/symbols/china_indices", region:"Asia" },
    { url:"http://hub1.tradingview.com:8094/symbols/european_indices", region:"Europe" },
    { url:"http://hub1.tradingview.com:8094/symbols/british_indices", region:"Europe" },
    { url:"http://hub1.tradingview.com:8094/symbols/spanish_indices", region:"Europe" },
    { url:"http://hub1.tradingview.com:8094/symbols/government_bonds" },
    { url:"http://hub1.tradingview.com:8094/symbols/euro_bonds", region:"Europe" },
    { url:"http://hub1.tradingview.com:8094/symbols/forex_tvc" },
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
                if (path.region){
                    s.region = path.region;
                }
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

var regionMarks = {
  "Middle East": ["TURKEY"],
  "Asia": ["CHINA","HONG KONG", "Hong Kong","INDIA","INDONESIA","JAPAN","KOREA","MALAYSIA","SINGAPORE","Singapore","THAILAND"],
  "Europe": ["EURO CURRENCY INDEX","BRITISH POUND CURRENCY INDEX","SWISS FRANC CURRENCY INDEX","BELGIUM","FRANCE","GERMAN", "Germany","IRELAND","ITALY","NETHERLANDS", "Netherlands","NORWAY","PORTUGAL","SPAIN", "Swiss","UK"],
  "Americas": ["NYSE","NASDAQ","S&P 500","US","THOMSON REUTERS","CANADIAN DOLLAR CURRENCY INDEX"],
  "Africa": ["SOUTH AFRICA"],
  "Pacific": ["AUSTRALIA", "Australia", "NEW ZEALAND DOLLAR CURRENCY INDEX"],
  "":["CRUDE OIL", "Corn", "Natural Gas", "Soybeans", "Sugar", "Wheat", "Copper", "GOLD/SILVER RATIO"]
};


function matches(s, values){
    for (var i = 0; i < values.length; i++){
        if (s.indexOf(values[i])>=0){
            return true;
        }
    }
    return false;
}

function matches2(s, obj){
    for (var p in obj){
        if (matches(s, obj[p])){
            return p;
        }
    }
    return null;
}

function tryDetectCategory(s){
    var description = s.f[2];
    if (s.f[1] === "index" || matches(description, indexMarks)){
        return "index";
    }
    if (matches(description, bondsMarks)){
        return "bond";
    }
    if (matches(description, commoditiesMarks)){
        return "commodity";
    }
    return null;
}

function tryDetectRegion(s){
    if (s.region){
        return s.region;
    }
    var description = s.f[2];
    return matches2(description, regionMarks);
}

var emptyCategoryCount = 0, emptyRegionCount = 0;
var dstSymbols = [];
symbols.forEach(function(s){
    var dst = {f:[]};
    dst.s = s.s;
    var cat = tryDetectCategory(s);
    if (!cat){
        emptyCategoryCount++;
    }
    dst.f[0] = cat;

    var reg = tryDetectRegion(s);
    if (reg === undefined || reg === null){
        emptyRegionCount++;
        console.log(s.s + " (" + s.f[2] + ")");
    }
    dst.f[1] = reg;

    dstSymbols.push(dst);
});

dstSymbols.sort(function(l,r){
    return l.s.localeCompare(r.s);
});

if (emptyCategoryCount){
    console.info("Symbols with empty category is " + emptyCategoryCount);
}

if (emptyRegionCount){
    console.info("Symbols with empty region is " + emptyRegionCount);
}

fs.writeFileSync(dstPath, JSON.stringify(
    {"time": new Date().toISOString()+'', "fields": ["sector","country"], "symbols": dstSymbols}, null, 2));
