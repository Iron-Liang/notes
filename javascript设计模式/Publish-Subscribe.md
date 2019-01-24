# 发布订阅模式

又叫观察者模式，定义对象中的一对多的依赖关系，当一个对象得状态发生改变的时候，所有依赖它的对象都将得到通知。javascript 中一般使用事件模型来替代传统的发布订阅模式。

## DOM 事件

```js
document.body.addEventListener(
  'click',
  () => {
    alert(1);
  },
  false,
);
document.body.click();
```

## 自定义事件

实现发布订阅模式得步骤

1. 指定发布者
2. 为发布者添加缓存列表，用于存放回调函数以便通知订阅者
3. 发布消息的时候，发布者遍历缓存列表，一次触发存放的订阅者回调函数

可以向回调里面填入一些参数，订阅者可以接收这些参数。

**通用发布订阅模式**

```js
var event = {
  clientList: {},
  listen(key, fn) {
    if (!this.clientList[key]) {
      this.clientList[key] = [];
    }
    this.clientList[key].push(fn);
  },
  trigger() {
    var key = Array.prototype.shift.call(arguments),
        fns = this.clientList[key];
    if (fns || fns.length === 0) {
      return false;
    }
    for (var 1 = 0, fn; fn = fns[i++];) {
      fn.apply(this, arguments)
    }
  }
};
```

定义 installEvent 为任意对象安装发布订阅模式

```js
var installEvent = function(obj) {
  for (var i in event) {
    obj[i] = event[i];
  }
};
```

添加取消订阅的方法

```js
event.remove = function(key, fn) {
  var fns = this.clientList[key];
  if (!fns) {
    return false;
  }
  if (!fn) {
    fns && (fns.length = 0);
  } else {
    for (var l = fns.length - 1; l >= 0; l--) {
      var _fn = fns[l];
      if (_fn === fn) {
        fns.splice(l, 1);
      }
    }
  }
};
```

## 全局发布订阅对象

```js
var Event = function() {
  var clientList = {},
    listen,
    trigger,
    remove;
  listen = function(key, fn) {
    if (!clientList[key]) {
      clientList[key] = [];
    }
    clientList[key].push(fn);
  };
  trigger = function() {
    var key = Array.prototype.shift.call(arguments),
      fns = clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    for (var i = 0, fn; (fn = fns[i++]); ) {
      fn.apply(this, arguments);
    }
  };
  remove = function(key, fn) {
    var fns = clientList[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    if (!fn) {
      fns && fns.length = 0;
    } else {
      for(var l = fns.length - 1;l >= 0;l--) {
        var _fn = fns[l];
        if (_fn === fn) {
          fns.splice(l, 1);
        }
      }
    }
  }
  return {
    listen,
    trigger,
    remove,
  }
};
```

## 先发布再订阅 & 全局事件命名冲突

利用离线堆栈实现先订阅再发布，离线堆栈的生命周期只有一次。全局事件命名存放在同一 clientList 对象中，难免会命名冲突。可以给 Event 对象提供创建命名空间的功能。

```js
var Event = (function() {
  var global = this,
    Event,
    _default = 'default';

  Event = (function() {
    var _listen,
      _trigger,
      _remove,
      _slice = Array.prototype.slice,
      _shift = Array.prototype.shift,
      _unshift = Array.prototype.unshift,
      namespaceCache = {},
      _create,
      each = function(ary, fn) {
        var ret;
        for (var i = 0, l = ary.length; i < l; i++) {
          var n = ary[i];
          ret = fn.call(n, i, n);
        }
        return ret;
      };

    _listen = function(key, fn, cache) {
      if (!cache[key]) {
        cache[key] = [];
      }
      cache[key].push(fn);
    };

    _remove = function(key, cache, fn) {
      if (cache[key]) {
        if (fn) {
          for (var i = cache[key].length; i >= 0; i--) {
            if (cache[key][i] === fn) {
              cache[key].splice(i, 1);
            }
          }
        } else {
          cache[key] = [];
        }
      }
    };

    _trigger = function() {
      var cache = _shift.call(arguments),
        key = _shift.call(arguments),
        args = arguments,
        _self = this,
        ret,
        stack = cache[key];
      if (!stack || !stack.length) {
        return;
      }
      return each(stack, function() {
        return this.apply(_self, args);
      });
    };
    _create = function(namespace) {
      var namespace = namespace || _default;
      var cache = {},
        offlineStack = [],
        ret = {
          listen: function(key, fn, last) {
            _listen(key, fn, cache);
            if (offlineStack === null) {
              return;
            }
            if (last === 'last') {
              offlineStack.length && offlineStack.pop()();
            } else {
              each(offlineStack, function() {
                this();
              });
            }
            offlineStack = null;
          },
          one: function(key, fn, last) {
            _remove(key, cache);
            this.listen(key, fn, last);
          },
          remove: function(key, fn) {
            _remove(key, cache, fn);
          },
          trigger: function() {
            var fn,
              args,
              _self = this;
            _unshift.call(arguments, cache);
            args = arguments;
            fn = function() {
              return _trigger.apply(_self, args);
            };
            if (offlineStack) {
              return offlineStack.push(fn);
            }
            return fn();
          },
        };

      return namespace
        ? namespaceCache[namespace]
          ? namespaceCache[namespace]
          : (namespaceCache[namespace] = ret)
        : ret;
    };
    return {
      create: _create,
      one: function(key, fn, last) {
        var event = this.create();
        event.one(key, fn, last);
      },
      remove: function(key, fn) {
        var event = this.create();
        event.remove(key, fn);
      },
      listen: function(key, fn, last) {
        var event = this.create();
        event.listen(key, fn, last);
      },
      trigger: function() {
        var event = this.create();
        event.trigger.apply(this, arguments);
      },
    };
  })();
  return Event;
})();
```
