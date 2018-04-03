# js中的`Object.defineProperty()`和`defineProperties()`

> ECMA-262第5版在定义只有内部采用的特性时，提供了描述了属性特征的描述对象。ECMAScript对象中目前存在的属性描述符主要有两种，数据描述符（数据属性）和存取描述符（访问器属性），属性描述符是一个拥有可写或不可写值的属性。存取描述符是由一对getter-setter函数功能来描述的属性。

`defineProperty`和`defineProperties`用来*定义或修改这些内部属性*，与之向对应的`getOwnPropertyDescriptor`和`getOwnPropertyDescriptors`就是获取这些内部属性的描述。

## 数据（数据描述符）属性

数据属性有4个描述内部属性的特性

**`[[Configurable]]`**

表示能否通过`delete`删除此属性，能否修改属性的特性，或者能否修改把属性修改为访问器属性，如果直接使用字面量定义对象，默认值为`true`
___

**`[[Enumerable]]`**

该属性是否可枚举，关系到能否通过`for...in`循环或`Object.keys()`返回属性，如果使用字面量定义对象，默认值为`true`
___

**`[[Writable]]`**

能否修改属性的值，如果直接使用字面量定义对象，默认为`true`
___

**`[[Value]]`**

该属性对应的值，默认为`undefined`
___

## 访问器（存取描述符）属性

访问器属性也有4个描述内部属性的特性

**`[[Configurable]]`**

和数据属性的`[[Configurable]]`一样
___

**`[[Enumerable]]`**

和数据属性的`[[Enumerable]]`一样
___

**`[[Get]]`**

一个给属性提供getter的方法（访问对象属性时调用的函数，返回值就是当前的属性的值），如果没有getter则为`undefined`。该方法的返回值被用作属性值。

**`[[Set]]`**

一个给属性提供setter的方法（给对象属性设置值时调用的函数），如果没有setter则为undefined。该方法将接受唯一参数，并将该参数的新值重新分配给该属性。默认为`undefined`

## 创建、修改、获取属性的方法

**`Object.defineProperty()`**

- 功能

直接在一个对象上定义一个新属性，或者修改一个对象现有属性，并返回这个对象。*如果不指定configurable、wriable、enumerable，则这些属性默认值为`false`*，*如果不指定`value`,get,set则这些属性默认值为`undefined`*

- 语法

```javascript
Object.defineProperty(obj, prop, descriptor)
```

- 参数
    - obj: 需要被操作的目标对象
    - property: 目标对象需要定义或修改的属性的名称
    - descriptor: 将定义或修改的属性的描述符

- 示例

```javascript
var obj = new Object()
obj.defineProperty(obj, 'name', {
    configurable: false,
    writable: true,
    enumerable: true,
    value: '张三'
})

obj.name // '张三'
```

**`Object.defineProperties()`**

- 功能

直接在一个对象上定义一个或多个新的属性或修改现有属性，并返回该对象

- 语法

```javascript
Object.defineProperties(obj, props)
```

- 参数
    - obj: 将要被添加属性或修改属性的对象
    - props: 该对象的一个或多个键值对定义了将要为对象添加或修改的属性的具体配置

- 示例

```javascript
const obj = new Object()
Object.defineProperties(obj, {
    name: {
        value: '张三',
        configurable: false,
        writable: true,
        enumerable: true
    },
    age: {
        value: 18,
        writable: true
    }
})
console.log(obj.name, obj.age) // '张三'， 18
```

**Object.getOwnPropertyDescriptor()**

- 功能

返回指定对象上一个自有属性对应的属性描述符。（自有属性指的是直接赋予该对象的属性，不需要原型链上进行查找的属性--非继承属性）

- 语法

```javascript
Object.getOwnPropertyDescriptor(obj, prop)
```

- 参数
    - obj: 需要查找的目标对象
    - prop: 目标对象内属性名称

- 示例

```javascript
var person = {
    name: '张三',
    age: 18
}

var dec = Object.getOwnPropertyDescriptor(person, 'name')
```

**Object.getOwnPropertyDescriptors()**

- 功能

所指定对象的所有自身属性的描述符，如果没有任何自身属性，则返回空对象

- 语法

```javascript
Object.getOwnPropertyDescriptors(obj)
```

- 参数
    - obj: 需要查找的目标对象

- 示例

```javascript
var person = {
    name: '张三',
    age: 18
}

var dec = Object.getOwnPropertyDescriptors(person)
console.log(dec)
/*
    {
        name: {
            configurable: true,
            writable: true,
            value: '张三'，
            enumerable: true
        },
        age: {
            configurable: true,
            enumerable: true,
            age: 18,
            writable: true
        }
    }
*/
```

## 深入描述符属性

**configurable**

`configurable`为`false`的对象属性，不能使用`delete`操作符删除（在严格模式下抛错），修改所有内部属性值都会抛出错误。

```javascript
const person  = {}

// 定义时不设置writable为true则不能修改所有内部属性，若设writable为true则可以修改writable和value

Object.defineProperty(person, 'name', {
    configurable: false,
    writable: true,
    value: 'John'
})

delete person.name // 严格模式下报错

console.log(person.name) // 'John'

Object.defineProperty(person, 'name', {
    configurable: true
}) // 报错

Object.defineProperty(person, 'name', {
    enumerable: true
}) // 报错

Object.defineProperty(person, 'name', {
    writable: false
})

person.name = 'Rose' // 严格模式报错

person.name

// 'John' writable修改为false,对name重新赋值失败
```