# async函数

## 含义

ES2017标准引入了async函数，使得异步操作变得更加方便。

async函数是Generator函数的语法糖

```javascript
var fs = require('fs')

const readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (error, data) {
            if (error) reject(error)
            resolve(data)
        })
    })
}

const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
}
```

写成async函数

```javascript
const aysncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
}
```

`async`函数对Generator函数的改进，体现在以下四点

1. 内置执行器

Generator函数的执行，必须要有执行器，所以才有了`co`模块，而`async`函数，自带执行器。也就是说，`async`函数的执行，与普通函数一模一样

```javascript
asyncReadFile()
```

2. 更好得语义

3. 更广的适用性

`co`模块约定，`yield`后面只能是Thunk函数或Promise对象，而`async`函数的`await`命令后面，可以是Promise对象和原始类型的值

4. 返回值是Promise

进一步说，`async`函数，完全可以额看作多个异步操作，包装成一个Promise对象，而`await`命令就是内部`then`命令的语法糖

## 基本用法

```javascript
async function getStockPriceByName (name) {
    const symbol = await getStockSymbol(name)
    const stockPrice = await getStockPrice(symbol)
    return stockPrice
}

getStockPriceByName('goog').then(function (result) {
    console.log(result)
})
```

`async`函数返回的是Promise对象，可以作为`await`命令的参数。

```javascript
async function timeout (ms) {
    await new Promise(resolve => setTimeout(resolve, ms))
}

async function asyncPrint (value, ms) {
    await timeout(ms)
    console.log(value)
}

asyncPrint('helloworld', 50)
```

## 语法

`async`函数的语法规则总体上比较简单，难点是错误处理机制

**返回Promise对象**

`async`函数返回一个Promise对象

`async`函数内部不`return`语句返回的值，会成为`then`方法回调函数的参数

```javascript
async function f() {
    return 'hello world'
}
f().then(v => console.log(v))
```

`aysnc`内部抛出错误，会导致返回的Promise对象变为`reject`状态。抛出的错误对象会被`catch`方法回调函数接收到

```javascript
async function f () {
    throw new Error('出错了')
}

f().then(
    v => console.log(v),
    e => console.log(e)
)
```

**Promise对象的状态变化**

`async`函数返回的Promise对象，必须等到内部所有`await`命令后面的Promise对象执行完，才会发生状态改变，除非遇到`return`语句或者抛出错误。只有`async`函数内部的异步操作执行完，才会执行`then`方法指定的回调函数。

```javascript
async function getTitle (url) {
    let response = await fetch(url)
    let html = await response.text()
    return html.match(/<title>([\s\S]+)<\/title>/i)[1]
}
getTitle('https://tc39.github.io/ecma262').then(console.log)
```

**await命令**

正常情况下，`await`命令后面是一个Promise对象。如果不是，会被转成一个立即`resolve`的Promise对象。

```javascript
async function f () {
    return await 123
}

f().then(v => console.log(v))
// 123
```

`awati`命令后面的Promise对象如果变为`reject`状态，则`reject`的参数会被`catch`方法的回调函数接收到。

只要一个`await`语句后面的Promise变成`reject`那么整个`async`函数都会中断执行。

有时候，我们希望即使前一个异步操作失败，也不要中断后面的异步操作。这时可以将第一个`await`放在`try...catch`结构里面，这样，不管这个异步操作是否成功，第二个`await`都会执行

```javascript
async function f () {
    try {
        await Promise.reject('出错了')
    } catch (e) {}
    return await Promise.resolve('hello world')
}
```

**错误处理**

如果`await`后面的异步操作出错，那么等同于`async`函数返回的Promise对象被`reject`。

```javascript
async function f () {
    await new Promise(function (resolve, reject) {
        throw new Error('出错了')
    })
}

f().then(v => console.log(v))
    .then(e => console.log(e))
// Error: 出错了
```

利用`try...catch`防止出错

多个`await`命令，可以统一放在`try...catch`结构中。

```javascript
async function main () {
    try {
        const v1 = await firstStep()
        const v2 = await secoundStep(val1)
        const v3 = await thirdStep(val1, val2)
        console.log('Final:', val3)
    }
    catch (err) {
        console.error(err)
    }
}
```

**使用注意点**

1. `await`命令后面的`Promise`对象，运行结果可能是`rejected`，所以最好把`await`命令放在`try...catch`代码块中

2. 多个`await`命令后面的异步操作，如果不存在继发关系，最好让它们同时触发。

```javascript
let foo = await getFoo()
let bar = await getBar()
```

这样比较耗时，因为只有`getFoo`完成后，才会执行`getBar`完全可以让它们同时触发

```javascript
// 写法一
let [foo, bar] = await Promise.all([getFoo(), getBar()])

// 写法二
let fooPromise = getFoo()
let barPromise = getBar()
let foo = await fooPromise
let bar = await barPromise
```

3. `await`命令只能用在`async`函数中，如果用在普通函数，就会报错

```javascript
async function dbFunc (db) {
    let docs = [{}, {}, {}]

    // 报错
    docs.forEach(function (doc) {
        await db.post(doc)
    })
}
```

如果将`forEach`方法的参数改成`async`函数，也有问题。

```javascript
function dbFuc (db) {
    let docs = [{}, {}, {}]

    // 可能得到错误的结果
    docs.forEach(async function (doc) {
        await db.post(doc)
    })
}
```

可能不会正常工作，因为`db.post`操作将是并发执行。正确的写法是采用`for`循环

```javascript
async function dbFunc (db) {
    let docs = [{}, {}, {}]

    for (let doc of docs) {
        await db.post(doc)
    }
}
```

如果确实希望多个请求并发执行，可以使用`Promise.all`方法。

```javascript
async function dbFunc (db) {
    let docs = [{}, {}, {}]
    let promise = docs.map(doc => db.post(doc))

    let results = await Promise.all(promises)
    console.log(results)
}
```

`@std/esm`模块加载器支持顶层`await`，即`await`命令可以不放在async函数里面，直接使用

```javascript
// async函数的写法
const start = async () => {
    const res = await fetch('google.com')
    return res.text()
}

start().then(console.log)

// 顶层await的写法
const res = await fetch('google.con')
console.log(await res.text())
```

## async函数的原理

async函数的实现原理，就是将Generator函数和自动执行器，包装在一个函数里面

```javascript
async function fn (args) {
    // ...
}
// 等同于

function fn (args) {
    return spawn(function* () {
        // ...
    })
}
```

`spawn`函数就是自动执行器

`spawn`函数的实现

```javascript
function spawn (genF) {
    return new Promise(function (resolve, reject) {
        const gen = genF()
        function step (nextF) {
            let next
            try {
                next = nextF
            } catch (e) {
                return reject(e)
            }
            if (next.done) {
                return resolve(next.value)
            }
            Promise.resolve(next.value).then(function (v) {
                step(function () { return gen.next(v) })
            }, function (e) {
                step(function () { return gen.throw(e) })
            })
        }
        step(function () { return gen.next(undefined) })
    })
}
```

## 与其他异步处理方法的比较

例子：假定某个DOM元素上面，部署了一系列动画，前一个动画结束，才能开始后一个。如果当中有一个动画出错，就不再往下执行，返回上一个成功执行的动画的返回值。

```javascript
// Promsie写法
function chainAnimationsPromise(elem, animations) {
    // 变量ret用来保存上一个动画的返回值
    let ret = null
    // 新建一个新的Promise
    let p = Promise.resolve()
    // 使用then方法，添加所有动画
    for (let anim of animations) {
        p = p.then(function (val) {
            ret = val
            return anim(elem)
        })
    }

    // 返回一个部署了错误捕捉机制的Promise
    return p.catch(function (e) {
        /* 忽略错误，继续执行 */
    }).then(function () {
        return ret
    })
}
```

缺点：大量Promise api，无操作语义

Generator函数的写法

```javascript
function chainAnimationsGenerator(elem, animations) {
    return spawn(function* () {
        let ret = null
        try {
            for (let anim of animations) {
                ret = yeild anim(elem)
            }
        } cathc (e) {
            /* 忽略错误，继续执行 */
        }
        return ret
    })
}
```

缺点：需要自动执行器，必须保证`yield`后面的表达式，必须返回一个Promise

async函数的写法

```javascript
async function chainAnimationsAsync (elem, animations) {
    let ret = null
    try {
        for (let anim of animations) {
            ret = await anim(elem)
        }
    } catch (e) {
        /* 忽略错误，继续执行 */
    }
    return ret
}
```

## 实例：按顺序完成异步操作

一次读取一组URL，然后按照读取的顺序，输出结果。

```javascript
function logInOrder (urls) {
    const textPromises = urls.map(url => {
        return fetch(url).then(response => response.text())
    })

    // 按次序输出
    textPromises.reduce((chain, textPromise) => {
        return chain.then(() => textPromise)
            .then(text => console.log(text))
    }, Promise.resolve())
}
```

async函数的实现

```javascript
async function logInOrder (urls) {
    for (const url of urls) {
        const response = await fetch(url)
        console.log(await response.text())
    }
}
```

缺点：继发远程请求，只有一个URL返回结果，才会去读取下一个URL。

并发的请求

```javascript
async function logInOrder (urls) {
    // 并发读取远程URL
    const textPromises = urls.map(async url => {
        const response = await fetch(url)
        return response.text()
    })

    // 按次序输出
    for (const textPromise of textPromises) {
        console.log(await textPromise)
    }
}
```

## 异步遍历器

Iterator遍历器的`next`方法必须是同步的，如果是异步操作，目前的解决方法是，Generator函数里面的异步操作，返回一个Thunk函数或者Promise对象，即`value`属性是一个Thunk函数，或者Promise对象，等待以后返回真正的值，而`done`属性还是同步产生的。

ES2018引入了“异步遍历器”，为异步操作提供原生的遍历器接口。即`value`和`done`这两个属性都是异步产生的。

**异步遍历的接口**

异步遍历器最大的特点，就是调用遍历器的`next`方法，返回的是一个Promise对象

```javascript
asyncIterator
    .next()
    .then(
        ({value, done}) => /* ... */
    )
```

一个对象的同步遍历器接口，部署在`Symbol.iterator`属性上面。对象的异步遍历器接口，部署在`Symbol.asyncIterator`属性上面。不管是什么样的对象，只要它的`Symbol.asyncIterator`有值，就表示应该对它进行异步遍历。

🌰

```javascript
const asyncIterable = createAsyncIterable(['a', 'b'])
const asyncIterator = asyncIterable[Symbol.asyncIterator]()

asyncIterator
.next()
.then(iterResult => {
    console.log(iterResult1) // { value: 'a', done: false }
    return asyncIterator.next()
})
.then(iterResult2 => {
    console.log(iterResult2) // { value: 'b', done: false }
    return asyncIterator.next()
})
.then(iterResult3 => {
    console.log(iterResult3) // { value: undefined, done: true }
})
```

由于异步遍历器的`next`方法，返回的是一个Promise对象。因此，可以把它放在`await`命令后面

```javascript
async function f() {
    const asyncIterable = createAsyncIterable(['a', 'b'])
    const asyncIterator = asyncIterable[Symbol.asyncIterator]()
    console.log(await asyncIterator.next())
    // { value: 'a', done: false }
    console.log(await asyncIterator.next())
    // { value: 'b', done: false }
    console.log(await asyncIterator.next())
    // { value: 'undefined', done: true }
}
```

把所有的`next`方法放在`Promise.all`方法里面

```javascript
const asyncGenObj = createAsyncIterable(['a', 'b'])
const [{value: v1}, {value: v2}] = await Promise.all([
    asyncGenObj.next(), asyncGenObj.next()
])

console.log(v1, v2) // a b
```

**for await...of**

`for...of`循环用于遍历同步的Iterator接口。新引入的`for await...of`循环，则用于遍历异步的Iterator接口

```javascript
async function f() {
    for await (const x of createAsyncIterable(['a', 'b'])) {
        console.log(x)
    }
}
// a
// b
```

部署了asyncIterable操作的异步接口，可以直接放入这个循化中

```javascript
let body = ''

async function f () {
    for await (const data of req) body += data
    const parsed = JSON.parse(body)
    console.log('got', parsed)
}
```

如果`next`方法返回的Promise对象被`reject`，`for await ... of`就会报错，要用`try...catch`捕捉

```javascript
async function () {
    try {
        for await (const x of createRejectingIterable()) {
            console.log(x)
        }
    } catch (e) {
        console.error(e)
    }
}
```

**异步Generator函数**

异步Generator函数的作用，是返回一个异步遍历器对象

```javascript
async function* gen () {
    yield 'hello'
}

const genObj = gen()
genObj.next().then(x => console.log(x))
```