# YYFJS
YYF前端请求和数据接口JS库, the frontend JavaScript lib for YYF RESTful API request

## usage
```javaScript
YYF.success(function(info){
    //dosomthing when success
    console.log('请求成功:',info);
}).fail(function(info){
    //dosomthing when fail 
    console.error('请求失败',info);
}).post('Something',{dataKey:'dataValue'});
```