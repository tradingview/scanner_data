var requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../forex.json";
const symbologyPath = "http://idc.tradingview.com/udf_proxy/symbols/forex";

var response = requestSync("GET", symbologyPath);
if (response.statusCode != 200) {
    throw Error(response.statusCode);
}

var regions = {
	"AED": "Middle East",
	"AFN": "Asia", // "Central Asia",
	"ALL": "European",
	"AMD": "Middle East",
	"ANG": "Americas",
	"AOA": "Africa",
	"ARS": "Americas",
	"AUD": "Pacific",
	"AWG": "Americas",
	"AZN": "Middle East",
	"BAM": "European",
	"BBD": "Americas",
	"BDT": "Asia", // "South Asia",
	"BGN": "European",
	"BHD": "Middle East",
	"BIF": "Africa",
	"BMD": "Americas",
	"BND": "Asia", // "Southeast Asia",
	"BOB": "Americas",
	"BRL": "Americas",
	"BSD": "Americas",
	"BTN": "Asia", // "South Asia",
	"BWP": "Africa",
	"BYN": "European",
	"BZD": "Americas",
	"CAD": "Americas",
	"CDF": "Africa",
	"CHF": "European",
	"CLP": "Americas",
	"CNY": "Asia", // "East Asia",
	"COP": "Americas",
	"CRC": "Americas",
	"CUP": "Americas",
	"CVE": "Africa",
	"CZK": "European",
	"DJF": "Africa",
	"DKK": "European",
	"DOP": "Americas",
	"DZD": "Africa",
	"EGP": "Middle East",
	"ERN": "Africa",
	"ETB": "Africa",
	"EUR": "European",
	"FJD": "Pacific",
	"FKP": "Americas",
	"GBP": "European",
	"GEL": "European",
	"GHS": "Africa",
	"GIP": "European",
	"GMD": "Africa",
	"GNF": "Africa",
	"GTQ": "Americas",
	"GYD": "Americas",
	"HKD": "Asia", // "East Asia",
	"HNL": "Americas",
	"HRK": "European",
	"HTG": "Americas",
	"HUF": "European",
	"IDR": "Asia", // "Southeast Asia",
	"ILS": "Middle East",
	"INR": "Asia", // "South Asia",
	"IQD": "Middle East",
	"IRR": "Middle East",
	"ISK": "European",
	"JMD": "Americas",
	"JOD": "Middle East",
	"JPY": "Asia", // "East Asia",
	"KES": "Africa",
	"KGS": "Asia", // "Central Asia",
	"KHR": "Asia", // "Southeast Asia",
	"KMF": "Africa",
	"KPW": "Asia", // "East Asia",
	"KRW": "Asia", // "East Asia",
	"KWD": "Middle East",
	"KYD": "Americas",
	"KZT": "Asia", // "Central Asia",
	"LAK": "Asia", // "Southeast Asia",
	"LBP": "Middle East",
	"LKR": "Asia", // "South Asia",
	"LRD": "Africa",
	"LSL": "Africa",
	"LTL": "European",
	"LYD": "Africa",
	"MAD": "Africa",
	"MDL": "European",
	"MGA": "Africa",
	"MKD": "European",
	"MMK": "Asia", // "Southeast Asia",
	"MNT": "Asia", // "East Asia",
	"MOP": "Asia", // "East Asia",
	"MRO": "Africa",
	"MUR": "Africa",
	"MVR": "Asia", // "South Asia",
	"MWK": "Africa",
	"MXN": "Americas",
	"MYR": "Asia", // "Southeast Asia",
	"MZN": "Africa",
	"NAD": "Africa",
	"NGN": "Africa",
	"NIO": "Americas",
	"NOK": "European",
	"NPR": "Asia", // "South Asia",
	"NZD": "Pacific",
	"OMR": "Middle East",
	"PAB": "Americas",
	"PEN": "Americas",
	"PGK": "Pacific",
	"PHP": "Asia", // "Southeast Asia",
	"PKR": "Asia", // "South Asia",
	"PLN": "European",
	"PYG": "Americas",
	"QAR": "Middle East",
	"RON": "European",
	"RSD": "European",
	"RUB": "European",
	"RWF": "Africa",
	"SAR": "Middle East",
	"SBD": "Pacific",
	"SCR": "Africa",
	"SDG": "Africa",
	"SEK": "European",
	"SGD": "Asia", // "Southeast Asia",
	"SHP": "Africa",
	"SLL": "Africa",
	"SOS": "Africa",
	"SRD": "Americas",
	"SSP": "Africa",
	"STD": "Africa",
	"SVC": "Americas",
	"SYP": "Middle East",
	"SZL": "Africa",
	"THB": "Asia", // "Southeast Asia",
	"TJS": "Asia", // "Central Asia",
	"TMT": "Asia", // "Central Asia",
	"TND": "Africa",
	"TOP": "Pacific",
	"TRY": "Middle East",
	"TTD": "Americas",
	"TWD": "Asia", // "East Asia",
	"TZS": "Africa",
	"UAH": "European",
	"UGX": "Africa",
	"USD": "Americas",
	"UYI": "Americas",
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
	"ZWL": "Africa",
};
function detectRegion(name){
    var firstCur = name.substr(0,3);
    var secondCur = name.substr(3,3);
    var result;
    if ("USD" === firstCur){
        result = regions[secondCur];
    }else{
        result = regions[firstCur] || "";
    }
    if (!result){
        console.warn("can not find region for " + name);
    }
    return result || "";
}

var majors = [
"EURUSD",
"USDJPY",
"GBPUSD",
"AUDUSD",
"USDCHF",
"USDCAD"
];

var minors=[
"AUDCAD",
"AUDCHF",
"AUDEUR",
"AUDGBP",
"AUDJPY",
"EURAUD",
"EURCAD",
"EURCHF",
"EURGBP",
"EURJPY",
"GBPAUD",
"GBPCAD",
"GBPCHF",
"GBPEUR",
"GBPJPY",
"USDAUD",
"USDEUR",
"USDGBP",
"JPYAUD",
"JPYCAD",
"JPYCHF",
"JPYEUR",
"JPYGBP",
"JPYUSD",
"CADAUD",
"CADCHF",
"CADEUR",
"CADGBP",
"CADJPY",
"CADUSD",
"CHFAUD",
"CHFCAD",
"CHFEUR",
"CHFGBP",
"CHFUSD",
"CHFJPY"
];

function detectMajor(name){
    if (majors.indexOf(name) >= 0){
        return "Major";
    }
    if (minors.indexOf(name) >= 0){
        return "Minor";
    }
    return "Exotic"
}

var dstSymbols = [];
var symbols = JSON.parse(response.getBody());
symbols.symbols.forEach(function(s){
    var dst = {f:[]};
    dst.s = s.s;
    dst.f[0] = detectRegion(s.f[0]);
    dst.f[1] = detectMajor(s.f[0]);
    dstSymbols.push(dst);
});

fs.writeFileSync(dstPath, JSON.stringify(
    {"time": new Date().toISOString()+'', "fields": ["country","sector"], "symbols": dstSymbols}, null, 2));