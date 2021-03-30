const requestSync = require("sync-request"),
    fs = require("fs");

function checkResponce(resp) {
    if (resp.statusCode != 200) {
        if (resp.statusCode === 400) {
            throw Error(resp.getBody());
        } else {
            throw Error(resp.statusCode);
        }
    }
}

function scan(r) {
    const scanResp = requestSync("POST", "https://scanner.tradingview.com/crypto/scan2", {json: r});
    checkResponce(scanResp);
    return JSON.parse(scanResp.getBody());
}

function pureTickerName(ss) {
    return ss.split(':')[1];
}

function uniqueSpreadsForUse() {
    const usedSpreads = {};
    scan({
            filter: [
                {
                    left: "description",
                    operation: "match",
                    right: "Calculated By Tradingview"
                },
                {
                    left: "sector",
                    operation: "nempty"
                }
            ]
        }
    ).symbols.forEach(function (s) {
        usedSpreads[s.s] = true;
    });

    let spreads = [];
    const spreadsGroups = {};

    [
        "http://hub1.tradingview.com:8094/symbols/btcbtc_spreads",
        "http://hub1.tradingview.com:8094/symbols/bittrex_spreads",
        "http://hub1.tradingview.com:8094/symbols/poloniex_spreads",
        "http://hub1.tradingview.com:8094/symbols/hitbtc_spreads"
    ].forEach(function (gr) {
        const resp = requestSync("GET", gr);
        checkResponce(resp);
        const sms = JSON.parse(resp.getBody()).symbols.filter(function (sym) {
            return usedSpreads[sym.s];
        }).map(function (sym) {
            return sym.s;
        });
        spreadsGroups[gr] = sms;
        spreads = spreads.concat(sms);
    });

    scan({
            filter: [
                {
                    left: "description",
                    operation: "nmatch",
                    right: "Calculated By Tradingview"
                },
                {
                    left: "name",
                    operation: "in_range",
                    right: spreads.map(pureTickerName)
                },
            ]
        }
    ).symbols.forEach(function (s) {
        const ticker = pureTickerName(s.s);
        for (const grN in spreadsGroups) {
            const gr = spreadsGroups[grN];
            const pos = gr.map(pureTickerName).indexOf(ticker);
            if (pos >= 0) {
                gr.splice(pos, 1);
            }
        }
    });

    console.log(JSON.stringify(spreadsGroups, null, 2));
}

// uniqueSpreadsForUse();

function checkForReplaceSpreadsToNative() {
    const usedSpreads = {};
    const usedSpreadsTickers = [];
    scan({
            filter: [
                {
                    left: "description",
                    operation: "match",
                    right: "Calculated By Tradingview"
                },
                {
                    left: "sector",
                    operation: "nempty"
                }
            ]
        }
    ).symbols.forEach(function (s) {
        const ptn = pureTickerName(s.s);
        usedSpreadsTickers.push(ptn);
        usedSpreads[ptn] = s.s;
    });

    return (scan({
            filter: [
                {
                    left: "description",
                    operation: "nmatch",
                    right: "Calculated By Tradingview"
                },
                {
                    left: "name",
                    operation: "in_range",
                    right: usedSpreadsTickers
                },
                {
                    left: "exchange",
                    operation: "not_in_range",
                    right: [
                        "COINBASE",
                        "KRAKEN"]
                },
            ]
        }
    ).symbols || []).map(function (s) {
        return {"old": usedSpreads[pureTickerName(s.s)], "new": s.s};
    });
}

function replaceSpreadsToNativePairs() {
    const forReplace = checkForReplaceSpreadsToNative();
    if (!forReplace.length) {
        console.log("Nothing to replace. All is ok.");
        return;
    }
    const forReplaceHash = {};
    forReplace.forEach(function (r) {
        forReplaceHash[r.old] = r.new;
    });

    const dstPath = "../../attributes/crypto.json";
    const data = JSON.parse(fs.readFileSync(dstPath));
    data.symbols.forEach(function (s) {
        const replaced = forReplaceHash[s.s];
        if (replaced) {
            s.s = replaced;
        }
    });
    data.time = new Date().toISOString() + '';
    fs.writeFileSync(dstPath, JSON.stringify(data, null, 2));
    console.log(forReplace.length + " symbols is replaced.");
}

checkForReplaceSpreadsToNative().forEach(function (r) {
    console.log("Replace " + r.old + " on to " + r.new);
});

replaceSpreadsToNativePairs();