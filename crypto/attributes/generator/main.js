const requestSync = require("sync-request"),
    fs = require("fs");

const dstPath = "../crypto.json";

const scanResp = requestSync("POST", "http://scanner-sfo.tradingview.com/crypto/scan2", {
    json: {
        sort: {
            sortBy: "volume",
            sortOrder: "desc"
        },
        columns: ["description"],
        filter: [
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
            {
                left: "exchange",
                operation: "not_in_range",
                right: ["COINBASE", "KRAKEN"]
            },
        ],
        filterOR: [
            {
                left: "volume",
                operation: "nempty"
            },
            {
                left: "name",
                operation: "equal",
                right: "BTCBTC"
            }
        ],
    }
});
if (scanResp.statusCode != 200) {
    if (scanResp.statusCode === 400) {
        throw Error(scanResp.getBody());
    } else {
        throw Error(scanResp.statusCode);
    }
}

const coinMktCapResp = requestSync("GET", "https://api.coinmarketcap.com/v1/ticker/?limit=0");
if (coinMktCapResp.statusCode != 200) {
    throw Error(coinMktCapResp.statusCode);
}

function getFirstCurrency(symbol) {
    const cur = getTicker(symbol);
    return cur.substring(0, cur.length - 3);
}

const excludeSymbols = [
    "BITTREX:BCCBTC",
    "HITBTC:BCCBTC",
    "HITBTC:BCCUSD",
    "BITFINEX:BCCBTC",
    "BITFINEX:BCCUSD",
    "BTCE:NVCUSD",
    "BTCE:NVCBTC",
    "BITFINEX:QTMBTC",
    "BITFINEX:QTMUSD",
    "BITTREX:AMPBTC",
    "BITTREX:AMPUSD",
    "BINANCE:BCCBTC",
    "BINANCE:BCCUSD",
];

function skipSymbol(s) {
    return excludeSymbols.indexOf(s) >= 0;
}

const tickers = {};
const selectedSymbols = {};
const descriptions = {};

function getTicker(s) {
    return s.split(':')[1];
}

JSON.parse(scanResp.getBody()).symbols.forEach(function (s) {
    const ticker = getTicker(s.s);
    if (!tickers[ticker] && !skipSymbol(s.s)) {
        tickers[ticker] = ticker;
        const token = getFirstCurrency(s.s);
        const ss = selectedSymbols[token] || [];
        ss.push(s.s);
        selectedSymbols[token] = ss;

        descriptions[s.s] = s.f[0];
    }
});

const currencyMapping = {
    "BTU": "BCU",
    "MIOTA": "IOT",
    "USNBT": "NBT",
    "DATA": "DAT",
};
const currencyRevertedMapping = {};
Object.keys(currencyMapping).forEach(function (k) {
    currencyRevertedMapping[currencyMapping[k]] = k;
});

const explicitCoinNames = {
    "BAT": "Basic Attention Token",
    "BTM": "Bitmark"
};

const dstSymbols = [];

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
    let key = s.symbol;
    let symbols = selectedSymbols[key];
    if (symbols === undefined) {
        key = currencyMapping[key];
        symbols = selectedSymbols[key];
    }
    if (symbols) {
        if (symbols.length === 2) {
            const explicitName = explicitCoinNames[s.symbol] || s.name;
            symbols.forEach(function (s1) {
                dstSymbols.push({
                    s: s1,
                    f: [explicitName, s.symbol]
                });

                const sDescr = descriptions[s1];
                if (sDescr.toLowerCase().indexOf(explicitName.toLowerCase()) < 0) {
                    console.error("Symbol " + s1 + " has description '" + sDescr + "' without coin-name '" + explicitName + "'");
                }
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

for (let s in selectedSymbols) {
    if (skippedCoins.indexOf(s) < 0) {
        console.warn("Symbol " + s + " not mapped!");
    }
}

dstSymbols.sort(function (l, r) {
    const res = l.f[0].localeCompare(r.f[0]);
    if (res!==0){
        return res;
    }
    return getTicker(l.s).localeCompare(getTicker(r.s));
});

fs.writeFileSync(dstPath, JSON.stringify({
    "time": new Date().toISOString() + '',
    "fields": ["sector", "crypto_code"],
    "symbols": dstSymbols
}, null, 2));