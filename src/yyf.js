(function() {
    'use strict';
    var DEBUG = true;
    /**
     * default configure of http request
     */
    var CONFIG = {
        root: '/', // request root url
        async: true, // request async
        cookie: false, // using cookie when cors site (withCredentials)
        type: 'urlencoded', //request,Content-type,using x-www-form-urlencoded in default
        headers: {}, //default headers in every request

        status: 'status', //status field in response
        data: 'data', // data field in response
        _code: { //status code for status
            success: 1, //response success
            fail: 0, // response false
            auth: -1, // need auth
        },
        _codeMap: { //map code to status for quick search
            '1': 'success',
            '0': 'fail',
            '-1': 'auth',
        },
        setCode: function(code_num, status_string) { //set code 
            if (status_tring) { //set
                CONFIG._code[status_tring] = code_num;
                CONFIG._codeMap[code_num] = status_tring;
            } else { //delete
                delete CONFIG._code[CONFIG._codeMap[code_num]];
                delete CONFIG._codeMap[code_num];
            }
        },

        handle: { //default handlers
            auth: function() {},
            onerror: console.error, //default handle for network error            
            success: function() {},
            fail: function() {}
        },
    };
    /**
     * serialize an object
     */
    function serialize(obj) {
        var str = [];
        for (var p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };
    /**
     * Http request
     */
    var Http = function(method, async, type) {
        this._METHOD = method || 'GET';
        this._ASYNC = typeof async === "undefined" ? CONFIG.async : async;
        this._TYPE = typeof type === "undefined" ? CONFIG.type : type;
    }
    Http.prototype = {
        _fmt: function(data, req) { // format data and req
            switch (this._TYPE.toLowerCase()) {
                case 'urlencoded':
                case 'url': //send as urlencoded form
                    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                    if (typeof data === "string" &&
                        data[0] === "{" && data.slice(-1) === '}') {
                        try {
                            data = JSON.parse(data); //json string
                        } catch (e) {}
                    }
                    if (typeof data === "object") { //serialize onj
                        return serialize(data);
                    } else {
                        return data;
                    }
                case 'json': //send as json format
                    req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                    if (typeof data === "object") {
                        data = JSON.stringify(data);
                    } else {
                        return data;
                    }
                case 'form': //send as form // req.setRequestHeader('Content-Type', 'multipart/form-data');
                    if (typeof data === "object") {
                        var form = new FormData();
                        for (var i in data) {
                            form.append(i, d[i]);
                        }
                        return form
                    } else {
                        return data;
                    }
                default: //empty doesn't set Content-Type 
                    if (this._TYPE) { //special Content type
                        req.setRequestHeader('Content-Type', this._TYPE);
                    }
                    return data;
            }
        },
        _send: function(url, data, callback) { //send request
            var req = new XMLHttpRequest();
            for (var key in callback) { // set callback
                if (callback[key]) {
                    req[key] = callback[key];
                }
            }
            if (CONFIG.root !== url[0]) { // avoid root with double'/'
                url = CONFIG.root + url;
            }
            if (this._METHOD === 'GET' && data) { //get serialize
                url += '?' + serialize(data);
                data = null;
            }
            // initialize request with URL and send
            if (DEBUG) {
                console.log(url);
            }
            req.open(this._METHOD, url, this._ASYNC);
            if (data) {
                data = this._fmt(data, req);
            }
            for (key in CONFIG.headers) { // set headers
                if (CONFIG.headers.hasOwnProperty(key)) {
                    req.setRequestHeader(key, CONFIG.headers[key]);
                }
            }
            req.withCredentials = CONFIG.cookie;
            req.send(data);
            return this;
        }
    };

    /**
     * yyf api
     */
    function yyf() {
        var that = this;
        that._onload = function() { // status change
            if (DEBUG) {
                console.log(this.status, this.responseText);
            }
            if (this.readyState === 4) { //XMLHttpRequest.DONE
                if (this.status >= 200 && this.status < 300) {
                    that._handle(this.responseText.trim(), this);
                } else {
                    that.getHandle('onerror');
                }
            }
        };
        that._handle = function(response, res) { //default resolve response
            if (DEBUG) {
                console.debug(response);
            }
            var handler = that.getHandle('complete');
            try {
                var response = JSON.parse(response);
            } catch (e) { // not json
            }
            if ((!handler) || (handler(response, res) && typeof response == "object")) {
                //no handler，or handler return true
                if (CONFIG.status in response) { // get status
                    var status = CONFIG._codeMap[response[CONFIG.status]];
                    handler = that.getHandle(status);
                    response = response[CONFIG.data]
                } else { //no 'status' key in response
                    handler = that.getHandle('onerror');
                }
                handler(response, res);
            }
        };
        return that;
    };
    yyf.prototype = {
        setHandle: function(key, callback) { //set handle for different status
            if (typeof callback !== "undefined") {
                this._handle[key] = callback;
            } else if (typeof key === "function") {
                this._handle = key;
            } else if (DEBUG) {
                console.log("it's not callable", key, callback);
            }
            return this;
        },
        getHandle: function(status) {
            if (status) {
                return this._handle[status] || CONFIG.handle[status];
            } else {
                return this._handle;
            }
        },
        request: function(url, method, data, async) { //request resource
            (new Http(method, async))._send(url, data, {
                'onload': this._onload,
                'onerror': this.getHandle('onerror')
            });
            return this;
        },
        delete: function(url, async) {
            return this.request(url, 'DELETE', null, async);
        }
    };
    ['get', 'put', 'post', 'patch'].forEach(function(m) { // method
        yyf.prototype[m] = function(url, data, async) {
            return this.request(url, m.toUpperCase(), data, async);
        };
    });
    ['success', 'fail', 'auth', 'complete'].forEach(function(status) { //handlers
        yyf.prototype[status] = function(callback) {
            return this.setHandle(status, callback);
        }
    });

    /**
     * set config
     */
    function config(options, handle, code) {
        if (arguments.length === 1) {
            if (typeof options === "string") { //root
                CONFIG['root'] = options;
                return (new yyf());
            } else if (
                typeof options['options'] === "object" ||
                typeof options['handle'] === "object" ||
                typeof options['code'] === "object"
            ) {
                handle = options['handle'];
                code = options['code'];
                options = options['options'];
            }
        }
        var key;
        for (key in options) {
            CONFIG[key] = options[key];
        }
        for (key in handle) {
            CONFIG.handle[key] = handle[key];
        }
        for (key in code) {
            CONFIG.setCode(code[key], key);
        }
        return (new yyf());
    };

    /**
     * Expose
     */
    var YYF = config;
    for (var func in yyf.prototype) { // yyf interfaces
        YYF[func] = function(name) {
            return function() {
                return yyf.prototype[name].apply(new yyf(), arguments);
            }
        }(func);
    }
    YYF.setCode = function(code, status) { //set code
        CONFIG.setCode(code, status);
        return YYF;
    };
    YYF.getHandle = function(status) { //get default handle
        return status ? CONFIG.handle[status] : CONFIG.handle;
    };
    // Vue plugin
    function install(Vue, options) {
        if (options) {
            config(options);
        }
        Vue.YYF = Vue.prototype.$yyf = YYF;
    }
    if (typeof window !== 'undefined' && window.Vue) { //Vue auto install
        window.Vue.use(install);
    } else {
        YYF.install = install;
        if (typeof module !== 'undefined' && typeof exports === 'object') {
            module.exports = YYF;
        } else if (typeof define === 'function' && define.amd) {
            define(function() { return YYF; });
        } else {
            this.YYF = YYF;
        }
    }
}).call(function() {
    return this || (typeof window !== 'undefined' ? window : global);
}());