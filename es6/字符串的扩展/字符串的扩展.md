# 字符串的扩展

ES6加强了对Unicode的支持，并且扩展了字符串的对象。

--

## 字符串的Unicode表示法

`\uxxxx`形式表示一个字符，其中`xxxx`表示字符的Unicode码点。

```javascript
"\u0061"
// "a"
```

单个双字节表示法只限于码点在`\u0000`~`\uFFFF`之间的字符。超出范围的字符，必须使用两个双字节的形式表示。

ES6中，将码点放入大括号，就能正确解读字符。

```javascript
"\u{20BB7}"
// ”𠮷“
let hello = 123
hell\u{6F} // 123

'\u{1F680}' === '\uD83D\uDE80'
// true
```

6种方法表示一个字符

```javascript
'\z' === 'z'
'\172' === 'z'
'\x7A' === 'z'
'\u007A' === 'z'
'\u{7A}' === 'z'
// true
```

## `codePointAt()`

javascript对于那些需要4个字节存储的字符（Unicode码点大于`0xFFFF`的字符），js会认它们是两个字符。

```javascript
var s = '𠮷'

s.length // 2
s.charAt(0) // ''
s.charAt(1) // ''
s.charCodeAt(0) // 55362
s.charCodeAt(1) // 57271
```

ES6提供`codePointAt`方法，能够正确处理4个字节储存的字符，返回一个字符的码点。

```javascript
let s = '𠮷a'

s.codePointAt(0) // 134071
s.codePointAt(1) // 57271

s.codePointAt(2) // 97
```

`codePointAt`方法的参数，仍然是不正确的。解决这个问题的方法是使用`for...of`循环，因为它会正确识别32位的UTF-16字符。

```javascript
let s = '𠮷a'
for (let ch of a) {
    console.log(ch.codePointAt(0).toString(16))
}
```

> 1个标准字符两个字节，16位。扩展字符四个字节，32位。

## `String.fromCodePoint()`

ES5的`String.fromCharCode`方法，不能识别32位的UTF-16字符。

ES6提供可以识别32位UTF-16字符的`String.fromCodePoint`方法，作用与`codePointAt`方法相反

## 字符串遍历

新增可以识别大于`0xFFFF`的码点的遍历接口`for...of`循环。

## `at()`方法

ES5的`charAt`方法，返回字符串给定位置的字符。但不能识别码点大于`0xFFFF`的字符。

有个提案，提出字符串实例的`at`方法，可以识别Unicode码点大于`0xFFFF`的字符。

[垫片库](https://github.com/es-shims/String.prototype.at) 可以实现这个实例方法。

## `normalize()`

ES6字符串实例的`normalize()`方法，用来将字符的不同表示方法统一为同样的形式。

可以接受一个参数来指定normalize的方式

- `NFC` "标准等价合成"
- `NFD` "标准等价分解"
- `NFKC` "兼容等价合成"
- `NFKD` "兼容等价分解"

## `includes()`,`startsWith()`,`endsWith()`

传统上，javascript只有`indexOf`方法，可以用来确定一个字符串是否包含在另一个字符串中。ES6又提供三种新方法。

- `includes()`: 返回布尔值，表示是否找到了参数字符串。
- `startsWith()`: 返回布尔值，表示参数字符串是否在原字符串的头部。
- `endsWith()`: 返回布尔值，表示参数字符串是否在原字符串的尾部。

三个方法都支持第二个参数，表示开始搜索的位置

```javascript
let s = 'Hello world!'
s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
/*
    在使用第二个参数时，`endsWith`的行为与其他两个方法有所不同。它针对前n个字符，而其他两个方法针对从第n个位置直到字符串结束。
*/
```

## `repeat()`

`repeat`方法返回一个新的字符串，表示将原字符串重复n次

```javascript
'x'.repeat(3) // 'xxx'
'hello'.repeat(2) // 'hellohello'
'na'.repeat(0) // ''
```

- 参数是负数或者`Infinity`,会报错
- 参数是0到-1之间的小数，则等同于0。(先取整，得到-0)
- `NaN`等同于0
- 参数是字符串，先转换成数字

## `padStart()`, `padEnd()`

ES2017引入了字符串的补全功能。如果某个字符串不够指定长度，会在头部或尾部补全。`padStart()`用于头部补全，`padEnd()`用于尾部补全。

```javascript
'x'.padStart(5, 'ab') // ababx
'x'.padEnd(5, 'ab') // xabab
```

- 原字符串的长度，等于或大于指定的最小长度，则返回原字符串
- 原字符串与用来补全的字符串两者的长度之和超过了指定的最小长度，则会截去超出位数的补全字符串
- 省略第二个参数，默认使用空格补全长度

**应用**

1. 补全指定位数

```javascript
'1'.padStart(10, '0') // "0000000001"
```

2. 提示字符串格式

```javascript
'12'.padStart(10, 'YYYY-MM-DD') // 'YYYY-MM-12'
'09-12'.padStart(10, 'YYYY-MM-DD') // 'YYYY-09-12'
```

## `matchAll()`

`matchAll`方法返回一个正则表达式在当前字符串的所有匹配。

## 模板字符串

如果使用模板字符串，所有的空格和缩进都会被保留在输出之中。

```javascript
$('#list').html(`
<ul>
    <li>first</li>
    <li>second</li>
</ul>
`)
```

可以使用`trim`方法消除换行

如果需要引用模板字符串本身，在需要时执行，可以像下面这样写

```javascript
// 写法一
let str = 'return' + '`Hello ${name}!`'
let func = new Function('name', str)
func('Jack') // 'Hello Jack'

// 写法二
let str = '(name) => `Hello ${name}!`'
let func = eval.call(null, str)
func('Jack') // 'Hello Jack!'
```

## 实例：模板编译

通过模板字符串，生成正式模板的实例。

```javascript
let template = `
<ul>
    <% for(let i = 0; i < data.supplies.length; i++) { %>
        <li><%= data.supplies[i] %></li>
    <% } %>
</ul>
`
```

上面的代码在模板字符串中放置一个常规模板。使用`<%...%>`放置javascript代码，使用`<%= ... %>`输出javascript表达式。

定义模板编译函数`compile`

```javascript
function compile(template) {
    const evalExpr = /<%=(.+?)%>/g
    const expr = /<%([\s\S]+?)%>/g

    template = template
        .replace(evalExpr, '`); \n echo( $1 ); \n echo(`')
        .replace(expr, '`); \n $1 \n echo(`')
    template = 'echo(`' + template + '`)'

    let script = 
    `(function parse(data) {
        let output = ''

        function echo(html) {
            output += html
        }

        ${ template }

        return output
    })`

    return script
}
```

使用`compile`函数

```javascript
let parse = eval(compile(template))
div.innerHtml = parse({
    supplies: ["broom", "mop", "cleaner"]
})
/*
    <ul>
        <li>broom</li>
        <li>mop</li>
        <li>cleaner</li>
    </ul>
*/
```

## 标签模板

模板字符串可以紧跟在一个函数名后面，该函数将被调用来处理这个模板字符串。这杯称为“标签模板“功能。

```javascript
alert`123`
// <=>
alert(123)
```

如果模板里面有变量，会将模板字符串先处理成多个参数，再调用函数。

```javascript
function tag(stringArr, ...values) {
    // ...
}
```

```javascript
let a = 5
let b = 10
tag`hello ${ a + b } world ${ a * b }`
tag(['hello', 'world', ''], 15, 50)
```

重要应用，过滤HTML字符串，防止用户输入恶意内容。

```javascript
let message = 
    SaferHTML`<p>${sender} has sent you a message.</p>`
function SaferHTML(templateData) {
    let s = templateData[0]
    for (let i = 1; i < arguments.length, i++) {
        let arg = String(arguments[i])

        s += arg.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

        s += templateData[i]
    }
}
```

模板处理函数的第一个参数（模板字符串数组），还有个`raw`属性，保存的时转义后的原字符串。

```javascript
tag`First line\nSecond line`

function tag(strings) {
    console.log(strings.raw[0])
}
// strings.raw[0] => "First line\nSecond line"
// 打印输出“First line\nSecond line”
```

## `String.raw()`

充当模板字符串的处理函数，返回一个斜杠都被转义的字符串，对应于替换变量之后的模板字符串

```javascript
String.raw`Hi\n${2+3}!`
// "Hi\\n5!"
```