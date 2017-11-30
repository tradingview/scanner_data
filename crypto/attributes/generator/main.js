var requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../crypto.json";

var scanResp = requestSync("POST", "http://scanner.tradingview.com/crypto/scan2", {
    json: {
        sort: {
            sortBy: "volume",
            sortOrder: "desc"
        },
        filter: [
            {
                left: "volume",
                operation: "nempty"
            },
            {
                left: "name",
                operation: "match",
                right: "USD$|BTC$"
            },
            // exclude tickers
            {
                left: "name",
                operation: "nequal",
                right: "DSHUSD"
            },
            {
                left: "name",
                operation: "nequal",
                right: "DSHBTC"
            },
        ]
    }
});
if (scanResp.statusCode != 200) {
    if (scanResp.statusCode === 400) {
        throw Error(scanResp.getBody());
    } else {
        throw Error(scanResp.statusCode);
    }
}

var coinMktCapResp = requestSync("GET", "https://api.coinmarketcap.com/v1/ticker/?limit=0");
if (coinMktCapResp.statusCode != 200) {
    throw Error(coinMktCapResp.statusCode);
}

function getFirstCurrency(symbol) {
    var cur = symbol.split(':')[1];
    return cur.substring(0, cur.length - 3);
}

const excludeSymbols = [
    "BITTREX:BCCBTC",
    "HITBTC:BCCBTC",
    "HITBTC:BCCUSD",
    "BITFINEX:BCCBTC",
    "BITFINEX:BCCUSD",
    "BTCE:NVCUSD",
    "BTCE:NVCBTC"
];

function skipSymbol(s) {
    return excludeSymbols.indexOf(s) >= 0;
}

var tickers = {};
var selectedSymbols = {};
JSON.parse(scanResp.getBody()).symbols.forEach(function (s) {
    var ticker = s.s.split(':')[1];
    if (!tickers[ticker] && !skipSymbol(s.s)) {
        tickers[ticker] = ticker;
        var token = getFirstCurrency(s.s);
        var ss = selectedSymbols[token] || [];
        ss.push(s.s);
        selectedSymbols[token] = ss;
    }
});

const currencyMapping = {
    "BTU": "BCU",
    "MIOTA": "IOT",
    "USNBT": "NBT",
    "QTUM": "QTM",
    "DATA": "DAT",
};
const currencyRevertedMapping = {};
Object.keys(currencyMapping).forEach(function (k) {
    currencyRevertedMapping[currencyMapping[k]] = k;
})

const explicitCoinNames = {
    "BAT": "Basic Attention Token",
    "BTM": "Bitmark"
};

var dstSymbols = [];

try {
    JSON.parse(fs.readFileSync(dstPath)).symbols.forEach(function (s) {
        dstSymbols.push(s);
        const key = getFirstCurrency(s.s);
        delete selectedSymbols[key];
        delete selectedSymbols[currencyRevertedMapping[key]];
    });
} catch (exc) {
    console.warn("Loading previous results failed with error: " + exc);
}

JSON.parse(coinMktCapResp.getBody()).forEach(function (s) {
    var key = s.symbol;
    var sym = selectedSymbols[key] || selectedSymbols[currencyMapping[key]];
    if (sym) {
        if (sym.length === 2 || key === "BTC" /*include BTCUSD without BTCBTC*/) {
            const explicitName = explicitCoinNames[key];
            sym.forEach(function (s1) {
                dstSymbols.push({
                    s: s1,
                    f: [explicitName ? explicitName : s.name]
                });
            });
        }

        delete selectedSymbols[key];
    }
});

const skippedCoins = [
    "STR",
    "XBT",
    "RRT",
    "EUR",
    "GHS",
    "MXN",
];

for (var s in selectedSymbols) {
    if (skippedCoins.indexOf(s) < 0) {
        console.warn("Symbol " + s + " not mapped!");
    }
}

dstSymbols.sort(function (l, r) {
    if (l.s > r.s) {
        return 1;
    }
    if (l.s < r.s) {
        return -1;
    }
    return 0;
});

fs.writeFileSync(dstPath, JSON.stringify({
    "time": new Date().toISOString() + '',
    "fields": ["sector"],
    "symbols": dstSymbols
}, null, 2));