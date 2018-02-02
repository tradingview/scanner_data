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
    const scanResp = requestSync("POST", "http://scanner-sfo.tradingview.com/crypto/scan2", {json: r});
    checkResponce(scanResp);
    return JSON.parse(scanResp.getBody());
}

function getCoins(dstCoin) {
    const result = {};
    scan({
            "filter": [
                {"left": "sector", "operation": "nempty"},
                {"left": "name", "operation": "match", "right": dstCoin + "$"}],
            "columns": ["sector"],
        }
    ).symbols.forEach(function (s) {
        result[s.f[0]] = s.s;
    });
    return result;
}

const btcCoins = getCoins("BTC");
const usdCoins = getCoins("USD");

function diff(src1, src2) {
    for (const c in src1) {
        if (src2[c]) {
            delete src1[c];
            delete src2[c];
        }
    }
}

diff(btcCoins, usdCoins);
diff(usdCoins, btcCoins);

function secondCurrency(s) {
    return s.substr(s.length - 3);
}

function loadCryptoCoins(path) {
    const coins = {};
    JSON.parse(fs.readFileSync(path)).symbols.forEach(function (s) {
        let coin = coins[s.f[0]] || {};
        coins[s.f[0]] = coin;
        coin[secondCurrency(s.s)] = s.s;
    });
    return coins;
}

const cryproCoins = loadCryptoCoins("../../attributes/crypto.json");
for (const c in cryproCoins) {
    const coin = cryproCoins[c];
    if (btcCoins[c]) {
        console.log("missing " + coin["USD"] + " for " + coin["BTC"]);
    }
    if (usdCoins[c]) {
        console.log("missing " + coin["BTC"] + " for " + coin["USD"]);
    }
}