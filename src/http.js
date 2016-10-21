'use strict';
var Http = {

    OPTIONS: {
        async: true,
        debug: false,
        contentType: 'application/json;charset=utf-8',
        headers: {},
        method: 'GET',
        root: '/'
    },
    PROPS: {},
    set: function (options) {
        for (var key in options) {
            this.OPTIONS[key] = options[key];
        }
        return this;
    },
    callback: function (on, func) {
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

    request: function (url, options) {
        // Get options and
        if (options) {
            for (var key in this.OPTIONS) {
                if (!options.hasOwnProperty(key)) {
                    options[key] = this.OPTIONS[key];
                }
            }
        } else {
            options = this.OPTIONS;
        }

        if (options.debug) {
            console.log(options);
        }
        var req = new XMLHttpRequest();

        // set callback
        for (var key in this.PROPS) {
            if (this.PROPS[key]) {
                req[key] = this.PROPS[key];
            }
        }

        //  initialize request with URL
        if (options.root) {
            url = options.root + url;
        }
        req.open(options.method, url, options.async);

        // set headers
        if (options.contentType) {
            req.setRequestHeader('Content-Type', options.contentType);
        }
        for (var key in this.OPTIONS.headers) {
            if (options.headers.hasOwnProperty(key)) {
                req.setRequestHeader(key, options.headers[key]);
            }
        }

        // send
        if (options.data) {
            var data = typeof options.data === "object" ? JSON.stringify(options.data) : options.data;
            req.send(data);
        } else {
            req.send();
        }
        return req;
    }
};

['onload', 'onerror', 'onreadystatechange', 'onabort', 'ontimeout'].forEach(function (key) {
    Http.callback(key, function () {
        if (Http.OPTIONS.debug) {
            console.log(key, arguments);
        };
    });
});
module.exports = Http;
