const requestSync = require("sync-request"),
    fs = require("fs");
const {URL} = require('url');

const dstPath = "../bonds.json";
const groups = [
    {
        url2: "prefix=TVC&type=bond",
        sector: "bond"
    }
];

const types = {
    "bond": true
};

const symbols = [];

function getUrl(gr) {
    const udfProxyPath = "http://udf-proxy.tradingview.com:8094/symbols";
    if (gr.url2) {
        return udfProxyPath + '?perm=*&domain=tv&' + gr.url2;
    }
    return udfProxyPath + '/' + gr.url;
}

groups.forEach(function (gr) {
    let url = gr;
    let include;
    let exclude;
    if (typeof gr !== "string") {
        url = getUrl(gr);
        if (gr.include) {
            include = {};
            gr.include.forEach(function (val) {
                include[val] = true;
            });
        }
        if (gr.exclude) {
            exclude = {};
            gr.exclude.forEach(function (val) {
                exclude[val] = true;
            });
        }
    }

    const urlO = new URL(url);
    urlO.searchParams.append('fields', 'symbol,type,description,country,symbol-proname,currency,value-unit-id');
    url = urlO.toString();
    const response = requestSync("GET", url);
    if (response.statusCode != 200) {
        throw Error(url + ':' + response.statusCode);
    }
    fields_list = JSON.parse(response.getBody()).fields;

    console.error(`360: ${JSON.stringify(url)}`);

    symbol_index = fields_list.indexOf("symbol");
    type_index = fields_list.indexOf("type");
    description_index = fields_list.indexOf("description");
    country_index = fields_list.indexOf("country");
    symbol_proname_index = fields_list.indexOf("symbol-proname");
    currency_index = fields_list.indexOf("currency");
    value_unit_id_index = fields_list.indexOf("value-unit-id");
    JSON.parse(response.getBody()).symbols.forEach(function (s) {
        if (types[s.f[type_index]]) {
            let skip = false;
            if (include && !include[s.s]) {
                skip = true;
            }
            if (exclude && exclude[s.s]) {
                skip = true;
            }
            if (!skip && gr.excludePattern && gr.excludePattern.test(s.s)) {
                skip = true;
            }
            if (!skip) {
                if (gr.region) {
                    s.region = gr.region;
                }
                if (gr.sector) {
                    s.sector = gr.sector;
                }

                let dolly = Object.assign({}, s);
                dolly.f = Object.assign({}, s.f);
                dolly.f[0] = s.f[symbol_index];
                dolly.f[1] = s.f[type_index];
                dolly.f[2] = s.f[description_index];
                dolly.f[3] = s.f[country_index];
                dolly.f[4] = s.f[symbol_proname_index];
                dolly.f[5] = s.f[currency_index];
                dolly.f[6] = s.f[value_unit_id_index]

                symbols.push(dolly);

                // if (s.s.indexOf('IXIC')>=0) console.log(url);
            }
        }
    });
});

const symbolCurrency = new Map()

symbols.forEach(function (s) {
    if (!isYieldSymbol(s)) {
        symbolCurrency.set(s.s, getCurrency(s))
    }
})

function isYieldSymbol(s) {
    return s.s.endsWith('Y')
}

function getCurrency(s) {
    if (s.f[5]) {
        console.error("s.f[5] " + s.f[5]);
        return s.f[5].toUpperCase();
    }
    if (s.f[6]) {
        console.error("s.f[6] " + s.f[6]);
        return s.f[6].toUpperCase();
    }
    return undefined;
}

const bondsMarks = [
    "TREASURY NOTE", "BOND", "Bond", "Bonds", "T-Note", "EURO BUND", "UK 10Y Gilt"
];

const regionMarks = {
    "Middle East": ["Turkey"],
    "Asia": ["China", "Hong Kong", "India", "Indonesia", "Japan", "JAPANESE YEN WCO", "Korea", "Malaysia", "MALAYSIA", "Singapore", "Thailand", "Taiwan", "Philippines", "Vietnam"],
    "Europe": ["EUROS WCO", "BRITISH POUNDS WCO", "SWISS FRANCS WCO", "Belgium", "France", "Ukraine", "Russian Federation",
        "Denmark", "Germany", "Ireland", "Italy", "Netherlands", "Norway", "Portugal", "Iceland", "Lithuania", "Latvia", "Romania", "Slovakia",
        "Spain", "Swiss", "United Kingdom", "Sweden", "Greece", "Poland", "Austria", "Switzerland", "Czech", "Euro", "Finland", "Hungary"],
    "Americas": ["NYSE", "NASDAQ", "S&P 500", "US ", "U.S.", "THOMSON REUTERS", "CANADIAN DOLLARS WCO", "US GOVERNMENT BONDS", "DOW JONES",
        "DOW-JONES", "RUSSELL", "PHLX", "BR GOVERNMENT BONDS", "Canada", "Colombia", "Chile", "Brazil", "Peru", "United States"],
    "Africa": ["South Africa"],
    "Pacific": ["Australia", "AUSTRALIAN WCO", "New Zealand ", "NEW ZEAL AND WCO"],
    "": ["CRUDE OIL", "Corn", "Natural Gas", "Soybeans", "Sugar", "Wheat", "Copper", "GOLD", "SILVER", "PLATINUM", "PALLADIUM", "Heating Oil", "Cotton", "COTTON", "Crude Oil"]
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
    {"s": "TVC:FTMIB", "cc": "IT"},
    {"s": "TVC:NI225", "cc": "JP"},
    {"s": "TVC:KOSPI", "cc": "KR"},
    {"s": "SSE:000001", "cc": "CN"},
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
    {"s": "MOEX:IMOEX", "cc": "RU"},
    {"s": "OMXHEX:OMXH25", "cc": "FI"},
    {"s": "OMXICE:OMXI10", "cc": "IS"},
    {"s": "OMXSTO:OMXS30", "cc": "SE"},
    {"s": "OMXCOP:OMXC25", "cc": "DK"},
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
    {"s": "BAHRAIN:BHBX", "cc": "BH"},
    {"s": "NSENG:NSE30", "cc": "NG"},
    {"s": "EGX:EGX30", "cc": "EG"},
    {"s": "BMFBOVESPA:IBOV", "cc": "BR"},
    {"s": "BMV:ME", "cc": "MX"},
    {"s": "BCBA:IMV", "cc": "AR"},
    {"s": "BVC:ICAP", "cc": "CO"},
    {"s": "BCS:SP_IPSA", "cc": "CL"},
    {"s": "BVL:SPBLPGPT", "cc": "PE"},
    {"s": "TWSE:TW50", "cc": "TW"},
    {"s": "BET:BUX", "cc": "HU"},
    {"s": "ATHEX:GD", "cc": "GR"},
    {"s": "BVB:BET", "cc": "RO"},
    {"s": "IDX:IDX30", "cc": "ID"}
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
    "United States",
    "Canada",
    // UK, Germany, France, Spain, Italy, потом по алфавиту
    "United Kingdom",
    "Germany",
    "France",
    "Spain",
    "Italy",
    //  japan, korea, china, india, hong kong, singapore, malaysia, indonesia, thailand, потом по алфавиту
    "Japan",
    "Korea",
    "China",
    "India",
    "Hong Kong",
    "Singapore",
    "Malaysia",
    "Indonesia",
    "Thailand"
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
    "South Africa": "ZA",
    "Argentina": "AR",
    "Australia": "AU",
    "Austria": "AT",
    "Belgium": "BE",
    "Bahrain": "BH",
    "Brazil": "BR",
    "CBOE": "US",
    "Canada": "CA",
    "Chile": "CL",
    "China": "CN",
    "Colombia": "CO",
    "Czech": "CZ",
    "Denmark": "DK",
    "Egypt": "EG",
    "Estonia": "EE",
    "Euro": "EU",
    "EURO": "EU",
    "Finland": "FI",
    "France": "FR",
    "Germany": "DE",
    "Greece": "GR",
    "Hong Kong": "HK",
    "Hungary": "HU",
    "Iceland": "IS",
    "India": "IN",
    "Indonesia": "ID",
    "Iran": "IR",
    "Ireland": "IE",
    "Israel": "IL",
    "Italy": "IT",
    "Japan": "JP",
    "Korea": "KR",
    "Latvia": "LV",
    "Lithuania": "LT",
    "Luxembourg": "LU",
    "Malaysia": "MY",
    "Mexico": "MX",
    "Netherlands": "NL",
    "New Zealand": "NZ",
    "Nigeria": "NG",
    "Norway": "NO",
    "NOTH KOREA": "KP",
    "Portugal": "PT",
    "Peru": "PE",
    "Philippines": "PH",
    "Poland": "PL",
    "Qatar": "QA",
    "Romania": "RO",
    "Russia": "RU",
    "SAUDI ARABIA": "SA",
    "Serbia": "RS",
    "Singapore": "SG",
    "Slovakia": "SK",
    "Spain": "ES",
    "Sweden": "SE",
    "Switzerland": "CH",
    "Taiwan": "TW",
    "Thailand": "TH",
    "Turkey": "TR",
    "Ukraine": "UA",
    "United Kingdom": "UK",
    "United States ": "US",
    "UNITED ARAB EMIRATES": "AE",
    "Vietnam": "VN",
    "WORLDWIDE": "WW",
    "BR": "BR",
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
    if (s.f[3]) {
        //return s.f[3].toUpperCase();
    }
    return undefined;
}

symbols.forEach(function (s) {
    const dst = {f: []};
    dst.s = s.s;
    let cat = tryDetectSector(s);
    // if (!cat) {
    //     emptySectorCount++;
    //     console.error("can't detect sector for " + s.s + " (" + s.f[2] + ")");
    // }
    // dst.f[0] = cat;

    const reg = tryDetectRegion(s);
    if (reg === undefined || reg === null) {
        emptyCountryCount++;
        console.error("can't detect country for " + s.s + " (" + s.f[2] + ")");
    }
    dst.f[0] = reg;
    dst.f[1] = detectPriority(s, cat);
    dst.f[2] = detectPriority2(s, cat);

    if (isYieldSymbol(s)) {
        dst.f[3] = symbolCurrency.get(s.s.substring(0, s.s.length - 1))
    } else {
        dst.f[3] = ""
    }

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

function verifyAllMajorIndicesAreCovered() {
    const mjInd = {};
    majorIndices.forEach(i => mjInd[i.s] = true);
    dstSymbols.forEach(s => delete mjInd[s.s]);
    const missing = Object.keys(mjInd);
    if (missing.length > 0) {
        console.error(`Missing major indices: ${JSON.stringify(missing)}`);
    }
};
verifyAllMajorIndicesAreCovered();

fs.writeFileSync(dstPath, JSON.stringify(
    {
        "fields": [
            "region",
            "index_priority",
            "forex_priority",
            "Bond.Currency"],
        "symbols": dstSymbols
    }, null, 2));


// update used groups list
function generateUsedGroups() {
    const usedGroupsList = groups.map(function (gr) {
        const url = new URL(getUrl(gr));
        const groupNames = url.pathname.split('/');
        const groupName = groupNames[groupNames.length - 1];
        return gr.url2 ? url.search : '/' + groupName + url.search;
    });
    usedGroupsList.sort();
    return usedGroupsList;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

(function (addedGroupsArr) {
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
        "russell_indices": true,
        "malaysia_indices": true,
        "cboe_indices": true,
        "nasdaq_us_indices": true,
        "nasdaq_europe_indices": true,
        "nasdaq_omx_indices": true,
        "nasdaq_global_indices": true,
        "nasdaq_asia_indices": true,
        "nasdaq_america_indices": true,
        "nasdaq_other_indices": true,
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
        "euronext_primary_europe_indices": true,
        "euronext_primary_lisbon_indices": true,
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