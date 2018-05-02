# Proxy

## 概述

Proxy用来修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”，对编程语言进行编程。

Proxy可以理解成在目标对象之前架设一层“拦截”，外界对该对象的访问，都必须先通过这层拦截，因此提供了一种机制，可以对外界的访问进行过滤和改写。

```javascript
var obj = new Proxy({}, {
    get (target, key, receiver) {
        console.log(`getting ${key}!`)
        return Reflect.get(target, key, receiver)
    },
    set (target, key, value, receiver) {
        console.log(`setting ${key}!`)
        return Reflect.set(target, key, value, receiver)
    }
})

obj.count = 1
// setting count
++obj.count
// getting count
// setting count
// 2
```

ES6提供原生的Proxy构造函数，用来生成Proxy实例

```javascript
var proxy = new Proxy(target, handler)
```

`target`参数表示所要拦截的目标对象，`handler`参数也是一个对象，用来定制拦截行为。

> 注意：要使`Proxy`起作用，必须针对`Proxy`实例（上例是`proxy`对象）进行操作，而不是针对目标对象进行操作。

如果handler没有设置任何拦截，那就等于直接通向对象

```javascript
var target = {}
var hanlder = {}
var proxy = new Proxy(target, handler)
proxy.a = 'b'
target.a // 'b'
```

将Proxy对象，设置到`object.proxy`属性，从而可以在`object`对象上调用

```javascript
var object = { proxy: new Proxy(target, hanlder) }
```

Proxy实例也可以作为其他对象的原型对象

```javascript
var proxy = new Proxy({}, {
    get (target, property) {
        return 35
    }
})

let obj = Object.create(proxy)
obj.time // 35
```

对于可以设置，但没有设置拦截的操作，直接落到目标对象上，按照原先的方式产生结果

Proxy可以设置的拦截操作一览

- `get(target, propKey, receiver)`: 拦截对象属性的读取，比如`proxy.foo`和`proxy['foo']`
- `set(target, propKey, value, receiver)`: 拦截对象属性的设置，比如`proxy.foo = v`或`proxy['foo'] = v`返回一个布尔值代表是否成功设置
- `has(target, propKey)`: 拦截`propKey in proxy`的操作，返回一个布尔值
- `ownKeys(target)`: 拦截`Object.getOwnPropertyNames(proxy)`、`Object.getOwnPropertySymbols(proxy)`、`Object.keys(proxy)`、`for...in`循环，返回一个数组。该方法的返回目标对象所有自身的属性的属性名，而`Object.keys()`的返回结果仅包括目标对象自身的可遍历属性。
- `getOwnPropertyDescriptor(target, propKey)`: 拦截`Object.getOwnPropertyDescriptor(proxy, propKey)`: 返回属性的描述对象。
- `defineProperty(target, propKey, propDesc)`: 拦截`Object.defineProperty(proxy, propKey, propDesc)`、`Object.defineProperties(proxy, propDesc)`，返回一个布尔值。
- `presentExtensions(target)`: 拦截`Object.preventExtensions(proxy)`返回一个布尔值
- `getPrototypeOf(target)`: 拦截`Object.getPrototypeOf(proxy)`，返回一个对象
- `isExtensibble(target)`: 拦截`Object.isExtensible(proxy)`，返回一个布尔值。
- `setPrototypeOf(target, proto)`: 拦截`Object.setPrototypeOf(proxy, proto)`,返回一个布尔值。

如果目标对象是函数，还有两种额外的操作可以拦截

- `apply(target, object, args)`: 拦截Proxy实例作为函数调用操作，比如`proxy(...args)`、`proxy.call(object, ...args)`、`proxy.apply(...)`。
- `construct(target, args)`: 拦截Proxy实例作为构造函数的调用操作，比如`new proxy(...args)`

## Proxy实例的方法

拦截方法的详细介绍

**`get()`**

`get`方法拦截某个属性的读取操作，可以接受三个参数分别为目标对象、属性名和proxy实例本身，最后一个参数可选

```javascript
var person = {
    name: '张三'
}

var proxy = new Proxy(person, {
    get (target, property) {
        if (property in person) {
            return person[property]
        } else {
            throw new ReferenceError("Property \"" + property + "\" does not exit.)
        }
    }
})

proxy.name // '张三'
proxy.age // 抛出错误
```

`get`可以继承

```javascript
let proto = new Proxy({}, {
    get (target, propertyKey, receiver) {
        console.log('GET ' + propertyKey)
        return target[propertyKey]
    }
})

let obj = Object.create(proto)

obj.foo // "GET foo"
```

利用Proxy将`.`操作转换为执行某个函数，实现属性的链式操作

```javascript
var pipe = (function () {
    return function (value) {
        var funcStack = []
        var oproxy = new Proxy({}, {
            get: function (pipeObject, fnName) {
                if (fnName === 'get') {
                    return funcStack.reduce(function (val, fn) {
                        return fn(val)
                    }, value)
                }
                funcStack.push(window[fnName])
                return oproxy
            }
        })
        return oproxy
    }
}())

var double = n => n * 2
var pow = n => n * n
var reverseInt = n => n.toString().split('').reverse().join('') | 0
pipe(3).double.pow.reverseInt.get // 63
```

> 如果一个属性不可配置（configurable）和不可写（writable），则该属性不能被代理，通过Proxy对象访问该属性会报错。

**`set()`**

`set`方法用来拦截某个属性的赋值操作，可以接受四个参数，依次为目标对象、属性名、属性值和Proxy实例本身，其中最后一个参数可选。

使用`set`限制对象的赋值

```javascript
let validator = {
    set: function (obj, prop, value) {
        if (prop === 'age') {
            if (!Number.isIneger(value)) {
                throw new TypeError('The age is not an integer')
            }
            if (value > 200) {
                throw new RangeError('The age seems invalid')
            }
        }
        obj[prop] = value
    }
}
let person = new Proxy({}, validator)
person.age = 100
person.age // 100

person.age = 'young' // 报错
person.age = 300 // 报错
```

> 如果目标对象的某个属性不可写或者不可配置，那么`set`方法将不起作用。

**`apply()`**

`apply`拦截函数的调用、`call`和`apply`操作。

`apply`方法可以接受三个参数，分别是目标对象、分别是目标对象、目标对象上下文（`this`）和目标对象的参数数组。

```javascript
var handler = {
    apply (target, ctx, args) {
        return Reflect.apply(...argements)
    }
}
```

**`has`**

拦截`hasProperty`操作，即判断对象是否具有某个属性时，这个方法生效。点型的操作就是`in`运算符。

```javascript
var hanlder = {
    has (target, key) {
        if (key[0] === '_') {
            return false
        }
        return key in target
    }
}
var target = { _prop: 'foo', prop: 'foo' }
var proxy = new Proxy(target, handler)
'_prop' in proxy // false
```

如果原对象不可配置或者静止扩展，这时`has`拦截会报错。

```javascript
var obj = { a: 10 }
Object.preventExtensions(obj)

var p = new Proxy(obj, {
    has: function (target, prop) {
        return false
    }
})

'a' in p // TypeError is thrown 
```

`has`方法拦截的是`hasProperty`方法，而不是`hasOwnProperty`操作，即`has`方法不判断一个属性是对象自身属性，还是继承属性。

虽然`for...in`循环也用到了`in`运算符，但是`has`拦截对`for...in`循环不生效

```javascript
let stu1 = { name: '张三', score: 59 }
let stu2 = { name: '李四', score: 99 }

let handler = {
    has (target, prop) {
        if (prop === 'score' && target[prop] < 60) {
            console.log(`${target.name}不及格`)
            return false
        }
        return prop in target
    }
}

let oproxy1 = new Proxy(stu1, handler)
let oproxy2 = new Proxy(stu2, handler)

'score' in oproxy1
// 张三 不及格
// false

'score' in oproxy2
// true

for (let a in oproxy1) {
    console.log(oproxy1[a])
}
// 张三
// 59

for (let b in oproxy2) {
    console.log(oproxy2[b])
}

// 李四
// 99
```

**`construct`**

拦截`new`命令

```javascript
var handler = {
    construct (target, args, newTarget) {
        return new target(...args)
    }
}
```

接受两个参数

- `target`: 目标对象
- `args`: 构造函数参数对象

```javascript
var p = new Proxy(function () {}, {
    construct: function (target, args) {
        console.log('called:' + args.join(','))
        return { value: args[0] * 10 }
    }
})

(new p(1)).value

// 'called: 1'
// 10
```

> construct方法返回值必须是一个对象，否则会报错

**`deleteProperty()`**

`deleteProperty`方法用于拦截`delete`操作，如果这个方法抛出错误或者返回`false`，当前属性就无法被`delete`命令删除

```javascript
var handler = {
    deleteProperty (target, key) {
        invariant(key, 'delete')
        return true
    }
}
function invariant (key, action) {
    if (key[0] === '_') {
        throw new Error(`Invalid attempt to ${action} private "${key}" property`)
    }
}

var target = { _prop: 'foo' }
var proxy = new Proxy(target, handler)
delete proxy._prop
// Error: Invalid attempt to delete private "_prop" property
```

> 目标对象自身的不可以配置（configurable）的属性，不能被`deletePorperty`方法删除，否则报错。

**`defineProperty()`**

拦截`Object.defineProperty操作`

```javascript
var handler = {
    defineProperty (target, key, descriptor) {
        return false
    }
}
var target = {}
var proxy = new Proxy(target, handler)
proxy.foo = 'bar'
// TypeError: proxy defineProperty handler returned false for property
```

> 如果目标对象不可扩展（extensible），则`defineProperty`不能增加目标对象上不存在的属性，否则会报错。如果目标对象某个属性不可写（writable）或不可配置（configurable），则`defineProperty`方法不得改变这两个设置。

**`getOwnPropertyDescriptor()`**

`getOwnPropertyDescriptor`方法拦截`Object.getOwnDescriptor()`,返回一个属性描述对象或者`undefined`

```javascript
var handler = {
    getOwnPropertyDescriptor (target, key) {
        if (key[0] === '_') {
            return
        }
        return Object.getOwnPropertyDescriptor(target, key)
    }
}
var target = { _foo: 'bar', baz: 'tar' }
var proxy = new Proxy(target, handler)
Object.getOwnPropertyDescriptor(proxy, 'wat')
// undefined
Object.getOwnPropertyDescriptor(proxy, '_foo')
// undefined
Object.getOwnPropertyDescriptor(proxy, 'baz')
/*
    {
        value: 'tar',
        configurable: true,
        writable: true,
        enumerable: true
    }
*/
```

**`getPrototypeOf()`**

拦截对象原型，具体拦截以下操作

- `Object.prototype.__proto__`
- `Object.prototype.isPrototypeOf()`
- `Object.getPrototypeOf()`
- `Reflect.getPrototypeOf()`
- `instanceof`

```javascript
var proto = {}
var p = new Proxy({}, {
    getPrototypeOf(target) {
        return proto
    }
})
Object.getPrototypeOf(p) === proto // true
```

> 返回值必须是对象或者`null`，否则报错。如果对象不可扩展（extensible）`getPrototypeOf`方法必须返回目标对象的原型对象。

**`isExtensible()`**

拦截`Object.isExtensible`操作

```javascript
var p = new Proxy({}, {
    isExtensible: function (target) {
        console.log('called')
        return true
    }
})

Object.isExtensible(p)
// 'called'
// true
```

> 该方法只能返回布尔值，否则返回值会被自动转为布尔值。它的返回值必须与目标对象的`isExtensible`属性保持一致，否则就会抛出错误。

```javascript
var p = new Proxy({}, {
    isExtensible: function (target) {
        return false
    }
})

Object.isExtensible(p)
```

**`ownKeys()`**

拦截对象自身属性的读取操作，拦截以下操作：

- `Object.getOwnPropertyNames()`
- `Object.getOwnPropertySymbols()`
- `Object.keys()`
- `for...in`循环

```javascript
let target = {
    a: 1,
    b: 2,
    c: 3
}

let handler = {
    ownKeys(target) {
        return ['a']
    }
}

let proxy = new Proxy(target, handler)
Object.keys(proxy)

// ['a']
```

使用`Object.keys()`时，有三类属性会被`ownKeys`方法自动过滤，不会返回

- 目标对象上不存在的属性
- 属性名为Symbol值
- 不可遍历（enumerable）的属性

```javascript
let target = {
    a: 1,
    b: 2,
    c: 3,
    [Symbol.for('secret')]: '4'
}

Object.defineProperty(target, 'key', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: 'static'
})

let handler = {
    ownKeys (target) {
        return ['a', 'd', Symbol.for('secret'), 'key']
    }
}

let proxy = new Proxy(target, handler)

Object.keys(proxy)
// ['a']
// 自动过滤不可遍历属性，symbol属性和不存在的属性
```

`ownKeys`方法拦截`Object.getOwnPropertyNames()`

```javascript
var p = new Proxy({}, {
    ownKeys: function (target) {
        return ['a', 'b', 'c']
    }
})

Object.getOwnPropertyNames(p)
// ['a', 'b', 'c']
```

> `ownKeys`返回的数组成员，只能是字符串或者Symbol值。如果有其它类型的值或者返回值根本就不是数组，就会报错。如果目标对象自身包含不可配置属性，该属性必须被`ownKeys`方法返回，否则报错。最后，如果目标对象是不可扩展的，这时，`ownKeys`方法返回数组中，必须包含原对象所有属性，且不能包含多余的属性，否则报错。

**preventExtensions()**

`preventExtensions`方法拦截`Object.preventExtensions()`该方法必须返回一个布尔值，否则会被自动转为布尔值。

该方法有一个限制，只有目标对象不可扩展时（即`Object.isExtensible(proxy)`为`false`）`proxy.preventExtensions`才能返回`true`,否则会报错。

**`setPrototypeOf()`**

该方法主要拦截`Object.setPrototypeOf`方法

该方法只能返回布尔值，否则会自动转为布尔值。另外，如果目标对象不可扩展（extensible），`setPrototypeOf`方法不得改变目标对象的原型。

## `Proxy.revocable()`

返回一个可取消的Proxy实例

```javascript
let target = {}
let handler = {}

let { proxy, revoke } = Proxy.revocable(target, handler)

proxy.foo = 123
proxy.foo // 123

revoke()
proxy.foo // TypeError: Revoked
```

目标不允许访问，必须通过代理访问，一旦访问结束，就收回代理，不允许再次访问。

## this问题

在Proxy代理的情况下，目标对象内部的`this`关键字会指向Proxy代理。

```javascript
const target = {
    m: function () {
        console.log(this === proxy)
    }
}
const handler = {}

const proxy = new Proxy(target, handler)

target.m() // false
proxy.m() // true
```

`this`指向变化，导致Proxy无法代理目标对象

```javascript
const _name = new WeakMap()

class Person {
    constructor (name) {
        _name.set(this, name)
    }
    get name () {
        return _name.get(this)
    }
}

const jane = new Person('Jane')
jane.name // 'Jane'
const proxy = new Proxy(jane, {})
proxy.name // undefined
```