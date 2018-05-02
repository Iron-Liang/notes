# Set和Map数据结构

## Set

ES6提供新的数据结构Set。类似于数组，但是成员的值都是唯一的，没有重复的值。

```javascript
const s = new Set()
[2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x))

for (let i of s) {
    console.log(i)
}

// 2 3 5 4
```

Set函数可以接收一个数组（或者具有iterable接口的其他数据结构）作为参数，用来初始化。

```javascript
const set = new Set([1, 2, 3, 4, 4])
[...set]
// [1, 2, 3, 4]

const items = new Set([1, 2, 3, 4, 5, 5, 5])
items.size // 5

const set = new Set(document.querySelectorAll('div'))
set.size // 56
```

数组去重

```javascript
[...new Set(array)]
```

向Set加入值的时候，不会发生类型转换，`5`和`'5'`是两个不同的值。Set内部判断两个值是否相等，使用的算法叫做“Same-value-zero equality”,类似于精确相等运算符（`===`），但认为`NaN`等于自身。

### Set的属性和方法

Set结构的实例有以下属性。

- `Set.prototype.constructor`: 构造函数，默认就是`Set`函数
- `Set.prototype.size`: 返回`Set`实例的成员总数

Set实例方法分为两大类：操作方法和遍历方法。

**操作方法**

- `add(value)`: 添加某个值，返回Set结构本身
- `delete(value)`: 删除某个值，返回一个布尔值，表示删除是否成功
- `has(value)`: 返回一个布尔值，表示该值是否为`Set`成员
- `clear()`: 清除所有成员，没有返回值

`Array.from`方法可以将Set结构转为数组

```javascript
const items = new Set([1, 2, 3, 4, 5])
Array.from(items)
// [1, 2, 3, 4, 5]
```

**遍历方法**

- `keys()`: 返回键名的遍历器
- `values()`: 返回键值的遍历器
- `entries()`: 返回键值对的遍历器
- `forEach()`: 使用回调函数遍历每个成员

`Set`的遍历顺序就是插入顺序。如果利用Set保存一个回调函数列表，调用时就能保证按照添加顺序调用。

Set的键名和键值是同一个值

```javascript
let set = new Set(['red', 'green', 'blue'])

for (let item of set.keys()) {
    console.log(item) // 'red' 'green' 'blue'
}

for (let item of set.values()) {
    console.log(item) // 'red' 'green' 'blue'
}

for (let item of set.entries()) {
    console.log(item) // ['red', 'red'] ['green', 'green'] ['blue', 'blue']
}
```

利用Set实现并集（Union）、交集（Intersect）、和差集（Difference）

```javascript
let a = new Set([1, 2, 3])
let b = new Set([4, 3, 2])

// 并集
let union = new Set([...a, ...b])
// 交集
let intersect = new Set([...a].filter(x => b.has(x)))
// 差集
let difference = new Set([...a].filter(x => !b.has(x)))
```

两种直接在遍历中改变原来的Set解构

```javascript
// 1
let set = new Set([1, 2, 3])
set = new set([...set].map(val => val * 2))
// 2
let set = new Set([1, 2, 3])
set = new Set(Array.from(set, val => val * 2))
```

## WeakSet

### 含义

WeakSet成员只能是对象，而不能是其他类型的值。并且WeakSet中的对象都是弱引用，垃圾回收机制不考虑WeakSet对该对象的引用，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占的内存，不考虑该对象还存在WeakSet之中。

WeakSet内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行是不可预测的。因此ES6规定WeakSet不可遍历。

### 语法

创建WeakSet数据结构

```javascript
const ws = new WeakSet()
```

构造函数参数类似于Set

```javascript
const a = [[1, 2], [3, 4]]
const ws = new WeakSet(a)
// WeakSet{[1, 2], [3, 4]}
// 数组参数的成员只能是对象
```

**方法**

- `WeakSet.prototype.add(value)`: 向WeakSet实例添加一个新成员
- `WeakSet.prototype.delete(value)`: 清除WeakSet实例指定成员
- `WeakSet.prototype.has(value)`: 返回一个布尔值，表示某个值是否在WeakSet实例之中

> 没有size属性和forEach方法，不能遍历

**应用**

储存DOM节点，而不用担心这些节点从文档移除时，会引发内存泄露

另外一个例子

```javascript
const foos = new WeakSet()
class Foo {
    constructor() {
        foos.add(this)
    }
    method() {
        if (!foos.has(this)) {
            throw new TypeError('Foo.prototype.method 只能在Foo的实例上调用！')
        }
    }
}
```

## Map

### 含义和基本用法

Javascript的对象（Object），本质上是键值对的集合（Hash结构），但是传统只能用字符串作为键。这给它的使用带来了很大的限制。

为了解决这个问题，ES6提供了Map数据结构。类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。Map结构提供了“值-值”的对应，是一种更完善的Hash结构。

```javascript
const m = new Map()
const o = { p: 'Hello World!' }

m.set(o, 'content')
m.get(o) // 'content'

m.has(o) // true
m.delete(o) // true
m.has(o) // false
```

作为构造函数，Map也可以接受一个数组作为参数。该数组的成员是一个个表示键值对的数组。

```javascript
const map = new Map([
    ['name', '张三'],
    ['title', 'Author']
])

map.size // 2
map.has('name') // true
map.get('name') // '张三'
```

事实上任何具有Iterator接口、且每个成员都是一个双元素的数组的数据结构都可以当做`Map`构造函数的参数。`Set`和`Map`都可以用来生成新的Map。

```javascript
const set = new Set([
    ['foo', 1],
    ['bar', 2]
])
const m1 = new Map(set)
m1.get('foo') // 1
```

对一个键多次赋值，后面的值将覆盖前面的值。

### 实例的属性和操作方法

1. `size`属性

返回Map结构成员总数

2. `set(key, value)`

设置键名为`key`的键值，存在则覆盖。返回当前`Map`对象可以链式调用。

3. `get(key)`

读取`key`对应的键值，如果找不到`key`，返回`undefined`

4. `has(key)`

返回一个布尔值，表示某个键是否在当前Map对象之中。

5. `delete(key)`

删除某个键，返回`true`。删除失败，返回`false`

6. `clear()`

清除所有成员，没有返回值。

### 遍历方法

- `keys()`: 返回键名的遍历器
- `values()`: 返回键值的遍历器
- `entries()`: 返回所有成员的遍历器
- `forEach()`: 遍历Map的所有成员

Map的遍历顺序就是插入顺序

## WeakMap

**含义**

与`Map`结构类似，用于生成键值对的集合。

但有两点区别

1. `WeakMap`只接受对象作为键名（`null`除外），不接受其他类型的值作为键名。

2. `WeakMap`的键名所指向的对象，不计入垃圾回收机制。

`WeakMap`的设计目的在于，有时我们想在某个对象上面存放一些数据，但是这回形成对于这个对象的引用。

```javascript
const e1 = document.getElementById('foo')
const e2 = document.getElementById('bar')
const arr = [
    [e1, 'foo元素'],
    [e2, 'bar元素']
]
```

上面的代码`arr`对`e1`和`e2`形成了引用。一旦不需要这两个对象，必须手动删除这个引用，否则垃圾回收机制就不会释放`e1`和`e2`

```javascript
// 手动删除引用
arr[0] = null
arr[1] = null
```

应用

```javascript
const wm = new WeakMap()
const element = document.getElementById('example')

vm.set(element, 'some information')
vm.get(element) // 'some information'
```

上面的DOM对象的引用计数是1而不是2。这时，一旦消除对该节点的引用，它占用的内层就会被垃圾回收机制释放。WeakMap保存的这个键值对就会自动消失。

> 注意： WeakMap弱引用的只是键名，而不是键值，键值依然是正常引用

```javascript
const wm = new WeakMap()
let key = {}
let obj = {foo: 1}

vm.set(key, obj)
obj = null
vm.get(key) // Object {foo: 1}
```

WeakMap没有遍历方法、`clear`方法和`size`属性，其他方法和Map一样

**应用**

部署私有属性，删除实例时，私有属性也随之消失，不会造成内存泄露

```javascript
const _counter = new WeakMap()
const _action = new WeakMap()

class Countdown {
    constructor (couter, action) {
        _counter.set(this, counter);
        _action.set(this, action)
    }
    dec () {
        let counter = _counter.get(this)
        if (counter < 1) return
        counter--
        _counter.set(this, counter)
        if (counter === 0) {
            _action.get(this)()
        }
    }
}

const c = new Countdown(2, () => console.log('DONE'))

c.dec()
c.dec()
// DONE
```