# 变量的解构赋值

## 数组的解构赋值

**基本用法**

ES6允许按照一定的模式，从数组和对象中提取值，对变量进行赋值，这被称为解构赋值（Destructuring）。

```javascript
let [a, b, c] = [1, 2, 3]

// 按照对应的位置，从数组中提取值
```

模式赋值，只要等号两边的模式相同，左边的变量就会被赋予对应的值。

```javascript
// 使用嵌套数组进行解构赋值
let [foo, [[bar], baz]] = [1, [[2], 3]]
foo // 1
bar // 2
baz // 3

let [,, third] = ['foo', 'bar', 'baz']
third // 'baz'

let [x,,y] = [1, 2, 3]
x // 1
y // 3

let [head, ...tail] = [1, 2, 3, 4]
head // 1
tail // [2, 3, 4]

let [x, y, ...z] = ['a']
x // 'a'
y // undefined
z // []
```

- 解构不成功，变量的值就为`undefined`。
- “不完全解构”等号左边的模式，只匹配部分等号右边的数组。这种情况，解构依然成功。
- 如果等号右边不是数组（严格来说，不存在Iterator接口（不可遍历）），则解构赋值会报错。
- 只要某种数据结构具有Iterator接口，都可以采用数组形式的解构赋值。

```javascript
// 对于Set结构，使用数组的解构赋值

let [x, y, z] = new Set(['a', 'b', 'c'])
x // "a"

// 对于Generator函数，使用数组的解构赋值
function* fibs() {
    let a = 0;
    let b = 1;
    while (true) {
        yield a;
        [a, b] = [b, a + b]
    }
}

let [first, second, third, fourth, fifth, sixth] = fibs()

sixth // 5
```

**默认值**

解构赋值允许指定默认值

```javascript
let [foo = true] = []
foo // true

let [x, y = 'b'] = ['a'] // x='a', y='b'
let [x, y = 'b'] = ['a', undefined] // x='a', y='b'
```

只有当一个数组成员严格等于`undefined`，默认值才会生效。

如果默认值是一个表达式，那么这个表达式是惰性求值的。只有在用到的时候，才会求值。

```javascript
function f() {
    console.log('aaa')
}
let [x = f()] = [1]

// f不会执行，因为x可以被赋值为1
```

## 对象的解构赋值

```javascript
let { foo, bar } = { foo: "aaa", bar: "bbb" }

foo // "aaa"
bar // "bbb"
```

> 数组解构与对象解构的区别：数组的元素是按次序排列的，变量的取值由它的位置决定；而对象的属性没有次序，变量必须与属性同名，才能取到正确的值。

对象解构赋值实际是下面这种形式的简写

```javascript
let { foo: foo, bar: bar } = { foo: 'aaa', bar: 'bbb' }

// 真正被赋值的是后者，而不是前者，前者是匹配模式的键名

let { foo: baz } = { foo: 'aaa', bar: 'bbb' }

foo // undefined
baz // "aaa"
```

> 对象解构一定要区分模式和变量

对象解构的默认值

```javascript
var { x = 3 } = {}
x // 3

var { x, y = 3 } = {x: 1}
x // 1
y // 3

var { x: y = 3 } = {}
y // 3

var { x: y = 3 } = { x: 5 }
y // 5

var { message: msg = 'Something went wrong' } = {}
msg // 'Something went wrong'
```

对象解构失败，变量的值为`undefined`

如果对象解构是嵌套模式，而模式的匹配不成功则会报错

## 字符串的解构赋值

```javascript
const [ a, b, c, d, e ] = 'hello'

a // 'h'
b // 'e'
c // 'l'
d // 'l'
e // 'o'

let { length: len } = 'hello'

len // 5
```

## 数值和布尔值的解构赋值

如果等号右边是数值和布尔值，则会先转为对象。

```javascript
let { toString: s } = 123
s === Number.prototype.toString // true

let { toString: s } = true
s === Boolean.prototype.toString // true
```

## 函数参数的解构赋值

```javascript
function add([x, y]) {
    return x + y
}

add([1, 2]) // 3
```

函数参数的解构也可以使用默认值

```javascript
function move({ x = 0, y = 0 } = {}) {
    return [x, y]
}
move({x: 3, y: 8}) // [3, 8]
move({x: 3}) // [3, 0]
move({}) // [0, 0]
move() // [0, 0]

/*
    函数move的参数是一个对象，通过对这个对象进行解构，得到变量x和y的值。如果解构失败，x和y等于默认值。如果实参为undefined,那么使用默认参数{}
*/
```

下面写法会得到不一样的结果

```javascript
function move({x, y} = { x: 0, y: 0 }) {
    return [x, y]
}

move({ x: 3, y: 8 }) // [3, 8]
move({ x: 3 }) // [3, undefined]
move({}) // [undefined, undefined]
move(); // [0, 0]
```

## 圆括号的问题

建议只要有可能，就不要在模式中放置圆括号。

**不能使用圆括号的情况**

1. 变量声明语句

```javascript
// 全部报错

let [(a)] = [1]

let {x: (c)} = {}
let {(x: c)} = {}
let ({x: c}) = {}
let {(x): c} = {}

let { o: ({ p: p }) } = { o: { p: 2 } }
```

2. 函数参数

函数参数属于变量声明，因此不能有圆括号。

```javascript
// 都报错
function f([(z)]) { return z }
function f([z, (x)]) { return x }
```

3. 赋值语句的模式

```javascript
// 报错
({ p: a }) = { p: 42 }
([a]) = [5]
/*
    在赋值语句中将整个模式放在圆括号中，导致报错
*/

[({ p: a }), { x: c }] = [{}, {}]

/*
    在赋值语句中将部分模式放在圆括号中，导致报错
*/
```

**可以使用圆括号的情况**

只有一种情况：赋值语句的非模式部分。

```javascript
[(b)] = [3]
({ p: (d) } = {})
[(parseInt.prop)] = [3]
```

## 用途

1. 交换变量的值

```javascript
let x = 1
let y = 2
[x, y] = [y, x]
```

2. 从函数返回多个值

方便从数组和对象返回值中取值

```javascript
// 返回数组
function example () {
    return [1, 2, 3]
}
let [a, b, c] = [1, 2, 3]

// 返回对象
function example () {
    return {
        foo: 1,
        bar: 2
    }
}
let { foo, bar } = example()
```

3. 函数参数定义

```javascript
// 有序参数
function f([x, y, z]) { ... }
f([1, 2, 3])
// 无序参数
function f({ x, y, z }) {
    ...
}
f({
    x: 1,
    y: 2,
    z: 3
})
```

4. 提取JSON数据

```javascript
let jsonData = {
    id: 42,
    status: "OK",
    data: [867, 5309]
}

let { id, status, data: number } = jsonData

id // 42
status // "OK"
number // [867, 5309]
```

5. 函数参数的默认值

```javascript
jQuery.ajax = function (url, {
    async = true,
    beforeSend = function () {},
    cache = true,
    complete = function () {},
    crossDomain = false,
    global = true,
    // ... more config
}) {
    // ... do stuff
}
/*
    可以避免在函数体内写 var foo = config.foo || 'default value'这样的语句。
*/
```

6. 遍历Map结构

任何部署了Iterator接口的对象，都可以用`for...of`循环遍历。配合解构赋值，可以很方便的从Map结构中取得键名和键值

```javascript
const map = new Map()
map.set('first', 'hello')
map.set('second', 'world')

for ( let [key, value] of Map )
 {
     console.log(key + "is" + value)
 }
```

7. 输入模块的指定方法

```javascript
const { SourceMapConsumer, SourceNode } = require('source-map')
```