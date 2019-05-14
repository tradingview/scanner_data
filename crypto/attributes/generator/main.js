const requestSync = require("sync-request");
const fs = require("fs");
const argv = require('minimist')(process.argv.slice(2));

const API_URL = argv.u || argv.url || "https://pro-api.coinmarketcap.com";
const API_TOKEN = argv.t || argv.token;

if (API_TOKEN == undefined) {
    // see https://xwiki.tradingview.com/display/tss/CoinMarketCap for available API tokens
    console.error("env CMC_API_TOKEN is undefined");
    process.exit(1);
}

const dstPath = "../crypto.json";
const defaultScannerLocation = 'nyc';

const scanRequestForPairs = {
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
            right: "VENBTC"
        },
        {
            left: "name",
            operation: "nequal",
            right: "VENUSD"
        },
        {
            left: "name",
            operation: "nequal",
            right: "DSHBTC"
        },
        {
            left: "exchange",
            operation: "not_in_range",
            right: [
                "COINBASE",
                "KRAKEN",
                "WEX"
                //, "BITFINEX"
            ]
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
};

function scan(req, loc) {
    loc = loc || defaultScannerLocation;
    const resp = requestSync("POST", `http://scanner-${loc}.tradingview.com/crypto/scan2`, {
        json: req
    });
    if (resp.statusCode != 200) {
        if (resp.statusCode === 400) {
            throw Error(resp.getBody());
        } else {
            throw Error(resp.statusCode);
        }
    }
    return resp;
}

function getCMCNewAPICall(url) {
    const result = requestSync("GET", url);
    const data = JSON.parse(result.getBody());
    if (data.status.error_code != 0) {
        console.error("can't get data (BTC), err=%j", data.status.error_message);
        return null;
    }
    return data;
}

function getCMCCoinsNewAPI() {
    const cachePath = "./coinmarketcap.cache";
    try {
        return JSON.parse("" + fs.readFileSync(cachePath));
    } catch (err) {
        console.info("can't load from cache (" + cachePath + "): " + err);
    }
    const limit = 5000;
    let coins = [];
    let data = {};
    let start = 1;
    let count = 0;
    // let creditCount = 0;
    // Pro API doesn't support unlimited requests
    // we have to use pagination
    do {
        // in basic (free) plan we cannot use "convert=BTC,USD"
        // so we have to make two distinct requests with different "convert" parameter value (one for BTC and one for USD)
        // and then copy USD quote data from the second response
        const urlBTC = `${API_URL}/v1/cryptocurrency/listings/latest?convert=BTC&start=${start}&sort=name&limit=${limit}&CMC_PRO_API_KEY=${API_TOKEN}`;
        const urlUSD = `${API_URL}/v1/cryptocurrency/listings/latest?convert=USD&start=${start}&sort=name&limit=${limit}&CMC_PRO_API_KEY=${API_TOKEN}`;
        const dataBTC = getCMCNewAPICall(urlBTC);
        const dataUSD = getCMCNewAPICall(urlUSD);
        //creditCount = dataBTC.status.credit_count + dataUSD.status.credit_count;
        count = dataBTC.data.length;
        // retrieve main data and BTC quote
        dataBTC.data.forEach(function (d) {
            data[d.id] = d;
        });
        // retrieve USD quote and merge it into the main data
        dataUSD.data.forEach(function (d) {
            data[d.id].quote.USD = d.quote.USD;
            coins.push(data[d.id]);
        });
        start += limit;
    } while (count == limit);
    return coins;
}

function getCMCCoinsOldAPI() {
    const coinMktCapResp = requestSync("GET", "https://api.coinmarketcap.com/v1/ticker/?limit=0");
    if (coinMktCapResp.statusCode != 200) {
        throw Error(coinMktCapResp.statusCode);
    }
    return JSON.parse(coinMktCapResp.getBody());
}

//const coinCapRes = getCMCCoinsOldAPI();
const coinCapRes = getCMCCoinsNewAPI();

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
    "BINANCE:HSRBTC",
    "BINANCE:HSRUSD",
    "BITFINEX:HOTBTC",
    "BITFINEX:HOTUSD",
    "BITFINEX:VETBTC",
    "BITFINEX:VETUSD",
    "BITFINEX:PAIBTC",
    "BITFINEX:PAIUSD",
    "BITFINEX:RBTBTC",
    "BITFINEX:RBTUSD"
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

function getExchange(s) {
    return s.split(':')[0];
}

JSON.parse(scan(scanRequestForPairs).getBody()).symbols.forEach(function (s) {
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

const coinsMappingTVvsCoinMktCap = {
    "BCU": "BTU",
    "IOTA": "MIOTA",
    "IOT": "MIOTA",
    "STR": "XLM",
    "NBT": "USNBT",
    "QTM": "QTUM",
    "DAT": "DATA",
    "YOYO": "YOYOW",
    "YYW": "YOYOW",
    "BQX": "ETHOS",
    "NANO": "XRB",
    "QSH": "QASH",
    "MNA": "MANA",
    // "SNG": "SNGLS",
    // "XBT": "BTC",
    // "IOS": "IOST",
    // "AIO": "AION",
    // "STJ": "STORJ"
};


const currencyMapping = {};
const currencyRevertedMapping = coinsMappingTVvsCoinMktCap;
Object.keys(coinsMappingTVvsCoinMktCap).forEach(function (k) {
    currencyMapping[coinsMappingTVvsCoinMktCap[k]] = k;
});

const explicitCoinNames = {
    "BAT": "Basic Attention Token",
    "BTM": "Bitmark"
};

let dstSymbols = [];

const excludedExchanges = [
//    "BITFINEX"
];

try {
    const coins = {};
    JSON.parse(fs.readFileSync(dstPath)).symbols.forEach(function (s) {
        const key = getFirstCurrency(s.s);
        const coin = coins[key] || {exchanges: [], symbols: []};
        coin.symbols.push(s);
        coin.exchanges.push(getExchange(s.s));
        coins[key] = coin;
    });
    Object.keys(coins).forEach(key => {
        const coin = coins[key];
        const containsExcludedExchange = excludedExchanges.filter(e => coin.exchanges.includes(e)).length > 0;
        if (!containsExcludedExchange) {
            dstSymbols = dstSymbols.concat(coin.symbols);
            delete selectedSymbols[key];
            delete selectedSymbols[currencyRevertedMapping[key]];
        }
    });
} catch (exc) {
    console.warn("Loading previous results failed with error: " + exc);
}

const missingPairs = [];

coinCapRes.forEach(function (s) {
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
                    f: [
                        explicitName,
                        s.symbol]
                });

                const sDescr = descriptions[s1];
                if (sDescr.toLowerCase().indexOf(explicitName.toLowerCase()) < 0) {
                    console.error("Symbol " + s1 + " has description '" + sDescr + "' without coin-name '" + explicitName + "'");
                }
            });
        } else if (symbols.length === 1) {
            missingPairs.push(getExchange(symbols[0]) + ':' + key + (symbols[0].endsWith("BTC") ? 'USD' : 'BTC'));
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

console.warn("Missing pairs:\n" + JSON.stringify(missingPairs) + '\n');

console.warn("Pairs with empty market cap:\n" + (JSON.parse(scan(
    {
        filter: [{left: "market_cap_calc", operation: "empty"}],
        symbols: {tickers: dstSymbols.map(s => s.s)}
    }
).getBody()).symbols || []).map(s => s.s).join(', ') + '\n');

dstSymbols.sort(function (l, r) {
    const res = l.f[0].localeCompare(r.f[0]);
    if (res !== 0) {
        return res;
    }
    return getTicker(l.s).localeCompare(getTicker(r.s));
});

fs.writeFileSync(dstPath, JSON.stringify({
    "fields": [
        "sector",
        "crypto_code"],
    "symbols": dstSymbols
}, null, 2));