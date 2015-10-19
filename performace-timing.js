/*
 * performance-timing.js 0.1
 * https://github.com/tjuking/performance-timing
 */

(function (global, factory) {

    "use strict";

    if (typeof define === "function" && define.amd) {
        define(["jquery"], function ($) {
            return factory($, global);
        });
    } else if (typeof exports !== "undefined") {
        module.exports = factory(require("jquery"), global);
    } else {
        global.Performance = factory(jQuery, global);
    }

})(typeof window !== "undefined" ? window : this, function ($, window) {

    "use strict";

    //封装的Performance对象
    var Perf = {

        //程序配置参数
        options: {
            url: "", //收集数据的URL，必须
            data: {
                "ext_domain": document.domain,
                "ext_path": window.location.pathname
            } //额外需要发送的数据，非必须
        },

        //原始timing数据
        timing: {},

        //用于存储解析后的数据
        data: {},

        //检查是否支持navigation timing api
        check: function () {
            return window.performance && window.performance.timing;
        },

        //程序的处理（包括数据收集、发送动作）
        setup: function () {
            Perf.timing = window.performance.timing;
            Perf.setData(Perf.timing);
            Perf.send(Perf.options.url, Perf.data);
        },

        //设置数据
        setData: function (timing) {
            var data = {
                "t_unload": timing.unloadEnd - timing.unloadStart, //上个文档的卸载时间
                "t_redirect": timing.redirectEnd - timing.redirectStart, //重定向时间
                "t_dns": timing.domainLookupEnd - timing.domainLookupStart, //DNS查询时间
                "t_tcp": timing.connectEnd - timing.connectStart, //tcp连接时间
                "t_request": timing.responseStart - timing.requestStart, //请求时间
                "t_response": timing.responseEnd - timing.responseStart, //文档下载时间
                "t_interactive": timing.domInteractive - timing.domLoading, //用户可操作时间
                "t_dom": timing.domContentLoaded - timing.domLoading, //dom ready时间
                "t_load": timing.loadEventStart - timing.domLoading, //onload时间
                "t_white": timing.responseStart - timing.fetchStart, //白屏时间
                "t_all": timing.loadEventEnd - timing.navigationStart //所有过程的时间之和
            };
            //删除无用数据，避免干扰
            for (var key in data) {
                if (data[key] <= 0) {
                    delete data[key];
                }
            }
            //合并程序外传入的数据
            $.extend(Perf.data, data, Perf.options.data);
        },

        //发送数据到后端
        send: function (url, data) {
            var img = new Image();
            img.src = url + "?" + $.param(data);
        },

        //程序主入口
        start: function (options) {
            //是否支持API
            if (Perf.check()) {
                //合并参数
                $.extend(Perf.options, options);
                //是否已完成页面加载
                if (window.performance.timing.loadEventEnd > 0) {
                    Perf.setup();
                } else {
                    window.addEventListener("load", function () {
                        //不能影响最后的时间计算
                        window.setTimeout(function () {
                            Perf.setup();
                        }, 0);
                    }, false);
                }
            }
        }

    };

    return Perf;
});