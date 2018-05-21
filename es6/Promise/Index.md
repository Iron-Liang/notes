# Promise对象

## 含义

`Promise`对象是一个容器，里面保存着某个未来才会结束的事件的结果。

特点：

1. 对象的状态不受外界影响。`Promise`对象代表一个异步操作，有三种状态：`pending`(进行中)、`fulfilled`(已成功)、`rejected`(已失败)。只有异步操作的结果可以决定当前的状态。

2. 一旦状态改变，就不会再变，任何时候都可以得到这个结果。

缺点：

1. 无法取消

2. 如果不设置回调，内部抛出错误，不会反应到外部

3. 当处于`pending`状态时，无法得知目前进展到哪一个阶段

## 基本用法

创造`Promise`实例

```javascript
const promise = new Promise(function (resolve, reject) {
    if (/* 异步操作成功 */) {
        resolve(value)
    } else {
        reject(error)
    }
})
```

- `resolve` 将`Promise`状态修改为“成功”
- `reject` 将`Promise`状态修改为“失败”

使用`then`方法分别指定`resolved`状态和`rejected`状态的回调

```javascript
promise.then(function (value) {
    // success
}, function (error) {
    // failure
})
```

实现ajax

```javascript
const getJSON = function (url) {
    const promise = new Promise(function (resolve, reject) {
        const handler = function () {
            if (this.readyState !== 4) {
                return
            }
            if (this.status === 200) {
                resolve(this.response)
            } else {
                reject(new Error(this.statusText))
            }
        }
        const client = new XMLHttpRequest()
        client.open("GET", url)
        client.onreadystatechange = handler
        client.responseType = "json"
        client.setRequestHeader("Accept", "application/json")
        client.send()
    })
    return promise
}
```

如果调用`resolve`函数和`rejected`函数时带有参数，那么它们的参数会传递给回调函数。`reject`函数通常是`Error`对象实例，表示抛出错误。`resolve`函数的参数除了正常的值以外，还可能是一个Promise对象。

```javascript
const p1 = new Promis(function (resolve, reject) {
    //...
})

const p2 = new Promise(function (resolve, reject) {
    // ...
    resolve(p1)
})

// 一个异步操作返回另一个异步操作
```

> `p1`的状态决定了`p2`的状态。如果`p1`的状态是`pending`那么`p2`的回调会等待`p1`的状态改变；如果`p1`的状态已经是`resolved`或者`rejected`那么`p2`的回调函数将会立即执行

```javascript
const p1 = new Promise(function (resolve, reject) {
    setTimeout(() => reject(new Error('fail')), 3000)
})

const p2 = new Promise(function (resolve, reject) {
    setTimeout(() => resolve(p1), 1000)
})

p2
    .then(result => console.log(result))
    .catch(error => console.log(error))
// Error: fail
```

由于p2返回的是另一个Promise，导致`p2`自己的状态无效了，由`p1`的状态决定`p2`的状态。所以，后面的`then`语句都变成针对`p1`。1秒后`p2`状态改变，又过了2秒，`p1`变成`rejected`，导致触发`catch`方法指定的回调函数。

## `Promise.prototype.then()`

`then`方法返回一个新的`Promise`实例。因此可以采用链式写法，即`then`方法后面再调用另一个`then`方法。

采用链式的`then`，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个`Promise`对象，这时，后一个回调函数，就会等待该`Promise`对象的状态发生变化，才会被调用。

## `Promise.prototype.catch()`

该方法是`.then(null, rejection)`的别名，用于指定发生错误时的回调函数。

```javascript
getJSON('/posts.json').then(function(posts) {
    //...
}).catch(function (error) {
    console.log('发生错误！', error)
})
```

> `then`方法指定的回调函数，如果运行中抛出错误，也会被`catch`方法捕获。

如果Promise状态已经变成`resolved`，再抛出错误是无效的。

```javascript
const promise = new Promise(function (resolve, reject) {
    resolve('ok')
    throw new Error('test')
})

promise
    .then(function (value) { console.log(value) })
    .catch(function (error) { console.log(error) }) // 不会执行
```

Promise对象的错误具有“冒泡”性质，会一直向后传递，直到被捕获为止。错误总是会被下一个`catch`语句捕获

```javascript
getJSON('/post/1.json').then(post => {
    return getJSON(post.commentURL)
}).then(comments => {
    // some code
}).catch(error => {
    // 处理前面三个Promise产生的错误
})
```

## `Promise.prototype.finally()`

该方法用于指定不管Promise对象最后的状态如何，都会执行的操作。该方法是ES2018引入的标准。

实现

```javascript
Promise.prototype.finally = function (callback) {
    let p = this.constructor
    return this.then(
        value => P.resolve(callback()).then(() => value),
        reson => P.resolve(callback()).then(() => { throw reason })
    )
}
```

垫片

```javascript
// npm install promise.prototype.finally --save
import promiseFinally from 'promise.prototype.finally'
promiseFinally.shim()
```

## `Promise.all()`

将多个Promise实例，包装成一个新的Promise实例。

```javascript
const p = Promise.all([p1, p2, p3])
```

`p`的状态由`p1`,`p2`,`p3`决定，分成两种情况

1. 只有`p1`,`p2`,`p3`的状态都变成`fullfilled`，`p`的状态才变成`fullfilled`，此时`p1`,`p2`,`p3`的返回值组成一个数组，传递给`p`的回到函数

2. 只要`p1`,`p2`,`p3`之中有一个变成`rejected`,`p`的状态就变成`rejected`,此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数。

例子

```javascript
const promises = [2, 3, 5, 7].map(id => {
    return getJSON('/post/' + id + '.json')
})

Promise.all(promise).then(posts => {
    // ...
}).catch(reason => {
    // ...
})
```

> 如果作为参数的Promise实例，自己定义了`catch`方法，那么它一旦被`rejected`并不会触发`Promise.all()`的`catch`方法。

## `Promise.race()`

同样是将多个Promise实例包装成一个新的Promise实例。

只要实例之中有一个实例率先改变状态，`p`的状态就跟着改变。那个率先改变的Promise实例的返回值，就传递给`p`的回调函数。

## `Promise.reslove`

将现有对象转化为Promise对象

等价写法

```javascript
Promise.resolve('foo')
// 等价于
new Promise(resolve => resolve('foo'))
```

参数分为四种情况

1. 参数是一个Promise实例

原封不动的返回这个实例

2. 参数是一个`thenable`对象

`thenable`是指具有`then`方法的对象,`then`的参数是`resolve`和`reject`

`Promise.resolve`会将这个对象转为Promise对象，然后立即执行`thenable`对象的`then`方法

```javascript
let thenable = {
    then (resolve, reject) {
        resolve(42)
    }
}
let p1 = Promise.resolve(thenable)
p1.then(value => console.log(value))
// 42
```

3. 参数不具有`then`方法的对象，或者根本不是对象

如果参数是一个原始值，或者是一个不具备`then`方法的对象，则`Promise.resolve`方法返回一个新的Promise对象，状态为`resolved`

```javascript
const p = Promise.resolve('hello')

p.then(e => console.log(e))
// Hello
```

4. 不带任何参数

直接返回一个`resolved`状态的Promise对象

```javascript
const p = Promise.reslove()
p.then(() => {
    // ...
})
```

`p`就是一个Promise对象

> 立即`resolve`的Promise对象，是在本轮“事件循环”的结束时，而不是在下一轮“事件循环”开始时。

## `Promise.reject()`

返回一个新的Promise实例，该实例的状态为`rejected`

> `Promise.reject()`方法的参数，会原封抱不动地作为`reject`的理由，变成后续方法的参数。

## `Promise.try()`

不知道或者不想区分，函数f是同步函数还是异步操作，但是想用 Promise 来处理它。因为这样就可以不管f是否包含异步操作，都用then方法指定下一步流程，用catch方法处理f抛出的错误。