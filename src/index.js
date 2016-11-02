'use strict';

var Http = require('./http.js');
var config = {
    root: '/',
    debug: false,
    status: 'status',
    data: 'info',
    code: { //默认状态
        success: 1, //response success
        fail: 0, // response false
        auth: -1, // need auth
    },
    handle: { //默认回调
        /*操作成功*/
        success: function() {},
        /*操作失败*/
        fail: function() {},
        /*验证回调*/
        auth: function() {},
        _error: function() {}, //出错回调
    },
    callback: {
        onload: function() {
            if (config.debug) {
                console.log(this.status, this.responseText);
            }
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status >= 200 && this.status < 300) {
                    var handler = YYF.getHandle();
                    console.assert(typeof handler === "function");
                    // console.debug(handle);
                    handler(this.responseText, this);
                } else {
                    reject(this);
                }
            }
        },
        onerror: function() {
            reject(this);
        }
    }
}


/**
 * handle for once
 */
var handle = {}

function buildCodeMap() {
    config.codeMap = {};
    for (var key in config.code) {
        config.codeMap[config.code[key]] = key;
    }
}

/**
 * init YYF
 */
function YYF(options, conf, callback) {
    if (conf) {
        for (var key in conf) {
            if (conf.hasOwnProperty(key)) {
                config[key] = conf[key];
                if ("code" === key) {
                    buildCodeMap();
                } else if ("debug" === key) {
                    if (typeof options === "undefined") {
                        options = { debug: conf.debug };
                    } else if (typeof options.debug === "undefined") {
                        options.debug = conf.debug;
                    }
                }
            }
        }
    }
    if (typeof callback === "undefined") {
        callback = config.callback;
    }
    return Http.set(options).callback(callback);
};

function resolve(responseText) {
    try {
        var response = JSON.parse(responseText);
        var status = response[config.status];

        status = config.codeMap[status];
        var handle = YYF.getHandle(status);
        if (config.debug) {
            console.debug(status, handle, response);
        }
        if (handle) {
            var info = response[config.data];
            handle(info);
        } else {

        }
    } catch (e) {
        console.error(e);
    }
};

function reject(xhr) {
    YYF.getHandle('_error')(xhr);
};

/**
 * set status code
 */
YYF.setCode = function(status, code) {
    config.code[status] = code;
    buildCodeMap();
    return this;
};

/**
 * set default status handle
 */
YYF.setHandle = function(key, callback) {
    if (typeof callback !== "undefined") {
        config.handle[key] = callback;
    } else if (typeof key === "function") {
        handle = key;
    } else if (config.debug) {
        console.log("it's not callable function", key, callback);
    }
    return this;
};

/**
 * set status handle for once
 */
['success', 'fail'].forEach(function(status) {
    YYF[status] = function(callback) {
        handle[status] = callback;
        return this;
    }
});

/**
 * get status handle
 */
YYF.getHandle = function(status) {
    if (status) {
        return handle[status] ? handle[status] : config.handle[status];
    } else {
        return typeof handle === "function" ? handle : resolve;
    }
}

function request(url, method, data, success, error) {
    if (success) {
        handle.success = success;
    }
    if (error) {
        handle.error = error;
    }
    var req = Http.request(url, { method: method, data: data });
    // handle = {};
    return req;
};

YYF.delete = function(url, success, fail) {
    return request(url, 'DELETE', null, success, fail);
};

['get', 'put', 'post', 'patch'].forEach(function(m) {
    YYF[m] = function(url, data, success, fail) {
        return request(url, m.toUpperCase(), data, success, fail);
    };
});

//init
Http.callback(config.callback);
buildCodeMap();

// register to window
if ((typeof window !== 'undefined') && !window.YYF) {
    window.YYF = YYF;
}

module.exports = YYF;