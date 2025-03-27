const fs = require("fs");
const {URL} = require('url');
const syncreq = require("../../../jscommon/sync-request");

const continuesPath = "./futures_continues.json";
const groupsPath = "../../groups/futures_list.json";
const dstPath = "../futures.json";

/*
function getPureTicker(s) {
    const delim = s.indexOf(':');
    if (delim < 0) {
        return s;
    }
    return s.substr(delim + 1);
}
*/

const continuesSrc = JSON.parse(fs.readFileSync(continuesPath));

function getRootForContinues(s) {
    return s.substr(0, s.length - 2);
}

const rootsHashes = {};
continuesSrc.symbols.forEach(function (s) {
    const r = getRootForContinues(s.s);
    rootsHashes[r] = 0;
    s.f.push(r);
});
continuesSrc.fields.push("root");

const groups = JSON.parse(fs.readFileSync(groupsPath)).symbols.map(s => s.s);

// const rxFuturesNamesParser = /(\w+:?\w+)([FGHJKMNQUVXZ])(\d{4})/;
const rxFuturesNamesParser = /(\w+:?[A-Z0-9._]+)([FGHJKMNQUVXZ])(\d{4})/;

function monthFromLetter(l) {
    const idx = 'FGHJKMNQUVXZ'.indexOf(l.toUpperCase());
    if (0 > idx) {
        throw Error("unknown month letter " + l);
    }
    return idx;
}

function parseFuturesName(name) {
    const result = rxFuturesNamesParser.exec(name);
    if (result) {
        return {"root": result[1], "month": monthFromLetter(result[2]), "year": +result[3]}
    }
    return null;
}

const symbols = [];

function isContinues(s) {
    return s.endsWith('1!') || s.endsWith('2!');
}

const now = new Date();

function isExpired(parseRes) {
    if (parseRes.year < now.getUTCFullYear()){
        return true;
    }
    if (parseRes.year > now.getUTCFullYear()){
        return false;
    }
    return parseRes.month < now.getUTCMonth();
}

groups.forEach(function (path) {
    let url = "http://udf-proxy.tradingview.com:8094/symbols?domain=tv&type=futures&symbol=%21%24%7C%5Cd%7B4%2C%7D%24&prefix=" + path; //symbol=!$%7C\d{4,}
    const urlO = new URL(url);
    urlO.searchParams.append('fields', 'symbol');
    url = urlO.toString();

    let spawnSync = require('child_process').spawnSync;
    let HttpResponse = require('http-response-object');
    let JSON = require("./node_modules/sync-request/lib/json-buffer");
    let worker = require.resolve('./node_modules/sync-request/lib/worker.js')

    const response = syncreq.doRequestSync("GET", url, undefined, spawnSync, HttpResponse, worker, JSON);
    if (response.statusCode != 200) {
        throw Error(url + ':' + response.statusCode);
    }
    (JSON.parse(response.getBody()).symbols || []).forEach(function (s) {
        const parseRes = parseFuturesName(s.s);
        if (parseRes) {
            if (rootsHashes[parseRes.root] !== undefined) {
                if (!isExpired(parseRes)) {
                    rootsHashes[parseRes.root]++;
                    symbols.push({
                        s: s.s,
                        f: [
                            null,
                            parseRes.root]
                    });
                }
            } else {
                // console.warn("root " + parseRes.root + " not included. skipping it");
            }
        } else {
            if (!isContinues(s.s)) {
                console.warn("can't parse " + s.s + " futures name. skipping it");
            }
        }
    });
});

const dstSymbols = continuesSrc.symbols.concat(symbols);

dstSymbols.sort(function (l, r) {
    return l.s.localeCompare(r.s);
});

fs.writeFileSync(dstPath, JSON.stringify(
    {
        "fields": continuesSrc.fields,
        "symbols": dstSymbols
    }, null, 2));

for (const r in rootsHashes) {
    if (0 === rootsHashes[r]) {
        console.warn("can't find contracts for root " + r);
    }
}
