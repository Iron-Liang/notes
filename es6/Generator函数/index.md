# Generator函数的语法

## 简介

### 基本概念

Generator函数是ES6提供的一种异步编程解决方案，语法行为与传统函数完全不同。

语法上，可以将Gererator函数理解成是一个状态机，封装了多个内部状态。

执行Generator函数会返回一个遍历器对象，返回的遍历器对象，可以依次遍历Generator函数内部的每一个状态。

```javascript
function* helloWorldGenerator () {
    yield 'hello'
    yield 'world'
    return 'ending'
}

var hw = helloWorldGenerator()
```

三个状态：'hello', 'world'和return语句。

必须调用遍历器对象的`next`方法，使得指针移向下一个状态。

Generator是分段执行的，`yield`表达式是暂停执行的标记，而`next()`方法可以恢复执行。

```javascript
hw.next()
// { value: 'hello', done: false }
hw.next()
// { value: 'world', done: false }
hw.next()
// { value: 'ending', done: true }
hw.next()
// { value: undefined, done: true }
```

### yield表达式

惰性求值

```javascript
function* gen () {
    yield 123 + 456
}
// 不会立即求值，只有调用next()方法，将指针指向该句时才求值
```

`yield`表达式只能用在Generator函数里面。

```javascript
var arr = [1, [[2, 3], 4], [5, 6]]

var flat = function* (a) {
    a.forEach(function (item) {
        if (typeof item !== 'numbber') {
            yield* flat(item)
        } else {
            yield item
        }
    })
}

for (var f of flat(arr)) {
    console.log(f)
}
```

上面代码会产生语法错误，因为`forEach`方法的参数是一个普通函数，但里面使用了`yield`表达式。

改用`for`循化

```javascript
var arr = [1, [[2, 3], 4], [5, 6]]

var flat = function* (a) {
    for (lwr i = 0; i < a.length; i++ ) {
        var item = a[i]
        if (typeof item !== 'numbber') {
            yield* flat(item)
        } else {
            yield item
        }
    }
}

for (var f of flat(arr)) {
    console.log(f)
}
// 1, 2, 3, 4, 5, 6
```

`yield`表达式如果用在另一个表达式中，必须放在圆括号里面

```javascript
function* demo () {
    console.log('Hello' + yield) // SyntaxError
    console.log('Hello' + yield 123) // SyntaxError

    console.log('Hello' + (yield)) // ok
    console.log('Hello' + (yield 123)) // ok
}
```

`yield`表达式作为函数参数，或放在赋值表达式的右边，可以不加括号

```javascript
function* demo() {
    foo(yield 'a', yield 'b') // ok
    let input = yield // ok
}
```

### 与Iterator接口的关系

Generator函数执行返回一个遍历器对象。该对象本身也具有`Symbol.iterator`属性，执行后返回自身。

```javascript
function* gen () {
    // some code
}

var g = gen()

g[Symbol.iterator] === g
// true
```

### next方法的参数

`yield`表达式本身总是返回`undefined`。`next`方法可以带一个参数，该参数就会被当作上一个`yield`表达式的返回值。

```javascript
function* f () {
    for (var i = 0; true; i++ ) {
        var reset = yield i;
        if (reset) { i = -1 }
    }
}

var g = f()

g.next() // { value: 0, done: false }
g.next() // { value: 1, done: false }
g.next(true) // { value: 0, done: false }
```

> 由于`next`方法的参数表示**上一个**`yield`表达式的返回值，所以在第一次使用`next`方法时，传递参数是无效的。

例子

```javascript
function* dataConsumer () {
    console.log('Started')
    console.log(`1.${yeild}`)
    console.log(`2.${yeild}`)
    return 'result'
}

let genObj = dataConsumer()
genObj.next()
// started
genObj.next('a')
// 1.a
genObj.next('b')
// 2.b
```

如果想第一次调用next的时候就输入值，可以在Generator函数外面再包一层

```javascript
function wrapper(generatorFunction) {
    return function (...args) {
        let generatorObj = generatorFunction(...args)
        generatorObj.next()
        return generatorObj
    }
}

const wrapped = wrapper(function* () {
    console.log(`First input: ${yield}`)
    return 'DONE'
})

wrapped().next('hello!')

// First input: hello!
```

### `for...of`循环

`for...of`循环可以自动遍历Generator函数时生成的`Iterator`对象，且此时不再需要调用`next`方法

```javascript
function* foo() {
    yield 1
    yield 2
    yield 3
    yield 4
    yield 5
    return 6
}

for (let v of foo()) {
    console.log(v)
}

// 1 2 3 4 5
```

原生的javascript对象，没有遍历接口，不能供`for...of`循环遍历，利用Generator函数为它加上这个接口，就可以用了。

```javascript
function* objectEntries(obj) {
    let propKeys = Object.ownKeys(obj)
    
    for (let propKey of propKeys) {
        yield [propKey, obj[propKey]]
    }
}

let jane = { first: 'Jane', last: 'Doe' }

jane[Symbol.iterator] = objectEntres

for (let [key, value] of jane) {
    console.log(`${key}: ${value}`)
}
```

### `Generator.prototype.throw()`

Generator返回的遍历器对象，都有一个`throw`方法，可以在函数体外抛出错误，然后在Generator函数体内捕获。

```javascript
var g = function* () {
    try {
        yield
    } catch (e) {
        console.log('内部捕获', e)
    }
}

var i = g()
i.next()

try {
    i.throw('a')
    i.throw('b')
} catch (e) {
    console.log('外部捕获'， e)
}

// 内部捕获 a
// 外部捕获 b
```

内部捕获过一次之后就不再捕获

如果Generator函数内部没有部署`try...catch`代码块，那么`throw`方法抛出的错误，将被外部`try...catch`代码捕获

`throw`方法抛出的错误要被内部捕获，前提是必须执至少执行过一次`next`方法

`throw`方法被捕获以后，会附带执行下一条`yield`表达式。相当于会附带执行一次`next`方法。

```javascript
var gen = function* gen () {
    try {
        yield console.log('a')
    } catch (e) {
        // ...
    }
    yield console.log('b')
    yield console.log('c')
}

var g = gen()
g.next() // a
g.throw() // b
g.next() // c
```

Generator函数体外抛出的错误，可以在函数体内捕获。反过来，Generator函数内部抛出的错误，也可以被函数体外的`catch`捕获。

```javascript
function* foo () {
    var x = yield 3
    var y = x.toUpperCase()
    yield y
}

var it = foo()
it.next() // { value:3 , done: false }

try {
    it.next(42)
} catch (err) {
    console.log(err)
} 
```

一旦Generator执行过程中抛出错误，且没有被内部捕获，就不会再执行下去。`next`方法返回`{ value: undefined, done: true }`

### `Generator.prototype.return()`

返回给定的值，并终结遍历Generator函数

```javascript
function* gen () {
    yield 2
    yield 3
    yield 4
}

var g = gen()
g.next() // { value: 1, done: false }
g.return('foo') // { value: 'foo', done: true }
g.next() // { value: undefined, done: true }
```

如果Generator函数内部有`try...finally`代码块，那么`return`方法会推迟到`finally`代码块执行完后再执行。

### `next()`、`throw()`、`return`的共同点

它们的作用都是让Generator函数恢复执行，并使用不同的语句替换`yield`表达式

### `yield*`表达式

如果在Generator函数内部，调用另外一个Generator函数，默认情况下是没有效果的。

`yield*`用来在一个Generator函数里面执行另外一个Generator函数。

```javascript
function* foo () {
    yield 'a'
    yield 'b'
}

function* bar () {
    yield 'x'
    yield* foo()
    yield 'y'
}

// 等同于
function* bar () {
    yield 'x'
    yield 'a'
    yield 'b'
    yield 'y'
}
```

`yield*`后面的Generator函数（没有`return`语句时），等同于在Generator函数内部，部署一个`for...of`循环

```javascript
function* concat (iter1, iter2) {
    yield* iter1
    yield* iter2
}

// 等同于

function* concat (iter1, iter2) {
    for (var value of iter1) {
        yield value
    }
    for (var value of iter2) {
        yield value
    }
}
```

如果`yield*`后面跟着一个数组，由于数组原生支持遍历器，因此会遍历数组成员

```javascript
function* gen () {
    yield* ["a", "b", "c"]
}

gen().next() // { value: 'a', done: false }
```

如果被代理的Generator函数有`return`语句，那么就可以向代理它的Generator函数返回数据

```javascript
function* foo () {
    yield 2
    yield 3
    return "foo"
}

function* bar () {
    yield 1
    var v = yield* foo()
    console.log("v:" + v)
    yield 4
}

var it = bar()
it.next()
// { value: 1, done: false }
it.next()
// { value: 2, done: false }
it.next()
// { value: 3, done: false }
it.next()
// v: foo
// { value: 4, done: false }
it.next()
// { value: undefined, done: true }
```

递归取出嵌套数组的所有成员

```javascript
function* iterTree (tree) {
    if (Array.isArray(tree)) {
        for (let i = 0; i < tree.length; i++) {
            yield* iterTree(tree)
        }
    } else {
        yield tree
    }
}
```

### 作为对象属性的Generator函数

```javascript
let obj = {
    * myGeneratorMethod () {
        ...
    }
}
```

### Generator函数的`this`

Generator函数总是返回一个遍历器对象，ES6规定，这个遍历器是Generator函数的实例，也继承了Generator函数`prototype`上的方法

```javascript
function* g () {}
g.prototype.hello = function () {
    return 'hi!'
}

let obj = g()
obj instanceof g // true
obj.hello() // 'hi!'
```

把`g`当做普通构造函数，并不会生效，因为`g`返回的总是遍历器对象，而不是`this`对象。

```javascript
function* g () {
    this.a = 11
}

let obj = g()
obj.next()
obj.a // undefined
```

与`new`一起使用，会报错

有一个变通的方法，可以让Generator函数返回一个正常的对象实例，即可以调用`next`方法，又可以获得正常的`this`

```javascript
function* F () {
    this.a = 1
    yield this.b = 2
    yield this.c = 3
}

var obj = {}
var f = F.call(obj)

f.next() // { value: 2, done: false }
f.next() // { value: 3, done: false }
f.next() // { value: undefined, done: true }

obj.a // 1
obj.b // 2
obj.c // 3
```

将obj和f统一

```javascript
function* F () {
    this.a = 1
    yield this.b = 2
    yield this.c = 3
}
var f = F.call(F.prototype)
```

## 含义

### Generator与状态机

Generator是实现状态机的最佳结构。下面的`clock`就是一个状态机

```javascript
var clock = function* () {
    while (true) {
        console.log('Tick!')
        yield
        console.log('Tock')
        yield
    }
}

// 每次调用clock.next就修改一次状态，不需要外部变量支持。
```

### Generator与协程

协程（coroutine）是一种程序运行的方式，可以理解成“协作的线程”或“协作的函数”。协程可以用单线程实现，也可以用多线程实现。前者是一种特殊的子例程，后者是一种特殊的线程。

1. 协程与子例程的差异

传统的“子例程”（subroutine）采用堆栈式“后进先出”的执行方式，只有当调用的子函数完全执行完毕，才会结束执行父函数。协程与其不同，多个线程（单线程情况下，即多个函数）可以并行执行，但是只有一个线程（或函数）处于正在运行的状态，其他线程（或函数）都处于暂停态（suspended），线程（或函数）之间可以交换执行权。也就是说，一个线程（或函数）执行到一半，可以暂停执行，将执行权交给另一个线程（或函数），等到稍后收回执行权的时候，再恢复执行。这种可以并行执行、交换执行权的线程（或函数），就称为协程。

从实现上看，在内存中，子例程只使用一个栈（stack），而协程是同时存在多个栈，但只有一个栈是在运行状态，也就是说，协程是以多占用内存为代价，实现多任务的并行。

2. 协程与普通线程的差异

不难看出，协程适合用于多任务运行的环境。在这个意义上，它与普通的线程很相似，都有自己的执行上下文、可以分享全局变量。它们的不同之处在于，同一时间可以有多个线程处于运行状态，但是运行的协程只能有一个，其他协程都处于暂停状态。此外，普通的线程是抢先式的，到底哪个线程优先得到资源，必须由运行环境决定，但是协程是合作式的，执行权由协程自己分配。

Generator 函数是 ES6 对协程的实现，但属于不完全实现。Generator 函数被称为“半协程”（semi-coroutine），意思是只有 Generator 函数的调用者，才能将程序的执行权还给 Generator 函数。如果是完全执行的协程，任何函数都可以让暂停的协程继续执行。

### Generator与上下文

JavaScript 代码运行时，会产生一个全局的上下文环境（context，又称运行环境），包含了当前所有的变量和对象。然后，执行函数（或块级代码）的时候，又会在当前上下文环境的上层，产生一个函数运行的上下文，变成当前（active）的上下文，由此形成一个上下文环境的堆栈（context stack）。

**这个堆栈是“后进先出”的数据结构，最后产生的上下文环境首先执行完成，退出堆栈，然后再执行完成它下层的上下文，直至所有代码执行完成，堆栈清空。**

Generator 函数不是这样，它执行产生的上下文环境，一旦遇到yield命令，就会暂时退出堆栈，但是并不消失，里面的所有变量和对象会冻结在当前状态。等到对它执行next命令时，这个上下文环境又会重新加入调用栈，冻结的变量和对象恢复执行。

## 应用

Generator可以暂停函数执行，返回任意表达式的值。这种特点使Generator有多种应用场景。

1. 异步操作的同步化表示

将异步操作写在`yield`表达式里面，等到调用`next`方法再往后执行。

```javascript
function* loadUI () {
    showLoadingScreen()
    yield loadUIDataAsyncchronously()
    hideLoadingScreen()
}
var loader = loadUI()
// 加载UI
loader.next()
// 卸载UI
loader.next()
```

通过Generator函数部署Ajax操作

```javascript
function* main () {
    var result = yield request('http://some.url')
    var resp = JSON.parse(result)
    console.log(resp.value)
}

function request (url) {
    makeAjaxCall(url, function (response) {
        it.next(response)
    })
}

var it = main()
it.next()
```

2. 控制流管理

一个多步操作非常耗时，采用回调函数

```javascript
step1 (function (value1) {
    step2 (value1, function (value2) {
        step3 (value2, function (value3) {
            step4 (value3, function (value4) {
                // Do something with value4
            })
        })
    })
})
```

用Promise的改写

```javascript
Promise.resolve(step1)
    .then(step2)
    .then(step3)
    .then(step4)
    .then(function (value4) {
        // Do something with value4
    })
    .catch(function (error) {
        // handle any error from step1 throungh step4
    })
    .done()
```

Generator函数进一步改善代码的运行流程

```javascript
function* longRunningTask (value1) {
    try {
        var value2 = yield step1(value1)
        var value3 = yield step2(value2)
        var value4 = yield step3(value3)
        var value5 = yield step4(value4)
        // Do something with value4
    } catch (e) {
        // handle any error from step1 throungh step4
    }
}
```

然后使用一个函数，按次序自动执行所有步骤

```javascript
scheduler(longRunningTask(initailValue))

function scheduler (task) {
    var taskObj = task.next(task.value)
    // 如果Generator函数未结束，就继续调用
    if (!taskObj.done) {
        task.value = taskObj.value
        scheduler(task)
    }
}
```

> 这种做法只适合同步操作，即所有的`task`都必须是同步的，不能有异步操作，因为这里的代理一得到返回值，就继续向下执行，没有判断异步操作何时完成。

利用`for...of`循环自动依次执行`yield`命令的特性，提供更一般的控制流管理方法

```javascript
let steps = [step1Func, step2Func, step3Func]

function* iterateSteps (steps) {
    steps.forEach(step => yield step())
}
```

将任务分解成步骤后，还可以将项目分解成多个依次执行的任务

```javascript
let jobs = [job1, job2, job3]

function* iterateJobs (jobs) {
    jobs.forEach(job => yield* iterateJobs(job.steps))
}
```

最后，利用`for...of`循环一次性执行所有任务的所有步骤

```javascript
for (var step of iterateJobs(jobbs)) {
    console.log(step.id)
}
```

3. 部署Iterator接口

利用Generator函数，可以在任意对象上部署Iterator接口

```javascript
function* iterEntries (obj) {
    let keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        let key  = key[i]
        yield [key, obj[key]]
    }
}

let myObj = { foo: 3, bar: 7 }

for (let [key, value] of iterEntries(myObj)) {
    console.log(key, value)
}
```

# Generator函数的异步应用

## 传统方法

ES6之前，异步编程的方法，大概有以下四种。

- 回调函数
- 事件监听
- 发布/订阅
- Promise对象

## 基本概念

**异步**

任务被认为分为两个阶段，先执行第一阶段，然后转而执行其它任务，等做好准备，再回头来执行第二段。

**回调函数**

所谓回调函数，就是把任务的第二段单独写在一个函数里面，等到重新执行这个任务的时候，就直接调用这个函数。

一个有趣的问题是，为什么 Node 约定，回调函数的第一个参数，必须是错误对象err（如果没有错误，该参数就是`null`）？

原因是执行分成两段，第一段执行完以后，任务所在的上下文环境就已经结束了。在这以后抛出的错误，原来的上下文环境已经无法捕捉，只能当作参数，传入第二段。

**Promise**

将回调函数变为链式调用

## Generator函数

**协程**

多个线程相互协作，完成异步任务

协程有点像函数，又有点像线程。流程如下

- 第一步，协程`A`开始执行。
- 第二步，协程`A`执行到一半，进入暂停，执行权转移到协程`B`
- 第三步，（一段时间后）协程`B`交还执行权
- 第四步，协程`A`恢复执行

协程`A`就是异步任务，它分为两段（或多段）执行。

读取文件的协程写法

```javascript
function* asyncJob () {
    // ...其他代码
    var f = yield readFile(fileA)
    // ...其他代码
}
```

**协程的Generator函数实现**

整个Generator函数就是一个封装的异步任务，或者说是异步任务的容器。异步需要暂停的地方，都用`yield`语句注明。Generator函数的执行方法如下

```javascript
function* gen (x) {
    var y = yield x + 2
    return y
}

var g = gen(1)
g.next() // { value: 3, done: false }
g.next() // { value: undefined, done: true }
```

**Generator函数的数据交换和错误处理**

Generator函数还有两个特性：函数体内外数据交换和错误处理机制

`next`返回值的value属性，是Generator函数向外输出数据；`next`方法还可以接受参数，向Generator函数体内输入数据。

```javascript
function* gen (x) {
    var y = yield x + 2
    return y
}

var g = gen(1)
g.next() // { value: 3, done: false }
g.next(2) // { value: 2, done: true }
```

Generator函数内部还可以部署错误处理代码，捕获函数体外抛出的错误

```javascript
function* gen (x) {
    try {
        var y = yield x + 2
    } catch (e) {
        console.log(e)
    }
    return y
}

var g = gen(1)
g.next()
g.throw('出错')
```

**异步任务的封装**

用Generator函数，执行一个真实的异步任务

```javascript
var fetch = require('node-fetch')

function* gen () {
    var url = 'https://ap1.github.com/users/github'
    var result = yield fetch(url)
    console.log(result.bio)
}

var g = gen()
var result = g.next()

result.value.then(data => data.json())
    .then(data => g.next(data))
```

> 虽然Generator函数将异步操作表示得很简洁，但是流程管理却不方便（即何时执行第一阶段，何时执行第二阶段）。

## Thunk函数

Thunk函数是自动执行Generator函数的一种方法

**参数的求值策略**

函数参数的求值策略

- “传值调用”，即进入函数体之前，就计算参数的值。（C语言采用）
- “传名调用”，将参数表达式传入函数体内，只有在用到它的时候求值。（Haskell语言采用）

**Thunk函数的含义**

编译器的“传名调用”实现，往往是将一个参数放到一个临时函数之中，再将这个临时函数传入函数体。这个临时函数就叫做Thunk函数

```javascript
function f (m) {
    return m * 2
}

f(x + 5)

// 等同于

var thunk = function () {
    return x + 5
}

function f(thunk) {
    return thunk() * 2
}
```

这就是Thunk函数的定义，它是“传名调用”的一种实现策略，用来替换某个表达式。

**JavaScript语言的Thunk函数**

JavaScript语言是传值调用，它的Thunk函数含义有所不同。在JavaScript语言中，Thunk函数替换的不是表达式，而是多参数函数。将其替换成一个只接受回调函数作为参数的单参数函数。

```javascript
// 正常版本的readFile（多参数版本）

fs.readFile(fileName, callback)

// Thunk版本的readFile（单参数版本）

var Thunk = function (fileName) {
    return function (callback) {
        return fs.readFile(fileName, callback)
    }
}

var readFileThunk = Thunk(fileName) // 单参数版本就叫做Thunk函数
readFileThunk(callback)
```

任何函数，只要参数有回调函数，就能写成Thunk函数的形式。下面是一个简单的Thunk函数转换器。

```javascript
// ES5版本
var Thunk = function (fn) {
    return function () {
        var ags = Array.prototype.slice.call(arguments)
        return function (callback) {
            args.push(callback)
            return fn.apply(this, args)
        }
    }
}

// ES6版本
const Thunk = function (fn) {
    return function (...args) {
        return function (callback) {
            return fn.call(this, ...args, callback)
        }
    }
}
```

生成`fs.readFile`的Thunk函数

```javascript
var readFileThunk = Thunk(fs.readFile)
readFileThunk(fileA)(callback)
```

**Thunkify模块**

生产环境的转换器，建议使用Thunkify模块

安装

```bash
npm install thunkify
```

使用

```javascript
var thunkify = require('thunkify')
var fs = require('fs')

var read = thunkify(fs.readFile)
read('package.json')((error, str) => {
    // ...
})
```

Thunkify源码

```javascript
function thunkify (fn) {
    return function () {
        var args = new Array(arguments.length)
        var ctx = this

        for (var i = 0; i < args.length; ++i) {
            args[i] = arguments[i]
        }

        return function (done) {
            var called

            args.push(function () {
                if (called) return
                called = true
                done.apply(null, arguments)
            })
        }

        try {
            fn.apply(ctx, args)
        } catch (err) {
            done(err)
        }
    }
}
```

变量`called`确保回调函数只运行一次。

**Generator函数的流程管理**

Thunk函数可以用在Generator函数的自动流程管理。

Generator函数可以自动执行

```javascript
function* gen () {
    // ...
}

var g = gen()
var res = g.next()

while (!res.done) {
    console.log(res.value)
    res = g.next()
}
```

这样的代码，Generator函数`gen`会自动执行完所有步骤。

但是，这并不适合异步操作。如果必须保证前一步执行完，才能执行后一步，上面的自动执行就不可行。

Generator函数封装两个异步操作

```javascript
var fs = require('fs')
var thunkify = require('thunkify')
var readFileThunk = thunkify(fs.readFile)

var gen = function* () {
    var r1 = yield readFileThunk('/etc/fstab')
    console.log(r1.toString())
    var r2 = yield readFileThunk('/etc/shells')
    console.log(r2.toString())
}
```

`yield`命令用于将程序的执行权移出Generator函数，需要一种方法，将执行权还给Generator函数。

这种方法就是Thunk函数。

上述Generator函数的执行

```javascript
var g = gen()

var r1 = g.next()
r1.value((err, data) => {
    if (err) throw err
    var r2 = g.next(data)
    r2.value((err, data) => {
        if (err) throw err
        g.next(data)
    })
})

// 本质是将同一个回调函数，反复传入`next`方法的value属性。这使得可以用递归来自动完成这个过程
```

**Thunk函数的自动流程管理**

Thunk函数可以自动执行Generator函数。

一个基于Thunk函数的Generator函数执行器

```javascript
function run (fn) {
    var gen = fn()

    function next(err, data) {
        var result = gen.next(data)
        if (result.done) return
        result.value(next)
    }

    next()
}

function* g () {
    // ...
}

run(g)

// 内部的next函数就是 Thunk 的回调函数。next函数先将指针移到 Generator 函数的下一步（gen.next方法），然后判断 Generator 函数是否结束（result.done属性），如果没结束，就将next函数再传入 Thunk 函数（result.value属性），否则就直接退出。
```

Thunk函数并不是Generator函数自动执行的唯一方案。因为自动执行的关键是，必须有一种机制，自动控制Generator函数的流程，接收和交还程序的执行权。回调函数可以做到，Promise对象也可以做到。

## co模块

**基本用法**

co模块是大牛TJ Holowaychuk 于 2013年6月发布的一个小工具，用于Generator函数的自动执行。

```javascript
var co = require('co')

var gen = function* () {
    var f1 = yield readFile('/etc/fstab')
    var f2 = yield readFile('/etc/shells')
    console.log(f1.toString())
    console.log(f2.toString())
}

co(gen)
```

`co`函数返回一个`Promise`对象，因此可以用`then`方法添加回调函数

```javascript
co(gen).then(function () {
    console.log('Generator 函数执行完成')
})
```

**co模块的原理**

为什么co可以自动执行Generator函数？

Generator就是一个异步操作容器。它的自动执行需要一种机制，当异步操作有了结果，能够自动交回执行权。

两种方法可以做到这一点

1. 回调函数。将异步操作包装成Thunk函数，在回调函数里面交回执行权。
2. Promise对象。将异步操作包装成Promise对象，用`then`方法交回执行权。

co 模块其实就是将两种自动执行器（Thunk 函数和 Promise 对象），包装成一个模块。使用 co 的前提条件是，Generator 函数的yield命令后面，只能是 Thunk 函数或 Promise 对象。如果数组或对象的成员，全部都是 Promise 对象，也可以使用 co，详见后文的例子。

**基于Promise对象的自动执行**

把`fs`的`readFile`方法包装成一个Promise对象

```javascript
var fs = require('fs')

var readFile = function (fileName) {
    return new Promise(function (resolve, reject) {
        fs.readFile(fileName, function (err, data) {
            if (err) reject(err)
            resolve(data)
        })
    })
}

var gen = function* () {
    var f1 = yield readFile('/etc/fstab')
    var f2 = yield readFile('/etc/shells')
    console.log(f1.toString())
    console.log(f2.toString())
}
```

手动执行

```javascript
var g = gen()
g.next().value.then(function (data) {
    g.next(data).value.then(function (data) {
        g.next(data)
    })
})
```

自动执行版本

```javascript
function run (gen) {
    var g = gen()
    function next (data) {
        var result = g.next(data)
        if (result.done) return result.value
        result.value.then(function (data) {
            next(data)
        })
    }
    next()
}

run(gen)
```

**co模块的源码**

co函数接收Generator函数作为参数，返回一个Promise对象

```javascript
function co (gen) {
    var ctx = this
    return new Promise(function (resolve, reject) {})
}
```

在返回的Promise对象里面，co先检查参数`gen`是否为Generator函数，如果是，就执行该函数，得到一个内部不指针对象。如果不是就返回，并修改Promise对象的状态为`resolved`

```javascript
function co (gen) {
    var ctx = this
    return new Promise(function (resolve, reject) {
        if (typeof gen === 'function') gen = gen.call(ctx)
        if (!gen || typeof gen.next !== 'function') return resolve(gen)
    })
}
```

为了能够捕捉抛出的错误，co将Generator函数内部指针对象的`next`方法，包装成`onFulfilled`函数

```javascript
function co (gen) {
    var ctx = this
    return new Promise(function (resolve, reject) {
        if (typeof gen === 'function') gen = gen.call(ctx)
        if (!gen || typeof gen.next !== 'function') return resolve(gen)
    })

    onFulfilled()
    function onFulfilled (res) {
        var ret
        try {
            ret = gen.next(res)
        } catch (e) {
            return reject(e)
        }
        next(ret)
    }
}
```

关键`next`函数，它会反复调用自身

```javascript
function next (ret) {
    if (ret.done) return resolve(ret.value)
    var value = toPrimose.call(ctx, ret.value)
    if (value && isPromise(value)) return value.then(onFulfilled, onRejected)
    return onRejected(
        new TypeError(
            'You may only yield a function, promise, generator, array, or object, '
            + 'but the following object was passed: "'
            + String(ret.value)
            + '"'
        )
    )
}
```

**处理并发的异步操作**

co支持并发的异步操作，即允许某些操作同时进行，等到它们全部完成，才进行下一步。

这时，要把并发的操作都放在数组或对象里面，跟在`yield`语句后面

```javascript
co(function* () {
    var res = yield [
        Promise.resolve(1),
        Promise.resolve(2)
    ]
    console.log(res)
}).catch(onerror)

// 对象写法
co(function* () {
    var res = yield {
        1: Promise.resolve(1),
        2: Promise.resolve(2)
    }
    console.log(res)
}).catch(error)
```