# 匹配器

匹配用于测试值

## 普通匹配器

**精确匹配**

```js
test('two plus two is four', () => {
  expect(2 + 2).toBe(4); // .toBe是匹配器
});
```

`toBe`使用`Object.is`来来测试完全相等。要测试对象得值，使用`toEqual`

```js
test('object assignment', () => {
  const data = { one: 1 };
  data['two'] = 2;
  expect(data).toEqual({ one: 1, two: 2 });
});
```

`toEqual`递归检查对象或数组的每个字段。

**真值判断**

- `toBeNull` 只匹配`null`
- `toBeUndefined` 只匹配`undefined`
- `toBeDefined` 和`toBeUndefined`相反
- `toBeTruthy` 匹配任何`if`语句为真
- `toBeFalsy` 匹配任何`if`语句为真

**数字**

比较浮点数相等，使用`toBeCloseTo`而不是`toEqual`

**字符串**

`toMatch`利用正则检查字符串

```js
test('there is a "stop" in Christoph', () => {
  expect('Christoph').toMatch(/stop/);
});
```

**数组**

检查数组包含特定子项`toContain`

```js
const shoppingList = [
  'diapers',
  'kleenex',
  'trash bags',
  'paper towels',
  'beer',
];

test('shopping list contain beer', () => {
  expect(shoppingList).toContain('beer');
});
```

## API

**`expect(value)`**

结合匹配器断言

**`expect.extend(matchers)`**

注册自定义的匹配器

```js
expect.extend({
  toBeDivisibleBy(received, argument) {
    const pass = received % argument == 0;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be divisible by ${argument}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be divisible by ${argument}`,
        pass: false,
      };
    }
  },
});
```

异步自定义匹配器（async函数）

```js
expect.extend({
    async toBeDivisibleByExternalValue(received) {
        const externalValue = await getExternalValueFromRemoteSource();
        const pass = received % externalValue == 0;
        // ...
    }
})
```

自定义匹配器提供的辅助函数

`this.isNot`: 是否被`.not`指示器调用，可以用于反转断言

`this.equals(a, b)`: 'deep-equality',递归判断两个对象具有相同的值。

`this.utils`: 主要是`matchHint`,`printExpected`,`printReceived`来格式化错误消息

**`expect.anything()`**

匹配除`null`或`undefined`之外的任何值

**`expect.any(constructor)`**

匹配任意通过`constructor`构造的值，可以代替使用字面量

**`expect.arrayContaining(array)`**

期望数组是接收数组的子集，可以用在以下情况替代字面量

- `toEqual`或者`toBeCallWith`
- 通过`objectContaining`或者`toMatchObject`匹配一个属性

**`expect.assertions`**

验证在测试期间，是否调用了一定数量的断言（在异步测试中很有用，确保实际调用中的断言）

```js
test('doAsync calls both callbacks', () => {
    expect.assertions(2);
    function callback1(data) {
        expect(data).toBeTruthy();
    }
    function callback2(data) {
        expect(data).toBeTruthy();
    }

    doAsync(callback1, callback2);
})

// expect.assertions(2)确保两个异步调用的callback确实被调用过
```

**`expect.hasAssertions()`**

验证在测试期间至少调用一次断言，在异步测试中，保证实际调用了回调中的断言

**`expect.not.arrayContaining(array)`**

与`expect.arrayContaining(array)`相反