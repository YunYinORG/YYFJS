/**
 * YYF.YYF
 * @module yyfjs
 * @see module:yyfjs
 * @namespace YYF
 * @author NewFuture
 */
declare module "yyfjs" {
    /**
     * @typedef YYF~Response
     * @desc the standard response object of the request which conttains data and status
     * @type {object}
     * @property {number} status - the status flag code of the result
     * @property {any} data - the response data
     */
    type Response = {
        status: number;
        data: any;
    };

    /**
     * @interface YYF~Config
     * @desc the Cofig to setting the YYF
     */
    interface Config {
        /**
         * @name YYF~Config.options
         * @type {?YYF~Options}
         * @desc the options of the configuration
         * @see YYF~Options
         */
        options?: Options;
        /**
         * @name YYF~Config.code
         * @type {Object.<string, number>}
         * @desc the code Map of the configuration
         */
        code?: {
            [key: string]: number;
        };
        /**
         * @name YYF~Config.handle
         * @type {?Object.<string, YYF~Handler>}
         * @desc the global handlers for all requests
         */
        handle?: {
            [key: string]: Handler;
        };
    }

    /**
     * handler callback afeter request
     * @callback YYF~dataHandler
     * @param {any} data - response data (without status)
     * @param {XMLHttpRequest} [request] - this xhr request object
     * @return {boolean|void} - return false to stop next handler event
     */
    type dataHandler = (data: any, request?: XMLHttpRequest) => boolean | void;

    /**
     * ready (when respone arrives) or final(the last envent) Handler
     * @callback YYF~responseHandler
     * @param {string|YYF~Response} response - the full response string or object
     * @param {XMLHttpRequest} [request] - this xhr request object
     * @return {boolean?} - return false to stop next handler event
     */
    type responseHandler = (response: string | Response, request?: XMLHttpRequest) => boolean;

    /**
     * @callback YYF~beforeHandler
     * @desc the handler before sending request, can capture or change the data and headers
     * @param {any} data - the request data
     * @param {any} [headers] - http request header can be modified
     * @param {string} [url] - the full request url
     * @param {string} [method] - the request method
     * @param {XMLHttpRequest} [request] - this xhr request object
     * @return {any?} - the data undifined means keep before
     */
    type beforeHandler = (data: any, headers?: any, url?: string, method?: string, request?: XMLHttpRequest) => any;

    /**
     * @callback YYF~errorHandler
     * @desc the callback when error occurred
     * @param {XMLHttpRequest} request - this xhr request object
     * @param {string|YYF~Response} [response] - response string or object
     */
    type errorHandler = (request: XMLHttpRequest, response?: string | Response) => void;

    /**
     * @typedef {YYF~dataHandler|YYF~responseHandler|YYF~beforeHandler|YYF~errorHandler} YYF~Handler
     */
    type Handler = dataHandler | responseHandler | beforeHandler | errorHandler;

    /**
     * @interface YYF~Options
     * @inner
     */
    interface Options {
        /**
         * the root of the request url
         * @memberof YYF~Options
         * @type {?string}
         */
        root?: string;
        /**
         * request async ? default true.
         * @memberof YYF~Options
         * @type {?boolean}
         * @default true
         */
        async?: boolean;
        /**
         * send with cookie header (withCredentials) when corss site (CORS)
         * @memberof YYF~Options
         * @type {?boolean}
         * @default false
         */
        cookie?: boolean;
        /**
         * request,Content-type,using x-www-form-urlencoded in default
         * @memberof YYF~Options
         * @type {?string}
         * @default 'urlencoded'
         */
        type?: string;
        /**
         * default headers in every request
         * @memberof YYF~Options
         * @type {?Object.<string, number|string>}
         */
        headers?: {
            [key: string]: number | string;
        };
        /**
         * the status field in response
         * @memberof YYF~Options
         * @type {?string}
         * @default 'status'
         */
        status?: string;
        /**
         * the data field in response
         * @memberof YYF~Options
         * @type {?string}
         * @default 'data'
         */
        data?: string;
    }

    /**
     * @class YYF~yyf
     * @classdesc REST API request
     * @inner
     * @protected
     */
    class yyf {
        /**
         * set handle for different status
         * @method YYF~yyf#setHandle
         * @param {string} key - status key
         * @param {YYF~Handler} callback - callback on this status
         * @return {YYF~yyf} - its self
         */
        setHandle(key: string, callback: Handler): yyf;

        /**
         * get the handler of status
         * @method YYF~yyf#getHandle
         * @param {string} [status] - status key,empty to get all handlers for current request
         * @return {YYF~Handler|Object.<string, YYF~Handler>} the handler of the status or all status
         */
        getHandle(status?: string): Handler | {
            [key: string]: Handler;
        };

        /**
         * send request
         * @method YYF~yyf#request
         * @param {string} method - request method such as GET POST
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        request(method: string, url: string, data?: any, async?: boolean): yyf;

        /**
         * quick delete
         * @method YYF~yyf#delete
         * @param {string} url - request url
         * @param {boolean} [async] - request async or sync default using Options (@see YYF~Options)
         * @return {YYF~yyf} -its self
         */
        delete(url: string, async?: boolean): yyf;

        /**
         * @name YYF~yyf#get
         * @desc send the GET request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        get(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#post
         * @desc send the POST request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        post(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#put
         * @desc send the PUT request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        put(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#patch
         * @desc send the PATCH request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        patch(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#success
         * @method
         * @desc the [request level] callback handler when response status is success
         * @param {YYF~dataHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        success(callback: dataHandler): yyf;

        /**
         * @name YYF~yyf#fail
         * @method
         * @desc the [request level] callback handler when response status is fail
         * @param {YYF~dataHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        fail(callback: dataHandler): yyf;

        /**
         * @method
         * @name YYF~yyf#auth
         * @desc the [request level] callback handler when response status is need auth
         * @param {YYF~dataHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        auth(callback: dataHandler): yyf;

        /**
         * @method
         * @name YYF~yyf#ready
         * @desc the [request level] callback when the request arrived
         * @param {YYF~responseHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        ready(callback: responseHandler): yyf;

        /**
         * @method
         * @name YYF~yyf#final
         * @desc the [request level] last callback when all handlers completed
         * @param {YYF~responseHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        final(callback: responseHandler): yyf;

    }

    /**
     * @global
     * @static
     * @class YYF.YYF
     * @mixes YYF~yyf
     * @alias module:yyfjs
     * @classdesc config the options and create yyf request instance
     * @param {string|YYF~Options|YYF~Config} options - setting config, string => root
     * @param {Object.<string, YYF~Handler>} [handlers] - handlers
     * @param {Object.<string, number>} [codeMap] - code key map
     * @return {YYF.YYF}
     */
    interface YYF {
        (options: string | Options | Config, handlers?: {
            [key: string]: Handler;
        }, codeMap?: {
            [key: string]: number;
        }): YYF;

        /**
         * set global status code
         * @method
         * @alias YYF.YYF.setCode
         * @param {string|number} key - status key
         * @param {number} callback - callback on this status
         * @return {YYF.YYF} - return the module
         */
        setCode(key: string | number, callback: number): YYF;

        /**
         * get the global handler of status
         * @method
         * @alias YYF.YYF.getHandle
         * @param {string} [status] - status key, empty for all handlers
         * @return {YYF~Handler|Object.<string, YYF~Handler>} - the global handler of the status or all handlers
         */
        getHandle(status: string): Handler;

        /**
         * register YYF to an object prototype
         * so you can use as `obj.YYF` or `(new obj()).$yyf`
         * @method
         * @alias YYF.YYF.install
         * @param {any} obj - the object such as Vue or Jquery
         * @param {string|YYF~Options|YYF~Config} [options] - options
         * @return {YYF.YYF}
         */
        install(obj: any, options?: string | Options | Config): YYF;

        /**
         * get the handler of status
         * @method YYF~yyf#getHandle
         * @param {string} [status] - status key,empty to get all handlers for current request
         * @return {YYF~Handler|Object.<string, YYF~Handler>} the handler of the status or all status
         */
        getHandle(): {
            [key: string]: Handler;
        };

        /**
         * send request
         * @method YYF~yyf#request
         * @param {string} method - request method such as GET POST
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        request(method: string, url: string, data?: any, async?: boolean): yyf;

        /**
         * quick delete
         * @method YYF~yyf#delete
         * @param {string} url - request url
         * @param {boolean} [async] - request async or sync default using Options (@see YYF~Options)
         * @return {YYF~yyf} -its self
         */
        delete(url: string, async?: boolean): yyf;

        /**
         * @name YYF~yyf#get
         * @desc send the GET request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        get(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#post
         * @desc send the POST request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        post(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#put
         * @desc send the PUT request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        put(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#patch
         * @desc send the PATCH request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {YYF~yyf} -its self
         */
        patch(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name YYF~yyf#success
         * @method
         * @desc the [request level] callback handler when response status is success
         * @param {YYF~dataHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        success(callback: dataHandler): yyf;

        /**
         * @name YYF~yyf#fail
         * @method
         * @desc the [request level] callback handler when response status is fail
         * @param {YYF~dataHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        fail(callback: dataHandler): yyf;

        /**
         * @method
         * @name YYF~yyf#auth
         * @desc the [request level] callback handler when response status is need auth
         * @param {YYF~dataHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        auth(callback: dataHandler): yyf;

        /**
         * @method
         * @name YYF~yyf#ready
         * @desc the [request level] callback when the request arrived
         * @param {YYF~responseHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        ready(callback: responseHandler): yyf;

        /**
         * @method
         * @name YYF~yyf#final
         * @desc the [request level] last callback when all handlers completed
         * @param {YYF~responseHandler} callback - the callback function
         * @return {YYF~yyf}
         */
        final(callback: responseHandler): yyf;

    }

    const yyfjs: YYF
    export = yyfjs;
}