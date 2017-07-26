(function () {
    'use strict';
    var DEBUG = true;

    /**
     * global configure of http request
     * @class CONFIG
     * @access private
     */
    var CONFIG = {
        root: '', // request root url
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
        _setCode: function (code_num, status_str) { //set code 
            if (status_str) { //set
                CONFIG._code[status_str] = code_num;
                CONFIG._codeMap[code_num] = status_str;
            } else { //delete
                delete CONFIG._code[CONFIG._codeMap[code_num]];
                delete CONFIG._codeMap[code_num];
            }
        },

        _handle: { //default handlers
            onerror: console.error, //default handle for network error
            success: function () { },
            fail: function () { }
        },
    };

    /**
     * encode an object to a uri string
     * @function serialize
     * @param {any} obj - an object to be serialized as uri string
     * @return {string} - seriladized uri string 
     */
    function serialize(obj) {
        return Object.keys(obj).reduce(function (str, key) {
            return str + (str && '&') + encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        }, '');
    }

    /**
     * @class Http
     * @classdesc HTTP request
     * @param {string} [method='GET'] - request method such as GET POST default is 'GET'
     * @param {boolean} [async] - request async or sync default using CONFIG (default false)
     * @param {string} [type] - encode type such as json,urlencoded,form; default using CONFIG (urlencode)
     */
    function Http(method, async, type) {
        this._METHOD = method || 'GET';
        this._ASYNC = typeof async === 'undefined' ? CONFIG.async : async;
        this._TYPE = typeof type === 'undefined' ? CONFIG.type : type;
    }
    Http.prototype = {
        // format data and request header
        _format: function (data, req) {
            switch (this._TYPE.toLowerCase()) {
                case 'urlencoded':
                case 'url': //send as urlencoded form
                    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                    if (typeof data === 'object') { //serialize onj
                        return serialize(data);
                    } else {
                        return data;
                    }

                case 'json': //send as json format
                    req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                    if (typeof data === 'object') {
                        data = JSON.stringify(data);
                    }
                    return data;

                case 'form': //send as form 
                    // req.setRequestHeader('Content-Type', 'multipart/form-data');
                    if (typeof data === 'object') {
                        var form = new FormData();
                        for (var i in data) {
                            form.append(i, data[i]);
                        }
                        data = form;
                    }
                    break;

                default: //special Content type
                    req.setRequestHeader('Content-Type', this._TYPE);
            }
            return data;
        },
        //send xhr request
        _send: function (url, data, callback) {
            var self = this;
            var request = new XMLHttpRequest();
            var headers = CONFIG.headers;
            var beforeHandler = CONFIG._handle['before'];
            var key;

            for (key in callback) { // set callback
                if (callback[key]) {
                    request[key] = callback[key];
                }
            }

            url = CONFIG.root + url;
            //before Hook
            if (beforeHandler) {
                headers = Object.assign({}, headers); //copy headers
                key = beforeHandler(data, headers, url, self._METHOD, request);
                if (key !== undefined) { // using return as data
                    data = key;
                }
            }

            //initialize request with URL and open
            if (self._METHOD == 'GET' && data) { //get serialize
                url += '?' + serialize(data);
                data = null;
            }
            request.open(self._METHOD, url, self._ASYNC);

            if (DEBUG) {
                console.log(url);
            }

            if (data && self._TYPE) { //format data and set Content-Type
                data = self._format(data, request);
            }
            for (key in headers) { // set headers
                if (headers.hasOwnProperty(key)) {
                    request.setRequestHeader(key, headers[key]);
                }
            }
            request.withCredentials = CONFIG.cookie;
            request.send(data);
            return self;
        }
    };

    /**
     * @class yyf
     * @classdesc REST API request
     */
    function yyf() {
        var self = this;
        // status change for http request
        self._onload = function () {
            if (DEBUG) {
                console.log(this.status, this.responseText);
            }
            if (this.readyState === 4) { //XMLHttpRequest.DONE
                if (this.status >= 300) {
                    self.getHandle('onerror')(this);
                } else if (this.status >= 200) {
                    self._handle(this.responseText.trim(), this);
                }
            }
        };
        //default resolve response
        self._handle = function (response, res) {
            if (DEBUG) {
                console.debug(response);
            }
            //ready
            var handler = self.getHandle('ready');
            try {
                response = JSON.parse(response);
            } catch (e) { // not json
            }
            // invoke
            if ((!(handler && (handler(response, res) === false))) && (typeof response == 'object')) {
                //no handler，or handler return false
                if (CONFIG.status in response) { // get status
                    self.getHandle(
                        CONFIG._codeMap[response[CONFIG.status]]
                    )(response[CONFIG.data], res);
                } else { //no 'status' key in response
                    self.getHandle('onerror')(response, res);
                }
            }
            //final
            handler = self.getHandle('final');
            if (handler) {
                handler(response, res);
            }
        };
        return self;
    }
    yyf.prototype = {

        /**
         * set handle for different status
         * @method
         * @alias yyf.setHandle
         * @param {string|number} key - status key
         * @param {function} callback - callback on this status
         * @return {yyf}
         */
        setHandle: function (key, callback) {
            if (typeof callback !== 'undefined') {
                this._handle[key] = callback;
            } else if (typeof key === 'function') {
                this._handle = key;
            } else if (DEBUG) {
                console.log('not callable', key, callback);
            }
            return this;
        },

        /**
         * get the handle of status
         * @method
         * @alias yyf.getHandle
         * @param {string|number} [status] - status key
         * @return {function|any}
         */
        getHandle: function (status) {
            if (status) {
                return this._handle[status] || CONFIG._handle[status];
            } else {
                return this._handle;
            }
        },

        /**
         * quick request
         * @method
         * @alias yyf.request
         * @param {string} method - request method such as GET POST
         * @param {string} url - request url     
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyf}
         */
        request: function (method, url, data, async) { //request resource
            (new Http(method, async))._send(url, data, {
                'onload': this._onload,
                'onerror': this.getHandle('onerror')
            });
            return this;
        },

        /**
        * quick delete
        * @method
        * @alias yyf.delete
        * @param {string} url - request url     
        * @param {boolean} [async] - request async or sync default using CONFIG (default false)
        * @return {yyf}
        */
        delete: function (url, async) {
            return this.request('DELETE', url, null, async);
        }
    };
    // apply all REST method
    ['get', 'put', 'post', 'patch'].forEach(function (m) {
        yyf.prototype[m] = function (url, data, async) {
            return this.request(m.toUpperCase(), url, data, async);
        };
    });
    //apply headers interfaces
    ['success', 'fail', 'auth', 'ready', 'final', 'onerror'].forEach(function (status) { //handlers
        yyf.prototype[status] = function (callback) {
            return this.setHandle(status, callback);
        };
    });


    /**
     * @class YYF
     * @param {string|object} [options] - setting config, string for root ,obejct fpr config
     * @param {any} [handle] - handles
     * @param {any} [code] - code key map
     */
    var YYF = function (options, handle, code) {
        if (arguments.length === 1 && options) {
            if (typeof options === 'string') { //root
                CONFIG['root'] = options;
                return (new yyf());
            } else if (
                typeof options['options'] === 'object' ||
                typeof options['handle'] === 'object' ||
                typeof options['code'] === 'object'
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
            CONFIG._handle[key] = handle[key];
        }
        for (key in code) {
            CONFIG._setCode(code[key], key);
        }
        return YYF;
    };
    // apply yyf interfaces
    for (var func in yyf.prototype) { // yyf interfaces
        YYF[func] = function (name) {
            return function () {
                return yyf.prototype[name].apply(new yyf(), arguments);
            };
        }(func);
    }

    /**
    * set global status code
    * @method
    * @alias YYF.setCode
    * @param {string|number} key - status key
    * @param {number} callback - callback on this status
    * @return {YYF}
    */
    YYF.setCode = function (code, status) { //set code
        CONFIG._setCode(code, status);
        return YYF;
    };

    /**
     * get the global handle of status
     * @method
     * @alias YYF.getHandle
     * @param {string|number} [status] - status key
     * @return {function|any}
     */
    YYF.getHandle = function (status) { //get default handle
        return status ? CONFIG._handle[status] : CONFIG._handle;
    };

    // Vue plugin
    YYF.install = function (Vue, options) {
        Vue.YYF = Vue.prototype.$yyf = YYF(options);
    };
    /**
     * Expose 
     */
    if (typeof window !== 'undefined' && window.Vue) { //Vue auto install
        window.Vue.use(YYF);
    } else if (typeof module !== 'undefined' && typeof exports === 'object') { //require

        /**
         * yyfjs lib
         * @module yyfjs
         * @exports YYF
         */
        module.exports = YYF;
    } else if (typeof define === 'function' && define.amd) { //amd
        define(function () { return YYF; });
    } else { //window
        this.YYF = YYF;
    }
}).call(function () {
    return this || (typeof window !== 'undefined' ? window : global);
}());