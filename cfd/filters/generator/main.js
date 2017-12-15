const requestSync = require("sync-request"),
    fs = require("fs");
const {URL} = require('url');

const dstPath = "../cfd.json";
const groups = [
    {url: "http://hub1.tradingview.com:8094/symbols/dxy_idc2", region: "Americas"},
    {url: "http://hub1.tradingview.com:8094/symbols/us_chicago_indices", region: "Americas"},
    {url: "http://hub1.tradingview.com:8094/symbols/us_ny_indices"},
    {url: "http://hub1.tradingview.com:8094/symbols/japan_indices", region: "Asia"},
    {url: "http://hub1.tradingview.com:8094/symbols/china_indices", region: "Asia"},
    {url: "http://hub1.tradingview.com:8094/symbols/european_indices", region: "Europe"},
    {url: "http://hub1.tradingview.com:8094/symbols/british_indices", region: "Europe"},
    {url: "http://hub1.tradingview.com:8094/symbols/spanish_indices", region: "Europe"},
    {url: "http://hub1.tradingview.com:8094/symbols/government_bonds"},
    {url: "http://hub1.tradingview.com:8094/symbols/euro_bonds", region: "Europe"},
    {
        url: "http://hub1.tradingview.com:8094/symbols/forex_tvc",
        exclude: ["TVC:USOIL", "TVC:UKOIL"]
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/fxcm_cfd?domain=tvbs",
        include: ["FX:USOIL", "FX:UKOIL"]
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/oanda",
        include: [
            "OANDA:SG30SGD", "OANDA:HK33HKD", "OANDA:UK10YBGBP", "OANDA:CORNUSD",
            "OANDA:USB30YUSD", "OANDA:XCUUSD", "OANDA:NATGASUSD", "OANDA:NL25EUR", "OANDA:US30USD",
            "OANDA:USB05YUSD", "OANDA:USB02YUSD", "OANDA:SUGARUSD", "OANDA:USB10YUSD", "OANDA:AU200AUD",
            "OANDA:DE30EUR", "OANDA:WHEATUSD", "OANDA:SOYBNUSD"
        ]
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/gain",
        include: ["FOREXCOM:HGOUSD", "FOREXCOM:COTUSD"]
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/sp_indices?typespecs=main",
        include: ["SP:SPX"]
    },
];

const types = {
    "cfd": true,
    "index": true
};

const symbols = [];
groups.forEach(function (path) {
    let url = path;
    let include;
    let exclude;
    if (typeof path !== "string" && path.url) {
        url = path.url;
        if (path.include) {
            include = {};
            path.include.forEach(function (val) {
                include[val] = true;
            });
        }
        if (path.exclude) {
            exclude = {};
            path.exclude.forEach(function (val) {
                exclude[val] = true;
            });
        }
    }

    const urlO = new URL(url);
    urlO.searchParams.append('fields', 'symbol,type,description');
    url = urlO.toString();
    const response = requestSync("GET", url);
    if (response.statusCode != 200) {
        throw Error(path + ':' + response.statusCode);
    }
    JSON.parse(response.getBody()).symbols.forEach(function (s) {
        if (types[s.f[1]]) {
            let skip = false;
            if (include && !include[s.s]) {
                skip = true;
            }
            if (exclude && exclude[s.s]) {
                skip = true;
            }
            if (!skip) {
                if (path.region) {
                    s.region = path.region;
                }
                symbols.push(s);
            }
        }
    });
});

const bondsMarks = [
    "TREASURY NOTE", "BOND", "Bond", "T-Note", "EURO BUND", "UK 10Y Gilt"
];

const indexMarks = [
    "INDEX", "NASDAQ", "RUSSELL", "S&P", "DOW JONES", "DOW-JONES", "STOXX", "Australia", "Swiss", "Germany", "Europe", "France",
    "Hong Kong", "Japan", "Netherlands", "NIKKEI", "FTSE", "Singapore", "CAC", "HANG SENG", "SHANGHAI COMPOSITE", "NYSE COMPOSITE",
    "Bund", "IBEX 35", "DAX PERFORMANCE", "US Wall St 30", "US Nas 100", "UK 100", "US Russ 2000", "AEX", "US SPX 500"
];

const metalsMarks = [
    "GOLD", "Gold", "SILVER", "Silver", "PALLADIUM", "Palladium", "PLATINUM", "Platinum", "Copper"
];

const energyMarks = [
    "Brent", "BRENT CRUDE OIL", "WTI", "West Texas Oil", "Gas", "Heating Oil", "Crude Oil"
];

const agricultureMarks = [
    "Sugar", "Corn", "Soybeans", "Wheat", "Cotton"
];

const regionMarks = {
    "Middle East": ["TURKEY"],
    "Asia": ["CHINA", "HONG KONG", "Hong Kong", "INDIA", "INDONESIA", "JAPAN", "KOREA", "MALAYSIA", "SINGAPORE", "Singapore", "THAILAND"],
    "Europe": ["EURO CURRENCY INDEX", "BRITISH POUND CURRENCY INDEX", "SWISS FRANC CURRENCY INDEX", "BELGIUM", "FRANCE", "GERMAN", "Germany", "IRELAND", "ITALY", "NETHERLANDS", "Netherlands", "NORWAY", "PORTUGAL", "SPAIN", "Swiss", "UK "],
    "Americas": ["NYSE", "NASDAQ", "S&P 500", "US ", "THOMSON REUTERS", "CANADIAN DOLLAR CURRENCY INDEX", "US GOVERNMENT BONDS", "DOW JONES", "DOW-JONES", "RUSSELL"],
    "Africa": ["SOUTH AFRICA"],
    "Pacific": ["AUSTRALIA", "Australia", "NEW ZEALAND DOLLAR CURRENCY INDEX"],
    "": ["CRUDE OIL", "Corn", "Natural Gas", "Soybeans", "Sugar", "Wheat", "Copper", "GOLD", "SILVER", "PLATINUM", "PALLADIUM", "Heating Oil", "Cotton", "Crude Oil"]
};


function matches(s, values) {
    for (let i = 0; i < values.length; i++) {
        if (s.indexOf(values[i]) >= 0) {
            return true;
        }
    }
    return false;
}

function matches2(s, obj) {
    for (const p in obj) {
        if (matches(s, obj[p])) {
            return p;
        }
    }
    return null;
}

function tryDetectCategory(s) {
    const description = s.f[2];
    if (s.f[1] === "index" || matches(description, indexMarks)) {
        return "index";
    }
    if (matches(description, bondsMarks)) {
        return "bond";
    }
    if (matches(description, metalsMarks)) {
        return "Metals";
    }
    if (matches(description, energyMarks)) {
        return "Energy";
    }
    if (matches(description, agricultureMarks)) {
        return "Agricultural";
    }
    return null;
}

function tryDetectRegion(s) {
    if (s.region) {
        return s.region;
    }
    const description = s.f[2];
    return matches2(description, regionMarks);
}

let emptyCategoryCount = 0, emptyRegionCount = 0;
const dstSymbols = [];

const symbolsPriorities = {};
[].concat(
    // Major World Indices
    "SP:SPX",
    "TVC:IXIC",
    "DJ:DJI",
    "TVC:UKX",
    "TVC:NI225",
    "TVC:HSI",
    "TVC:SHCOMP",
    "TVC:DAX",
    "EURONEXT:PX1",
    "TVC:SX5E",
    "TSX:TSX",
    "CBOE:VIX",
    "OANDA:SG30SGD",
    "ASX:XJO",
    "INDEX:KQY0",
    "BMFBOVESPA:IBOV",
    "NSE:NIFTY",
    "MOEX:MICEXINDEXCF",
    "NZX:NZ50G",
    "BME:IBC",
    "TVC:SSMI",
).concat(
    // Currency Indices
    "TVC:DXY",
    "TVC:EXY",
    "TVC:BXY",
    "TVC:SXY",
    "TVC:JXY",
    "TVC:CXY",
    "TVC:AXY",
    "TVC:ZXY",
).concat(
    // US Indices
    "SP:SPX",
    "SP:SVX",
    "SP:MID",
    "SP:OEX",
    "SP:SPGSCI",
    "DJ:DJI",
    "TVC:IXIC",
    "NYSE:NDX",
    "RUSSEL:RUA",
    "RUSSEL:RUT",
    "RUSSEL:RUI",
    "NYSE:NYA",
    "NYSE:XMI",
    "NYSE:XAX",
    "CBOE:VIX",
    "NYSE:OSX",
    "NYSE:XAU",
    "NYSE:HGX",
    "NYSE:UTY",
    "NYSE:SOX",
).forEach((s, i) => symbolsPriorities[s] = i);

function detectPriority(s) {
    return symbolsPriorities[s];
}

symbols.forEach(function (s) {
    const dst = {f: []};
    dst.s = s.s;
    let cat = tryDetectCategory(s);
    if (!cat) {
        emptyCategoryCount++;
        console.error("can't detect category for " + s.s + " (" + s.f[2] + ")");
    }
    dst.f[0] = cat;

    const reg = tryDetectRegion(s);
    if (reg === undefined || reg === null) {
        emptyRegionCount++;
        console.error("can't detect region for " + s.s + " (" + s.f[2] + ")");
    }
    dst.f[1] = reg;

    dst.f[2] = detectPriority(s.s);

    dstSymbols.push(dst);
});

dstSymbols.sort(function (l, r) {
    return l.s.localeCompare(r.s);
});

if (emptyCategoryCount) {
    console.info("Symbols with empty category is " + emptyCategoryCount);
}

if (emptyRegionCount) {
    console.info("Symbols with empty region is " + emptyRegionCount);
}

fs.writeFileSync(dstPath, JSON.stringify(
    {
        "time": new Date().toISOString() + '',
        "fields": ["sector", "country", "index_priority"],
        "symbols": dstSymbols
    }, null, 2));
