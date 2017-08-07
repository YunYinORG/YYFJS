declare const YYF: yyfjs.YYF;
declare module "yyfjs" { export = YYF; }

/**
 * YYFJS
 * A REST API request lib
 * @module yyfjs
 * @see module:yyfjs
 * @namespace yyfjs
 * @author NewFuture
 */
declare namespace yyfjs {
    /**
     * @typedef yyfjs~Response
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
     * @interface yyfjs~Config
     * @inner yyfjs
     * @desc the Cofig to setting the YYF
     */
    interface Config {
        /**
         * @name yyfjs~Config.options?
         * @type {yyfjs~Options}
         * @desc the options of the configuration
         * @see yyfjs~Options
         */
        options?: Options;
        /**
         * @name yyfjs~Config.code?
         * @type {Object.<string, number|string>}
         * @desc the code Map of the configuration
         * @default {success:1,fail:0,auth:-1}
         */
        code?: {
            [key: string]: number | string;
        };
        /**
         * @name yyfjs~Config.handle?
         * @type {Object.<string, yyfjs~Handler>}
         * @desc the global handlers for all requests
         * @default {error:console.error}
         */
        handle?: {
            [key: string]: Handler;
        };
    }

    /**
     * handler callback afeter request
     * @callback yyfjs~dataHandler
     * @param {any} [data] - response data (without status)
     * @param {?XMLHttpRequest} [request] - this xhr request object
     * @return {boolean|void} - return false to stop next handler event
     */
    type dataHandler = (data?: any, request?: XMLHttpRequest)=>boolean | void;

    /**
     * ready (when respone arrives) or final(the last envent) Handler
     * @callback yyfjs~responseHandler
     * @param {string|yyfjs~Response} [response] - the full response string or object
     * @param {?XMLHttpRequest} [request] - this xhr request object
     * @return {boolean|void} - return false to stop next handler event
     */
    type responseHandler = (response?: string | Response, request?: XMLHttpRequest)=>boolean | void;

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
    type beforeHandler = (data: any, headers?: any, url?: string, method?: string, request?: XMLHttpRequest)=>any;

    /**
     * @callback yyfjs~errorHandler
     * @desc the callback when error occurred
     * @param {XMLHttpRequest} [request] - this xhr request object
     * @param {?string|yyfjs~Response} [response] - response string or object
     */
    type errorHandler = (request?: XMLHttpRequest, response?: string | Response)=>void;

    /**
     * @typedef {yyfjs~dataHandler|yyfjs~responseHandler|yyfjs~beforeHandler|yyfjs~errorHandler} yyfjs~Handler
     */
    type Handler = dataHandler | responseHandler | beforeHandler | errorHandler;

    /**
     * @interface yyfjs~Options
     * @inner
     */
    interface Options {
        /**
         * @alias yyfjs~Options.root?
         * @desc the root of the request url
         * @type {string}
         * @default ''
         */
        root?: string;
        /**
         * @alias yyfjs~Options.async?
         * @desc request async ? default true.
         * @type {?boolean}
         * @default true
         */
        async?: boolean;
        /**
         * @alias yyfjs~Options.cookie?
         * @desc send with cookie header (withCredentials) when corss site (CORS)
         * @type {?boolean}
         * @default false
         */
        cookie?: boolean;
        /**
         * @alias yyfjs~Options.type?
         * @desc request,Content-type,using x-www-form-urlencoded in default
         * @type {string}
         * @default 'urlencoded'
         */
        type?: string;
        /**
         * @alias yyfjs~Options.headers?
         * @desc default headers in every request
         * @type {Object.<string, number|string>}
         */
        headers?: {
            [key: string]: number | string;
        };
        /**
         * @alias yyfjs~Options.status?
         * @desc the status field in response
         * @type {string}
         * @default 'status'
         */
        status?: string;
        /**
         * @alias yyfjs~Options.data?
         * @desc the data field in response
         * @type {string}
         * @default 'data'
         */
        data?: string;
    }

    /**
     * @class yyfjs~yyf
     * @classdesc REST API request
     * @inner
     * @protected
     */
    class yyf {
        /**
         * set handle for different status
         * @method yyfjs~yyf#on
         * @param {string} key - status key
         * @param {yyfjs~Handler?} [callback] - callback on this status
         * @return {yyfjs~yyf} - its self
         */
        on(key: string, callback?: Handler): yyf;

        /**
         * @method
         * @desc get all the [request level] handlers map for all status
         * @name yyfjs~yyf#getHandle
         * @variation 1
         * @return {Object.<string, yyfjs~Handler>} the [request level] handlerMap for all status
         */
        getHandle(): {
            [key: string]: Handler;
        };

        /**
         * @method yyfjs~yyf#getHandle
         * @desc get the handler of status for current request
         * @param {string} status - status key,empty to get all handlers for current request
         * @return {yyfjs~Handler} the handler of the status
         */
        getHandle(status: string): Handler;

        /**
         * send request
         * @method yyfjs~yyf#request
         * @param {string} method - request method such as GET POST
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        request(method: string, url: string, data?: any, async?: boolean): yyf;

        /**
         * quick delete
         * @method yyfjs~yyf#delete
         * @param {string} url - request url
         * @param {boolean} [async] - request async or sync default using Options (@see yyfjs~Options)
         * @return {yyfjs~yyf} -its self
         */
        delete(url: string, async?: boolean): yyf;

        /**
         * @name yyfjs~yyf#get
         * @desc send the GET request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        get(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name yyfjs~yyf#post
         * @desc send the POST request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        post(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name yyfjs~yyf#put
         * @desc send the PUT request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        put(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name yyfjs~yyf#patch
         * @desc send the PATCH request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        patch(url: string, data?: any, async?: boolean): yyf;

        /**
         * @name yyfjs~yyf#success
         * @method
         * @desc the [request level] callback handler when response status is success
         * @param {yyfjs~dataHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        success(callback: dataHandler): yyf;

        /**
         * @name yyfjs~yyf#fail
         * @method
         * @desc the [request level] callback handler when response status is fail
         * @param {yyfjs~dataHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        fail(callback: dataHandler): yyf;

        /**
         * @method
         * @name yyfjs~yyf#auth
         * @desc the [request level] callback handler when response status is need auth
         * @param {yyfjs~dataHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        auth(callback: dataHandler): yyf;

        /**
         * @method
         * @name yyfjs~yyf#error
         * @desc the [request level] callback handler when error occurs
         * @param {yyfjs~errorHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        error(callback: errorHandler): yyf;

        /**
         * @method
         * @name yyfjs~yyf#ready
         * @desc the [request level] callback when the request arrived
         * @param {yyfjs~responseHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        ready(callback: responseHandler): yyf;

        /**
         * @method
         * @name yyfjs~yyf#final
         * @desc the [request level] last callback when all handlers completed
         * @param {yyfjs~responseHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        final(callback: responseHandler): yyf;

    }

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
    interface YYF {
        /**
         * @method yyfjs.YYF.config
         * @desc config the options and create yyf request instance
         * @param {string|yyfjs~Options|yyfjs~Config} options - setting config, string => root
         * @param {Object.<string, yyfjs~Handler>} [handlersMap] - handlers
         * @param {Object.<string, number>} [codeMap] - code key map
         * @return {yyfjs.YYF}
         */
        config(options: string | Options | Config, handlersMap?: {
            [key: string]: Handler;
        }, codeMap?: {
            [key: string]: number;
        }): YYF;
        (options: string | Options | Config, handlersMap?: {
            [key: string]: Handler;
        }, codeMap?: {
            [key: string]: number;
        }): YYF;
        /**
         * set global status code
         * @method
         * @alias yyfjs.YYF.setCode
         * @param {string} key - status key,should be the same as the key of handlers，such as 'success'
         * @param {number} statusCode - the status code for the key such as 0,1
         * @return {yyfjs.YYF} - return the module
         */
        setCode(key: string, statusCode: number): YYF;
        /**
         * @method
         * @name yyfjs.YYF.getHandle
         * @variation 1
         * @desc get all global handlers of every status
         * @return {Object.<string, yyfjs~Handler>} - the global handler of the status or all handlers
         */
        getHandle(): {
            [key: string]: Handler;
        };
        /**
         * @method yyfjs.YYF.getHandle
         * @desc get the global handler of status
         * @param {string} status - status key
         * @return {yyfjs~Handler} - the global handler of the status
         */
        getHandle(status: string): Handler;
        /**
         * @method
         * @name yyfjs.YYF.setHandle
         * @variation 1
         * @desc set global handle map
         * @param {Object.<string, yyfjs~Handler>} handlerMap
         * @return {yyfjs.YYF} - its self
         */
        setHandle(handlerMap: {
            [key: string]: Handler;
        }): YYF;
        /**
         * @method yyfjs.YYF.setHandle
         * @desc set global [default] handler for different status
         * @param {string} key - status key
         * @param {yyfjs~Handler} callback - callback on this status
         * @return {yyfjs.YYF} - its self
         */
        setHandle(key: string, callback: Handler): YYF;
        /**
         * register YYF to an object prototype
         * so you can use as `obj.YYF` or `(new obj()).$yyf`
         * @method yyfjs.YYF.install
         * @param {any} obj - the object such as Vue or Jquery
         * @param {string|yyfjs~Options|yyfjs~Config} [options] - options
         * @return {yyfjs.YYF}
         */
        install(obj: any, options?: string | Options | Config): YYF;
        /**
         * send request
         * @method yyfjs~yyf#request
         * @param {string} method - request method such as GET POST
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        request(method: string, url: string, data?: any, async?: boolean): yyf;
        /**
         * @name yyfjs~yyf#get
         * @desc send the GET request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        get(url: string, data?: any, async?: boolean): yyf;
        /**
         * @name yyfjs~yyf#post
         * @desc send the POST request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        post(url: string, data?: any, async?: boolean): yyf;
        /**
         * @name yyfjs~yyf#put
         * @desc send the PUT request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        put(url: string, data?: any, async?: boolean): yyf;
        /**
         * @name yyfjs~yyf#patch
         * @desc send the PATCH request
         * @method
         * @param {string} url - request url
         * @param {any} [data] - request data
         * @param {boolean} [async] - request async or sync default using CONFIG (default false)
         * @return {yyfjs~yyf} -its self
         */
        patch(url: string, data?: any, async?: boolean): yyf;
        /**
         * quick delete
         * @method yyfjs~yyf#delete
         * @param {string} url - request url
         * @param {boolean} [async] - request async or sync default using Options (@see yyfjs~Options)
         * @return {yyfjs~yyf} -its self
         */
        delete(url: string, async?: boolean): yyf;
        /**
         * set handle for different status
         * @method yyfjs~yyf#on
         * @param {string} key - status key
         * @param {yyfjs~Handler?} [callback] - callback on this status
         * @return {yyfjs~yyf} - its self
         */
        on(key: string, callback?: Handler): yyf;
        /**
         * @name yyfjs~yyf#success
         * @method
         * @desc the [request level] callback handler when response status is success
         * @param {yyfjs~dataHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        success(callback: dataHandler): yyf;
        /**
         * @name yyfjs~yyf#fail
         * @method
         * @desc the [request level] callback handler when response status is fail
         * @param {yyfjs~dataHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        fail(callback: dataHandler): yyf;
        /**
         * @method
         * @name yyfjs~yyf#ready
         * @desc the [request level] callback when the request arrived
         * @param {yyfjs~responseHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        ready(callback: responseHandler): yyf;
        /**
         * @method
         * @name yyfjs~yyf#final
         * @desc the [request level] last callback when all handlers completed
         * @param {yyfjs~responseHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        final(callback: responseHandler): yyf;
        /**
         * @method
         * @name yyfjs~yyf#error
         * @desc the [request level] callback handler when error occurs
         * @param {yyfjs~errorHandler} callback - the callback function
         * @return {yyfjs~yyf}
         */
        error(callback: errorHandler): yyf;
    }

}

