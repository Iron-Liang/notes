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