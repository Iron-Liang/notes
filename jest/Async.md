# 异步测试

异步的测试需要知道测试在何时完成。

jest 处理的方式有以下几种

## Callbacks

jest 会在测试代码执行完后立即完成，所以以下的做法是错误的

```js
// Don't do this!
test('the data is peanut butter', () => {
  function callback(data) {
    expect(data).toBe('peanut butter');
  }
  fetchData(callback); // fetchData执行完了以后测试就会立即完成
});
```

测试回调的 done 参数可以显示指定测试完成

```js
test('the data is peanut butter', done => {
  function callback(data) {
    expect(data).toBe('peanut butter');
    done(); // 如果done未被调用，测试将失败
  }

  fetchData(callback);
});
```

## Promises


