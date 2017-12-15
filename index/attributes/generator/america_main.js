const requestSync = require("sync-request"),
    fs = require("fs");
const {URL} = require('url');

const dstPath = "../america.json";
const groups = [
    "http://idc.tradingview.com/udf_proxy/symbols/dj_indices_delayed?typespecs=main",
    "http://idc.tradingview.com/udf_proxy/symbols/nyse_indices_eod?typespecs=main",
    "http://idc.tradingview.com/udf_proxy/symbols/nasdaq_indices_eod?typespecs=main",
    "http://idc.tradingview.com/udf_proxy/symbols/nyse_gif_indices_eod?typespecs=main",
    "http://idc.tradingview.com/udf_proxy/symbols/cboe_indices_delayed?typespecs=main",
    "http://idc.tradingview.com/udf_proxy/symbols/sp_indices?typespecs=main",
    "http://idc.tradingview.com/udf_proxy/symbols/russel_indices_eod?typespecs=main"];

const sectorNames = {};
[
    {
        "s": "SP:SPF",
        "f": ["FINANCIALS"]
    },
    {
        "s": "SP:SPN",
        "f": ["ENERGY"]
    },
    {
        "s": "SP:S5HLTH",
        "f": ["HEALTH CARE"]
    },
    {
        "s": "SP:S5INFT",
        "f": ["INFORMATION TECHNOLOGY"]
    },
    {
        "s": "SP:S5CONS",
        "f": ["CONSUMER STAPLES"]
    },
    {
        "s": "SP:S5MATR",
        "f": ["MATERIALS"]
    },
    {
        "s": "SP:S5COND",
        "f": ["CONSUMER DISCRETIONARY"]
    },
    {
        "s": "SP:S5UTIL",
        "f": ["UTILITIES"]
    },
    {
        "s": "SP:S5INDU",
        "f": ["INDUSTRIALS"]
    },
    {
        "s": "SP:S5TELS",
        "f": ["TELECOMMUNICATION SERVICES"]
    },
    {
        "s": "SP:S5REAS",
        "f": ["REAL ESTATE"]
    }
].forEach(s => sectorNames[s.s] = s.f[0]);

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
        let skip = false;
        if (include && !include[s.s]) {
            skip = true;
        }
        if (exclude && exclude[s.s]) {
            skip = true;
        }
        if (!skip) {
            symbols.push(s);
        }
    });
});

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
    const p = symbolsPriorities[s];
    return p !== undefined ? p : 0xffffff;
}

function detectSector(s) {
    return sectorNames[s];
}

const dstSymbols = symbols.map(function (sym) {
    return {"s": sym.s, "f": [detectSector(sym.s), detectPriority(sym.s)]}
});

dstSymbols.sort(function (l, r) {
    return l.s.localeCompare(r.s);
});

fs.writeFileSync(dstPath, JSON.stringify(
    {
        "time": new Date().toISOString() + '',
        "fields": ["sector", "index_priority"],
        "symbols": dstSymbols
    }, null, 2));
