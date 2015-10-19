# performance-timing

利用HTML5中的navigation timing API进行前端性能数据采集

使用示例：

    Performance.start({
        url: "http://www.xxx.com/a.gif", //后端收集数据的URL
        data: {
            //额外需要记录的数据
        }
    });