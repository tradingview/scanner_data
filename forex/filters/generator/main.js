const requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../forex.json";
const symbologyPath = "http://udf-proxy.tradingview.com:8094/symbols/forex?fields=symbol,type";

const response = requestSync("GET", symbologyPath);
if (response.statusCode != 200) {
    throw Error(response.statusCode);
}

const regions = {
    "AED": "Middle East",
    "AFN": "Asia", // "Central Asia",
    "ALL": "Europe",
    "AMD": "", // "Middle East",
    "ANG": "Americas",
    "AOA": "Africa",
    "ARS": "Americas",
    "ATS": "Europe",
    "AUD": "Pacific",
    "AUG": "Pacific",
    "AUN": "Pacific",
    "AWG": "Americas",
    "AZN": "", // "Middle East",
    "BAM": "Europe",
    "BBD": "Americas",
    "BDT": "Asia", // "South Asia",
    "BEF": "Europe",
    "BGN": "Europe",
    "BHD": "Middle East",
    "BIF": "Africa",
    "BMD": "Americas",
    "BND": "Asia", // "Southeast Asia",
    "BOB": "Americas",
    "BRL": "Americas",
    "BRJ": "Americas",
    "BRK": "Americas",
    "BRX": "Americas",
    "BSD": "Americas",
    "BTN": "Asia", // "South Asia",
    "BWP": "Africa",
    "BYN": "Europe",
    "BZD": "Americas",
    "CAD": "Americas",
    "CAX": "Americas",
    "CDF": "Africa",
    "CHF": "Europe",
    "CLP": "Americas",
    "CLF": "Americas",
    "CNY": "Asia", // "East Asia",
    "CNH": "Asia", // "East Asia",
    "COP": "Americas",
    "CRC": "Americas",
    "CUP": "Americas",
    "CUC": "Americas",
    "CVE": "Africa",
    "CZK": "Europe",
    "CZX": "Europe",
    "DEM": "Europe",
    "DJF": "Africa",
    "DKK": "Europe",
    "DOP": "Americas",
    "DOE": "Americas",
    "DOL": "Americas",
    "DZD": "Africa",
    "EGP": "Middle East",
    "ERN": "Africa",
    "ESP": "Europe",
    "ETB": "Africa",
    "EUR": "Europe",
    "EUX": "Europe",
    "FRN": "Europe",
    "FRF": "Europe",
    "FJD": "Pacific",
    "FIM": "Europe",
    "FKP": "Americas",
    "GBP": "Europe",
    "GBX": "Europe",
    "GEL": "Europe",
    "GRD": "Europe",
    "GHS": "Africa",
    "GIP": "Europe",
    "GMD": "Africa",
    "GNF": "Africa",
    "GTQ": "Americas",
    "GYD": "Americas",
    "HKD": "Asia", // "East Asia",
    "HNL": "Americas",
    "HRK": "Europe",
    "HRX": "Europe",
    "HTG": "Americas",
    "HUF": "Europe",
    "HUX": "Europe",
    "IDR": "Asia", // "Southeast Asia",
    "IEP": "Europe",
    "ILA": "Middle East",
    "ILS": "Middle East",
    "INR": "Asia", // "South Asia",
    "INH": "Asia", // "South Asia",
    "ING": "Asia", // "South Asia",
    "INI": "Asia", // "South Asia",
    "INJ": "Asia", // "South Asia",
    "INL": "Asia", // "South Asia",
    "INK": "Asia", // "South Asia",
    "IQD": "Middle East",
    "IRR": "Middle East",
    "ISK": "Europe",
    "ISX": "Europe",
    "ITL": "Europe",
    "JMD": "Americas",
    "JOD": "Middle East",
    "JPY": "Asia", // "East Asia",
    "KES": "Africa",
    "KGS": "Asia", // "Central Asia",
    "KHR": "Asia", // "Southeast Asia",
    "KMF": "Africa",
    "KPW": "Asia", // "East Asia",
    "KRW": "Asia", // "East Asia",
    "KRU": "Asia", // "East Asia",
    "KWD": "Middle East",
    "KWF": "Middle East",
    "KYD": "Americas",
    "KZT": "Asia", // "Central Asia",
    "LAK": "Asia", // "Southeast Asia",
    "LBP": "Middle East",
    "LKR": "Asia", // "South Asia",
    "LRD": "Africa",
    "LSL": "Africa",
    "LTL": "Europe",
    "LTN": "Europe",
    "LYD": "Africa",
    "LUF": "Europe",
    "MAD": "Africa",
    "MAL": "Africa",
    "MDL": "Europe",
    "MGA": "Africa",
    "MKD": "Europe",
    "MMK": "Asia", // "Southeast Asia",
    "MNT": "Asia", // "East Asia",
    "MOP": "Asia", // "East Asia",
    "MRO": "Africa",
    "MRK": "Africa",
    "MRU": "Africa",
    "MUR": "Africa",
    "MVR": "Asia", // "South Asia",
    "MWK": "Africa",
    "MXN": "Americas",
    "MXV": "Americas",
    "MYR": "Asia", // "Southeast Asia",
    "MYX": "Asia", // "Southeast Asia",
    "MZN": "Africa",
    "NAD": "Africa",
    "NAP": "Africa",
    "NGN": "Africa",
    "NIO": "Americas",
    "NLG": "Europe",
    "NOK": "Europe",
    "NPR": "Asia", // "South Asia",
    "NPL": "Asia", // "South Asia",
    "NZD": "Pacific",
    "OMR": "Middle East",
    "PAB": "Americas",
    "PEN": "Americas",
    "PGK": "Pacific",
    "PHP": "Asia", // "Southeast Asia",
    "PKR": "Asia", // "South Asia",
    "PLN": "Europe",
    "PLX": "Europe",
    "PTE": "Europe",
    "PYG": "Americas",
    "QAR": "Middle East",
    "RON": "Europe",
    "RSD": "Europe",
    "RUB": "Europe",
    "RWF": "Africa",
    "SAR": "Middle East",
    "SBD": "Pacific",
    "SBJ": "Pacific",
    "SBK": "Pacific",
    "SBL": "Pacific",
    "SBN": "Pacific",
    "SCR": "Africa",
    "SDG": "Africa",
    "SEK": "Europe",
    "SGD": "Asia", // "Southeast Asia",
    "SHP": "Africa",
    "SLL": "Africa",
    "SOS": "Africa",
    "SOH": "Africa",
    "SIT": "Europe",
    "SRD": "Americas",
    "SSP": "Africa",
    "STD": "Africa",
    "STN": "Africa",
    "SVC": "Americas",
    "SYP": "Middle East",
    "SZL": "Africa",
    "THB": "Asia", // "Southeast Asia",
    "TJS": "Asia", // "Central Asia",
    "TMT": "Asia", // "Central Asia",
    "TND": "Africa",
    "TNZ": "Africa",
    "TOP": "Pacific",
    "TRY": "Middle East",
    "TTD": "Americas",
    "TWD": "Asia", // "East Asia",
    "TZS": "Africa",
    "UAH": "Europe",
    "UGX": "Africa",
    "USD": "Americas",
    "USX": "Americas",
    "UYI": "Americas",
    "UYU": "Americas",
    "UZS": "Asia", // "Central Asia",
    "VEF": "Americas",
    "VND": "Asia", // "Southeast Asia",
    "VUV": "Pacific",
    "WST": "Pacific",
    "XAF": "Africa",
    "XCD": "Americas",
    "XOF": "Africa",
    "XPF": "Pacific",
    "YER": "Middle East",
    "ZAR": "Africa",
    "ZAC": "Africa",
    "ZMW": "Africa",
    "ZWL": "Africa",
    "DLL": "",
    "DLR": "",
    "FLN": "",
    "HEL": "",
    "M5P": "",
    "NSO": "",
    "OSO": "",
    "SWI": "",
    "XCU": "",
    "XDR": "",
    "VRL": "",
    "VRN": "",
    "NTG": "",
    "WTC": "",
};

const majorCurs = [
    "USD",
    "EUR",
    "GBP",
    "CHF",
    "AUD",
    "JPY",
    "NZD",
    "CAD",
];

function isMajor(cur) {
    return majorCurs.indexOf(cur) >= 0;
}

const regionsPriority = [
    "Americas",
    "Europe",
    "Asia",
    "Pacific",
    "Middle East",
    "Africa",
];

function getRegionPriority(r) {
    const idx = regionsPriority.indexOf(r);
    if (idx >= 0) {
        return idx;
    }
    return regionsPriority.length;
}

const majorForRegions = {
    "Middle East": ["USD"],
    "Asia": [
        "USD",
        "JPY"
    ],
    "Europe": [
        "USD",
        "EUR",
        "GBP",
        "CHF"
    ],
    "Americas": [
        "USD",
        "CAD"
    ],
    "Africa": ["USD"],
    "Pacific": [
        "USD",
        "AUD",
        "NZD"
    ],
    "": []
};

function isRegionMajor(major, region) {
    const mjs = majorForRegions[region];
    if (mjs === undefined) {
        console.error('Unknown region ' + region);
        return false;
    }
    return mjs.indexOf(major) >= 0;
}

function detectRegion(name, preferSecondMajor) {
    if (isInvertedMajor(name)) {
        return "";
    }

    var firstCur = name.substr(0, 3);
    var secondCur = name.substr(3, 3);
    var result;
    if (isMajor(firstCur)) {
        // первая валюта - мажор
        if (isMajor(secondCur)) {
            // если и вторая - мажор, то определяем регион по первой (!preferSecondMajor) или второй (preferSecondMajor===true)
            if (preferSecondMajor === true) {
                result = regions[secondCur];
            } else
                result = regions[firstCur];
        } else {
            // если вторая региональная, получаем ее регион
            result = regions[secondCur];
            if (!isRegionMajor(firstCur, result)) {
                // если мажор не относится к нашему региону, отбрасываем
                result = "";
            }
        }
    } else {
        if (isMajor(secondCur)) {
            // если первая региональная валюта, а вторая мажор - исключаем их
            result = "";
        } else {
            result = regions[firstCur];
            // это обе региональные валюты. если обе с одного региона, возвращаем его, иначе - ничего
            if (result !== regions[secondCur]) {
                result = "";
            }
        }
    }
    if (undefined === result) {
        console.warn("can not find region for " + name);
    }
    return result || "";
}

const majors = [
    "AUDUSD",
    "EURUSD",
    "GBPUSD",
    "NZDUSD",
    "USDCAD",
    "USDCHF",
    "USDJPY",
];
const invertedMajors = majors.map(p => {
    const prim = p.slice(0, 3), sec = p.slice(3);
    return sec + prim;
});

function isInvertedMajor(name) {
    return invertedMajors.indexOf(name) >= 0;
}

const minors = [
    "EURGBP",
    "EURAUD",
    "EURCAD",
    "EURCHF",
    "EURJPY",
    "EURNZD",
    "GBPEUR",
    "GBPJPY",
    "GBPAUD",
    "GBPCAD",
    "GBPCHF",
    "GBPNZD",
    "JPYAUD",
    "JPYCAD",
    "JPYCHF",
    "JPYEUR",
    "JPYGBP",
    "JPYNZD",
    "AUDCAD",
    "AUDCHF",
    "AUDEUR",
    "AUDGBP",
    "AUDJPY",
    "AUDNZD",
    "CADAUD",
    "CADCHF",
    "CADEUR",
    "CADGBP",
    "CADJPY",
    "CADNZD",
    "CHFAUD",
    "CHFCAD",
    "CHFEUR",
    "CHFGBP",
    "CHFJPY",
    "CHFNZD",
    "NZDAUD",
    "NZDCAD",
    "NZDCHF",
    "NZDEUR",
    "NZDJPY",
    "NZDGBP",
];

const exotics = [
    "USDBRL",
    "USDCNH",
    "USDCZK",
    "USDDKK",
    "USDHKD",
    "USDHRK",
    "USDHUF",
    "USDINR",
    "USDMXN",
    "USDNOK",
    "USDPLN",
    "USDRON",
    "USDRUB",
    "USDSAR",
    "USDSEK",
    "USDSGD",
    "USDTHB",
    "USDTRY",
    "USDZAR",
    "EURCZK",
    "EURDKK",
    "EURHKD",
    "EURHUF",
    "EURMXN",
    "EURNOK",
    "EURPLN",
    "EURRON",
    "EURRUB",
    "EURSEK",
    "EURSGD",
    "EURTRY",
    "EURZAR",
    "GBPDKK",
    "GBPHKD",
    "GBPHUF",
    "GBPNOK",
    "GBPPLN",
    "GBPRON",
    "GBPSEK",
    "GBPSGD",
    "GBPTRY",
    "GBPZAR",
    "CHFDKK",
    "CHFHKD",
    "CHFHUF",
    "CHFNOK",
    "CHFPLN",
    "CHFSEK",
    "CHFSGD",
    "CHFTRY",
    "CHFZAR",
    "AUDHKD",
    "AUDSGD",
    "CADHKD",
    "CADSGD",
    "NZDHKD",
    "NZDSGD",
    "HKDJPY",
    "MXNJPY",
    "NOKJPY",
    "NOKSEK",
    "SEKJPY",
    "SGDCHF",
    "SGDHKD",
    "SGDJPY",
    "TRYJPY",
    "ZARJPY",
];

function detectMajor(name) {
    if (isInvertedMajor(name)) {
        return null;
    }
    if (majors.indexOf(name) >= 0) {
        return "Major";
    }
    if (minors.indexOf(name) >= 0) {
        return "Minor";
    }
    if (exotics.indexOf(name) >= 0) {
        return "Exotic";
    }
    return null;
}

function calcHash(name) {
    let result = 0;
    for (var i = 0; i < name.length; i++) {
        result += (name.charCodeAt(i) - 0x41) * Math.pow(10, (name.length - i) * 2);
    }
    return result;
}

const customPriority = [
    "EURUSD",
    "USDJPY",
    "GBPUSD",
    "AUDUSD",
    "USDCAD",
    "USDOTH",
    "USDCNY",
    "USDCHF",
    "EURGBP",
    "USDMXN",
    "USDSGD",
    "EURJPY",
    "USDKRW",
    "USDNZD",
    "USDHKD",
    "USDSEK",
    "USDTRY",
    "EUROTH",
    "USDINR",
    "USDRUB",
    "USDNOK",
    "USDBRL",
    "EURCHF",
    "JPYOTH",
    "USDZAR",
    "EURSEK",
    "USDTWD",
    "EURNOK",
    "AUDJPY",
    "USDPLN",
    "EURAUD",
    "EURCAD",
    "EURPLN",
    "EURDKK",
    "EURHUF",
    "EURTRY",
    "CADJPY",
    "NZDJPY",
    "JPYTRY",
    "ZARJPY",
    "EURCNY",
    "JPYBRL"
];

function detectPriority(name, region) {
    {
        const customPriorityIdx = customPriority.indexOf(name);
        if (customPriorityIdx >= 0) {
            return customPriorityIdx;
        }
    }
    if (region) {
        const firstCur = name.substr(0, 3);
        const secondCur = name.substr(3, 3);
        const majorIdx = (majorForRegions[region] || []).indexOf(firstCur);
        if (majorIdx >= 0) {
            const result = calcHash(secondCur) + (getRegionPriority(region) * 10 + majorIdx + 1) * Math.pow(10, (secondCur.length + 1) * 2);
            return result;
        }
    }
    const result = calcHash(name);
    return result;
}

function detectPriorityMinor(name) {
    {
        const customPriorityIdx = minors.indexOf(name);
        if (customPriorityIdx >= 0) {
            return customPriorityIdx;
        }
    }
    return detectPriority(name);
}

function detectPriorityExotic(name) {
    {
        const customPriorityIdx = exotics.indexOf(name);
        if (customPriorityIdx >= 0) {
            return customPriorityIdx;
        }
    }
    return detectPriority(name);
}

////////////////// tests
[
    detectPriority('USDRUB') < detectPriority('EURRUB'),
    detectPriority('USDRUB', 'Europe') < detectPriority('EURRUB', 'Europe'),
    detectPriority('JPYCHN', 'Asia') < detectPriority('EURCHN', 'Asia'),
    detectPriority('CADANG', 'Americas') > detectPriority('USDARS', 'Americas'),
    detectPriority('JPYAUD', 'Asia') < detectPriority('AUDCAD', 'Americas'),
].forEach(function (t, i) {
    if (!t) {
        console.error('detectPriority check ' + i + ' failed!');
        process.exit(-1);
    }
});

////////////////// tests

const currencyForExclude = [
    "ATS",
    "AUG",
    "AUN",
    "BEF",
    "BRJ",
    "BRK",
    "BRX",
    "CZX",
    "DEM",
    "DLL",
    "DLR",
    "DOE",
    "DOL",
    "ESP",
    "EUX",
    "FIM",
    "FLN",
    "FRF",
    "FRN",
    "GBX",
    "GRD",
    "HEL",
    "HRX",
    "HUX",
    "IEP",
    "ILA",
    "ING",
    "INH",
    "INI",
    "INJ",
    "INK",
    "INL",
    "ISX",
    "ITL",
    "KRU",
    "KWF",
    "LTN",
    "LUF",
    "M5P",
    "MAL",
    "MRK",
    "MXV",
    "MYX",
    "NAP",
    "NLG",
    "NPL",
    "NSO",
    "NTG",
    "OSO",
    "PLX",
    "PTE",
    "SBJ",
    "SBK",
    "SBL",
    "SBN",
    "SIT",
    "SOH",
    "SWI",
    "THX",
    "TNZ",
    "USX",
    "USY",
    "VRL",
    "VRN",
    "WCU",
    "WTC",
    "XDR",
    "ZAC"
];

const symbolExclude = [
    "EUREUR",
    "USDUSD",
    "GBPGBP",
];

function mustExcluded(name) {
    var firstCur = name.substr(0, 3);
    var secondCur = name.substr(3, 3);
    return currencyForExclude.indexOf(firstCur) >= 0 || currencyForExclude.indexOf(secondCur) >= 0 || symbolExclude.indexOf(name) >= 0;
}

const dstSymbols = [];
const symbols = JSON.parse(response.getBody());
symbols.symbols.filter(function (s) {
    return s.f[1] === "forex" && !mustExcluded(s.f[0]);
}).forEach(function (s) {
    var dst = {f: []};
    dst.s = s.s;
    dst.f[0] = detectRegion(s.f[0]);
    dst.f[1] = detectMajor(s.f[0]);
    dst.f[2] = detectPriority(s.f[0], dst.f[0]);
    dst.f[3] = detectRegion(s.f[0], true);
    dst.f[4] = dst.f[1] === "Minor" ? detectPriorityMinor(s.f[0]) : null;
    dst.f[5] = dst.f[1] === "Exotic" ? detectPriorityExotic(s.f[0]) : null;
    dstSymbols.push(dst);

    // if (dst.f[1] === "Exotic" && s.f[0].slice(0, 3) === "USD") {
    //     console.log(s.f[0] + ',');
    // }
});
dstSymbols.sort((l, r) => l.s.localeCompare(r.s));

fs.writeFileSync(dstPath, JSON.stringify(
    {
        "fields": [
            "country",
            "sector",
            "forex_priority",
            "country2",
            "forex_minor_priority",
            "forex_exotic_priority",
        ],
        "symbols": dstSymbols
    }, null, 2));