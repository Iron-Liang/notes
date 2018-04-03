# 对象的扩展

## 属性的简介表示法

直接写入变量和函数，作为对象的属性和方法。

```javascript
const foo = 'bar'
const baz = { foo }
baz // {foo: "bar"}

// 等同于

const baz = { foo: foo }
```

属性的赋值器（setter）和取值器（getter）

```javascript
const cart = {
    _wheels: 4,
    get wheels () {
        return this._wheels
    },
    set wheels () {
        if (value < this._wheels) {
            thorw new Error('数值太小了')
        }
        this._wheels = value
    }
}
```

如果某个方法的值是一个Generator函数，前面需要加上星号

```javascript
const obj = {
    * m() {
        yield 'hello world'
    }
}
```

## 属性名表达式

ES6允许字面量定义对象时，用表达式作为对象的属性名，（表达式必须放在方括号内）

```javascript
let propKey = "foo"

let obj = {
    [propKey]: true,
    ['a' + 'bc']: 123
}
```

表达式还可以用于定义方法名

```javascript
let obj = {
    ['h' + 'llo'] () {
        return 'hi'
    }
}

obj.hello() // 'hi'
```

> 属性名表达式和简洁表示不能同时使用，属性名表达式如果是一个对象，默认情况下会自动将对象转为字符串`'[object Object]'`

```javascript
const keyA = {a: 1}
const keyB = {b: 1}

const myObject = {
    [keyA]: 'valueA',
    [keyB]: 'valueB'
}

myObject // Object {[object Object]: "valueB"}
```

`[keyA]`和`[keyB]`得到的都是`[object Object]`所以`[keyB]`会把`[keyA]`覆盖掉

## 方法的name属性

如果对象的方法使用了取值函数（`getter`）和存值函数（`setter`），则`name`属性不是在该方法上面，而是方法的属性的描述对象的`get`和`set`属性上面，返回值是方法名前面加上`get`和`set`

```javascript
const obj = {
    set foo() {},
    get foo(x) {}
}

const descriptor = Object.getOwnPropertyDescriptor(obj, 'foo')
descriptor.get.name // 'get foo'
descriptor.set.name // 'set foo'
```

`bind`方法创造的函数，`name`属性返回`bound`加上原函数的名字，`Function`构造函数创造的函数，`name`属性返回`anonymous`

```javascript
(new Function()).name // "anonymous"

var doSomething = function () {
    ...
}
doSomething.bind().name // 'bound doSomething'
```

如果对象的方法是一个Symbol值，那么`name`属性返回的时这个Symbol值的描述

```javascript
const key1 = Symbol('description')
const key2 = Symbol()

let obj = {
    [key1] () {},
    [key2] () {}
}
obj[key1].name // "[description]"
obj[key2].name // ""
```

## `Object.is()`

ES6提出“Same-value equality”（同值相等）算法，用来解决这个问题。

`Object.is()`就是部署这个算法的新方法，用来比较两个值是否相等，与严格比较运算符（===）行为基本一致

```javascript
Object.is('foo', 'foo')
// true
Object.is({}, {})
// false
```

不同之处为

```javascript
+0 === -0 // true
NaN === NaN // false

Object.is(+0, -0) // false
Object.is(NaN) // true
```

## `Object.assign()`

**基本用法**

`Object.assign()`将源对象（source）所有可枚举属性，复制到目标对象（target）

```javascript
const target = { a: 1 }
const source1 = { b: 2 }
const source2 = { c: 3 }

Object.assign(target, source1, source2)
target // { a: 1, b: 2, c: 3 }
```

如果只有一个参数，返回该参数

```javascript
const obj = { a: 1 }
Object.assign(obj) === obj // true
```

首参数不是对象，转换为对象，然后返回

```javascript
typeof Object.assign(2) // "Object"
```

首参是`undefined`或`null`报错

非对象类型出现在非首参位置，不能被转换为对象的值会被忽略，能转换为对象，但除了字符串会以数组的形式，拷贝入对象，其他值都不会产生效果。（因为只有字符串的包装对象会产生枚举属性）

```javascript
const v1 = 'abc'
const v2 = true
const v3 = 10

const obj = Object.assign({}, v1, v2, v3)
console.log(obj) {'0': 'a', '1': 'b', '2': 'c'}

Object(true) // {[[PrimitiveValue]]: true}
Object(10) // {[[PrimitiveValue]]: 10}
Object('abc') // {0: 'a', 1: 'b', 2: 'c', length: 3, [[PrimitiveValue]]: 'abc'}
```

`Object.assign`拷贝是有限制的，只拷贝源对象的自身属性（不拷贝继承属性），也不拷贝不可枚举属性（`enumerable: false`）。

```javascript
Object.assign({b: 'c'},
    Object.defineProperty({}, 'invisible', {
        enumerable: false,
        value: 'hello'
    })
)
// {b: 'c'}
```

属性名为Symbol值的属性，也会被`Object.assign`拷贝

```javascript
Object.assign({a: 'b'}, { [Symbol('c')]: 'd' })
// { a: 'b', Symbol(c): 'd' }
```

**注意点**

1. 浅拷贝

`Object.assign`方法实行的是浅拷贝，而不是深拷贝。如果某个对象某个属性的值是对象，那么目标对象拷贝得到的是这个对象的引用。

```javascript
const obj1 = {a: {b: 1}}
const obj2 = Object.assign({}, obj1)

obj1.a.b = 2
obj2.a.b // 2
```

2. 同名属性的替换

对于这种嵌套的对象，一旦遇到同名属性，`Object.assign`的处理是替换，而不是添加（合并）。

```javascript
const target = {a: {b: 'c', d: 'e'}}
const source = {a: {b: 'hello'}}
Object.assign(target, source)
// {a: {b: 'hello'}}
/*
    不能得到{a: {b: 'hello', d: 'e'}}这样的结果
*/
```

一些函数库提供`Object.assign`的定制版本，（Lodash的`_.defaultsDeep`方法）可以得到深拷贝得合并。

3. 数组的处理

将数组视为对象

```javascript
Object.assign([1, 2, 3], [4, 5])
// [4, 5, 3]
```

4. 取值函数的处理

`Object.assign`指示进行值的赋值，如果要复制的值是一个取值函数，那么求值后再复制。

```javascript
const source = {
    get foo() { return 1 }
}
const target = {}

Object.assign(target, source)
// {foo: 1}
```

**常见用途**

1. 为对象添加属性

```javascript
class Point {
    constructor (x, y) {
        Object.assign(this, {x, y})
    }
}
```

2. 为对象添加方法

```javascript
Object.assign(SomeClass.prototype, {
    someMethod(arg1, arg2) {
        ...
    },
    anotherMethod() {
        ...
    }
})
```

3. 克隆对象

```javascript
function clone(origin) {
    return Object.assign({}, origin)
}
```

这种克隆方式只能克隆原始对象自身的值，不能克隆继承的值。想保持继承链，可以采用

```javascript
function clone(origin) {
    let originProto = Object.getPrototypeOf(origin)
    return Object.assign(Object.create(originProto), origin)
}
```

4. 合并多个对象

将多个对象合并到某个对象

```javascript
const merge = (...sources) => Object.assign({}, ...sources)
```

5. 为属性指定默认值

```javascript
const DEFAULTS = {
    logLevel: 0,
    outputFormat: 'html'
}

function processContent(options) {
    options = Object.assign({}, DEFAULTS, options)
    console.log(options)
}
```

> Object.assign是浅拷贝，如果属性值是对象，拷贝结果为覆盖而不是合并

## 属性的可枚举性和遍历

**可枚举性**

`Object.getOwnPropertyDescriptor`方法可以获取该属性的描述对象

```javascript
let obj = { foo: 123 }
Object.getOwnPropertyDescriptor(obj, 'foo')
/*
    {
        value: 123,
        writable: true,
        enumerable: true,
        configurable: true
    }
*/
```

描述对象的`enumerable`属性，称为“可枚举属性”，如果该属性为`false`，就表示某些操作会忽略当前属性。

目前有四个操作会忽略`enumerable`为`false`的属性

- `for...in`循环：只遍历对象自身的和继承的可枚举属性
- `Object.keys()`：返回对象自身的所有可枚举属性的键名
- `JSON.stringify()`：只串行化对象自身的可枚举属性
- `Object.assign()`：忽略`enumerable`为`false`的属性，只拷贝对象自身的可枚举属性

ES6规定，所有Class的原型的方法都是不可枚举的

```javascript
Object.getOwnPropertyDescriptor(class {foo() {}}.prototype, 'foo').enumerable
// false
```

**属性的遍历**

5种方法遍历对象的属性

1. `for...in`

`for...in`循环遍历对象自身的和继承的可枚举属性（不含Symbol属性）

2. `Object.keys(obj)`

`Object.keys`返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含Symbol属性）的键名

3. `Object.getOwnPropertyNames(obj)`

`Object.getOwnPropertyNames`返回一个数组，包括对象自身的所有属性（不含Symbol属性，但是包括不可枚举的属性）的键名

4. `Object.getOwnPropertySymbols(obj)`

`Object.getOwnPropertySymbols`返回一个数组，包含对象自身的所有Symbol属性的键名

5. `Reflect.ownKeys(obj)`

`Reflect.ownKeys`返回一个数组，包含对象自身的所有键名，不管键名是Symbol或字符串，也不管是否可枚举

5种方式遵守同一属性遍历的次序规则

- 首先遍历所有的数值键，按照数值升序排列
- 其次遍历所有字符串键，按照加入时间升序排列
- 最后遍历所有的Symbol键，按照加入时间升序排列

```javascript
let obj = {
    [Symbol()]: 0,
    b: 0,
    10: 0,
    2: 0,
    a: 0
}

Reflect.ownKeys(obj)

// ['2', '10', 'b', 'a', Symbol()]
```

## `Object.getOwnPropertyDescriptors()`

`Object.getOwnPropertyDescriptor`方法会返回某个对象属性的描述对象。

ES2017引入了`Object.getOwnPropertyDescriptors`方法，返回指定对象所有自身属性（非继承属性）的描述对象

```javascript
const obj = {
    foo: 123,
    get bar() {
        return 'abc'
    }
}
Object.getOwnPropertyDescriptors(obj)
/*
    {
        foo: {
            value: 123,
            writable: true,
            enumerable: true,
            configurable: true
        },
        bar: {
            get: [Function: get bar],
            set: undefined,
            enumerable: true,
            configurable: true
        }
    }
*/
```

使用`Object.getOwnPropertyDescriptors`来实现对`get`和`set`属性的拷贝

```javascript
const source = {
    set foo(value) {
        console.log(value)
    }
}
const target2 = {}
Object.defineProperties(target2, Object.getOwnPropertyDescriptors(source))
Object.getOwnPropertyDescriptor(target2, 'foo')
/*
    {
        get: undefined,
        set: [Function: set foo],
        enumerable: true,
        configurable: true
    }
*/
```

配合`Object.create`方法实现浅拷贝

```javascript
const clone = Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))

// 或者

const shallowClone = (obj) => Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj)
)
```

实现继承

```javascript
const obj = Object.create(prot)
obj.foo = 123

// 或者

const obj = Object.assign(
    Object.create(prot),
    {
        foo: 123
    }
)
```

使用`Object.getOwnPropertyDescriptors`

```javascript
const obj = Object.create(
    prot,
    Object.getOwnPropertyDescriptors({
        foo: 123
    })
)
```

实现Mixin(混入)模式

```javascript
let mix = (object) => ({
    with: (...mixins) => mixins.reduce(
        (c, mixin) => Object.create(
            c, Object.getOwnPropertyDescriptors(mixin)
        ),
        object
    )
})

let a = {a: 'a'}
let b = {b: 'b'}
let c = {c: 'c'}
let d = mix(c).with(a, b)

d.c // 'c'
d.b // 'b'
d.a // 'a'
```

## `__proto__`属性， `Object.setPrototypeOf()`, `Object.getPrototypeOf()`

ES6提供了更多的原型对象的操作

**`__proto__`属性**

读取或设置当前对象的`prototype`对象。所有浏览器都部署了这个属性。

```javascript
// es6
const obj = {
    method: function () { ... }
}
obj.__proto__ = someOtherObj

// es5
var obj = Object.create(someOtherObj)
obj.method = function () { ... }
```

只有流浪器环境部署，不建议使用，而是使用`Object.setPrototypeOf()`（写操作）、`Object.getPrototypeOf()`（读操作）、`Object.create()`（生成操作）代替。

实际上`__proto__`调用的是`Object.prototype.__proto__`

```javascript
Object.defineProperty(Object.prototype, '__proto__', {
    get () {
        let _thisObj = Object(this)
        return Object.getPrototypeOf(_thisObj)
    },
    set (proto) {
        if (this === undefined || this === null) {
            throw new TypeError()
        }
        if (!isObject(this)) {
            return undefined
        }
        if (!isObject(proto)) {
            return undefined
        }
        let status = Reflect.setPrototypeOf(this, proto)
        if (!status) {
            throw new TypeError()
        }
    }
})
```

如果一个对象本身部署了`__proto__`属性，该属性的值就是对象的原型

```javascript
Object.getPrototypeOf({
    __proto__: null
})

// null
```

**Object.setPrototypeOf()**

`Object.setPrototypeOf`方法作用与`__proto__`相同，用来设置一个对象的`prototype`对象，返回参数对象本身。ES6正式推荐的设置原型对象的方法。

```javascript
// 语法
Object.setPrototypeOf(object, prototype)

// 用法
const o = Object.setPrototypeOf({}, null)
```

示例

```javascript
let proto = {}
let obj = { x: 10 }
Object.setPrototypeOf(obj, proto)

proto.y = 20
proto.z = 40

obj.x // 10
obj.y // 20
obj.z // 40
```

**Object.getPrototypeOf()**

用于读取一个对象的原型对象

```javascript
Object.getPrototypeOf(obj)
```

示例

```javascript
function Rectangle() {
    // ...
}

const rec = new Rectangle()

Object.getPrototypeOf(rec) === Rectangle.prototype
// true

Object.setPrototypeOf(rec, Object.prototype)
Object.getPrototypeOf(rec) === Rectangle.prototype
// false
```

## super关键字

`this`关键字总是指向函数所在的当前对象，ES6又新增另外一个类似的关键字`super`，指向当前对象的原型对象。

```javascript
const proto = {
    foo: 'hello'
}

const obj = {
    foo: 'world',
    find () {
        return super.foo
    }
}

Object.setPrototypeOf(obj, proto)
obj.find() // 'hello'
```

> 注意：`super`关键字表示原型对象时，只能用在对象的方法中，在其他地方都会报错。

```javascript
// 报错
const obj = {
    foo: super.foo
}

// 报错
const obj = {
    foo: () => super.foo
}

// 报错
const obj = {
    foo: function () {
        return super.foo
    }
}
/*
    目前，只有对象方法的简写法，可以让javascript引擎确认，定义的是对象的方法。
*/
```

javascript引擎内部，`super.foo`相当于`Object.getPrototypeOf(this).foo`（属性）或`Object.getPrototypeOf(this).foo.call(this)`（方法）

```javascript
const proto = {
    x: 'hello',
    foo () {
        console.log(this.x)
    }
}

const obj = {
    x: 'world',
    foo () {
        super.foo()
    }
}

Object.setPrototypeOf(obj, proto)
obj.foo()
// world
/*
    super.foo指向原型对象proto的foo方法，但是绑定的this却还是当前对象obj,因此输出的就是'world'
*/
```

## `Object.keys()`,`Object.values()`,`Object.entries()`

**`Object.keys()`**

返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性键名。

```javascript
var obj = { foo: 'bar', baz: 42 }
Object.keys(obj)
// ['foo', 'baz']
```

ES2017引入配套的`Object.values`和`Object.entries`作为遍历对象的补充手段，供`for...of`循环使用。

**`Object.values()`**

`Object.values()`返回一个数组，成员是参数对象自身的（不含继承）所有可遍历（enumerable）属性的键值

```javascript
const obj = { foo: 'bar', baz: 42 }
Object.values(obj)
// ['b', 'c', 'a']
```

**`Object.entries`**

返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性键值对数组。

```javascript
const obj = { foo: 'bar', baz: 42 }
Object.entries(obj)
// [ ['foo', 'bar'], ['baz', 42] ]
```

除了返回值不通，该方法的行为与`Object.values`基本一致。

## 对象的扩展运算符

ES2018将数组的扩展运算符（`...`）引入了对象。

**解构赋值**

对象的解构赋值用于从一个对象取值，相当于将目标对象自身的所有可遍历的（enumerable）、但尚未被读取的属性、分配到指定的对象上面。所有的键和他们的值，都会拷贝到新的对象上面。

```javascript
{x, y, ...z} = { x: 1, y: 2, a: 3, b: 4 }

x // 1
y // 2
z // { a: 3, b: 4 }
```

对象的扩展运算符用于解构赋值，必须是最后一个参数，否则报错。

> 注意：解构赋值是浅拷贝，如果一个键的值是负荷类型的值（数组，对象，函数）那么解构赋值拷贝的是这个值的引用，而不是这个值的副本。

```javascript
let obj = { a: {b: 1} }
let {...x} = obj
obj.a.b = 2
x.a.b // 2
```

不能复制继承自原型对象的属性。

ES6规定变量声明语句找那个，如果使用解构赋值，扩展运算符后面必须是一个变量名，而不能是一个解构赋值表达式

```javascript
let {x, ...{y, z}} = o
// 报错
```

解构赋值可以扩展某个函数的参数，引入其他操作

```javascript
function baseFunction({ a, b }) {
    // ...
}
function wrapperFunction({x, y, ...restConfig}) {
    // 使用x和y参数进行操作
    // 其余参数传给原始函数
    return baseFunction(restConfig)
}
```

**扩展运算符**

对象的扩展运算符，用于取出参数对象的所有可遍历属性，拷贝到当前对象之中。

```javascript
let z = { a: 3, b: 4 }
let n = { ...z }
n // { a: 3, b: 4 }
```

只拷贝了对象实例的属性，如果想完整克隆一个对象，还拷贝对象原型的属性，可以采用

```javascript
const clone1 = {
    __proto__: Object.getPrototypeOf(obj),
    ...obj
}

// 或者

const clone2 = Object.assign(
    Object.create(Object.getPrototypeOf(obj)),
    obj
)

// 或者

const clone3 = Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj)
)
```

扩展运算符参数对象之中，如果有取值函数`get`,这个函数是会执行的

```javascript
let runtimeError = {
    ...a,
    ...{
        get x() {
            throw new Error('throw now')
        }
    }
}

// 抛出错误 因为x属性被执行了
```