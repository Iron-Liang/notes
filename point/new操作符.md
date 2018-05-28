new 一共经历的4个阶段

1. 创建一个新对象

```javascript
varobj = new Object()
```

2. 设置原型链

```javascript
obj.__proto__ = Func.prototype
```

3. 让Func中的this指向obj，并执行Func的函数体

```javascript
var result = Func.call(obj)
```

4. 判断Func的返回值类型

如果是值类型，返回obj。如果是引用类型，返回这个引用类型的对象

```javascript
if (typeof result = 'object') {
    func = result
} else {
    func = obj
}
```