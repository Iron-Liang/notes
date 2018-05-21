# 简介

`XMLHttpRequest`是一个API，它为客户端提供了在客户端和服务器之间传输数据的功能。

## 构造函数

通过构造函数，实例化xhr对象

```javascript
const xhr = new XMLHttpRequest()
```

## 属性

继承`XMLHttpRequestEventTarget`和`EventTarget`的属性

- `onreadystatechange`

    一个javascript函数对象，当readyState属性改变时，会调用它。回调函数会在user interface线程中调用

- `readyState`

    请求的五种状态

    - `0` UNSENT（未打开） `open()`方法还未被调用
    - `1` OPENDED（未发送） `open()`方法已被调用
    - `2` HEADERS_RECEIVED（已获取响应头） `send()`方法已被调用，响应头和响应状态已被返回
    - `3` LOADING（已在下载响应体） 响应体下载中；`reponseText`已经获取了部分数据
    - `4` DONE（请求完成）整个请求过程已经完毕

- `response`

    响应实体的类型由`responseType`来指定，可以是`ArrayBuffer`, `Blob`, `Document`,JavaScript对象（即“json”）或者是字符串。如果请求未完成或者失败，则该值为`null`

- `responseText`

    此次请求的响应为文本，或是当请求未成功或还未发送时为`null`。**只读**。

- `responseType`

    改变响应类型，告诉服务器期望的响应格式。

    - `''`（空字符串） 字符串（默认）
    - `arraybuffer` `ArrayBuffer`
    - `blob` `Blob`
    - `document` `Document`
    - `json` Javascript对象，解析自服务器传递回来的JSON字符串
    - `text` 字符串

- `respnseXML`

    本次请求的响应是一个`Document`对象，如果是以下情况则值为`null`:请求未成功，请求未发送，或响应无法被解析成XML或HTML。**只读**

> 如果服务器不支持`text/xml`Content-Type头, 你可以使用`overrideMimeType()`强制`XMLHttpRequest`将响应解析为XML

- `status`

    请求响应状态码**只读**

- `statusText`

    请求的响应状态码信息，包含一个状态码和原因短语

- `upload`

    可以在`upload`上添加一个事件监听来跟踪上传过程

- `withCredentials`

    表明在进行跨域（cross-site）的访问控制（Access-Control）请求时，是否使用认证信息（例如cookie或授权的header）。默认为`false`。

## 方法

- `abort()`

    如果请求已发送，则立即中止请求。

- `getAllResponseHeaders()`

    返回所有响应头信息，如果响应头还没有接受，则返回`null`

- `getResponseHeader()`

    返回指定响应头的值，如果响应头还没被接受，或该响应头不存在，返回`null`

- `open()`

    初始化一个请求

    参数：

    - `method` 请求所使用的HTTP方法
    - `url` 请求访问的url
    - `async` 是否执行异步操作，默认为true
    - `user` 用户名，可选参数，默认为空字符串
    - `password` 密码， 可选参数，默认为空字符串

- `overrideMimeType()`

    重写服务器返回的MIME type。可用于强制把一个响应流当做“text/xml”来处理和解析，这个方法必须在send()之前调用。

- `send()`

    发送请求，如果该请求是异步模式，该方法会立刻返回。

> 所有相关事件绑定必须在调用send()方法之前进行

- `setRequestHeader()`

    给指定的HTTP请求头赋值，在这之前必须已经调用了`open()`方法打开一个URL

    参数：
    
    - `header` 将要被赋值的请求头名称
    - `value` 指定的请求头赋的值

## 实例

发起一个请求

```javascript
var xhr = new XMLHttpRequest()

xhr.open('GET', 'example.php')

xhr.onreadystatechange = function () {
    if (xhr.readyStatus === 4 && xhr.status === 200) {
        alert( xhr.responseText )
    } else {
        alert( xhr.statusText )
    }
}

xhr.send()
```

## XMLHttpRequest Level 2

### 新版版本功能

- 可以设置请求的时限
- 可以使用FormData对象管理表单数据
- 可以上传文件
- 可以请求不同域名下的数据（跨域请求）
- 可以获取服务器端的二进制数据
- 可以获得数据传输的进度信息

#### HTTP请求时限

`timeout`属性可以设置HTTP请求的时限

```javascript
xhr.timeout = 3000
```

配套`timeout`事件，用来指定回调函数

```javascript
xhr.ontimeout = function (event) {
    alert('请求超时！')
}
```

#### FormData对象

H5新增一个FormData对象，可以模拟表单

```javascript
var formData = new FormData()
formData.append('username', '张三')
formData.append('id', 123456)
xhr.send(formData)
```

FormData对象可以用来获取网页表单的值

```javascript
var form = document.getElementById('myform')
var formData = new FormData(form)
formData.append('secret', '123456')
xhr.open('POST', form.action)
xhr.send(formData)
```

#### 上传文件

假定files是一个“选择文件”的表单元素（input[type="file"]）

```javascript
var formData = new FormData()
for (var i = 0; i < files.length; i++) {
    formData.append('files[]', files[i])
}
xhr.send(formData)
```

#### 跨域资源共享（CORS）

只要浏览器和服务端支持，就可以像发起同域请求一样发起跨域请求。

> IE8和IE9不支持

#### 接收二进制数据

**方法一（改写MIMEType）**

新版XMLHttpRequest对象可以取回二进制数据

将服务器返回的二进制数据伪装成文本数据，并且告诉浏览器这是用户自定义的字符集

```javascript
xhr.overrideMimeType("text/plain; charset=x-user-defined")
```

用`reponseText`接收服务器返回的二进制数据

```javascript
var binStr = xhr.responseText
```

将文本数据还原为二进制数据

```javascript
for (var i = 0, len = binStr.length; i < len; i++ ) {
    var c = binStr.charCodeAt(i)
    var byte = c & 0xff // 每个字符的两个字节之中，只保留后一个字节，将前一个字节扔掉。
}
```

**方法二（responseType属性）**

将responseType设为blob，表示服务器传回的是二进制对象。

```javascript
var xhr = new XMLHttpRequest()
xhr.open('GET', '/path/to/image.png')
xhr.responseType = 'blob'
```

用浏览器自带的Blob对象接收数据

```javascript
var blob = new Blob([xhr.response], { type: 'image/png' })
```

#### 进度信息

`progress`事件来反回进度信息

分为上传和下载。下载的`progress`事件属于XMLHttpRequest，上传的`progress`事件属于XMLHttpRequest.upload对象。

定义事件回调

```javascript
xhr.onprogress = updateProgress
xhr.upload.onprogress = updateProgress
```

使用事件对象的属性

```javascript
function updateProgress(event) {
    if (event.lengthComputable) {
        var percentComplete = event.loaded / event.total
    }
}

// 如果event.lengthComputable不为真，则event.total等于0
```

其他五个事件：

- `load`事件：传输完成
- `abort`事件：传输被用户取消
- `error`事件：传输中出现错误
- `loadstart`事件：传输开始
- `loadEnd`事件：传输结束，但不知道成功还是失败