const requestSync = require("sync-request"),
    fs = require("fs");
const {URL} = require('url');

const dstPath = "../cfd.json";
const dstGroupsPath = "../../groups/indices.json";
const udfProxyPath = "http://udf-proxy.tradingview.com:8094/symbols/";
const groups = [
    {url: "dxy_idc2", region: "Americas"},
    {url: "us_chicago_indices", region: "Americas", include: ["TVC:VIX"]},
    {url: "us_ny_indices"},
    {url: "japan_indices", region: "Asia"},
    {url: "china_indices", region: "Asia"},
    {url: "european_indices", region: "Europe"},
    {url: "british_indices", region: "Europe"},
    {url: "spanish_indices", region: "Europe"},
    {url: "government_bonds", sector: "bond"},
    {url: "euro_bonds", sector: "bond", region: "Europe"},
    {url: "canadian_bonds", sector: "bond", region: "Americas"},
    {
        url: "forex_tvc",
        exclude: ["TVC:USOIL", "TVC:UKOIL"]
    },
    {url: "nzx_tvc_indices", region: "Pacific"},
    {
        url: "fxcm_cfd?domain=tvbs",
        include: ["FX:USOIL", "FX:UKOIL"]
    },
    {
        url: "oanda",
        include: [
            "OANDA:HK33HKD", "OANDA:CORNUSD",
            "OANDA:XCUUSD", "OANDA:NATGASUSD", "OANDA:NL25EUR", "OANDA:US30USD",
            "OANDA:SUGARUSD", "OANDA:AU200AUD",
            "OANDA:DE30EUR", "OANDA:WHEATUSD", "OANDA:SOYBNUSD"
        ]
    },
    {
        url: "gain",
        include: ["FOREXCOM:HGOUSD", "FOREXCOM:COTUSD"]
    },
    {
        url: "sp_indices?typespecs=main",
        include: ["SP:SPX"],
        region: "Americas"
    },
    {
        url: "cboe_indices_delayed?typespecs=main",
        include: ["CBOE:VIX"],
        region: "Americas"
    },
    {
        url: "euronext_primary_indices",
        include: [
            "EURONEXT:PX1",
            "EURONEXT:AEX",
            "EURONEXT:BEL20"],
        region: "Europe"
    },
    {
        url: "toronto_indices",
        include: ["TSX:TSX"],
        region: "Americas"
    },
    {
        url: "asx_indices",
        include: ["ASX:XJO"],
        region: "Pacific"
    },
    {
        url: "korean_tvc_indices",
        include: ["TVC:KOSPI"],
        region: "Asia"
    },
    {
        url: "bovespa_indices",
        include: ["BMFBOVESPA:IBOV"],
        region: "Americas"
    },
    {
        url: "nse_indices",
        include: ["NSE:NIFTY"],
        region: "Asia"
    },
    {
        url: "bse_indices",
        include: ["BSE:SENSEX"],
        region: "Asia"
    },
    {
        url: "moex_indices",
        include: ["MOEX:IMOEX"],
        region: "Europe"
    },
    {
        url: "nzx_indices",
        include: ["NZX:NZ50G"],
        region: "Pacific"
    },
    {
        url: "bme_indices",
        include: ["BME:IBC"],
        region: "Europe"
    },
    {
        url: "dj_indices?typespecs=main",
        include: ["DJ:DJI"],
        region: "Americas"
    },
    {
        url: "singapore_tvc_indices",
        include: ["TVC:STI"],
        region: "Asia"
    },
    {
        url: "swiss_indices",
        include: ["SIX:SMI"],
        region: "Europe"
    },
    {
        url: "hangseng_indices",
        include: ["HSI:HSI"],
        region: "Asia"
    },
    {
        url: "xetra_indices",
        include: ["XETR:DAX"],
        region: "Europe"
    },
    {
        url: "istanbul_indices",
        include: ["BIST:XU100"],
        region: "Europe"
    },
    {
        url: "warsaw_indices",
        include: ["GPW:WIG20"],
        region: "Europe"
    },
    {
        url: "mexico_indices",
        include: ["BMV:ME"],
        region: "Americas"
    },
    {
        url: "egyptian_indices",
        include: ["EGX:EGX30"],
        region: "Middle East"
    },
    {
        url: "santiago_indices",
        include: ["BCS:IPSA"],
        region: "Americas"
    },
    {
        "url": "bahrain_indices",
        "include": ["BAHRAIN:BSEX"],
        "region": "Middle East"
    },
    {
        "url": "belgrade_indices",
        "include": ["BELEX:BELEX15"],
        "region": "Europe"
    },
    {
        "url": "buenosaires_indices",
        "include": ["BCBA:IMV"],
        "region": "Americas"
    },
    {
        "url": "colombia_indices",
        "include": ["BVC:IGBC"],
        "region": "Americas"
    },
    {
        "url": "dubai_indices",
        "include": ["DFM:DFMGI"],
        "region": "Middle East"
    },
    {
        "url": "indonesia_indices",
        "include": ["IDX:COMPOSITE"],
        "region": "Asia"
    },
    {
        "url": "lima_indices",
        "include": ["BVL:SPBLPGPT"],
        "region": "Americas"
    },
    {
        "url": "malaysia_ftse_indices",
        "include": ["FTSEMYX:FBMKLCI"],
        "region": ""
    },
    {
        "url": "milan_indices",
        "include": ["MIL:FTSEMIB"],
        "region": "Europe"
    },
    {
        "url": "nigerian_indices",
        "include": ["NSENG:NSE30"],
        "region": "Africa"
    },
    {
        "url": "qatar_indices",
        "include": ["QSE:GNRI"],
        "region": "Middle East"
    },
    {
        "url": "riga_indices",
        "include": ["OMXRSE:OMXRGI"],
        "region": "Europe"
    },
    {
        "url": "saudi_indices",
        "include": ["TADAWUL:TASI"],
        "region": "Middle East"
    },
    {
        "url": "shenzhen_indices",
        "include": ["SZSE:399001"],
        "region": "Asia"
    },
    {"url": "taiwan_indices", "include": ["TWSE:TAIEX"], "region": "Asia"},
    {
        "url": "tallinn_indices",
        "include": ["OMXTSE:OMXTGI"],
        "region": "Europe"
    },
    {
        "url": "telaviv_indices",
        "include": ["TASE:TA35"],
        "region": "Middle East"
    },
    {
        "url": "vilnius_indices",
        "include": ["OMXVSE:OMXVGI"],
        "region": "Europe"
    },
    {
        "url": "south_africa_tvc_indices",
        "region": "Africa"
    },
    {
        "url": "helsinki_basic_indices",
        "include": ["OMXHEX:OMXH25"],
        "region": "Europe"
    },
    {
        "url": "iceland_indices",
        "include": ["OMXICE:OMXI8"],
        "region": "Europe"
    },
    {
        "url": "stockholm_basic_indices",
        "include": ["OMXSTO:OMXS30"],
        "region": "Europe"
    },
    {
        "url": "copenhagen_indices",
        "include": ["OMXCOP:OMXC25"],
        "region": "Europe"
    },
    // {
    //     "url": "thailand_indices",
    //     "include": ["SET:SET"], // TODO : uncomment after release
    //     "region": "Asia"
    // },
];

const types = {
    "cfd": true,
    "index": true
};

const symbols = [];

function getUrl(gr) {
    return udfProxyPath + gr.url;
}

groups.forEach(function (path) {
    let url = path;
    let include;
    let exclude;
    if (typeof path !== "string" && path.url) {
        url = getUrl(path);
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
    urlO.searchParams.append('fields', 'symbol,type,description,country');
    url = urlO.toString();
    const response = requestSync("GET", url);
    if (response.statusCode != 200) {
        throw Error(url + ':' + response.statusCode);
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
                if (path.sector) {
                    s.sector = path.sector;
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
    "Asia": ["CHINA", "HONG KONG", "Hong Kong", "INDIA", "INDONESIA", "JAPAN", "KOREA", "MALAYSIA", "SINGAPORE", "Singapore", "THAILAND", "TAIWAN"],
    "Europe": ["EURO CURRENCY INDEX", "BRITISH POUND CURRENCY INDEX", "SWISS FRANC CURRENCY INDEX", "BELGIUM", "FRANCE",
               "GERMAN", "DENMARK", "Germany", "IRELAND", "ITALY", "NETHERLANDS", "Netherlands", "NORWAY", "PORTUGAL",
               "SPAIN", "Swiss", "UK ", "SWEDEN", "GREECE", "POLAND"],
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
    if (s.sector) {
        return s.sector;
    }
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

function tryDetectRegion(s) {
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
    { "s":"OMXHEX:OMXH25", "cc":"FI" },
    { "s":"OMXICE:OMXI8",  "cc":"IS" },
    { "s":"OMXSTO:OMXS30", "cc":"SE" },
    { "s":"OMXCOP:OMXC25", "cc":"DK" },
    {"s": "BELEX:BELEX15", "cc": "RS"},
    {"s": "OMXRSE:OMXRGI", "cc": "LV"},
    {"s": "OMXTSE:OMXTGI", "cc": "EE"},
    {"s": "OMXVSE:OMXVGI", "cc": "LT"},
    {"s": "BIST:XU100", "cc": "TR"},
    {"s": "TASE:TA35", "cc": "IL"},
    {"s": "TVC:SA40", "cc": "ZA"},
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
    {"s": "BVL:SPBLPGPT", "cc": "PE"},
];

const indicesPriorities = {};

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
).concat(currencyIndices).forEach((s, i) => indicesPriorities[s] = i);

const bondsRegionsPriority = [
    "US",
    "CANADIAN",
    // UK, Germany, France, Spain, Italy, потом по алфавиту
    "UK",
    "GERMAN",
    "FRANCE",
    "SPAIN",
    "ITALY",
    //  japan, korea, china, india, hong kong, singapore, malaysia, indonesia, thailand, потом по алфавиту
    "JAPAN",
    "KOREA",
    "CHINA",
    "INDIA",
    "HONG KONG",
    "SINGAPORE",
    "MALAYSIA",
    "INDONESIA",
    "THAILAND"
];

function calcHash(name, limit) {
    let result = 0;
    const len = Math.min(name.length, limit);
    for (let i = 0; i < len; i++) {
        result += (name.charCodeAt(i) - 0x41) * Math.pow(10, (len - i) * 2);
    }
    return result;
}

function getBondRegionPriority(description, notUseRegionPriority) {
    if (!notUseRegionPriority) {
        const idx = bondsRegionsPriority.findIndex(reg => description.startsWith(reg));
        if (idx >= 0) {
            return idx;
        }
    }
    return bondsRegionsPriority.length + calcHash(description, 4);
}

const rxBondParser = /[A-Z]{2}([0-9]{2})(M)?Y?/;

function getBondNamePriority(ticker) {
    const parseResult = rxBondParser.exec(ticker);
    if (!parseResult) {
        console.warn("can't parse " + ticker + " bond's name");
        return calcHash(ticker, 3);
    }
    return (parseResult[2] ? 0 : 1) * 10 + (+parseResult[1]);
}

function detectBondPriority(s, notUseRegionPriority) {
    const description = s.f[2];
    const regionP = getBondRegionPriority(description, notUseRegionPriority);
    const nameP = getBondNamePriority(s.f[0]);
    return regionP * 1000 + nameP;
}

function detectPriority(s, cat) {
    switch (cat) {
        case "bond":
            return detectBondPriority(s);
    }
    return indicesPriorities[s.s];
}

function detectPriority2(s, cat) {
    switch (cat) {
        case "bond":
            return detectBondPriority(s, true);
    }
    return null;
}

const symbolsCountryCode = {};
majorIndices.forEach(s => symbolsCountryCode[s.s] = s.cc);

const countryCodeByName = {
    "SOUTH AFRICA": "ZA",
    "ARGENTINA": "AR",
    "AUSTRALIA": "AU",
    "AUSTRIA": "AT",
    "BELGIUM": "BE",
    "BAHRAIN": "BH",
    "BRAZIL": "BR",
    "CBOE": "US",
    "CANADIAN": "CA",
    "CHILE": "CL",
    "CHINA": "CN",
    "COLOMBIA": "CO",
    "CZECH REPUBLIC": "CZ",
    "DENMARK": "DK",
    "EGYPT": "EG",
    "ESTONIA": "EE",
    "EURO": "EU",
    "FINLAND": "FI",
    "FRANCE": "FR",
    "GERMAN": "DE",
    "GREECE": "GR",
    "HONG KONG": "HK",
    "HUNGARY": "HU",
    "ICELAND": "IS",
    "INDIA": "IN",
    "INDONESIA": "ID",
    "IRAN": "IR",
    "IRELAND": "IE",
    "ISRAEL": "IL",
    "ITALY": "IT",
    "JAPAN": "JP",
    "KOREA": "KR",
    "LATVIA": "LV",
    "LITHUANIA": "LT",
    "LUXEMBOURG": "LU",
    "MALAYSIA": "MY",
    "MEXICO": "MX",
    "NETHERLANDS": "NL",
    "NEW ZEALAND": "NZ",
    "NIGERIA": "NG",
    "NORWAY": "NO",
    "NOTH KOREA": "KP",
    "PORTUGAL GOVERNMENT": "PT",
    "PERU": "PE",
    "POLAND": "PL",
    "QATAR": "QA",
    "ROMANIA": "RO",
    "RUSSIA": "RU",
    "SAUDI ARABIA": "SA",
    "SERBIA": "RS",
    "SINGAPORE": "SG",
    "SPAIN": "ES",
    "SWEDEN": "SE",
    "SWITZERLAND": "CH",
    "TAIWAN": "TW",
    "THAILAND": "TH",
    "TURKEY": "TR",
    "UK ": "UK",
    "US ": "US",
    "UNITED ARAB EMIRATES": "AE",
    "VIETNAM": "VN",
    "WORLDWIDE": "WW"
};

function tryMatchCountry(desciption) {
    for (const p in countryCodeByName) {
        if (matches(desciption, [p])) {
            return countryCodeByName[p];
        }
    }
    return undefined;
}

function getCountryCode(s, cat) {
    const hardCoded = symbolsCountryCode[s.s];
    if (hardCoded) {
        return hardCoded;
    }
    if ("bond" === cat) {
        const description = s.f[2];
        const result = tryMatchCountry(description);
        if (!result) {
            console.error("Can't find country code for " + description);
        }
        return result;
    }
    if (s.f[3]){
        //return s.f[3].toUpperCase();
    }
    return undefined;
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

    const reg = tryDetectRegion(s);
    if (reg === undefined || reg === null) {
        emptyCountryCount++;
        console.error("can't detect country for " + s.s + " (" + s.f[2] + ")");
    }
    dst.f[1] = reg;
    dst.f[2] = detectPriority(s, cat);
    dst.f[3] = getCountryCode(s, cat);
    dst.f[4] = detectPriority2(s, cat);

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
        "fields": [
            "sector",
            "country",
            "index_priority",
            "country_code",
            "forex_priority"],
        "symbols": dstSymbols
    }, null, 2));


// update used groups list
function generateUsedGroups() {
    const usedGroupsList = groups.map(function (gr) {
        const url = new URL(getUrl(gr));
        const groupNames = url.pathname.split('/');
        const groupName = groupNames[groupNames.length - 1];
        return groupName + url.search;
    });
    usedGroupsList.sort();
    return usedGroupsList;
}

fs.writeFileSync(dstGroupsPath, JSON.stringify({
    "fields": [],
    "symbols": generateUsedGroups().map(function (s) {
        return {"s": s, "f": []};
    })
}, null, 2));

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function(addedGroupsArr) {
    const allGroups = JSON.parse(requestSync("GET", "http://udf-proxy.tradingview.com:8094/").getBody());
    const addedGroupsHash = {};
    addedGroupsArr.forEach(function (gr) {
        const url = new URL(getUrl(gr));
        const groupNames = url.pathname.split('/');
        const groupName = groupNames[groupNames.length - 1];
        addedGroupsHash[groupName] = true;
    });

    const skippedIndices = {
        "euronext_non_primary_indices": true,
        "euronext_indices": true,
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
        "cboe_russell_indices": true,
        "euronext_non_primary_amsterdam_indices": true,
        "euronext_non_primary_brussels_indices": true,
        "euronext_non_primary_europe_indices": true,
        "euronext_non_primary_lisbon_indices": true,
        "euronext_non_primary_paris_indices": true,
        "euronext_primary_amsterdam_indices": true,
        "euronext_primary_brussels_indices": true,
        "euronext_primary_europe_indices": true,
        "euronext_primary_lisbon_indices": true,
        "euronext_primary_paris_indices": true,
        "vietnam_indices": true,
        "copenhagen_basic_indices": true,
        "helsinki_indices": true,
        "iceland_basic_indices": true,
        "stockholm_indices": true,
    };

    const missingGroups = Object.keys(allGroups.feeds.idc).filter(function (gr) {
        return gr.endsWith("_indices") && !skippedIndices[gr];
    }).filter(function (groupName) {
        return !addedGroupsHash[groupName];
    });
    missingGroups.sort();
    console.log("Not used index groups:\n" + JSON.stringify(missingGroups, null, 2));
})(groups);
