const requestSync = require("sync-request"),
    fs = require("fs");
const {URL} = require('url');

const dstPath = "../america.json";
const groups = JSON.parse(fs.readFileSync("../../groups/list.json")).symbols.map(s => `http://udf-proxy.tradingview.com:8094/symbols?perm=*&domain=tv&typespecs=main&prefix=${s.s}`);

const sectorNames = {};
[
    {
        "s": "SPCFD:SPF",
        "f": ["FINANCIALS"]
    },
    {
        "s": "SPCFD:SPN",
        "f": ["ENERGY"]
    },
    {
        "s": "SPCFD:S5HLTH",
        "f": ["HEALTH CARE"]
    },
    {
        "s": "SPCFD:S5INFT",
        "f": ["INFORMATION TECHNOLOGY"]
    },
    {
        "s": "SPCFD:S5CONS",
        "f": ["CONSUMER STAPLES"]
    },
    {
        "s": "SPCFD:S5MATR",
        "f": ["MATERIALS"]
    },
    {
        "s": "SPCFD:S5COND",
        "f": ["CONSUMER DISCRETIONARY"]
    },
    {
        "s": "SPCFD:S5UTIL",
        "f": ["UTILITIES"]
    },
    {
        "s": "SPCFD:S5INDU",
        "f": ["INDUSTRIALS"]
    },
    {
        "s": "SPCFD:S5TELS",
        "f": ["TELECOMMUNICATION SERVICES"]
    },
    {
        "s": "SPCFD:S5REAS",
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
    urlO.searchParams.append('fields', 'symbol,type,description,symbol-proname');
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
[].concat([
    // US Indices
    "SPCFD:SPX",
    "SPCFD:SVX",
    "SPCFD:MID",
    "SPCFD:OEX",
    "SPCFD:SPGSCI",
    "DJCFD:DJI",
    "NASDAQ:IXIC",
    "NASDAQ:NDX",
    "RUSSELL:RUA",
    "RUSSELL:RUT",
    "RUSSELL:RUI",
    "NYSE:NYA",
    "NYSE:XMI",
    "NYSE:XAX",
    "CBOE:VIX",
    "NASDAQ:OSX",
    "NASDAQ:XAU",
    "NASDAQ:HGX",
    "NASDAQ:UTY",
    "NASDAQ:SOX",
]).concat([
    "SPCFD:S5COND",
    "SPCFD:S5CONS",
    "SPCFD:S5HLTH",
    "SPCFD:S5INDU",
    "SPCFD:S5INFT",
    "SPCFD:S5MATR",
    "SPCFD:S5REAS",
    "SPCFD:S5TELS",
    "SPCFD:S5UTIL",
    "SPCFD:SPF",
    "SPCFD:SPN",
]).forEach((s, i) => symbolsPriorities[s] = i);

const forExclude = ["CBOE:OEX", "CBOE:RUI"];

function detectPriority(s) {
    if (forExclude.indexOf(s) >= 0) {
        return null;
    }
    const p = symbolsPriorities[s];
    return p !== undefined ? p : 0xffffff;
}

function detectSector(s) {
    return sectorNames[s];
}

const dstSymbols = symbols.map(function (sym) {
    return {"s": sym.f[3], "f": [detectSector(sym.s), detectPriority(sym.s)]}
});

dstSymbols.sort(function (l, r) {
    return l.s.localeCompare(r.s);
});

fs.writeFileSync(dstPath, JSON.stringify(
    {
        "fields": ["sector", "index_priority"],
        "symbols": dstSymbols
    }, null, 2));
