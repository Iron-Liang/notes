# 迭代器模式

`Array.prototype.forEach`

## jQuery 中的迭代器

```js
$each([1, 2, 3], function(i, n) {
  console.log('当前下标为：' + i);
  console.log('当前值为：' + n);
});
```

## 自己实现迭代器

```js
var each = function(ary, callback) {
  for (var i = 0, l = ary.length; i < l; i++) {
    callback.call(ary[i], i, ary[i]);
  }

  each([1, 2, 3], function(i, n) {
    alert([1, n]);
  });
};
```

## 内部迭代器和外部迭代器

1. 内部迭代器

`each`函数属于内部迭代器，内部定义好了迭代规则，完全接手整个迭代过程。

缺点是内部规则预定，无法修改。

2. 外部迭代器

外部迭代器必须显式的请求迭代下一个元素，增加了调用的复杂度，也增强了迭代器的灵活性。

```js
var Iterator = function(obj) {
  var current = 0;

  var next = function() {
    current += 1;
  };

  var isDone = function() {
    return current >= obj.length;
  };

  var getCurrItem = function() {
    return obj[current];
  };

  return {
    next,
    isDone,
    getCurrItem,
  };
};
```

判断 2 个数组里元素的值是否完全相等。

```js
var compare = function(iterator1, iterator2) {
  while (!iterator1.isDone() && !iterator2.isDone()) {
    if (iterator1.getCurrItem() !== iterator2.getCurrItem()) {
      throw new Error('iterator1 和 iterator2不相等');
    }
    iterator1.next();
    iterator2.next();
  }
  alert('iterator1 和 iterator2相等');
};

var iterator1 = Iterator([1, 2, 3]);
var iterator2 = Iterator([1, 2, 3]);

compare(iterator1, iterator2);
```
