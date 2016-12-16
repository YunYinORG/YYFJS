;
(function() {
    'use strict';
    var CONFIG = {
        root: '/',
        debug: false,
        async: true,
        type: 'urlencoded',
        status: 'status',
        data: 'info',
        code: { //status code for status
            success: 1, //response success
            fail: 0, // response false
            auth: -1, // need auth
        },
        codeMap: {
            '1': 'success',
            '0': 'fail',
            '-1': 'auth',
        },
        setCode: function(code, status) { //set code 
            if (code) {
                CONFIG.code[status] = code;
                CONFIG.codeMap[code] = status;
            } else {
                delete CONFIG.code[status];
                delete CONFIG.codeMap[code];
            }
        },
        handle: { //default handlers
            auth: function() {},
            success: function() {},
            fail: function() {}
        },
        onerror: function(res) { //default on network error
            console.log('request error:', this, res);
        }
    };
    //serialize an object
    function serialize(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };
    //http request
    var Http = function(method, async, type) {
        this.METHOD = method || 'GET';
        this.ASYNC = typeof async === "undefined" ? CONFIG.async : async;
        this.TYPE = typeof type === "undefined" ? CONFIG.type : type;
        this.HEADERS = {};
        this.PROPS = {};
    }
    Http.prototype = {
        set: function(key, value) { //set options
            key = key.toUpperCase();
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
            return this;
        },
        callback: function(on, func) { //set callback
            if (typeof func !== "undefined") {
                console.assert(typeof func === 'function', key + ' should be a function,', func);
                this.PROPS[on] = func;
            } else if (on) {
                for (var key in on) {
                    this.PROPS[key] = on[key];
                }
            }
            return this;
        },
        request: function(url, data) { //send request
            var req = new XMLHttpRequest();
            for (var key in this.PROPS) { // set callback
                if (this.PROPS[key]) {
                    req[key] = this.PROPS[key];
                }
            }
            if (CONFIG.root && CONFIG.root !== url[0]) {
                url = CONFIG.root + url;
            }
            if (this.METHOD === 'GET') {
                url += serialize(data);
            } else if (data) {
                switch (this.TYPE.toLowerCase()) {
                    case 'urlencoded':
                    case 'url': //submit as urlencoded form
                        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                        if (typeof data === "string" && data[0] === "{" && data.slice(-1) === '}') {
                            data = JSON.parse(data);
                        }
                        if (typeof data === "object") {
                            data = serialize(data);
                        }
                        break;
                    case 'json': //json format
                        req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                        if (typeof data === "object") {
                            data = JSON.stringify(data);
                        }
                        break;
                    case 'form': //submit as form
                        // req.setRequestHeader('Content-Type', 'multipart/form-data');
                        if (typeof data === "object") {
                            var form = new FormData();
                            for (var i in data) {
                                form.append(i, d[i]);
                            }
                            data = form;
                        }
                        break;
                    default: //empty set nothing 
                        if (this.TYPE) { //special Content type
                            req.setRequestHeader('Content-Type', this.TYPE);
                        }
                }
            }
            for (key in this.HEADERS) { // set headers
                if (this.HEADERS.hasOwnProperty(key)) {
                    req.setRequestHeader(key, this.HEADERS[key]);
                }
            }
            // initialize request with URL and send
            if (CONFIG.debug) {
                console.log(url);
            }
            req.open(this.METHOD, url, this.ASYNC);
            req.send(data);
            return this;
        }
    };

    function yyf() {
        var that = this;
        this.onerror = CONFIG.onerror;
        this.onload = function() { // status change
            if (CONFIG.debug) {
                console.log(this.status, this.responseText);
            }
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status >= 200 && this.status < 300) {
                    that.handle(this.responseText, this);
                } else {
                    that.onerror(this);
                }
            }
        };
        this.handle = function(responseText, res) { //default resolve response
            try {
                var response = JSON.parse(responseText);
                var complete = this.getHandle('complete');
                if (complete) {
                    complete(response, res);
                } else {
                    var status = response[CONFIG.status];
                    status = CONFIG.codeMap[status];
                    var handle = this.getHandle(status);
                    if (CONFIG.debug) {
                        console.debug(status, handle, response);
                    }
                    if (handle) {
                        handle(response[CONFIG.data]);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        };
        return this;
    };
    yyf.prototype = {
        setHandle: function(key, callback) { //set handle for different status
            if (typeof callback !== "undefined") {
                this.handle[key] = callback;
            } else if (typeof key === "function") {
                this.handle = key;
            } else if (CONFIG.debug) {
                console.log("it's not callable function", key, callback);
            }
            return this;
        },
        getHandle: function(status) {
            if (status) {
                return this.handle[status] || CONFIG.handle[status];
            } else {
                return this.handle;
            }
        },
        request: function(url, method, data, async) { //request resource
            var http = new Http(method, async);
            http.callback('onload', this.onload)
                .callback('onerror', this.onerror)
                .request(url, data);
            return this;
        },
        delete: function(url, async) {
            return this.request(url, 'DELETE', null, async);
        }
    };
    ['get', 'put', 'post', 'patch'].forEach(function(m) {
        yyf.prototype[m] = function(url, data, async) {
            return this.request(url, m.toUpperCase(), data, async);
        };
    });
    ['success', 'fail', 'auth', 'complete'].forEach(function(status) {
        yyf.prototype[status] = function(callback) {
            return this.setHandle(status, callback);
        }
    });


    function config(options, handle, code) {
        if (arguments.length === 1 && (
                typeof options['options'] === "object" ||
                typeof options['handle'] === "object" ||
                typeof options['code'] === "object"
            )) {
            handle = options['handle'];
            code = options['code'];
            options = options['options'];
        }
        var key;
        for (key in options) {
            CONFIG[key] = options[key];
        }
        for (key in handle) {
            CONFIG.handle[key] = handle[key];
        }
        for (key in code) {
            CONFIG.setCode(key, code[key]);
        }
        return (new yyf());
    };

    /**
     * Expose
     */
    var YYF = config;
    for (var func in yyf.prototype) { // yyf interfaces
        YYF[func] = function(f) {
            return function() {
                var y = new yyf();
                return yyf.prototype[f].apply(y, arguments);
            }
        }(func);
    }
    YYF.setCode = function(code, status) { //set code
        CONFIG.setCode(code, status);
        return YYF;
    };
    YYF.getHandle = function(status) { //get default handle
        if (status) {
            return CONFIG.handle[status];
        } else {
            return CONFIG.handle;
        }
    };

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = YYF;
    } else if (typeof define === 'function' && define.amd) {
        define(function() { return YYF; });
    } else {
        this.YYF = YYF;
    }
}).call(function() {
    return this || (typeof window !== 'undefined' ? window : global);
}());