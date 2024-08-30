const requestSync = require("sync-request"),
    fs = require("fs");
const {URL} = require('url');

const dstPath = "../cfd.json";
const groups = [
    {
        url2: "prefix=TVC",
        include: ["TVC:VIX"],
        region: "Americas"
    },
    {
        url2: "prefix=TVC",
        include: ["TVC:DJI", "TVC:MOVE", "TVC:NYA", "TVC:RUA", "TVC:RUI", "TVC:RUT", "TVC:TRJEFFCRB", "TVC:XAX", "TVC:XMI"]
    },
    {
        url2: "prefix=TVC",
        include: ["TVC:HGX", "TVC:IXIC", "TVC:OSX", "TVC:SOX", "TVC:UTY", "TVC:XAU"]
    },
    {
        url2: "prefix=TVC",
        include: ["TVC:AXY", "TVC:BXY", "TVC:CXY", "TVC:DXY", "TVC:EXY", "TVC:JXY", "TVC:SXY", "TVC:ZXY"]
    },
    {
        url2: "prefix=SSE&type=index",
        include: ["SSE:000001"],
        region: "Asia"
    },
    {
        url2: "prefix=TVC&type=index",
        include: ["TVC:NI225","TVC:HSI"],
        region: "Asia"
    },
    {
        url2: "prefix=TVC&type=cfd",
        include: ["TVC:FTMIB","TVC:SX5E","TVC:SXXP","TVC:AEX","TVC:CAC40","TVC:SSMI","TVC:DEU40","TVC:UKX","TVC:IBEX35"],
        region: "Europe"
    },
    {
        url2: "prefix=TVC&type=bond",
        sector: "bond"
    },
    {
        url2: "prefix=TVC&type=cfd",
        include: ["TVC:EUBUND"],
        sector: "bond",
        region: "Europe"
    },
    {
        url2: "prefix=TVC",
        include: ["TVC:GOLDSILVER","TVC:GOLD","TVC:PLATINUM","TVC:PALLADIUM","TVC:SILVER"]
    },
    {
        url2: "prefix=TVC&type=index",
        include: ["TVC:NZ50G"],
        region: "Pacific"
    },
    {
        url2: "prefix=FX",
        include: ["FX:USOIL", "FX:UKOIL"],
    },
    {
        url2: "prefix=OANDA",
        include: [
            "OANDA:HK33HKD", "OANDA:CORNUSD",
            "OANDA:XCUUSD", "OANDA:NATGASUSD", "OANDA:NL25EUR", "OANDA:US30USD",
            "OANDA:SUGARUSD", "OANDA:AU200AUD",
            "OANDA:DE30EUR", "OANDA:WHEATUSD", "OANDA:SOYBNUSD"
        ]
    },
    {
        url2: "prefix=FOREXCOM",
        include: ["FOREXCOM:HGOUSD", "FOREXCOM:COTUSD"]
    },
    {
        url2: "prefix=SP&alias=1&typespecs=main",
        include: ["SP:SPX"],
        region: "Americas"
    },
    {
        url2: "prefix=CBOE&typespecs=main",
        include: ["CBOE:VIX"],
        region: "Americas"
    },
    {
        url2: "prefix=EURONEXT&type=index&typespecs=main",
        include: ["EURONEXT:PX1","EURONEXT:AEX","EURONEXT:BEL20"],
        region: "Europe"
    },
    {
        url2: "prefix=TSX&type=index&typespecs=main",
        include: ["TSX:TSX"],
        region: "Americas"
    },
    {
        url2: "prefix=ASX&type=index&typespecs=main",
        include: ["ASX:XJO"],
        region: "Pacific"
    },
    {
        url2: "prefix=TVC",
        include: ["TVC:KOSPI"],
        region: "Asia"
    },
    {
        url2: "prefix=BMFBOVESPA&type=index&typespecs=main",
        include: ["BMFBOVESPA:IBOV"],
        region: "Americas"
    },
    {
        url2: "prefix=NSE&type=index&typespecs=main",
        include: ["NSE:NIFTY"],
        region: "Asia"
    },
    {
        url2: "prefix=BSE&type=index&typespecs=main",
        include: ["BSE:SENSEX"],
        region: "Asia"
    },
    {
        url2: "prefix=NZX&type=index&typespecs=main",
        include: ["NZX:NZ50G"],
        region: "Pacific"
    },
    {
        url2: "prefix=BME&type=index&typespecs=main",
        include: ["BME:IBC"],
        region: "Europe"
    },
    {
        url2: "prefix=DJ&alias=1&typespecs=main",
        include: ["DJ:DJI"],
        region: "Americas"
    },
    {
        url2: "prefix=TVC",
        include: ["TVC:STI"],
        region: "Asia"
    },
    {
        url2: "prefix=SIX&type=index&typespecs=main",
        include: ["SIX:SMI"],
        region: "Europe"
    },
    {
        url2: "prefix=HSI&type=index&typespecs=main",
        include: ["HSI:HSI"],
        region: "Asia"
    },
    {
        url2: "prefix=XETR&type=index&typespecs=main",
        include: ["XETR:DAX"],
        region: "Europe"
    },
    {
        url2: "prefix=BIST&type=index&typespecs=main",
        include: ["BIST:XU100"],
        region: "Europe"
    },
    {
        url2: "prefix=GPW",
        include: ["GPW:WIG20"],
        region: "Europe"
    },
    {
        url2: "prefix=BMV&type=index&typespecs=main",
        include: ["BMV:ME"],
        region: "Americas"
    },
    {
        url2: "prefix=EGX&type=index&typespecs=main",
        include: ["EGX:EGX30"],
        region: "Middle East"
    },
    {
        url2: "prefix=BCS&type=index",
        include: ["BCS:SP_IPSA"],
        region: "Americas"
    },
    {
        url2: "prefix=BAHRAIN&type=index",
        include: ["BAHRAIN:BHBX"],
        region: "Middle East"
    },
    {
        "url": "belgrade_indices?kind=delay",
        "include": ["BELEX:BELEX15"],
        "region": "Europe"
    },
    {
        url2: "prefix=BCBA&type=index&typespecs=main",
        include: ["BCBA:IMV"],
        region: "Americas"
    },
    {
        url2: "prefix=BVC&type=index",
        include: ["BVC:ICAP"],
        region: "Americas"
    },
    {
        url2: "prefix=DFM&type=index",
        include: ["DFM:DFMGI"],
        region: "Middle East"
    },
    {
        url2: "prefix=IDX&type=index",
        include: ["IDX:COMPOSITE","IDX:IDX30"],
        region: "Asia"
    },
    {
        url2: "prefix=BVL&type=index",
        include: ["BVL:SPBLPGPT"],
        region: "Americas"
    },
    {
        url2: "prefix=FTSEMYX&type=index",
        include: ["FTSEMYX:FBMKLCI"],
        region: ""
    },
    {
        url2: "prefix=NSENG&type=index",
        include: ["NSENG:NSE30"],
        region: "Africa"
    },
    {
        url2: "prefix=QSE&type=index",
        "include": ["QSE:GNRI"],
        "region": "Middle East"
    },
    {
        url2: "prefix=OMXRSE&type=index",
        include: ["OMXRSE:OMXRGI"],
        region: "Europe"
    },
    {
        url2: "prefix=TADAWUL&type=index",
        include: ["TADAWUL:TASI"],
        region: "Middle East"
    },
    {
        url2: "prefix=SZSE&type=index&typespecs=main",
        include: ["SZSE:399001"],
        region: "Asia"
    },
    {
        url2: "prefix=TWSE&type=index",
        include: ["TWSE:TAIEX","TWSE:TW50"],
        region: "Asia"
    },
    {
        url2: "prefix=OMXTSE&type=index&typespecs=main",
        include: ["OMXTSE:OMXTGI"],
        region: "Europe"
    },
    {
        url2: "prefix=TASE&type=index&typespecs=main",
        include: ["TASE:TA35"],
        region: "Middle East"
    },
    {
        url2: "prefix=OMXVSE&type=index&typespecs=main",
        include: ["OMXVSE:OMXVGI"],
        region: "Europe"
    },
    {
        url2: "prefix=TVC&type=index&typespecs=main",
        include: ["TVC:SA40"],
        region: "Africa"
    },
    {
        url2: "prefix=OMXHEX&type=index&typespecs=main",
        include: ["OMXHEX:OMXH25"],
        region: "Europe"
    },
    {
        url2: "prefix=OMXICE&type=index&typespecs=main",
        include: ["OMXICE:OMXI10"],
        region: "Europe"
    },
    {
        url2: "prefix=OMXSTO&type=index&typespecs=main",
        include: ["OMXSTO:OMXS30"],
        region: "Europe"
    },
    {
        url2: "prefix=OMXCOP&type=index&typespecs=main",
        include: ["OMXCOP:OMXC25"],
        region: "Europe"
    },
    {
        url2: "prefix=BET&type=index",
        include: ["BET:BUX"],
        region: "Europe"
    },
    {
        url2: "prefix=ATHEX&type=index",
        include: ["ATHEX:GD"],
        region: "Europe"
    },
    {
        url2: "prefix=BVB&type=index",
        include: ["BVB:BET"],
        region: "Europe"
    }
];

const types = {
    "cfd": true,
    "index": true,
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
    urlO.searchParams.append('fields', 'symbol,type,description,country,symbol-proname');
    url = urlO.toString();
    const response = requestSync("GET", url);
    if (response.statusCode != 200) {
        throw Error(url + ':' + response.statusCode);
    }
    fields_list = JSON.parse(response.getBody()).fields;
    symbol_index = fields_list.indexOf("symbol");
    type_index = fields_list.indexOf("type");
    description_index = fields_list.indexOf("description");
    country_index = fields_list.indexOf("country");
    symbol_proname_index = fields_list.indexOf("symbol-proname");
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
                

                symbols.push(dolly);

                // if (s.s.indexOf('IXIC')>=0) console.log(url);
            }
        }
    });
});

const bondsMarks = [
    "TREASURY NOTE", "BOND", "Bond", "Bonds", "T-Note", "EURO BUND", "UK 10Y Gilt"
];

const indexMarks = [
    "INDEX", "NASDAQ", "RUSSELL", "S&P", "DOW JONES", "DOW-JONES", "STOXX", "Australia", "Swiss", "Germany", "Europe", "France",
    "Hong Kong", "Japan", "Netherlands", "NIKKEI", "FTSE", "Singapore", "CAC", "HANG SENG", "SHANGHAI COMPOSITE", "NYSE COMPOSITE", "PHLX",
    "Bund", "IBEX 35", "DAX PERFORMANCE", "US Wall St 30", "US Nas 100", "UK 100", "US Russ 2000", "AEX", "US SPX 500", "DAX", "NYSE AMERICAN COMPOSITE"
];

const metalsMarks = [
    "GOLD", "Gold", "SILVER", "Silver", "PALLADIUM", "Palladium", "PLATINUM", "Platinum", "Copper"
];

const energyMarks = [
    "Brent", "BRENT CRUDE OIL", "WTI", "West Texas Oil", "Gas", "Heating Oil", "Crude Oil"
];

const agricultureMarks = [
    "Sugar", "Corn", "Soybeans", "Wheat", "Cotton", "COTTON"
];

const regionMarks = {
    "Middle East": ["Turkey"],
    "Asia": ["China", "Hong Kong", "India", "Indonesia", "Japan", "JAPANESE YEN WCO", "Korea", "Malaysia", "MALAYSIA", "Singapore", "Thailand", "Taiwan", "Philippines", "Vietnam"],
    "Europe": ["EUROS WCO", "BRITISH POUNDS WCO", "SWISS FRANCS WCO", "Belgium", "France", "Ukraine", "Russian Federation",
               "Denmark", "Germany", "Ireland", "Italy", "Netherlands", "Norway", "Portugal", "Iceland", "Lithuania", "Latvia", "Romania", "Slovakia",
               "Spain", "Swiss", "United Kingdom", "Sweden", "Greece", "Poland", "Austria", "Switzerland", "Czech", "Euro", "Finland", "Hungary"],
    "Americas": ["NYSE", "NASDAQ", "S&P 500", "US ", "U.S.", "THOMSON REUTERS", "CANADIAN DOLLARS WCO", "US GOVERNMENT BONDS", "DOW JONES",
                "DOW-JONES", "RUSSELL", "PHLX", "BR GOVERNMENT BONDS","Canada", "Colombia", "Chile", "Brazil", "Peru", "United States"],
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
    { "s":"OMXHEX:OMXH25", "cc":"FI" },
    { "s":"OMXICE:OMXI10",  "cc":"IS" },
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
        return gr.url2 ? url.search : '/' + groupName + url.search;
    });
    usedGroupsList.sort();
    return usedGroupsList;
}

fs.writeFileSync("../../groups/indices.json", JSON.stringify({
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
