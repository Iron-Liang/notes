# Reflect

## 概述

`Reflect`对象与`Proxy`对象一样，也是ES6为了操作对象而提供的新API。`Reflect`对象的设计目的为

1. 将`Object`对象的一些明显属于语言内部的方法（比如`Object.defineProperty`）,放在`Reflect`对象上。现阶段，某些方法同时在`Object`和`Reflect`对象上部署，未来新方法将只部署在`Reflect`对象上。
2. 修改某些`Object`方法的返回结果，让其变得更合理。比如`Object.defineProperty(obj, name, desc)`在无法定义属性时，会抛出一个错误，而`Reflect.defineProperty(obj, name, desc)`则会返回`false`
3. 让`Object`操作都变成函数行为。某些`Object`操作是命令式，比如`name in obj`和`delete obj[name]`而`Reflect.has(obj, name)`和`Reflect.deleteProperty(obj, name)`让它变成了函数行为。
4. `Reflect`对象与`Proxy`对象的方法一一对应，只要是`Proxy`对象的方法，就能在`Reflect`对象找到对应的方法。这就让`Proxy`对象可以方便的调用对应的`Reflect`方法，完成默认行为，作为修改的基础。也就是说，不管`Proxy`怎么修改默认行为，你总可以在`Reflect`上获取默认行为。

```javascript
Proxy(target, {
    set: function (target, name, value, receiver) {
        var success = Reflect.set(target, name, value, receiver)
        if (success) {
            log('property' + name + ' on' + target + ' set to ' + value)
        }
        return success
    }
})
```

## 静态方法

- Reflect.apply(target, thisArg, args)
- Reflect.construct(target, args)
- Reflect.get(target, name, receiver)
- Reflect.set(target, name, value, receiver)
- Reflect.defineProperty(target, name, desc)
- Reflect.deleteProperty(target, name)
- Reflect.has(target, name)
- Reflect.ownKeys(target)
- Reflect.isExtensible(target)
- Reflect.preventExtensions(target)
- Reflect.getOwnPropertyDescriptor(target, name)
- Reflect.getPrototypeOf(target)
- Reflect.setPrototypeOf(target, prototype)

**`Reflect.get(target, name, receiver)`**

`Reflect.get`方法查找并返回`target`对象的`name`属性，如果没有该属性，则返回`undefined`

```javascript
var myObject = {
    foo: 1,
    bar: 2,
    get baz () {
        return this.foo + this.bar
    }
}

Reflect.get(myObject, 'foo') // 1
Reflect.get(myObject, 'bar') // 2
Reflect.get(myObject, 'baz') // 3
```

如果`name`属性部署了读取函数（getter），则读取函数的`this`和`receiver`

```javascript
var myObject = {
    foo: 1,
    bar: 2,
    get baz () {
        return this.foo + this.bar
    }
}

var myReceiverObject = {
    foo: 4,
    bar: 4
}

Reflect.get(myObject, 'baz', myReceiverObject) // 8
```

**`Reflect.set(target, name, value, receiver)`**

`Reflect.set`方法设置`target`对象的`name`属性等于`value`。

```javascript
var myObject = {
    foo: 1,
    set bar (value) {
        return this.foo = value
    }
}

myObject.foo // 1

Reflect.set(myObject, 'foo', 2)
myObject.foo // 2

Reflect.set(myObject, 'bar', 3)
myObject.foo // 3
```

如果`name`属性设置了赋值函数，则赋值函数的`this`绑定`receiver`

```javascript
var myObject = {
    foo: 4,
    set bar(value) {
        return this.foo = value
    }
}

var myReceiverObject = {
    foo: 0
}

Reflect.set(myObject, 'bar', 1, myRevceiverObject)
myObject.foo // 4
myReceiverObject.foo // 1
```

> 如果Proxy对象和Reflect对象联合使用，前者拦截赋值操作，后者完成赋值的默认行为，而且传入了`receiver`那么`Reflect.set`会触发`Proxy.defineProperty`拦截

```javascript
let p = {
    a: 'a'
}

let handler = {
    set (target, key, value, receiver) {
        console.log('set')
        Reflect.set(target, key, value, receiver)
    },
    defineProperty (target, key, attribute) {
        console.log('defineProperty')
        Reflect.defineProperty(target, key, attribute)
    }
}

let obj = new Proxy(p, handler)
obj.a = 'A'
// set
// defineProperty
```

**`Reflect.has(obj, name)`**

`Reflect.has`方法对应`name in obj`里面的`in`运算符

```javascript
var myObject = {
    foo: 1
}

Reflect.has(myObject, 'foo') // true
```

**`Reflect.deleteProperty(obj, name)`**

`Reflect.deleteProperty`方法等同于`delete obj[name]`,用于删除对象属性

```javascript
const myObj = { foo: 'bar' }

Reflect.deleteProperty(myObj, 'foo')
```

该方法返回一个布尔值。如果删除成功，或者被删除的属性不存在，返回`true`；删除失败，被删除的属性依然存在，返回`false`

**`Reflect.construct(target, args)`**

等同于`new target(...args)`这提供了一种不适用`new`来调用构造函数的方法

```javascript
function Greeting(name) {
    this.name = name
}

const instance = Reflect.construct(Greeting, ['张三'])
```

**`Reflect.getPrototypeOf(obj)`**

`Reflect.getPrototypeOf`方法用于读取对象的`__proto__`属性，对应`Object.getPrototypeOf(obj)`

其中的一个区别是，如果参数不是对象，`Object.getPrototypeOf`会将这个参数转为对象，然后再运行，而`Reflect.getPrototypeOf`会报错

**`Reflect.setPrototypeOf`**

设置对象的`__proto__`属性，返回第一个参数对象，对应`Object.setPrototypeOf(obj, newProto)`

如果第一个参数不是对象，`Object.setPrototypeOf`会返回第一个参数本身，而`Reflect.setPrototypeOf`会报错。

**`Reflect.apply(func, thisArg, args)`**

