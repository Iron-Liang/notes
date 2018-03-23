# 函数的扩展

ES6增加函数参数默认值，箭头函数等特性

## 函数参数的默认值

```javascript
function log(x, y='world') {
    console.log(x, y)
}

log('hello') // hello world
log('hello', 'china') // hello china
```

> 注意

- 参数变量默认是声明的，所以不能用`let`或`const`再次声明。
- 使用参数默认值时，函数不能有同名参数。
- 参数默认值不是传值的而是惰性求值的。

```javascript
let x = 99
function foo(p = x + 1) {
    console.log(p)
}

foo() // 100
x = 100
foo() // 101
```

**与解构赋值结合使用**

```javascript
function foo({x, y = 5}) {
    console.log(x, y)
}

foo({}) // undefined 5
foo({x: 1}) // 1 5
foo({x: 1, y: 2}) // 1 2
foo() // TypeError: Cannot read property 'x' of undefined
```

只使用了对象的解构赋值默认值，没有使用函数参数默认值。通过提供函数参数默认值，可以避免不传参数时报错。

```javascript
function foo({x, y = 5} = {}) {
    console.log(x,y)
}
foo() // undefined 5
```

> 函数参数解构赋值是将函数形参作为模式，从实参中解构赋值

**参数默认值的位置**

定义了默认值的参数，应该是函数的尾参数。因为这样比较容易看出来到底省略了哪些参数。如果非尾部的参数设置默认值，实际上参数是没法省略的。

**函数的length属性**

指定默认参数后，函数的length属性将失真，返回没有指定默认值的参数个数。

```javascript
(function (a) {}).length // 1
(function (a = 5) {}).length // 0
(function (a, b, c = 5) {}).length // 2
```

rest参数不计入length属性

```javascript
(function (...args) {}).length // 0
```

设置了默认值的参数不是尾参数，那么length属性也不再计入后面的参数。

```javascript
(function (a = 0, b, c) {}).length // 0
```

**作用域**

设置了函数参数默认值后，函数进行声明初始化时，会形成一个单独的作用域。等到初始化结束，这个作用域消失。

```javascript
var x = 1
function f(x, y=x) {
    console.log(y)
}
f(2) // 2
/*
    函数声明时形成临时作用域，变相x指向第一个参数x而不是全局x
*/
```

**应用**

利用参数默认值，指定某参数不能省略，如果省略便抛出错误

```javascript
function throwIfMissing() {
    throw new Error('Missing parameter')
}

function foo(mustBeProvided = throwIfMissing()) {
    return mustBeProvided
}
```

> 函数参数默认值是在运行时执行的，不是在声明时执行

## rest参数

用于获取多余的参数，这样就不需要使用`arguments`对象了。rest参数搭配的变量是一个数组，该变量将多余的参数放入数组中。

```javascript
function add(...values) {
    let sum = 0
    values.forEach(value => {
        sum += value
    })
    return sum
}
add(1, 2, 3) // 6
```

> 注意

- rest参数之后不能有其他参数，否则报错
- 函数的length属性，不包括rest参数

## 严格模式

ES5开始，函数内部可以设定为严格模式

```javascript
function doSomething(a, b) {
    'use strict';
    // code
}
```

ES6中只要函数使用了默认值、解构赋值、或者扩展运算符，那么函数内部就不能显示的设为严格模式，否则报错。

规避方法

```javascript
// 全局使用严格模式
'use strict'
function doSomething (a, b = a) {
    // code
}

// 使用无参自执行函数

const doSomething = (function () {
    'use strict'
    return function (value = 42) {
        return value
    }
}())
```

## name属性

函数的name属性，返回函数的函数名

ES6中，匿名函数赋值给一个变量，正确的返回函数名

```javascript
function foo () {}
foo.name // 'foo'

var f = function () {}
f.name // 'f'
```

`Function`构造函数返回的函数实例，`name`属性为`'anonymous'`

```javascript
(new Function).name // 'anonymous'
```

`bind`返回的函数，`name`属性会加上`bound`

```javascript
function foo () {}
foo.bind({}).name // 'bound foo'

(function () {}).bind({}).name // 'bound'
```

## 箭头函数

**基本用法**

```javascript
var f = v => v
```

**使用注意**

- 函数体内的`this`对象，就是箭头函数本身定义时所在的对象，而不是使用时所在的对象。
- 不可以当做构造函数，也就是说，不可以使用`new`命令
- 不可以使用`arguments`对象，该对象在函数体内部不存在。可以用rest参数代替
- 不可以使用`yield`命令，因此箭头函数不能用作Generator函数

**嵌套的箭头函数**

部署管道机制（pipeline），前一个函数的输出是后一个函数的输入

```javascript
const pipeline = (...funcs) =>
    val => funcs.reduce((a,b) => b(a), val)

const plus1 = a => a + 1
const mult2 = a => a * 2
const addThenMult = pipeline(plus1, mult2)
addThenMult(5) // 12
```

## 双冒号运算符

提案，“函数绑定”运算符（function bind），用来取代`call`、`apply`、`bind`

`::`左边是一个对象，右边是一个函数。该运算符将左边的对象作为上下文（即`this`对象），绑定到右边的函数上。

```javascript
foo::bar
// 等同于
bar.bind(foo)

foo::bar(...arguments)
// 等同于
bar.apply(foo, arguments)
```

如果冒号左边为空，右边是一个对象的方法，则等于将该方法绑定在该对象上面

```javascript
var method = obj::obj.foo
// 等同于
var method = ::obj.foo

let log = ::conole.log
// 等同于
let log = console.log.bind(console)
```

如果双冒号运算符的运算结果，还是一个对象，可以采用链式写法

```javascript
import { map, takeWhile, forEach } from 'iterlib'

getPlayers()
::map(x => x.character())
::takeWhile(x => x.strength > 100)
::forEach(x => console.log(x))
```

## 尾调用优化

尾调用（Tail Call），指某个函数的最后一步是调用另外一个函数。

```javascript
function f(x) {
    return g(x)
}
```

```javascript
function f(x) {
    g(x)
}

// 等同于

function f(x) {
    g(x)
    return undefined
}

/*
    不属于尾调用
*/
```

**尾调用优化**

尾调用与其它调用不同之处

*函数调用在内存中形成一个“调用记录”，称为“调用帧”（call frame），用来保存调用位置和内部变量信息。如果函数A内部调用函数B，那么A的调用帧上方，还会形成一个B的调用帧。等到B运行结束，将结果返回到A，B的调用帧才会消失。如果函数B内部还调用了函数C，那就还有一个C的调用帧，以此类推。所有的调用帧就形成了一个“调用栈”（call stack）*

*尾调用由于是函数的最后一步操作，所以不需要保留外层函数的调用帧，因为调用位置，内部变量等信息都不会再用到了，只要直接用内部函数的调用帧，取代外部函数的调用帧就可以了。*

> 注意：只有不再用到外层函数的内部变量，内层函数的调用帧才会取代外层函数的调用帧，否则无法进行“尾调用优化”

**尾递归**

函数尾调用自身，称为尾递归

计算n的阶乘

```javascript
// 非尾递归写法复杂度O(n)

function factorial(n) {
    if (n === 1) return 1
    return n * factiorial(n - 1)
}
```

```javascript
// 尾递归写法复杂度O(1)

function factorial(n, total) {
    if (n === 1) return total
    return factorial(n - 1, n * total)
}
```

Fibonacci数列

```javascript
// 非尾递归

function Fibonacci(n) {
    if (n <= 1) return 1
    return Fibonacci(n - 1) + Fibonacci(n - 2)
}
```

```javascript
// 尾递归

function Fibonacci(n, ac1 = 1, ac2 = 1) {
    if (n <= 1) return ac2
    return Fibonacci(n - 1, ac2, ac2 + ac1)
}
```

递归本身是一种循环操作。纯粹的函数式编程语言没有循环操作命令，所有循环使用递归实现。所以一旦使用递归，就最好使用尾递归。

**递归函数的改写**

把所有用到的内部变量改写成函数参数。这样就导致函数接收多个参数，不够直观。

解决方法一

```javascript
function tailFactorial(n, total) {
    if (n === 1) return total
    return tailFactorial(n - 1, n * total)
}

function factorial(n) {
    return tailFactorial(n, 1)
}

factorial(5)
```

解决方法二

利用柯里化（currying）

```javascript
function currying(fn, n) {
    return function (m) {
        return fn.call(this, m, n)
    }
}

function tailFactorial(n, total) {
    if (n === 1) return total
    return tailFactorial(n - 1, n * total)
}

const factorial = currying(tailFactorial, 1)
factorial(5)
```

方法三

默认参数

```javascript
function factorial(n, total = 1) {
    if (n === 1) return total
    return factorial(n - 1, n * total)
}

factorial(5)
```

**严格模式**

ES6的尾调用优化只在严格模式下有效。

非严格模式下函数内部有两个变量，可以跟踪函数的调用栈

- `func.arguments`: 返回调用时函数的参数。
- `func.caller`: 返回调用当前函数的那个函数

尾调用优化会导致上面两个变量失真。严格模式禁止使用这两个变量。

**尾递归优化的实现**

思路：将递归转化为循化

正常的递归函数

```javascript
function sum(x, y) {
    if (y > 0) {
        return sum(x + 1, y - 1)
    } else {
        return x
    }
}
```

利用蹦床函数把递归转化为循环执行

```javascript
function trampoline(f) {
    while (f && f instanceof Function) {
        f = f()
    }
    return f
}
/*
    接受一个函数f作为参数，只要f执行后返回一个函数，就继续执行。否则直接返回结果。这里是返回一个函数，然后执行该函数，而不是函数邻面调用函数。
*/
```

将原递归函数改写成每一步返回另一个函数

```javascript
function sum(x, y) {
    if (y > 0) {
        return sum.bind(null, x + 1, y - 1)
    } else {
        return x
    }
}
```

利用蹦床函数执行sun

```javascript
trampoline(sum(1, 1000))
```

真正尾递归优化实现

```javascript
function tco(f) {
    var value
    var active = false
    var accumulated = []
    return function accumulator() {
        accumulated.push(arguments)
        if (!active) {
            active = true
            while (accumulated.length) {
                value = f.apply(this, accumulated.shift())
            }
            active = false
            return value
        }
    }
}

var sum = tco(function(x, y) {
    if (y > 0) {
        return sum(x + 1, y - 1)
    } else {
        return x
    }
})

sum(1, 10000)
```

分析（本质是把递归变成了while循环）

```javascript
var sum = tco(function(x, y) {
    if (y > 0) {
        return sum(x + 1, y - 1)
    } else {
        return x
    }
})
```

调用之后`sum`是一个闭包函数，可以定义为如下

```javascript
var sum = function () {
    accumulated.push(arguments)
    if (!active) {
        active = true
        while (accmulated.length) {
            value = function (x, y) {
                if (y > 0) {
                    return sum(x + 1, y - 1)
                } else {
                    return x
                }
            }.apply(this, accumulated.shift())
        }
        active = false
        return value
    }
}
```

函数内部变量`value`，`active`, `accumulated`是闭包形成的私有变量

```javascript
sum(1, 100000)
```

执行`sum`

1. `accumulated = [{0: 1, 1: 100000}]`
2. 进入`if`
3. `active = true`
4. 进入`while`
5. 
```javascript
value = (function(x, y) {
    if (y > 0) {
        return sum(x + 1, y - 1)
    } else {
        return x
    }
}(1, 100000))
```

等价于

```javascript
value = sum(1 + 1, 100000 - 1)
```
6. 进入`sum(1 + 1, 100000 - 1)`后，不进入`if`代码块，直接返回`undefined`但是`accumulated = [{0: 2, 1: 99999}]`
7. 第五步等价于`value = undefined`
8. 此时私有变量`accumulated = [{0: 2, 1: 99999}]`，`while`语句通过条件，进入循化