// this is a copy-paste from sync-request library with maxBuffer adjustment
module.exports = {
    doRequestSync : function doRequestSync(method, url, options, spawnSync, HttpResponse, worker, JSON) {
    if (!spawnSync) {
        throw new Error(
            'Sync-request requires node version 0.12 or later.  If you need to use it with an older version of node\n' +
            'you can `npm install spawn-sync@2.2.0`, which was the last version to support older versions of node.'
        );
    }
    var req = JSON.stringify({
        method: method,
        url: url,
        options: options
    });
    var res = spawnSync(process.execPath, [worker], {input: req, maxBuffer: 1024*1024*50});
    console.log("res.status = " + res.status)
    if (res.status !== 0) {
        throw new Error(res.stderr.toString());
    }
    if (res.error) {
        console.error(res.error)
        if (typeof res.error === 'string') res.error = new Error(res.error);
        throw res.error;
    }
    var response = JSON.parse(res.stdout);
    if (response.success) {
        return new HttpResponse(response.response.statusCode, response.response.headers, response.response.body, response.response.url);
    } else {
        throw new Error(response.error.message || response.error || response);
    }
}
};
