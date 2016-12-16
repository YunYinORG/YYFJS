# YYFJS
YYF前端请求和数据接口JS库, the frontend JavaScript lib for YYF RESTful API request



## Install

### with npm

1. install npm package : `npm i yyfjs -S` 
2. Minimal usage:

```js
var YYF=require('yyfjs');
YYF.get('Index/test').success(console.log);
```

### in Browser: 

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

## Configure

global Configure
```js
YYF(options,handle,codeMap);
//or all in one,
YYF({
    handle:{},
    code:{}
});
```

### options ()

### handle (callback)

### code 
