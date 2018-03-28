# 数组的扩展

## 扩展运算符

扩展运算符（spread）(...)：将一个数组转为用逗号分隔的参数序列。

```javascript
console.log(...[1, 2, 3])

[...document.querySelectorAll('div')]
```

**扩展运算符的应用**

1. 复制数组

利用扩展运算符可以克隆一个全新的数组

```javascript
const a1 = [1, 2]
const a2 = a1.concat()

a2[0] = 2

a1 // [1, 2]
```

扩展运算符写法

```javascript
const a1 = [1, 2]
// 1
const a2 = [...a1]
// 2
const [...a2] = a1
```

2. 合并数组

```javascript
const more = [3, 4, 5]
[1, 2, ...more]
```

3. 与结构赋值结合

```javascript
const [first, ...rest] = [1, 2, 3, 4, 5]

first // 1
rest // [2, 3, 4, 5]

const [first, ...rest] = []

first // undefined
rest // []

const [first, ...rest] = ["foo"]

first // "foo"
rest // []
```

> 将扩展运算符用在数组赋值只能放在最后一位，否则报错。

4. 字符串

扩展运算符可以将字符串转成真正的数组

```javascript
[...'hello']
// ['h', 'e', 'l', 'l', 'o']
```

能够正确识别四个字节的Unicode字符

5. 实现了Iterator接口的对象

任何部署了Iterator接口的对象，都可以用扩展运算符转为真正的数组

```javascript
let nodelist = document.querySelectorAll('div')
let array = [...nodelist]
```

## `Array.from()`

`Array.from()`用于将两类对象转化为真正的数组：*array-like*和*iterable*

将类似数组对象转为数组

```javascript
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
}

// es5

var arr1 = [].slice.call(arrayLike) // ['a', 'b', 'c']

// es6

var arr2 = Array.from(arrayLike) // ['a', 'b', 'c']
```

`Array.from`还可以接受第二个参数，作用类似于数组的`map`方法，用来对每个元素进行处理，将处理后的值放入返回的数组

```javascript
Array.from(arrayLike, x => x * x)
// [1, 4, 9]
```

如果处理函数`map`中使用到了`this`，可以传入`Array.from`的第三个参数，用以绑定`this`。

## `Array.of()`

用于将一组值，转换为数组

构造函数`Array()`会因为参数的个数不同，产生不同的行为

```javascript
Array() // []
Array(3) // [undefined, undefined, undefined]
Array(1, 2, 3) // [1, 2, 3]
```

`Array.of`行为统一

```javascript
Array.of() // []
Array.of(1) // [1]
Array.of(1, 2, 3) // [1, 2, 3]
```

## `Array.prototype.copyWithin()`

在当前数组内部，将指定位置的成员复制到其他位置，然后返回当前数组。（会修改当前数组）

参数：

- target(required)：从该位置开始替换数据，如果为负值，表示倒数。
- start(unrequired)：从该位置开始读取数据，默认为0。如果为负数，表示倒数。
- end(unrequired)：到该位置停止读取数据，默认等于数组的长度。如果为负数，表示倒数。

参数不是数值，自动转化为数值

```javascript
[1, 2, 3, 4, 5].copyWithin(0, 3, 4) // [4, 2, 3, 4, 5]

[1, 2, 3, 4, 5].copyWithin(0, -2, -1) // [4, 2, 3, 4, 5]

// 处理类似数组对象

[].copyWithin.call({length: 5, 3: 1}, 0, 3) // {0: 1, 3： 1， length： 5}

let i32a = new Int32Array([1, 2, 3, 4, 5])
i32a.copyWithin(0, 2) // Int32Array [3, 4, 3, 4, 5]
```

## `Array.prototype.find()`和`Array.prototype.findIndex()`

`find`方法用于查找第一个符合条件的数组成员。参数是一个回调函数。所有成员一次执行该回调函数，直到找出第一个返回值为`true`的成员，然后返回该成员。如果没有找到，则返回`undefined`

```javascript
[1, 4, -5, 10].find(item => item < 0)

// -5
```

回调接收三个参数

- item: 当前值
- index: 当前位置
- array: 原数组

`findeIndex`方法与`find`类似，返回第一个符合条件的数组成员位置，如果所有的成员都不符合条件，则返回`-1`

```javascript
[1, 5, 10, 15].findIndex((value, index, array) => {
    return value > 9
})

// 2
```

两个方法都接收第二个参数，用来绑定回调内部`this`

可以用来找到`NaN`

```javascript
[NaN].indexOf(NaN) // -1

[NaN].findIndex(value => Object.is(NaN, value)) // 0
```

## `Array.prototype.fill()`

使用给定的值，填充数组。

```javascript
['a', 'b', 'c'].fill(7)
// [7, 7, 7]

new Array(3).fill(7)
// [7, 7, 7]
```

接收第二个参数和第三个参数，指定填充的起始位置和结束位置

```javascript
['a', 'b', 'c'].fill(7, 1, 2)
// ['a', 7, 'c']
```

> 如果填充的类型为对象，那么被赋值的是同一个内存地址的对象，而不是深拷贝对象。

## `Array.prototype.entries()(keys() | values())`

`entries`,`keys`,`values`用于遍历数组。它们都返回一个遍历器对象,可以用`for...of`遍历。

- `entries` 键值对的遍历
- `keys` 键名的遍历
- `values` 键值的遍历

```javascript
const arr = ['a', 'b']

for (let index of arr.keys()) {
    console.log(index)
}
// 0
// 1

for (let value of arr.values()) {
    console.log(value)
}
// 'a'
// 'b'

for (let [index, elem] of arr.entries()) {
    console.log(index, elem)
}
// 0 'a'
// 1 'b'
```

除了使用`for...of`循环，可以手动调用next方法进行遍历

```javascript
let letter = ['a', 'b', 'c']
let entries = letter.entries()

console.log(entries.next().value) // [0, 'a']
console.log(entries.next().value) // [1, 'b']
console.log(entries.next().value) // [2, 'c']
```

## `Array.prototype.includes()`

返回一个布尔值，表示某个数组是否包含给定的值

```javascript
[1, 2, 3].includes(2) // true

[NaN].includes(NaN) // true

[NaN].indexOf(NaN) // -1
/*
    indexOf方法不能准确判断NaN,includs
*/
```

第二个参数表示搜索的起始位置，默认为`0`。负数表示倒数，如果这时它大于数组的长度，则重置为从`0`开始。

Map和Set数据结构有一个`has`方法，需要注意与`include`区分

- Map结构的`has`方法，用来查找键名，`Map.prototype.has(key)`、`WeekMap.prototype.has(key)`、`Reflect.has(target, propertyKey())`

- Set结构的`has`方法，是用来查找值的，比如`Set.prototype.has(value)`、`WeakSet.prototype.has(value)`