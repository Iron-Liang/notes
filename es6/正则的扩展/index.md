# 正则的扩展

--

## RegExp构造函数

ES5中

第一种情况，参数是字符串，第二个参数是正则表达式的修饰符，创建一个新的正则

```javascript
var regex = new RegExp('xyz', 'i')

// 等价于

var regex = /xyz/i
```

第二种情况，参数是一个正则表达式，返回一个原有正则表达式的拷贝。

```javascript
var regex = new RegExp(/xyz/i)

// 等价于

var regex = /xyz/
```

ES6中。如果`RegExp`构造函数的第一个参数是一个正则对象，那么可以使用第二个参数指定修饰符。而且，返回的正则表达式会忽略原有正则表达式的修饰符，只使用新指定的修饰符。

```javascript
new RegExp(/abc/ig, 'i').flags

// "i"
```

## 字符串的正则方法

字符串对象有4个方法可以使用正则表达式：`match()`、`replace()`、`search()`、`split()`。

ES6将这四个方法全部定义在`RegExp`对象上。

- `String.prototype.match`调用`RegExp.prototype[Symbol.match]`
- `String.prototype.replace`调用`RegExp.prototype[Symbol.replace]`
- `String.prototype.search`调用`RegExp.prototype[Symbol.search]`
- `String.prototype.split`调用`RegExp.prototype[Symbol.split]`

## u修饰符

“Unicode模式”，用来正确处理大于`\uFFFF`的Unicode字符。会正确处理四个字节的UTF-16编码。

```javascript
/^\uD83D/u.test('\uD83D\uDC2A') // false
/^\uD83D/.test('\uD83D\uDC2A') // true

// '\uD83D\uDC2A'是一个四个字节的UTF-16编码，代表一个字符。
```

一旦加上`u`修饰符，会修改下面这些正则表达式的行为。

1. 点字符

`.`字符在正则表达式中表示除了换行符以外的任意单个字符。对于码点大于`0xFFFF`的Unicode字符，点字符不能识别，必须加上`u`修饰符。

```javascript
var s = '𠮷';

/^.$/.test(s) //false
/^.$/u.test(s) //true
```

2. Unicode字符表示

ES6新增了大括号表示Unicode字符，这种表示法在正则表达式中必须加上`u`修饰符才能识别，否则会被解读为量词。

```javascript
/\u{61}/.test('a') // false
/\u{61}/u.test('a') // true
/\u{20BB7}/u.test('𠮷') // true
```

3. 量词

使用`u`后所有的量词都会正确识别码点大于`0xFFFF`的Unicode字符。

4. 预定义模式

`u`修饰符也影响到预定义模式，能否正确识别码点大于`0xFFFF`的Unicode字符。

```javascript
// 正确返回字符串长度的函数
function codePointLength(text) {
    var result = text.match(/[\s\S]/gu)
    return result ? result.length : 0
}

var s = '𠮷'

s.length // 4
codePonitLength(s) // 2
```

5. i修饰符

有些Unicode字符的编码不同，但是字型很接近`\u004B`与`\u212A`都是大写的`K`

```javascript
/[a-z]/i.test('\u212A') // false
/[a-z]/iu.test('\u212A') // true

// 不加u无法识别非标准的K字符
```

## y修饰符

`y`修饰符，叫做“粘连”(sticky)修饰符。

`g`修饰符只要求剩余位置中存在匹配就可，而`y`修饰符确保匹配必须从剩余第一个位置开始。

```javascript
var s = 'aaa_aa_a'
var r1 = /a+/g
var r2 = /a+/y

r1.exec(s) // ["aaa"]
r2.exec(s) // ["aaa"]

r1.exec(s) // ["aa"]
r2.exec(s) // null
```

`y`修饰符号隐含了头部匹配的标志`^`

```javascript
/b/y.exec('aba') // null
```

`y`修饰符的设计本意，是让头部匹配的标志`^`在全局匹配中有效

```javascript
const REGEX = /a/gy
'aaxa'.replace(REGEX, '-') // '--xa'
```

## sticky属性

与`y`修饰符相匹配

```javascript
var r = /hello\d/y
r.sticky // true
```

## flags属性

返回正则表达式的修饰符

```javascript
/abc/ig.source // "abc"

/abc/ig.flags // 'gi'
```

## s修饰符：dotAll模式

`s`修饰符使得字符`.`可以匹配任意单个字符。正则表达式的`dotAll`属性，返回一个布尔值，表示该正则表达式是否处在`dotAll`模式。

## 后行断言

- 先行断言

`x`只有在`y`前面才匹配，必须写成`/x(?=y)/`

例：匹配百分号之前的数字 `/\d+(?=%)/`

- 先行否定断言

`x`只有不在`y`前面才匹配，必须写成`/x(?!y)/`

例：只匹配不在百分号之前的数字 `\d+(?!%)`

- 后行断言

`x`只有在`y`后面才匹配，必须写成`/(?<=y)x/`

例：只匹配美元符号后的数字 `(?<=\$)\d+`

- 后行否定断言

`x`只有不在`y`后面才匹配，必须写成`/(?<!y)x/`

例：只匹配不在美元符号后面的数字 `(?<!\$)\d+`

**“后行断言”的特殊行为**

对于`/(?<=x)y/`需要先匹配`y`然后再回到左边匹配位置。“先右后左”的执行顺序，与其他正则操作相反，导致一些不符合预期的行为。

组匹配：

```javascript
/(?<=(\d+)(\d+))$/.exec('1053') // ["", "1", "053"]
/*
    第二个括号是贪婪模式捕获到“053”,第一个括号只能捕获一个字符
*/
/^(\d+)(\d+)$/.exec('1053') // ["105", "3"]
/*
    没有后行断言，第一个括号是贪婪模式，捕获“105”而第二个括号只能捕获一个字符
*/
```

反向引用：

反向引用必须放在对应哪个括号之前

```javascript
/(?<=(o)d\1)r/.exec('hodor') // null
/(?<=\1d(o))r/.exec('hodor') // ["r", "o"]
```

## 具名组匹配

```javascript
const RE_DATE = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/

const matchObj = RE_DATE.exec('1999-12-31')
const year = matchObj.groups.year // 1999
const month = matchObj.groups.month // 12
const day = matchObj.groups.day // 31
```

**解构赋值和替换**

```javascript
let { groups: {one, two} } = /^(?<one>.*):(?<two>.*)$/u.exec('foo:bar')

one // foo
two // bar
```

字符替换时使用`$<组名>`引用具名组。

```javascript
let re = /(?<year>\d{4})-(?<mouth>\d{2})-(?<day>\d{2})/u

'2015-01-02'.replace(re, '$<day>/$<mouth>/$<year>')
// '02/01/2015'
```

函数作为第二个参数

```javascript
'2015-01-02'.replace(re, (
    matched, // 整个匹配结果
    capture1, // 第一个组匹配
    capture2, // 第二个组匹配
    capture3, // 第三个组匹配
    position, // 匹配开始的位置
    s, // 原字符串
    groups // 具名组组成的一个对象 {year, mouth, day}
) => {
    let {day, month, year} = args[args.length - 1]
    return `${day}/${month}/${year}`
})
```

反向引用使用`\k<组名>`的写法

## `String.prototype.matchAll`（提案阶段）

一次性取出所有匹配，不过它返回的是一个遍历器（Iterator），不是数组。

```javascript
const string = 'test1test2test3'

const regex = /t(e)(st(\d?))/g

for (const match of string.matchAll(regex)) {
    console.log(match)
}

// ["test1", "e", "st1", "1", index: 0, input: "test1test2test3"]
// ["test2", "e", "st2", "2", index: 5, input: "test1test2test3"]
// ["test3", "e", "st3", "3", index: 10, input: "test1test2test3"]
```

转化成数组

```javascript
[...string.matchAll(regex)]

Array.from(string.matchAll(regex))
```