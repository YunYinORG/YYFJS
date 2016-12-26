# YYFJS

YYF前端请求和数据接口JS库。

The frontend JavaScript library for YYF RESTful API request.

[![Build Status](https://travis-ci.org/YunYinORG/YYFJS.svg?branch=master)](https://travis-ci.org/YunYinORG/YYFJS)
[![npm](https://img.shields.io/npm/v/yyfjs.svg)](https://www.npmjs.com/package/yyfjs)


1. [安装和使用](#1-install)
2. [接口API](#2-interface)
3. [配置](#3-configure)
4. [Vue插件](#4-vue)
5. [流程图](#5-flowchart)

## 1. Install
**安装**

### with npm(使用npm安装)

1. install npm package : `npm i yyfjs -S` 
2. Minimal usage:

```js
var YYF=require('yyfjs');
YYF.get('Index/test').success(console.log);
```

### in Browser(浏览器中直接使用)

可以在[unpkg上](unpkg..com/yyfjs)下载最新版代码

Just include the lib,exemple:
```html
<html>
<head>
  <script src="http://unpkg..com/yyfjs"></script>
</head>
<body>
  <script>
  YYF.get('Index/test').success(console.log);
  </script>
</body>
</html>
```

## 2. Interface 
**方法接口和API**

### 2.1 Examples

* 快速定义
```js
YYF('https;//yyf.yunyin.org/index.php/');
YYF.success(function(data) {
    alert('success:' + data);
}).fail(function(data) {
    alert('fail:' + data);
}).get('Index/test');
```
* 也可以把回调置后
```js
YYF.post('Resource/id', data)
.ready(function(response) {
    //do somthing
    return true;
}).success(function(data) {
    //do somthing when success
}).fail(function(data) {
    //do somthing when fail
});
```

### 2.2 请求操作 (REST method)

所有请求接口 返回均为`当前yyf`对象可以继续操作

* `get(uri, data, async)`: GET操作
* `post(uri, data, async)`: POST操作
* `put(uri, data, async)`: PUT操作
* `patch(uri, data, async)`: PATCH操作
* `delete(uri,async)`: DELETE操作
* `request(method, url, data, async)`: 自定义请求

参数表

| 参数   |  类型            |      默认    | 参数说明 |
| :-----|:---------------- | :----------:| :----- |
|`uri`  | `string`         | 无(必须)     | 请求资源，自动补上[全局配置options](#32-options)的`root`|
|`data` |`Object`或`string`| `undefined` | 发送数据,**delete**无此参数|
|`async`| `bool`           | 读取全局配置  | 是否异步请求|


### 2.3 回调接口 (callback handler)

所有回调接口 返回均为 `当前yyf`对象可以继续操作

- invoke回调 (根据条件执行)
    * `success`设置操作成功的回调方法
    * `fail`设置操作失败的回调方法
    * `auth`设置需要回调的回调方法
    * 自定义回调 `setHandle(key,callback)`
- 通用处理 (正常完成一定执行)
    * `ready`设置拦截返回内容的回调方法(在success和fail等invoke之前)
    * `final`处理完成方法(在success和fail等invoke之后)

参数细节参照[全局回调函数表handle](#33-handle)

## 3. Configure

**配置**

### 3.1 global Configure

* 快速设置API请求站点相对更地址 `YYF(root)`
```js
/*简单配置*/
//如请求API是index.php ，如果不配置root为"/"
YYF('/index.php/');
//跨站需要带上URL
YYF('https://yyf.yunyin.org/');
```
* 多参数设置`YYF(options,handle,codeMap)`
```js
//基本配置
var options = { //options 参数
    root: 'api.php',
    type: 'json'
};
//回调函数
var handlers = { //默认回调
    auth: function(data) { //验证失败回调,默认对应status为-1代表验证失败
        alert("验证失败,请登录!" + data);
    },
    onerror: function(data) { //网络错误或者解析失败
        console.log('网络错误:', data);
    }
};
//options和handler,后面参数可省略
YYF(options, handlers);
```
* 单参数全部设置`YYF({})`
```js
//all in one,
YYF({
    options: options,
    handle: handlers
});
```

### 3.2 options 

**全局默认配置**，每次请求可能都有同样的设置，可以提前统一配置。

| 键(key) | 类型(type)|     说明         | 默认(value)| 备注 |
| :------ |:--------:| :---------------| :----------:|：------|
| `root`  | `string` | 请求API地址前缀   | `""`       | 通常为站点根目录,同站请求无需域名 |
|`headers`| `Object` | 附加http头(键值对) | `{}`        | 所有的请求中，添加此请求头|
| `cookie`|  `bool`  |(跨域)是否带cookie | `false`      | 仅对跨域设置有效 |
| `async` |  `bool`  |  异步或者同步请求  | `true`       | `false`时可阻塞js,根据需要设置 |
| `status`| `string` | 返回的`状态`标识字段| `"status"`  | 与服务器上rest.status配置保持一致 |
| `data`  | `string` | 返回的`数据`标识字段| `"data"`    | 与服务器上rest.data配置保持一致 |
| `type`  | `string` | 发送请求编码格式   |`"urlencoded"`| <li>默认对跨域优化</li><li>`json`以json格式提交;</li><li>`form`以表单提交;</li><li>其他为自定义`Content-type`</li> |


### 3.3 handle

**全局默认回调函数**

每次请求可以单独设置这些回调操作，**如果没有设置对应处理方式**,会使用下面的默认回调方式。

例如，通常,认证失败和网络错误预设一个统一的回调方式来提示用户

| 键(key) |     说明        | 回调参数表 |  默认值(value) | 触发条件和说明 |
| :------ |:---------------| :-------:|:-------------:|:------|
|`onerror`| 请求失败或解析出错| 请求对象|`console.error`| 网络，服务器错误或解析出错 |
| `before`| 请求预处理   |`data`,`headers`,<br/>`url`,`method`,`XHR`|`undefined`|发送请求前调用,可拦截request和修改发送数据|
| `ready` | 回调拦截,返回false终止分发|`response`,`res`|`undefined`| 收到返回数据首先执行此操作|
| `final` | 所有处理结束后,最后执行|`response`,`res`|`undefined`| 返回正常处理最后触发此操作 |
| `auth`  | 认证失败默认回调  | `data`,`res` | `undefined`| 返回`status`状态为`-1`(可设置) |
|`success`| 操作成功默认回调  | `data`,`res` | `function(){}`| 返回`status`状态为`1`(可设置) |
| `fail`  | 操作失败默认回调  | `data`,`res` | `function(){}`| 返回`status`状态为`0`(可设置) |
|其他| 自定义调用(invoke) | `data`,`res` | 用户定义函数| 需自定义状态码，见[code配置](#34-code) |

说明:

* `before` **仅可全局配置**,不能为某个请求单独设置(此接口通常用来在所有请求中添加统一的校验和,或者验证hash)
* `before` 可以通过返回值修改数据,如果不存在返回值(不是`undefined`)则直接复制给请求的数据data
* 当返回的response为可解析的json时, `ready`和`final`的第一个参数，传入值为解析后的对象；
* 当返回的response为不是json时，`ready`和`final`的第一个参数，传入值为字符串；且不会进入invoke；
* invoke 传入的第一个参数,传入值为解析后的数据字段(data)部分.
* 如果设置了`ready`,且函数执行返回`false`(完全`===`**false**),可跳过 invoke直接进入`final` [详细流程](#5-flowchart)

### 3.4 code

**状态码表**

解析请求结果时，会根据status字段(可以设置`options`中`status`字段来修改)不同的值代表不同状态,可以根据需要自定义或者覆盖这些状态码的默认设置

|`status` | value   |      说明    | 操作解释 |
| :------ |:-------:| :----------:| :--- |
|`success`| `1`     | 操作成功状态码 | 返回中的status为1，触发success回调|
| `fail`  | `0`     | 操作失败状态码 | 返回中的status为0，触发fail回调|
| `auth`  | `-1`    | 认证失败状态码 | 返回中的status为-1，触发auth回调|
|其他string| 自定义值 |  自定状态码  | status为自定义值，调用对应的回调方式|

同时提供了`setCode(code, status)`接口来快速设置状态。列如

```js
YYF.setCode(2,'special');
//等效配置
YYF({
  code:{special:2}
});
```

## 4. Vue

YYFJS 支持[Vue](https://vuejs.org/)插件

### 4.1 浏览器中直接使用

引入js库后会自动注册Vue插件

### 4.2 npm 安装

```js
var Vue = require('Vue');
var YYF = require('yyfjs');
Vue.use(YYF,{/*配置*/});
//或者 YYF(options,callback,code);//配置
```

### 4.3 模块内使用

模块内部 使用 `this.$yyf`即可，相当于调用YYF

exemple
```js
var app = new Vue({
  el: '#app',
  mounted(){
      this.$yyf.get('/');
  }
})
```

## 5. Flowchart

基本流程: `before()`==> [send request] => `ready()` ==> `[INVOKE?]()` ==> `final()`

收到响应(response)后的处理流程：

1. before: 发送http请求之前调用，如果有全局before,则调用before,如果有返回值，用来设置data数据
2. 发送http请求，等待响应
3. ready: 如果存在`ready`则先执行ready,返回值为`false`时直接进入第5步(final)，否则进入第4步(invoke)
4. invoke: 根据status状态调用对应处理函数，如未定义调用默认配置,如果都未定义直接到第5步(final)
5. final：如果存在`final`回调函数，则执行此函数，否则结束
6. 结束

流程图如下

>
```
      +~~~~~~~+         +==========+
      | START +-------> | before() |
      +~~~~~~~+         +==========+
                             |
                             v
      +----------------------+----+
      | RESPONSE  <-----  REQUEST |
      +-----------------+---------+
        OK |            | error      +===========+
           |            +----------> | onerror() |
           V                         +===========+
    +-------------+
    |             |       +=========+
    | has "ready" |       |         |
    |  handler ?  +------>| ready() |
    |             | YES   |         |
    +------+------+       +=========+
        NO |                   |
           |                   |
           v                   |
    +============+         +---v----+
    |  [INVOKE]  |         |        |
    | -success() |         | return |
    | -fail()    | <-------+ FALSE? |
    | -auth()    |      NO |        |
    |  ...       |         +---+----+
    +============+             | YES
           |                   | 
           v                   |(skip)
    +------+------+            |
    |             | <----------+
    | has "final" |
    |  handler ?  |        +=========+
    |             +------->|         |
    +------+------+ YES    | final() |
        NO |               |         |
           |               +=========+
           v                   |
      +~~~~+~~~~+              |
      |  DONE   | <------------+
      +~~~~~~~~~+
```
>
