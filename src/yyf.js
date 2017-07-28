(function () {
    'use strict';
    var DEBUG = true;

    /**
     * @interface Config
     */
    var CONFIG = {
        /**
         * the root of the request url
         * @memberof Config
         * @type {?string}
         */
        root: '',

        /**
         * request async ? default true.
         * @memberof Config
         * @type {?boolean}
         * @default true
         */
        async: true,

        /**
         * send with cookie header (withCredentials) when corss site (CORS)
         * @memberof Config
         * @type {?boolean}
         * @default false
         */
        cookie: false,

        /**
         * request,Content-type,using x-www-form-urlencoded in default
         * @memberof Config
         * @type {?string}
         * @default 'urlencoded'
         */
        type: 'urlencoded',

        /**
         * default headers in every request
         *@memberof Config
         * @type {?Object.<string, number|string>}
         */
        headers: {},

        /**
         * the status field in response
         * @memberof Config
         * @type {?string}
         * @default 'status'
         */
        status: 'status',

        /**
         * the data field in response
         * @memberof Config
         * @type {?string}
         * @default 'data'
         */
        data: 'data',

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
     * @inner
     * @private
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
     * @property {object} get
     * @param {string} url - request url
     * @param {any} [data] - request data    
     * @param {boolean} [async] - request async or sync default using CONFIG (default false)
     * @return {yyf}
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
                    self.getHandle('onerror')(res, response);
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
         * @instance 
         * @memberof yyf
         * @param {string} key - status key
         * @param {YYFHandler} callback - callback on this status
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
         * @instance 
         * @memberof yyf
         * @param {string} [status] - status key
         * @return {YYFHandler|Object.<string, YYFHandler>}
         */
        getHandle: function (status) {
            if (status) {
                return this._handle[status] || CONFIG._handle[status];
            } else {
                return this._handle;
            }
        },

        /**
         * send request
         * @method
         * @instance 
         * @memberof yyf
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
         * @instance 
         * @memberof yyf
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

        /**
         * create get request
         * @method
         * @alias yyf#get
         * @param {string} url - request url
         * @param {any} [data] - request data    
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyf}
         */
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
     * @global
     * @class YYF
     * @param {string|Config} [options] - setting config, string for root ,obejct fpr config
     * @param {Object.<string, YYFHandler>} [handlers] - handlers
     * @param {Object.<string, number>} [codeMap] - code key map
     * @return {YYF}
     */
    var YYF = function (options, handlers, codeMap) {
        if (arguments.length === 1 && options) {
            if (typeof options === 'string') { //root
                CONFIG['root'] = options;
                return YYF;
            } else if (
                typeof options['options'] === 'object' ||
                typeof options['handle'] === 'object' ||
                typeof options['code'] === 'object'
            ) {
                handlers = options['handle'];
                codeMap = options['code'];
                options = options['options'];
            }
        }
        var key;
        for (key in options) {
            CONFIG[key] = options[key];
        }
        for (key in handlers) {
            CONFIG._handle[key] = handlers[key];
        }
        for (key in codeMap) {
            CONFIG._setCode(codeMap[key], key);
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
     * @param {string} [status] - status key
     * @return {YYFHandler|Object.<string, YYFHandler>}
     */
    YYF.getHandle = function (status) { //get default handle
        return status ? CONFIG._handle[status] : CONFIG._handle;
    };

    /**
     * register YYF as a plugin in an object prototype
     * @method
     * @alias YYF.install
     * @param {any} obj - the object such as Vue or Jquery 
     * @param {string|Config} [options] - options
     * @return {YYF}
     */
    YYF.install = function (obj, options) {
        return obj.YYF = obj.prototype.$yyf = YYF(options);
    };

    /**
     * Expose 
     */
    if (typeof window !== 'undefined' && window.Vue) { //Vue auto install
        window.Vue.use(YYF);
    } else if (typeof module !== 'undefined' && typeof exports === 'object') { //require
        module.exports = YYF;
    } else if (typeof define === 'function' && define.amd) { //amd
        define(function () { return YYF; });
    } else { //window
        this.YYF = YYF;
    }
}).call(function () {
    return this || (typeof window !== 'undefined' ? window : global);
}());

/**
 * @typedef Response
 * @type {object}
 * @property {number} code - the root URL of the request
 * @property {any} data - async request? default true.
 */

 /**
 * handler callback afeter request
 * @callback dataHandler
 * @param {any} data - response data (without code)
 * @param {XMLHttpRequest} [request] - this xhr request object
 * @return {boolean?} - return false to stop next handler event
 */

 /**
 * ready (when respone arrives) or final(the last envent) Handler
 * @callback fullHandler
 * @param {string|Response} response - the full response string
 * @param {XMLHttpRequest} [request] - this xhr request object
 * @return {boolean?} - return false to stop next handler event
 */

/**
 * before request Handler
 * @callback beforeHandler
 * @param {any} data - response data (without code)
 * @param {any} [headers] - http request header
 * @param {string} [url] - the full request url
 * @param {string} [method] - the request method
 * @param {XMLHttpRequest} [request] - this xhr request object
 * @return {any?} - the data undifined means keep before 
 */

 /**
  * error callback
  * @callback errorHandler
  * @param {XMLHttpRequest} request - this xhr request object
  * @param {string|Response} [response] - response data (without code)
  * @return {any?}
  */

 /**
  * @typedef {dataHandler|fullHandler} normalHandler
  */

  /**
  * @typedef {dataHandler|fullHandler|beforeHandler|errorHandler} YYFHandler
  */
