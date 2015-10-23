/*
 * performance-timing.js 0.2
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
    var _P = {

        //程序配置参数
        options: {
            url: "", //后端收集数据的URL（必须）
            rate: 0.1, //抽样比例（必须，默认为10%抽中）
            data: { //额外需要发送的数据（非必须）
                "ext_domain": encodeURIComponent(document.domain),
                "ext_path": encodeURIComponent(window.location.pathname.toLowerCase().replace(/\//g, "_"))
            }
        },

        //原始timing数据
        timing: {},

        //用于存储解析后的数据
        data: {},

        //检查是否支持navigation timing api，并且包含在抽样中
        check: function () {
            return window.performance && window.performance.timing && Math.random() < _P.options.rate;
        },

        //程序的处理（包括数据收集、发送动作）
        setup: function () {
            _P.timing = window.performance.timing;
            //数据正常时才发送
            if (_P.setData(_P.timing)) {
                _P.send(_P.options.url, _P.data);
            }
        },

        //设置需要发送给后端的数据
        setData: function (timing) {
            var startTime = timing.navigationStart || timing.fetchStart;
            var data = {
                "t_unload": timing.unloadEventEnd - timing.unloadEventStart, //上个文档的卸载时间
                "t_redirect": timing.redirectEnd - timing.redirectStart, //*重定向时间
                "t_dns": timing.domainLookupEnd - timing.domainLookupStart, //*DNS查询时间
                "t_tcp": timing.connectEnd - timing.connectStart, //*服务器连接时间
                "t_request": timing.responseStart - timing.requestStart, //*服务器响应时间
                "t_response": timing.responseEnd - timing.responseStart, //*网页下载时间
                "t_paint": _P.getFirstPaintTime() - startTime, //*首次渲染时间
                "t_dom": timing.domContentLoadedEventStart - timing.domLoading, //dom ready时间（阶段）
                "t_domready": timing.domContentLoadedEventStart - startTime, //*dom ready时间（总和）
                "t_load": timing.loadEventStart - timing.domLoading, //onload时间（阶段）
                "t_onload": timing.loadEventStart - startTime, //*onload时间（总和）
                "t_white": timing.responseStart - startTime, //*白屏时间
                "t_all": timing.loadEventEnd - startTime //整个过程的时间之和
            };
            for (var key in data) {
                //删除无用数据，避免干扰(小于等于0或大于两分钟)
                if (data[key] <= 0 || data[key] >= 120000) {
                    delete data[key];
                }
            }
            //合并程序外传入的数据
            $.extend(true, _P.data, data, _P.options.data);
            return startTime > 0;
        },

        //获取首次渲染时间
        getFirstPaintTime: function () {
            var firstPaintTime = 0;
            if (window.chrome && typeof window.chrome.loadTimes === "function") { //Chrome
                firstPaintTime = window.chrome.loadTimes().firstPaintTime * 1000;
            } else if (typeof _P.timing.msFirstPaint === "number") { //IE
                firstPaintTime = _P.timing.msFirstPaint;
            }
            return Math.round(firstPaintTime);
        },

        //发送数据到后端
        send: function (url, data) {
            var img = new Image();
            img.src = url + "?" + $.param(data);
        },

        //程序主入口
        start: function (options) {
            //合并参数
            $.extend(true, _P.options, options);
            //支持API并且被抽样抽中
            if (_P.check()) {
                //是否已经形成数据（页面加载完成之后）
                if (window.performance.timing.loadEventEnd > 0) {
                    _P.setup();
                } else {
                    $(window).on("load", function () {
                        //不能影响最后的时间计算
                        window.setTimeout(function () {
                            _P.setup();
                        }, 0);
                    });
                }
            }
        }

    };

    return _P;
});