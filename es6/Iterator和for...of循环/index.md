# `Iterator`和`for...of`循环

## 概念

遍历器（Iterator）是一种接口，为不同的数据结构，提供统一的访问机制。任何数据结构只要部署Iterator接口，就可以完成遍历操作。

Iterator的作用：

1. 为各种数据结构，提供一个统一的、简便的访问接口。

2. 使得数据结构和成员能够按某种次序排列。

3. 供`for...of`循环消费。

## 默认Iterator接口

ES6规定，默认的Itertor接口部署在数据结构的`Symbol.iterator`属性，或者说，一个数据结构只要有`Symbol.iterator`属性，就可以认为是“可遍历的”。

`Symbol.iterator`本身是一个函数，就是当前数据结构默认的遍历器生成函数。执行这个函数，就会返回一个遍历器。

```javascript
const obj = {
    [Symbol.iterator]: function () {
        return {
            next: function () {
                return {
                    value: 1,
                    done: true
                }
            }
        }
    }
}

// 遍历器的本质特征是具有next方法，每次调用next方法都会返回一个代表当前成员信息对象，具有value和done两个属性。
```

原生具备Iterator接口的数据结构如下。

- Array
- Map
- Set
- String
- TypedArray
- 函数的arguments对象
- NodeList对象

数组的`Symbol.iterator`属性

```javascript
let arr = ['a', 'b', 'c']
let iter = arr[Symbol.iterator]()

iter.next() // { value: 'a', done: false }
iter.next() // { value: 'b', done: false }
iter.next() // { value: 'c', done: false }
iter.next() // { value: 'undefined', done: true }
```

一个对象如果要具备可被`for...of`循环调用的Iterator接口，就必须在`Symbol.iterator`的属性上部署遍历器生成方法(原型链上具有该方法也可)

```javascript
class RangeIterator {
    constructor (start, stop) {
        this.value = start
        this.stop = stop
    }

    [Symbol.iterator] () { return this }

    next () {
        var value = this.value
        if (value < this.stop) {
            this.value++
            return { done: false, value: value }
        } else {
            return { done: true, value: undefined }
        }
    }
}

function range (start, stop) {
    return new RangeIterator(start, stop)
}

for (var value of range(0, 3)) {
    console.log(value) // 0, 1, 2
}
```

类似数组的对象（存在数值键名和`length`属性），部署Iterator接口，有一个简便方法，就是`Symbol.iterator`方法直接引用数组的Iterator接口。

```javascript
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
```

## 调用Iterator接口的场合

1. 解构赋值

对数组和Set结构进行解构赋值时，会默认调用`Symbol.iterator`方法

```javascript
let set = new Set().add('a').add('b').add('c')

let [x, y] = set
// x = 'a', y = 'b'

let [first, ...rest] = set
// first = 'a', rest = ['b', 'c']
```

2. 扩展运算符

扩展运算符（`...`）也会默认调用Iterator接口

3. yield*

`yield*`后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。

4. 其他场合

- for...of
- Array.from()
- Map(), Set(), WeakMap(), WeakSet()
- Promise.all()
- Promise.race()

## Iterator和Generator函数

`Symbol.iterator`方法最简单的实现

```javascript
let myIterable = {
    [Symbol.iterator]: function* () {
        yield 1
        yield 2
        yield 3
    }
}

[...myIterable] // [1, 2, 3]
```

## 遍历器对象的return()

`return`方法的使用场景是，如果`for...of`循环提前退出（通常是因为出错或者有`break`语句或`continue`语句），就会调用`return`方法。