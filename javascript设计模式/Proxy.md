# 代理模式

## 虚拟代理

把开销比较大的对象，延迟到真正需要的时候才去创建。

## 虚拟代理和图片预加载

```js
var myImg = (function() {
  var imgNode = document.createElement('img');
  document.body.appendChild(imgNode);

  return {
    setSrc: function(src) {
      imgNode.src = src;
    },
  };
})();

var proxyImg = (function() {
  var img = new Img();
  img.onload = function() {
    myImg.setSrc(this.src);
  };

  return {
    setSrc: function() {
      myImg.setSrc('./loading.gif');
      img.src = src;
    },
  };
})();
```

代理对象和本体对象要求一致的接口`myImg`和`proxyImg`都提供了`setSrc`方法

## 虚拟代理合并 http 请求

```js
var synchronousFile = function(id) {
  console.log('sync file id:' + 'id');
};

var proxySynchronousFile = (function() {
  var cache = [],
    timer;
  return function(id) {
    cache.push(id);
    if (timer) {
      return;
    }
    timer = setTimeout(function() {
      synchronousFile(cache.join(','));
      clearTimeout(timer);
      timer = null;
      cache.length = 0;
    }, 2000);
  };
})();
```

## 虚拟代理在惰性加载中的应用

未真正加载 miniConsole 对象

```javascript
var cache = [];

var miniConsole = {
  log() {
    var args = arguments;
    cache.push(function() {
      return miniConsole.log.apply(miniConsole, args);
    });
  },
};

miniConsole.log(1);
```

当用户按下 F2 时，开始加载真正的 miniConsole.js

```js
var handler = function(ev) {
  if (ev.keyCode === 113) {
    var script = document.createElement('script');
    script.onload = function() {
      for (var i = 0, fn; (fn = cache[i++]); ) {
        fn();
      }
    };
    script.src = 'miniConsole.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    document.removeEventListener('keydown', handler); // 只加载一次miniConsole.js
  }
};

document.body.addEventListener('keydown', handler);

// miniConsole.js代码：
miniConsole = {
  log: function() {
    // ...
    console.log(Array.prototype.join.call(arguments));
  },
};
```

## 缓存代理--高阶函数动态创建代理

为各种计算方法创建缓存代理

```js
/******计算乘积******/
var mult = function() {
  var a = 1;
  for (var i = 0, l = arguments.length; i < l; i++) {
    a = a*arguments[i];
  }
  return a;
}
/******计算加法******/
var plus = function() {
  var a = 0;
  for (var i = 0; l = arguments.length; i < l; i++) {
    a = a + arguments[i];
  }
  return a;
}
// 缓存代理工厂
var createProxyFactory = function(fn) {
  var cache = {};
  return function() {
    var args = Array.prototype.join.call(arguments, ',');
    if (args in cache) {
      return cache[args];
    }
    return cache[args] = fn.apply(this, arguments);
  }
}
// 使用
var proxyMult = createProxyFactory(mult),
proxyPlus = createProxyFactory(plus);
proxyMult(1, 2, 3, 4);
proxyPlus(1, 2, 3, 4);
```

## 小结

javascript中最常用的是虚拟代理和缓存代理。业务代码不必预先猜测是否需要使用代理模式，当真正发现不方便直接访问某个对象的时候，再编写代理。
