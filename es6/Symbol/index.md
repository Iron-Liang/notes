# Symbol

ES5的对象名称都是字符串，这容易造成属性名的冲突。

`Symbol`是一种新的原始数据类型，表示独一无二的值。

Symbol值通过`Symbol`函数生成。凡是属性名属于Symbol类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

```javascript
let s = Symbol()
typeof s
// 'symbol'
```

> 注意：`Symbol`函数前不能使用`new`命令，否则会报错。这是因为生成的Symbol是一个原始类型的值，不是对象。是一种类似于字符串的数据类型。

`Symbol`函数可以接收一个字符串作为参数，表示对Symbol的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分。

```javascript
let s1 = Symbol('foo')
let s2 = Symbol('bar')

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // 'Symbol(foo)'
s2.toString() // 'Symbol(bar)'
```

如果`Symbol`的参数是一个对象，就会调用该对象的`toString`方法，将其转为字符串，然后生成一个Symbol值。

```javascript
const obj = {
    toString () {
        return 'abc'
    }
}

const sym = Symbol(obj)

sym // 'Symbol(abc)'
```