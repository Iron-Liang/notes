# 单例模式

## 简单的单例

```js
var Singleton = function(name) {
  this.name = name;
  this.instance = null;
};

Singleton.prototype.getName = function() {
  return this.name;
};

Singleton.getInstance = function(name) {
  if (!this.instance) {
    this.instance = new Singleton(name);
  }
  return this.instance;
};
```

## 透明的单例模式

```js
var CreateDiv = (function() {
  var instance;
  var CreateDiv = function(html) {
    if (instance) {
      return instance;
    }
    this.html = html;
    this.init();
    return (instance = this);
  };
  CreateDiv.prototype.init = function() {
    var div = document.createElement('div');
    div.innerHtml = this.html;
    document.body.appendChild(div);
  };
  return CreateDiv;
})();
var a = new CreateDiv('sven1');
var b = new CreateDiv('sven2');
a === b; // true
```

透明单例模式能够像普通构造函数一样创建但灵活性不高。

## 用代理实现单例模式

普通构造函数

```js
var CreateDiv = function(html) {
  this.html = html;
  this.init();
};

CreateDiv.prototype.init = function() {
  var div = document.createElement('div');
  div.innerHTML = this.html;
  document.body.appendChild(div);
};
```

引入代理类实现单例

```js
var ProxySingletonCreateDiv = (function() {
  var instance;
  return function(html) {
    if (!instance) {
      instance = new CreateDiv(html);
    }
    return instance;
  };
})();

var a = new ProxySingletonCreateDiv('sven1');
var b = new ProxySingletonCreateDiv('sven2');

a === b; // true
```

符合单一职责原则

## 通用的惰性单例

```js
var getSingle = function(fn) {
  var result;
  return function() {
    return result || fn.apply(this, arguments);
  };
};
```
