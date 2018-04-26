const requestSync = require("sync-request"),
    fs = require("fs");
const {URL} = require('url');

const dstPath = "../cfd.json";
const dstGroupsPath = "../../groups/indices.json";
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
    {url: "http://hub1.tradingview.com:8094/symbols/canadian_bonds", region: "Americas"},
    {
        url: "http://hub1.tradingview.com:8094/symbols/forex_tvc",
        exclude: ["TVC:USOIL", "TVC:UKOIL"]
    },
    {url: "http://hub1.tradingview.com:8094/symbols/nzx_tvc_indices", region: "Pacific"},
    {
        url: "http://hub1.tradingview.com:8094/symbols/fxcm_cfd?domain=tvbs",
        include: ["FX:USOIL", "FX:UKOIL"]
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/oanda",
        include: [
            "OANDA:HK33HKD", "OANDA:UK10YBGBP", "OANDA:CORNUSD",
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
        include: ["SP:SPX"],
        region: "Americas"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/cboe_indices_delayed?typespecs=main",
        include: ["CBOE:VIX"],
        region: "Americas"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/euronext_indices",
        include: [
            "EURONEXT:PX1",
            "EURONEXT:AEX",
            "EURONEXT:BEL20"],
        region: "Europe"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/toronto_indices",
        include: ["TSX:TSX"],
        region: "Americas"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/asx_indices",
        include: ["ASX:XJO"],
        region: "Pacific"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/korean_tvc_indices",
        include: ["TVC:KOSPI"],
        region: "Asia"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/bovespa_indices",
        include: ["BMFBOVESPA:IBOV"],
        region: "Americas"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/nse_indices",
        include: ["NSE:NIFTY"],
        region: "Asia"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/bse_indices",
        include: ["BSE:SENSEX"],
        region: "Asia"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/moex_indices",
        include: ["MOEX:IMOEX"],
        region: "Europe"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/nzx_indices",
        include: ["NZX:NZ50G"],
        region: "Pacific"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/bme_indices",
        include: ["BME:IBC"],
        region: "Europe"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/dj_indices?typespecs=main",
        include: ["DJ:DJI"],
        region: "Americas"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/singapore_tvc_indices",
        include: ["TVC:STI"],
        region: "Asia"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/swiss_indices",
        include: ["SIX:SMI"],
        region: "Europe"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/hangseng_indices",
        include: ["HSI:HSI"],
        region: "Asia"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/xetra_indices",
        include: ["XETR:DAX"],
        region: "Europe"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/istanbul_indices",
        include: ["BIST:XU100"],
        region: "Europe"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/warsaw_indices",
        include: ["GPW:WIG20"],
        region: "Europe"
    },
    {
        url: "http://idc.tradingview.com/udf_proxy/symbols/mexico_indices",
        include: ["BMV:ME"],
        region: "Americas"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/egyptian_indices",
        include: ["EGX:EGX30"],
        region: "Middle East"
    },
    {
        url: "http://hub1.tradingview.com:8094/symbols/santiago_indices",
        include: ["BCS:IPSA"],
        region: "Americas"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/bahrain_indices",
        "include": ["BAHRAIN:BSEX"],
        "region": "Middle East"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/belgrade_indices",
        "include": ["BELEX:BELEX15"],
        "region": "Europe"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/buenosaires_indices",
        "include": ["BCBA:IMV"],
        "region": "Americas"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/colombia_indices",
        "include": ["BVC:IGBC"],
        "region": "Americas"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/dubai_indices",
        "include": ["DFM:DFMGI"],
        "region": "Middle East"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/indonesia_indices",
        "include": ["IDX:COMPOSITE"],
        "region": "Asia"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/lima_indices",
        "include": ["BVL:SPBLPGPT"],
        "region": "Americas"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/luxembourg_indices",
        "include": ["LUXSE:LUXX"],
        "region": "Europe"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/malaysia_ftse_indices",
        "include": ["FTSEMYX:FBMKLCI"],
        "region": ""
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/milan_indices",
        "include": ["MIL:FTSEMIB"],
        "region": "Europe"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/nigerian_indices",
        "include": ["NSENG:NSE30"],
        "region": "Africa"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/qatar_indices",
        "include": ["QSE:GNRI"],
        "region": "Middle East"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/riga_indices",
        "include": ["OMXRSE:OMXRGI"],
        "region": "Europe"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/saudi_indices",
        "include": ["TADAWUL:TASI"],
        "region": "Middle East"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/shenzhen_indices",
        "include": ["SZSE:399001"],
        "region": "Asia"
    },
    {"url": "http://idc.tradingview.com/udf_proxy/symbols/taiwan_indices", "include": ["TWSE:TAIEX"], "region": "Asia"},
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/tallinn_indices",
        "include": ["OMXTSE:OMXTGI"],
        "region": "Europe"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/telaviv_indices",
        "include": ["TASE:TA35"],
        "region": "Middle East"
    },
    {
        "url": "http://idc.tradingview.com/udf_proxy/symbols/vilnius_indices",
        "include": ["OMXVSE:OMXVGI"],
        "region": "Europe"
    }];

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

                // if (s.s.indexOf('IXIC')>=0) console.log(url);
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
    "Bund", "IBEX 35", "DAX PERFORMANCE", "US Wall St 30", "US Nas 100", "UK 100", "US Russ 2000", "AEX", "US SPX 500", "DAX", "NYSE AMERICAN COMPOSITE"
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
    "Europe": ["EURO CURRENCY INDEX", "BRITISH POUND CURRENCY INDEX", "SWISS FRANC CURRENCY INDEX", "BELGIUM", "FRANCE", "GERMAN", "Germany", "IRELAND", "ITALY", "NETHERLANDS", "Netherlands", "NORWAY", "PORTUGAL", "SPAIN", "Swiss", "UK ", "SWEDEN "],
    "Americas": ["NYSE", "NASDAQ", "S&P 500", "US ", "THOMSON REUTERS", "CANADIAN DOLLAR CURRENCY INDEX", "US GOVERNMENT BONDS", "DOW JONES", "DOW-JONES", "RUSSELL", "PHLX"],
    "Africa": ["SOUTH AFRICA"],
    "Pacific": ["AUSTRALIA", "Australia", "NEW ZEALAND "],
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

function tryDetectSector(s) {
    if (currencyIndices.indexOf(s.s) >= 0) {
        return "currency";
    }
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

function tryDetectCountry(s) {
    if (s.region) {
        return s.region;
    }
    const description = s.f[2];
    return matches2(description, regionMarks);
}

let emptySectorCount = 0, emptyCountryCount = 0;
const dstSymbols = [];

const majorIndices = [
    {"s": "SP:SPX", "cc": "US"},
    {"s": "TVC:IXIC", "cc": "US"},
    {"s": "DJ:DJI", "cc": "US"},
    {"s": "CBOE:VIX", "cc": "US"},
    {"s": "TSX:TSX", "cc": "CA"},
    {"s": "TVC:UKX", "cc": "GB"},
    {"s": "XETR:DAX", "cc": "DE"},
    {"s": "EURONEXT:PX1", "cc": "FR"},
    {"s": "MIL:FTSEMIB", "cc": "IT"},
    {"s": "TVC:NI225", "cc": "JP"},
    {"s": "TVC:KOSPI", "cc": "KR"},
    {"s": "TVC:SHCOMP", "cc": "CN"},
    {"s": "SZSE:399001", "cc": "CN"},
    {"s": "HSI:HSI", "cc": "HK"},
    {"s": "TVC:STI", "cc": "SG"},
    {"s": "ASX:XJO", "cc": "AU"},
    {"s": "NZX:NZ50G", "cc": "NZ"},
    {"s": "TWSE:TAIEX", "cc": "TW"},
    {"s": "FTSEMYX:FBMKLCI", "cc": "MY"},
    {"s": "IDX:COMPOSITE", "cc": "ID"},
    {"s": "TVC:SX5E", "cc": "EU"},
    {"s": "BME:IBC", "cc": "ES"},
    {"s": "SIX:SMI", "cc": "CH"},
    {"s": "GPW:WIG20", "cc": "PL"},
    {"s": "EURONEXT:AEX", "cc": "NL"},
    {"s": "EURONEXT:BEL20", "cc": "BE"},
    {"s": "LUXSE:LUXX", "cc": "LU"},
    {"s": "MOEX:IMOEX", "cc": "RU"},
    {"s": "BELEX:BELEX15", "cc": "RS"},
    {"s": "OMXRSE:OMXRGI", "cc": "LV"},
    {"s": "OMXTSE:OMXTGI", "cc": "EE"},
    {"s": "OMXVSE:OMXVGI", "cc": "LT"},
    {"s": "BIST:XU100", "cc": "TR"},
    {"s": "TASE:TA35", "cc": "IL"},
    {"s": "NSE:NIFTY", "cc": "IN"},
    {"s": "BSE:SENSEX", "cc": "IN"},
    {"s": "DFM:DFMGI", "cc": "AE"},
    {"s": "TADAWUL:TASI", "cc": "SA"},
    {"s": "QSE:GNRI", "cc": "QA"},
    {"s": "BAHRAIN:BSEX", "cc": "BH"},
    {"s": "NSENG:NSE30", "cc": "NG"},
    {"s": "EGX:EGX30", "cc": "EG"},
    {"s": "BMFBOVESPA:IBOV", "cc": "BR"},
    {"s": "BMV:ME", "cc": "MX"},
    {"s": "BCBA:IMV", "cc": "AR"},
    {"s": "BVC:IGBC", "cc": "CO"},
    {"s": "BCS:IPSA", "cc": "CL"},
    {"s": "BVL:SPBLPGPT", "cc": "PE"}
];

const symbolsPriorities = {};

const currencyIndices = [
    // Currency Indices
    "TVC:DXY",
    "TVC:EXY",
    "TVC:BXY",
    "TVC:SXY",
    "TVC:JXY",
    "TVC:CXY",
    "TVC:AXY",
    "TVC:ZXY",
];
[].concat(
    majorIndices.map(el => el.s)
).concat(currencyIndices).forEach((s, i) => symbolsPriorities[s] = i);

function detectPriority(s) {
    return symbolsPriorities[s];
}

const majorIndicesCC = {};
majorIndices.forEach(s => majorIndicesCC[s.s] = s.cc);

function getCountryCode(s) {
    return majorIndicesCC[s];
}

symbols.forEach(function (s) {
    const dst = {f: []};
    dst.s = s.s;
    let cat = tryDetectSector(s);
    if (!cat) {
        emptySectorCount++;
        console.error("can't detect sector for " + s.s + " (" + s.f[2] + ")");
    }
    dst.f[0] = cat;

    const reg = tryDetectCountry(s);
    if (reg === undefined || reg === null) {
        emptyCountryCount++;
        console.error("can't detect country for " + s.s + " (" + s.f[2] + ")");
    }
    dst.f[1] = reg;

    dst.f[2] = detectPriority(s.s);

    dst.f[3] = getCountryCode(s.s);

    dstSymbols.push(dst);
});

dstSymbols.sort(function (l, r) {
    return l.s.localeCompare(r.s);
});

if (emptySectorCount) {
    console.info("Symbols with empty category is " + emptySectorCount);
}

if (emptyCountryCount) {
    console.info("Symbols with empty region is " + emptyCountryCount);
}

fs.writeFileSync(dstPath, JSON.stringify(
    {
        "time": new Date().toISOString() + '',
        "fields": ["sector", "country", "index_priority", "country_code"],
        "symbols": dstSymbols
    }, null, 2));


// update used groups list
function generateUsedGroups() {
    const usedGroupsList = groups.map(function (gr) {
        const url = new URL(gr.url);
        const groupNames = url.pathname.split('/');
        const groupName = groupNames[groupNames.length - 1];
        return groupName + url.search;
    });
    usedGroupsList.sort();
    return usedGroupsList;
}

fs.writeFileSync(dstGroupsPath, JSON.stringify({
    "time": new Date().toISOString() + '',
    "fields": [],
    "symbols": generateUsedGroups().map(function (s) {
        return {"s": s, "f": []};
    })
}, null, 2));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function(addedGroupsArr) {
    const allGroups = JSON.parse(requestSync("GET", "http://idc.tradingview.com/udf_proxy/").getBody());
    const addedGroupsHash = {};
    addedGroupsArr.forEach(function (gr) {
        const url = new URL(gr.url);
        const groupNames = url.pathname.split('/');
        const groupName = groupNames[groupNames.length - 1];
        addedGroupsHash[groupName] = true;
    });

    const skippedIndices = {
        "euronext_non_primary_indices": true,
        "euronext_primary_indices": true,
        "international_indices": true,
        "russel_indices": true,
        "russell_indices": true,
        "malaysia_indices": true,
        "cboe_indices": true,
        "nasdaq_indices": true,
        "nyse_gif_indices": true,
        "nyse_indices": true,
        "hongkong_indices": true,
        "singapore_indices": true,
        "tocom_indices": true,
        "tokyo_indices": true,
        "topix_indices": true,
    };

    const missingGroups = Object.keys(allGroups.feeds.idc).filter(function (gr) {
        return gr.endsWith("_indices") && !skippedIndices[gr];
    }).filter(function (groupName) {
        return !addedGroupsHash[groupName];
    });
    missingGroups.sort();
    console.log("Not used index groups:\n" + JSON.stringify(missingGroups, null, 2));
})(groups);