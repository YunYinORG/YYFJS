/*!
 * YYFJS v2.1.0-beta
 * (c)2016-2017 NewFuture@yunyin.org
 * @license Apache2.0
 */
/**
 * YYFJS 
 * A REST API request lib
 * @module yyfjs
 * @see module:yyfjs
 * @namespace yyfjs
 * @author NewFuture
 */
(/** @lends yyfjs*/function () {
    'use strict';
    //remove debug;

    /**
     * @interface yyfjs~Options
     * @inner
     */
    var CONFIG = {
        /**
         * @alias yyfjs~Options.root?
         * @desc the root of the request url 
         * @type {string}
         * @default ''
         */
        root: '',

        /**
         * @alias yyfjs~Options.async?
         * @desc request async ? default true.
         * @type {?boolean}
         * @default true
         */
        async: true,

        /**
         * @alias yyfjs~Options.cookie?
         * @desc send with cookie header (withCredentials) when corss site (CORS) 
         * @type {?boolean}
         * @default false
         */
        cookie: false,

        /**
         * @alias yyfjs~Options.type?
         * @desc request,Content-type,using x-www-form-urlencoded in default
         * @type {string}
         * @default 'urlencoded'
         */
        type: 'urlencoded',

        /**
         * @alias yyfjs~Options.headers?
         * @desc default headers in every request
         * @type {Object.<string, number|string>}
         */
        headers: {},

        /**
         * @alias yyfjs~Options.status?
         * @desc the status field in response
         * @type {string}
         * @default 'status'
         */
        status: 'status',

        /**
         * @alias yyfjs~Options.data?
         * @desc the data field in response
         * @type {string}
         * @default 'data'
         */
        data: 'data',

        _code: { //status code for status
            success: 1, //response success
            fail: 0, // response false
            auth: -1, // need auth
        },
        _codeMap: { //map code to status for quick search
            1: 'success',
            0: 'fail',
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
            error: console.error, //default handle for network error
            success: function () { },
            fail: function () { }
        },
    };

    /**
     * encode an object to a uri string
     * @function yyfjs~serialize
     * @inner
     * @param {any} obj - an object to be serialized as uri string
     * @return {string} - seriladized uri string 
     * @private
     */
    function serialize(obj) {
        return Object.keys(obj).reduce(function (str, key) {
            return str + (str && '&') + encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        }, '');
    }

    /**
     * @class yyfjs~Http
     * @classdesc HTTP request
     * @inner
     * @private
     * @param {string} [method='GET'] - request method such as GET POST default is 'GET'
     * @param {boolean} [async] - request async or sync default using CONFIG (default false)
     * @param {string} [type] - encode type such as json,urlencoded,form; default using CONFIG (urlencode)
     */
    function Http(method, async, type) {
        this._METHOD = method || 'GET';
        this._ASYNC = typeof async == 'undefined' ? CONFIG.async : async;
        this._TYPE = typeof type == 'undefined' ? CONFIG.type : type;
    }
    Http.prototype = {
        // format data and request header
        _format: function (data, req) {
            switch (this._TYPE.toLowerCase()) {
                case 'urlencoded':
                case 'url': //send as urlencoded form
                    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
                    if (typeof data == 'object') { //serialize onj
                        return serialize(data);
                    } else {
                        return data;
                    }

                case 'json': //send as json format
                    req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                    if (typeof data == 'object') {
                        data = JSON.stringify(data);
                    }
                    return data;

                case 'form': //send as form 
                    // req.setRequestHeader('Content-Type', 'multipart/form-data');
                    if (typeof data == 'object') {
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

            /* remove debug */


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
     * @class yyfjs~yyf
     * @classdesc REST API request
     * @inner
     * @protected
     */
    function yyf() {
        var self = this;
        // status change for http request
        self._onload = function () {
            /* remove debug */

            if (this.readyState === 4) { //XMLHttpRequest.DONE
                if (this.status >= 300) {
                    self.getHandle('error')(this);
                } else if (this.status >= 200) {
                    self._handle(this.responseText.trim(), this);
                }
            }
        };
        //default resolve response
        self._handle = function (response, res) {
            /* remove debug */

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
                    self.getHandle('error')(res, response);
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
         * @method yyfjs~yyf#on
         * @param {string} key - status key
         * @param {yyfjs~Handler?} [callback] - callback on this status
         * @return {yyfjs~yyf} - its self
         */
        on: function (key, callback) {
            this._handle[key] = callback;
            return this;
        },

        /**
         * @method
         * @desc get all the [request level] handlers map for all status
         * @name yyfjs~yyf#getHandle
         * @variation 1
         * @return {Object.<string, yyfjs~Handler>} the [request level] handlerMap for all status
         */
        /**
        * @method yyfjs~yyf#getHandle
        * @desc get the handler of status for current request        
        * @param {string} status - status key,empty to get all handlers for current request
        * @return {yyfjs~Handler} the handler of the status
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
         * @method yyfjs~yyf#request
         * @param {string} method - request method such as GET POST
         * @param {string} url - request url     
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        request: function (method, url, data, async) { //request resource
            (new Http(method, async))._send(url, data, {
                'onload': this._onload,
                'error': this.getHandle('error')
            });
            return this;
        },

        /**
         * quick delete
         * @method yyfjs~yyf#delete
         * @param {string} url - request url     
         * @param {boolean} [async] - request async or sync default using Options (@see yyfjs~Options)
         * @return {yyfjs~yyf} -its self
         */
        delete: function (url, async) {
            return this.request('DELETE', url, null, async);
        }
    };
    // apply all REST method
    ['get', 'put', 'post', 'patch'].forEach(function (m) {
        /**
         * @name yyfjs~yyf#get
         * @desc send the GET request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data    
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        /**
         * @name yyfjs~yyf#post 
         * @desc send the POST request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data    
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        /**
        * @name yyfjs~yyf#put 
        * @desc send the PUT request
        * @method
        * @param {string} url - request url
        * @param {any} [data] - request data    
        * @param {boolean} [async] - request async or sync default using CONFIG (default false)
        * @return {yyfjs~yyf} -its self
        */
        /**
        * @name yyfjs~yyf#patch 
        * @desc send the PATCH request
        * @method
        * @param {string} url - request url
        * @param {any} [data] - request data    
        * @param {boolean} [async] - request async or sync default using CONFIG (default false)
        * @return {yyfjs~yyf} -its self
        */
        yyf.prototype[m] = function (url, data, async) {
            return this.request(m.toUpperCase(), url, data, async);
        };
    });
    //apply headers interfaces
    ['success', 'fail', 'auth', 'ready', 'final', 'error'].forEach(function (status) { //handlers
        /**
         * @name yyfjs~yyf#success
         * @method
         * @desc the [request level] callback handler when response status is success
         * @param {yyfjs~dataHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        /**
        * @name yyfjs~yyf#fail
        * @method
        * @desc the [request level] callback handler when response status is fail
        * @param {yyfjs~dataHandler} callback - the callback function
        * @return {yyfjs~yyf}
        */
        /**
        * @method
        * @name yyfjs~yyf#auth
        * @desc the [request level] callback handler when response status is need auth
        * @param {yyfjs~dataHandler} callback - the callback function
        * @return {yyfjs~yyf}
        */
        /**
        * @method
        * @name yyfjs~yyf#error
        * @desc the [request level] callback handler when error occurs
        * @param {yyfjs~errorHandler} callback - the callback function
        * @return {yyfjs~yyf}
        */
        /**
        * @method
        * @name yyfjs~yyf#ready
        * @desc the [request level] callback when the request arrived 
        * @param {yyfjs~responseHandler} callback - the callback function
        * @return {yyfjs~yyf}
        */
        /**
        * @method
        * @name yyfjs~yyf#final
        * @desc the [request level] last callback when all handlers completed
        * @param {yyfjs~responseHandler} callback - the callback function
        * @return {yyfjs~yyf}
        */
        yyf.prototype[status] = function (callback) {
            return this.on(status, callback);
        };
    });

    /**
     * @interface yyfjs.YYF
     * @borrows yyfjs~yyf#request as request 
     * @borrows yyfjs~yyf#get as get
     * @borrows yyfjs~yyf#post as post
     * @borrows yyfjs~yyf#put as put
     * @borrows yyfjs~yyf#patch as patch
     * @borrows yyfjs~yyf#delete as delete
     * @borrows yyfjs~yyf#on as on 
     * @borrows yyfjs~yyf#success as success
     * @borrows yyfjs~yyf#fail as fail
     * @borrows yyfjs~yyf#ready as ready
     * @borrows yyfjs~yyf#final as final
     * @borrows yyfjs~yyf#error as error 
     */
    function YYF(options, handlers, codeMap) {
        if (arguments.length == 1 && options) {
            if (typeof options == 'string') { //root
                CONFIG['root'] = options;
                return YYF;
            } else if (
                typeof options['options'] == 'object' ||
                typeof options['handle'] == 'object' ||
                typeof options['code'] == 'object'
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
    }

    // apply yyf interfaces
    for (var func in yyf.prototype) { // yyf interfaces
        YYF[func] = function (name) {
            return function () {
                return yyf.prototype[name].apply(new yyf(), arguments);
            };
        }(func);
    }

    /**
     * @method yyfjs.YYF.config
     * @desc config the options and create yyf request instance
     * @param {string|yyfjs~Options|yyfjs~Config} options - setting config, string => root
     * @param {Object.<string, yyfjs~Handler>} [handlersMap] - handlers
     * @param {Object.<string, number>} [codeMap] - code key map
     * @return {yyfjs.YYF}
     */
    YYF.config = function () {
        return YYF.apply(YYF, arguments);
    };

    /**
    * set global status code
    * @method
    * @alias yyfjs.YYF.setCode
    * @param {string} key - status key,should be the same as the key of handlers，such as 'success'
    * @param {number} statusCode - the status code for the key such as 0,1
    * @return {yyfjs.YYF} - return the module
    */
    YYF.setCode = function (key, status) { //set code
        CONFIG._setCode(key, status);
        return YYF;
    };

    /**
     * @method
     * @name yyfjs.YYF.getHandle
     * @variation 1
     * @desc get all global handlers of every status
     * @return {Object.<string, yyfjs~Handler>} - the global handler of the status or all handlers
     */
    /**
     * @method yyfjs.YYF.getHandle
     * @desc get the global handler of status
     * @param {string} status - status key
     * @return {yyfjs~Handler} - the global handler of the status
     */
    YYF.getHandle = function (status) { //get default handle
        return status ? CONFIG._handle[status] : CONFIG._handle;
    };

    /**
     * @method
     * @name yyfjs.YYF.setHandle
     * @variation 1 
     * @desc set global handle map
     * @param {Object.<string, yyfjs~Handler>} handlerMap
     * @return {yyfjs.YYF} - its self
     */
    /**
     * @method yyfjs.YYF.setHandle
     * @desc set global [default] handler for different status 
     * @param {string} key - status key
     * @param {yyfjs~Handler} callback - callback on this status
     * @return {yyfjs.YYF} - its self
     */
    YYF.setHandle = function (key, callback) {
        if (callback) { // key value
            CONFIG._handle[key] = callback;
        } else if (typeof key == 'object') {
            YYF({ handle: key });
        } else {
            /* remove debug */

            throw new Error('invalid params:' + key + callback);
        }
        return YYF;
    };

    /**
     * register YYF to an object prototype
     * so you can use as `obj.YYF` or `(new obj()).$yyf`
     * @method yyfjs.YYF.install
     * @param {any} obj - the object such as Vue or Jquery 
     * @param {string|yyfjs~Options|yyfjs~Config} [options] - options
     * @return {yyfjs.YYF}
     */
    YYF.install = function (obj, options) {
        return obj.YYF = obj.prototype.$yyf = YYF(options);
    };

    /**
     * Expose 
     */
    if (typeof window != 'undefined' && window.Vue) { //Vue auto install
        window.Vue.use(YYF);
    } else if (typeof module != 'undefined' && typeof exports == 'object') { //require
        exports = YYF;
    } else if (typeof define == 'function' && define.amd) { //amd
        define(function () { return YYF; });
    } else { //window
        this.YYF = YYF;
    }
}).call(function () {
    return this || (typeof window != 'undefined' ? window : global);
}());

/**
 * @typedef yyfjs~Response
 * @desc the standard response object of the request which conttains data and status
 * @type {object}
 * @property {number} status - the status flag code of the result
 * @property {any} data - the response data
 */

/**
 * @interface yyfjs~Config
 * @inner yyfjs
 * @desc the Cofig to setting the YYF
 */
/**
 * @name yyfjs~Config.options?
 * @type {yyfjs~Options}
 * @desc the options of the configuration
 * @see yyfjs~Options
 */
/**
 * @name yyfjs~Config.code?
 * @type {Object.<string, number|string>}
 * @desc the code Map of the configuration
 * @default {success:1,fail:0,auth:-1}
 */
/**
 * @name yyfjs~Config.handle?
 * @type {Object.<string, yyfjs~Handler>}
 * @desc the global handlers for all requests
 * @default {error:console.error}
 */

/**
* handler callback afeter request
* @callback yyfjs~dataHandler
* @param {any} [data] - response data (without status)
* @param {?XMLHttpRequest} [request] - this xhr request object
* @return {boolean|void} - return false to stop next handler event
*/

/**
* ready (when respone arrives) or final(the last envent) Handler
* @callback yyfjs~responseHandler
* @param {string|yyfjs~Response} [response] - the full response string or object
* @param {?XMLHttpRequest} [request] - this xhr request object
* @return {boolean|void} - return false to stop next handler event
*/

/**
 * @callback yyfjs~beforeHandler
 * @desc the handler before sending request, can capture or change the data and headers 
 * @param {any} data - the request data
 * @param {any} [headers] - http request header can be modified
 * @param {string} [url] - the full request url
 * @param {string} [method] - the request method
 * @param {XMLHttpRequest} [request] - this xhr request object
 * @return {any?} - the data undifined means keep before 
 */

/**
 * @callback yyfjs~errorHandler
 * @desc the callback when error occurred  
 * @param {XMLHttpRequest} [request] - this xhr request object
 * @param {?string|yyfjs~Response} [response] - response string or object
 */

/**
* @typedef {yyfjs~dataHandler|yyfjs~responseHandler|yyfjs~beforeHandler|yyfjs~errorHandler} yyfjs~Handler
*/

/**
* @typedef {XMLHttpRequest} XMLHttpRequest
*/