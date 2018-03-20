## 创建新的RegExp对象

```javascript
var pattern = /s$/
var pattern2 = new RegExp("s$")
```

> ECMAscript 3规范中，用正则表达式创建的RegExp对象会共享同一个实例，而在ECMAscript 5中则是两个独立的实例。

## 修饰符

- `i` 执行不区分大小写的匹配
- `g` 执行全局匹配，找到所有的匹配，而不是在找到第一个之后就停止
- `m`多行模式，`^`匹配行开头和字符串开头，`$`匹配行的结束和字符串的结束

## 用于模式匹配的String方法

### `String.prototype.search()`

**语法**

```javascript
str.search(regexp)
```

- 参数

    - `regexp`: 一个正则表达式对象，如果传入非正则表达式对象，则会使用`new RegExp(obj)`隐式的将其转换成正则表达式。

- 返回值

匹配成功，返回正则表达式在字符串首次匹配项的索引。否则返回-1。

> search方法不支持全局检索，会忽略正则表达式参数中的修饰符g。

### `String.prototype.replace()`

返回一个由替换值替换一些或所有匹配的模式后的字符串。模式可以是正则表达式或者一个字符串，替换值可以是一个字符串或者一个每次匹配都要调用的函数。

**语法**

```javascript
str.replace(regexp|substr, newSubStr|function)
```

- 参数

    - `regexp`(pattern): 正则对象
    - `newSubStr`: 用于替换第一个参数在原字符串中的匹配部分的字符串。可以使用`$1`这样的分组引用
    - `function`: 用来创建新字符串的函数。该函数的返回值将替换掉第一个参数匹配到的结果。

- 返回值

部分或全部匹配由替代模式所取代的新字符串。

**描述**

- 使用字符串作为参数

替换字符串可以插入下面的特殊变量。

| 变量名 | 代表的值 |
| --- | --- |
| `$$` | 插入一个'$' |
| `$&` | 插入匹配的子串 |
| $` | 插入当前匹配子串左边的内容 |
| `$n` | 插入正则第n个分组匹配的字符串 |

- 指定一个函数作为参数

匹配执行的时候，函数就会执行，函数的返回值作为替换字符串。全局匹配多个匹配成功，函数就会被多次调用。

函数的参数：

| 变量名 | 代表的值 |
| --- | --- |
| `match` | 匹配的子串，对应`$&` |
| `p1,p2,...` | 正则第n个分组匹配的字符串 |
| `offset` | 匹配到的字符串在原始字符串的偏移量 |
| `string` | 被匹配的原字符串 |

> 使用replace方法，原字符串不会改变

### `String.prototype.split()`

指定分割符字符串，将一个`String`对象分割成字符串数组，以将字符串分割成子字符串，以确定每个拆分位置。

**语法**

```javascript
str.split([separator[, limit]])
```

> 如果空字符串（""）被当做分割符，则字符串会在每个字符之间分割

- 参数

    - `separator` 表示每个拆分应发生的点的字符串。可以是字符串或者正则表达式。
    - `limit` 一个整数，返回分割片段数量。

- 返回值

分割后字符串组成的数组。

### `String.prototype.match()`

**语法**

```javascript
str.match(regexp)
```

- 参数

    - `regexp` 正则表达式对象，如果传入一个非正则表达式就会隐性使用`new RegExp(obj)`将其转换为一个`RegExp`对象。如果不提供任何参数，直接使用`match`，那么你会得到一个包含空字符串的`Array`:[""]

- 返回值

    - `array` 如果字符串匹配到了表达式，就会返回一个数组，数组的第一项是进行匹配完整的字符串，之后的项是用圆括号捕获的结果。如果没有匹配，返回null。

**描述**

如果正则表达式不包含`g`标志，则`str.match()`会返回和`RegExp.exec()`相同的结果。

## RegExp对象

### `RegExp.prototype.exec()`

**语法**

```javascript
regexObj.exec(str)
```

- 参数
    - `str` 用于匹配正则的字符串
- 返回值

如果匹配成功，`exec()`返回一个数组，并更新正则表达式对象的属性。返回数组将完全匹配成功的文本作为第一项，将分组匹配成功的作为数组填充到后面。

匹配失败返回null。

**描述**

示例

```javascript
var regex = /quick\s(brown).+?(jumps)/ig
var result = regex.exec('The Quick Brown Fox Jumps Over The Lazy Dog')
```

返回值

| 对象 | 属性/索引 | 描述 | 例子 |
| --- | --- | --- | --- |
| `result` | `[0]` | 匹配的全部字符串 | 'Quick Brown Fox Jumps' |
|  | `[1], ...[n]` | 括号中分组匹配的内容 | [1] = Brown [2] = Jumps |
|  | `index` | 匹配到的字符位于原始字符串的基于0的索引值 | `4` |
|  | `input` | 原始字符串 | 'The Quick Brown Fox Jumps Over The Lazy Dog' |
| `regex` | `lastIndex` | 下次匹配开始的位置 | `25` |
|  | `ignoreCase` | 是否使用了`i`标识符 | `true` |
|  | `global` | 是否使用了`g`标识符 | `true` |
|  | `multiline` | 是否使用了`m`标识符 | `false` |
|  | `source` | 正则匹配的字符串 | 'quick\s(brown).+?(jumps)' |

### `Regex.prototype.test()`

执行一个检索，用来查看正则表达式与指定的字符串是否匹配。返回`true`或`false`。

**语法**

```javascript
regexObj.test(str)
```

- 参数
    - `str` 用来与正则表达式匹配的字符串
- 返回值

如果正则表达式与指定字符串匹配成功，返回`true`,否则返回`false`。

**描述**

和`exec()`一样，在相同的全局正则表达式实例上多次调用`test`或越过之前的匹配