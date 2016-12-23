# YYFJS
YYF前端请求和数据接口JS库.
The frontend JavaScript library for YYF RESTful API request

## 1. Install(安装)

### with npm(使用npm安装)

1. install npm package : `npm i yyfjs -S` 
2. Minimal usage:

```js
var YYF=require('yyfjs');
YYF.get('Index/test').success(console.log);
```

### in Browser(浏览器中直接使用)

include the lib,exemple:
```html
<html>
<head>
  <script src="lib/yyf.js"></script>
</head>
<body>
  <script>
  YYF.get('Index/test').success(console.log);
  </script>
</body>
</html>
```

## 2. Interface (方法接口)

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
.complete(function(response) {
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

* GET操作:`get(uri, data, async)`
* POST操作:`post(uri, data, async)`
* PUT操作:`put(uri, data, async)`
* PATCH操作：`patch(uri, data, async)`
* DELETE操作:`delete(uri,async)`

参数表

| 参数   |  类型            |      默认    | 参数说明 |
| :-----|:---------------- | :----------:| :----- |
|`uri`  | `string`         | 无(必须)     | 请求资源，自动加上前缀[全局配置](#32-options-基本默认配置)的`root`|
|`data` |`Object`或`string`| `undefined` | 发送数据,**delete**无此参数|
|`async`| `bool`           | 读取全局配置  | 是否异步请求|


### 2.3 回调接口 (callback handler)

所有回调接口 返回均为 `当前yyf`对象可以继续操作

* `success`设置操作成功的回调方法
* `fail`设置操作失败的回调方法
* `auth`设置需要回调的回调方法
* `complete`设置拦截返回内容的回调方法(在success和fail等之前)
* 自定义回调 `setHandle(key,callback)`

参数细节参照[回调函数表](#33-handle-默认回调函数)

## 3. Configure(配置)

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
var handler = { //默认回调
    auth: function(data) { //验证失败回调,默认对应status为-1代表验证失败
        alert("验证失败,请登录!" + data);
    },
    onerror: function(data) { //网络错误或者解析失败
        console.log('网络错误:', data);
    }
};
//options和handler,后面参数可省略
YYF(options, handler);
```
* 单参数全部设置`YYF({})`
```js
//all in one,
YYF({
    options: options,
    handle: handler
});
```

### 3.2 options (基本默认配置)

每次请求可能都有统样的设置，可以提前统一配置。

| 键(key) | 类型(type)|     说明         | 默认(value)| 备注 |
| :------ |:--------:| :---------------:| :----------:|------|
| `root`  | `string` | 请求API地址前缀    | `"/"`       |完整url或相对根目录,同站请求无需域名 |
|`headers`| `Object` | 附加http头(键值对) | `{}`        | 此请求头在所有的请求中均会加上|
| `cookie`|  `bool`  |(跨域)是否带cookie | `false`      | 仅对跨域设置有效 |
| `async` |  `bool`  |  异步或者同步请求  | `true`       | `false`时可阻塞js,根据需要设置 |
| `status`| `string` | 返回的`状态`标识字段| `"status"`  | 与服务器上rest.status配置保持一致 |
| `data`  | `string` | 返回的`数据`标识字段| `"data"`    | 与服务器上rest.data配置保持一致 |
| `type`  | `string` | 发送请求编码格式   |`"urlencoded"`| <li>默认对跨域优化</li><li>`json`以json格式提交;</li><li>`form`以表单提交;</li><li>其他为自定义`Content-type`</li> |


### 3.3 handle (默认回调函数)

每次请求可以单独设置这些回调操作，**如果没有设置对应处理方式**,会使用下面的默认回调方式。

通常,认证失败和网络错误预设一个统一的回调方式来提示用户

| 键(key) |     说明        | 回调参数|  默认值(value) | 触发条件 |
| :------ |:---------------| :-----:|:-------------:|------|
|`onerror`| 请求失败或解析出错| 请求对象|`console.error`| 网络，服务器错误或解析出错 |
|`complete`| 回调拦截,返回true执行后续|`response`,`res`|`undefined`| 当返回类true的值才执行下面的操作 |
| `auth`  | 认证失败默认回调  | `data`,`res` | `function(){}`| 返回`status`状态为`-1`(可设置) |
|`success`| 操作成功默认回调  | `data`,`res` | `function(){}`| 返回`status`状态为`1`(可设置) |
| `fail`  | 操作失败默认回调  | `data`,`res` | `function(){}`| 返回`status`状态为`0`(可设置) |
|其他string| 自定义回调       | `data`,`res` | 需要用户定义函数| 需要自定义返回状态码，见code配置 |


### 3.4 code (状态码表)

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

## 4. Vue插件

YYFJS 支持Vue插件

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
