# Symbol

ES5的对象名称都是字符串，这容易造成属性名的冲突。

`Symbol`是一种新的原始数据类型，表示独一无二的值。

Symbol值通过`Symbol`函数生成。凡是属性名属于Symbol类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

```javascript
let s = Symbol()
typeof s
// 'symbol'
```

> 注意：`Symbol`函数前不能使用`new`命令，否则会报错。这是因为生成的Symbol是一个原始类型的值，不是对象。是一种类似于字符串的数据类型。

`Symbol`函数可以接收一个字符串作为参数，表示对Symbol的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分。

```javascript
let s1 = Symbol('foo')
let s2 = Symbol('bar')

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // 'Symbol(foo)'
s2.toString() // 'Symbol(bar)'
```

如果`Symbol`的参数是一个对象，就会调用该对象的`toString`方法，将其转为字符串，然后生成一个Symbol值。

```javascript
const obj = {
    toString () {
        return 'abc'
    }
}

const sym = Symbol(obj)

sym // 'Symbol(abc)'
```

Symbol值不能和其他类型的值进行运算，会报错

```javascript
let sym = Symbol('My symbol')

"your symbol is " + sym
// TypeError: can't convert symbol to string
`your symobl is ${sym}`
// TypeError: can't convert symbol to sring
```

Symbol可以显式的转为字符串

```javascript
let sym = Symbol('my symbol')

String(sym) // 'Symbol(My symbol)'
sym.toString // 'Symbol(My symbol)'
```

也可以转化为布尔值，但不能转为数值

```javascript
let sym = Symbol()
Boolean(sym) // true
!sym // false
```

## 作为属性名的Symbol

作为属性名的Symbol可以防止属性名冲突

```javascript
let mySymbol = Symbol()

// 第一种写法
let a = {}
a[mySymbol] = 'Hello!'

// 第二种写法
let a = {
    [mySymbol]: 'Hello'
}

// 第三种写法
let a = {}
Object.defineProperty(a, mySymbol, { value: 'Hello!' })

a[maySymbol] // 'Hello!'
```

## 实例：消除魔法字符串

魔法字符串是指代码之中多次出现、与代码形成强耦合的某一个具体的字符串或者数值。

```javascript
function getArea(shape, options) {
    let area = 0

    switch (shape) {
        case 'Triangle': // 魔法字符串
            area = .5 * options.width * options.height
            break
    }

    return area
}

getArea('Triangle', { width: 100, height: 100 }) //魔法字符串
```

使用Symbol改写

```javascript
const shapeType = {
    triangle: Symbol()
}

function getArea(shape, options) {
    let area = 0

    switch (shape) {
        case shapeType.triangle:
            area = .5 * options.width * options.height
            break
    }

    return area
}

getArea(shapeType.triangle, { width: 100, height: 100 }) //魔法字符串
```

## 属性名的遍历

Symbol作为属性名，该属性不会出现在`for...in`、`for...of`循环中，也不会被`Object.keys()`、`Object.getOwnPropertyNames()`、`JSON.stringify()`返回。但是，它也不是私有属性，方法`Object.getOwnPropertySymbols`可以获取指定对象的所有Symbol属性名。

`Object.getOwnPropertySymbols`方法返回一个数组，成员是当前对象的所有用作属性名的Symbol值

```javascript
const obj = {}
let a = Symbol('a')
let b = Symbol('b')

obj[a] = 'Hello'
obj[b] = 'World'

const objSymbols = Object.getOwnPropertySymbols(obj)

objSymbols
// [Symbol(a), Symbol(b)]
```

新API，`Reflect.ownKeys`方法可以返回所有类型的键名，包括常规键名和Symbol键名

```javascript
let obj = {
    [Symbol('my_key')]: 1,
    enum: 2,
    nonEnum: 3
}

Reflect.ownKeys(obj)

// ['enum', 'nonEnum', Symbol(my_key)]
```

## `Symbol.for()`,`Symbol.keyFor()`

`Symbol.for`允许我们重新使用同一个Symbol值。

它接收一个字符串作为参数，然后搜索有没有以该参数作为名称的Symbol值。如果有，就返回这个Symbol值，否则就新建一个以该字符串作为名称的Symbol值。

```javascript
let s1 = Symbol.for('foo')
let s2 = Symbol.for('foo')

s1 === s2
// true
```

`Symbol.keyFor()`方法返回一个已登记的Symbol类型值的`key`

```javascript
let s1 = Symbol.for('foo')
Symbol.keyFor(s1)

// 'foo'

let s2 = Symbol('foo')
Symbol.keyFor(s2)

// undefined
```

> `Symbol.for`为Symbol值登记的名字，是全局环境的，可以在不同的iframe或service worker中取到同一个值

## 实例：模块的Singleton模式

Singleton模式（单例模式）是指调用一个类，任何时候返回的都是同一实例。

Node中的模块文件可以看出是一个类。怎么保证每次执行这个模块文件，返回的都是同一个实例呢？

一个办法是将实例放到顶层对象`global`

```javascript
// mod.js
function A() {
    this.foo = 'hello'
}

if (!global._foo) {
    global._foo = new A()
}

module.exports = global._foo
```

问题是全局变量`global._foo`是可写的,任何文件都可以修改

```javascript
global._foo = { foo: 'world' }

const a = require('./mod.js')
console.log(a.foo)
// 'world'
```

为了防止这种情况，可以使用Symbol

```javascript
const FOO_KEY = Symbol.for('foo')

function A() {
    this.foo = 'hello'
}

if (!global[FOO_KEY]) {
    global[FOO_KEY] = new A()
}

module.exports = global[FOO_KEY]
```

## 内置的Symbol值

ES6定义了6个内置的Symbol值，指向语言内部使用的方法

**Symbol.hasInstance**

使用`instanceof`运算符，会调用这个方法。比如`foo instanceof Foo`实际上调用的是`Foo[Symbol.hasInstance](foo)`

**Symbol.isConcatSpreadable**

对象的`Symbol.isConcatSpreadable`属性等于一个布尔值，表示该对象用于`Array.proptotype.concat()`时，是否可以展开

```javascript
let arr1 = ['c', 'd']
['a', 'b'].concat(arr1, 'e') // ['a', 'b', 'c', 'd', 'e']
arr1[Symbol.isConcatSpreadable] // undefined

let arr2 = ['c', 'd']
arr2[Symbol.isConcatSpreadable] = false
['a', 'b'].concat(arr2, 'e') // ['a', 'b', ['c', 'd'], 'e']
```

数组的默认行为是可以展开的。`Symbol.isConcatSpreadable`属性为`false`的时候不展开

类似数组对象正好相反，默认不展开，它的`Symbol.isConcatSpreadable`属性设为`true`才可以展开

```javascript
const obj = {
    length: 2,
    0: 'c',
    1: 'd'
}

['a', 'b'].concat(obj, 'e') // ['a', 'b', obj, 'e']

obj[Symbol.isConcatSpreadable] = true
['a', 'b'].concat(obj, 'e') // ['a', 'b', 'c', 'd', 'e']
```

**Symbol.species**

对象的`Symbol.species`属性，指向一个构造函数。创建衍生对象时，会使用该属性。

```javascript
class A1 extends Array {
}

class A2 extends Array {
    static get [Symbol.species] () {
        return Array
    }
}

const a1 = new A1()
const _a1 = a1.map(x => x)
const a2 = new A2()
const _a2 = a2.map(x => x)

_a1 instanceof A1 // true
_a2 instanceof A2 // false
```

实例对象在运行过程中，需要再次调用自身的构造函数时，会调用该属性指定的构造函数

**Symbol.match()**

对象的`Symbol.match`属性，指向一个函数，当执行`str.match(myObject)`时，如果该属性存在，会调用它，返回该方法的一个返回值。

```javascript
String.prototype.match(regexp)
// 等同于
regexp[Symbol.match](this)

class MyMatcher {
    [Symbol.match](string) {
        return 'hello world'.indexOf(string)
    }
}

'e'.match(new MyMatcher()) // 1
```

**Symbol.replace**

对象的`Symbol.replace`属性，指向一个方法，当该对象被`String.prototype.replace`方法调用时，会返回该方法的返回值

```javascript
String.prototype.replace(searchValue, replaceValue)
// 等同于
searchValue[Symbol.replace](this, replaceValue)
```

**Symbol.search**

对象的`Symbol.search`属性，指向一个方法，当该对象被`String.prototype.search`方法调用时，会返回该方法的返回值。

```javascript
String.prototype.search(regexp)
// 等同于
regexp[Symbol.search](this)
```

**Symbol.split**

对象的`Symbol.splite`属性，指向一个方法，当该对象被`String.prototype.split`方法调用时，会返回该方法的返回值

```javascript
String.prototype.split(separator, limit)
// 等同于
separator[Symbol.split](this, limit)
```

**Symbol.iterator**

对象的`Symbol.iterator`属性，指向该对象的默认遍历器方法。

```javascript
const myIterable = {}
myIterable[Symbol.iterator] = function () {
    yield 1;
    yield 2;
    yield 3;
}
[...myIterable] // [1, 2, 3]
```

**Symbol.toPrimitive**

对象的`Symbol.toPrimitive`属性，指向一个方法。该对象被转为原始类型的值时，会调用这个方法，返回该对象的原始类型值。

`Symbol.toPrimitive`被调用的时候，会接收一个字符串参数，表示当前运算的模式，一个三种模式

- Number:该场合需要转换成数值
- String:该场合需要转换成字符串
- Default:该场合可以转成数值，也可以转成字符串

```javascript
let obj = {
    [Symbol.toPrimitive](hint) {
        switch (hint) {
            case 'number':
                return 123
            case 'string':
                return 'str'
            case 'default':
                return 'default'
            default:
                throw new Error()
        }
    }
}

2 * obj // 246
3 + obj // '3default'
obj === 'default' // true
String(obj) // 'str'
```

**Symbol.toStringTag**

对象的`Symbol.toStringTag`属性，指向一个方法。在该对象上面调用`Object.prototype.toString`方法时，如果这个属性存在，它的返回值会出现在`toString`方法返回的字符串之中，表示对象的类型。

```javascript
({ [Symbol.toStringTag]: 'Foo' }.toString())
// '[Object Foo]'
```