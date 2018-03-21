# Ecmascript 6

通过[GitHub.com/tc39/ecma262](Github.com/tc39/ecma262)查看ECMAScript当前所提案。

通过[kangax.github.io/es5-compat-table/es6/](kangax.github.io/es5-compat-table/es6/)查看各大浏览器对ES6的支持

```bash
node --v8-options | grep harmony

# 查看Node已经实现的ES6特性
```

## `let`和`const`命令

### `let`命令

`let`类似于`var`，但`let`声明的变量只在`let`命令所在的代码块内有效。

> `for`循环特别之处在于，设置循环变量的那部分是一个父作用于，而循环体内部是一个单独的子作用域。

```javascript
for (let i = 0; i < 3; i++) {
	let i = 'abc';
	console.log(i);
}
// 输出三次abc
```

**不存在变量提升**

`var`命令会发生“变量提升现象”，即变量可以在声明之前使用，值为`undefined`。

`let`命令所声明的变量一定要在声明后使用，否则报错。

**暂时性死区**

只要块级作用域内存在`let`命令，它所声明的变量就“绑定”这个区域，不再受外部影响。

在代代码块内，使用`let`命令声明变量之前，该变量都是不可用的。这在语法上称为“暂时性死区”（temporal dead zone, TDZ）。

隐蔽的“死区”

```javascript
function bar(x = y, y = 2) {
	return [x, y]
}
bar(); // 报错

/*
	参数x的默认值等于y,而此时y还未声明，属于“死区”
*/
```

**不允许重复声明**

`let`不允许在相同的作用域内，重复声明同一个变量。

### 块级作用域

**为什么需要块级作用域**

ES5只有全局作用域和函数作用域，带来以下问题

1. 内层变量覆盖外层变量

```javascript
var tmp = new Date()
function f() {
	console.log(tmp)
	if (false) {
		var tmp = 'hello world'
	}
}
f(); // undefined

/*
	由于变量提升，导致内层tmp覆盖外层tmp
*/
```

2. 用于计数的循环变量泄露为全局变量

```javascript
var s = 'hello'

for (var i = 0; i < s.length; i++) {
	console.log(s[i]);
}
console.log(i); // 5

/*
	循环结束i泄露成了全局变量。
*/
```

**ES6的块级作用域**

`let`为javascript新增了块级作用域。
可以替换自执行函数。

**块级作用域与函数声明**

ES5规定，函数只能在顶层作用域和函数作用域中声明

ES6明确允许块级作用域中声明函数，块级作用域中，函数声明语句的行为类似于`let`,在块级作用域之外不可以引用。

但ES6附录B规定，浏览器的实现可以不遵守上面的规定，有自己的行为方式。

- 允许块级作用域内声明函数。
- 函数声明类似`var`,即会提升到全局作用域或者函数作用域的头部。
- 同时，函数声明还会提升到所在块级作用域的头部。

浏览器的ES6环境中，块级作用域声明的函数，行为类似`var`声明的变量。

```javascript
function f() {
	console.log('outside')
}
(function () {
	if (false) {
		function f() {
			console.log('inside')
		}
	}
	f()
})()
```

以上代码在所有符合ES6的浏览器中都会报错，因为实际运行的是以下代码

```javascript
function f() {
	console.log('outside')
}
(function () {
	var f = undefined
	if (false) {
		function f() {
			console.log('inside')
		}
	}
	f()
})()
// Uncaught TypeError: f is not a function
```

> 所以，在实际开发中，应该避免在块级作用域中声明函数，如果确实需要，应该写成函数表达式的形式。

### `const`命令

**基本用法**

`const`声明一个只读的常量。一旦声明，常量的值就不能改变。`const`一旦声明，就必须立即初始化。其它特性和`let`一样。

**本质**

`const`实际上保证的，并不是变量的值不得改动，而是变量指向的内层地址不得改动。

用`const`声明的复合类型的数据，`const`只能保证这个指针指向的内层地址是固定的，至于数据结构是不是可变，就不能控制了。

```javascript
const foo = {}
// 为foo添加一个属性，可以成功
foo.prop = 123
foo.prop // 123
// 将foo指向另外一个对象，就会报错
foo = {} // TypeError: "foo" is read-only
```

使用`Object.freeze`方法冻结对象

```javascript
"use strict"
const foo = Object.freeze({})
foo.prop = 123;
// 严格模式报错
// 非严格模式，不起作用
```

彻底冻结对象的函数（包括对象属性）

```javascript
var constantize = (obj) => {
	Object.freeze(obj)
	Object.keys(obj).forEach((key, i) => {
		if (typeof obj[key] === 'object') {
			constantize(obj[key])
		}
	})
}
```

> ES6声明变量的方法，`var`,`function`,`let`,`const`,`import`,`class`

### 顶层对象属性

ES6中用`var`和`function`声明的变量依然是顶层对象的属性，而`let`,`const`,`class`声明的变量不是顶层对象属性。

### global对象

ES5中顶层对象的实现差别

- 浏览器顶层对象`window`,Node和Web Worker没有`window`
- 浏览器和Web Work里面，`self`也指向顶层对象，但Node没有`self`
- 只有Node中的顶层对象是`global`

存在一个提案，在语言标准层面，引入`global`作为顶层对象。

现在可以使用`system.global`垫片库在所有环境中拿到`global`

```javascript
import shim from 'system.global/shim'

shim()

// 保证各种环境中，global对象是存在的
```

```javascript
import getGlobal from 'system.global'

const global = getGlobal()

// 将顶层对象放入变量`global`
```
 