# performance-timing

利用HTML5中的[navigation timing API](http://www.w3.org/TR/navigation-timing/)进行前端性能数据采集

### 浏览器兼容性

请参考：[http://caniuse.com/#feat=nav-timing](http://caniuse.com/#feat=nav-timing)

### 依赖

目前依赖[jQuery](http://jquery.com/)，如果不希望依赖jQuery可以自己去实现函数`$.param`和`$.extend`

### 优势

* 浏览器原生支持，准确性高
* 能够获取到更多的数据，例如DNS解析时间、重定向时间等
* 支持页面首次渲染时间的采集
* 代码量少（百行左右）
* 可定制化程度高
* 支持抽样
* 支持在网页加载完成后进行数据采集和发送，减少页面的性能损耗

### 使用示例

```js
    //支持 AMD 和 CMD，下面代码使用的是全局变量的方式
    Performance.start({
        url: "http://www.xxx.com/a.gif", //后端收集数据的URL，必填
        rate: 0.2, //抽样比例，默认是10%抽样
        data: { //额外需要记录的数据，非必填
            ext_domain: "www.xxx.com", //域名，默认是document.domain
            ext_path: "_wap_index" //页面，默认是encodeURIComponent(location.pathname.toLowerCase().replace(/\//g, "_"));
        }
    });
```

### 采集的数据说明

默认情况下脚本将会采集以下数据（详细计算公式可参看采集脚本）：

|参数            |类型            |描述   |
|:-------------:|:-------------:|:-----:|
|`ext_domain`   |string         |域名    |
|`ext_path`|string|页面|
|`t_unload`|number|上个文档的卸载时间|
|`t_redirect`|number|页面重定向的时间|
|`t_dns`|number|DNS解析时间|
|`t_tcp`|number|服务器连接时间|
|`t_request`|number|服务器响应时间|
|`t_response`|number|网页文档下载时间|
|`t_paint`|number|首次渲染时间|
|`t_dom`|number|DOM Ready时间（阶段）|
|`t_domready`|number|DOM Ready时间（总和）|
|`t_load`|number|onload时间（阶段）|
|`t_onload`|number|onload时间（总和）|
|`t_white`|number|白屏时间|
|`t_all`|number|全部过程时间|


### 注意事项

* 后端利用数据进行统计时，需要排除值为0的项，避免某些不准确的数据或者未采集到的数据对性能指标产生影响
* 用户IP以及浏览器识别的数据可以放到后端进行采集
