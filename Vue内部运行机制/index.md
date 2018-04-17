# 剖析Vue.js内部运行机制

## 概览

### 初始化及挂载

new Vue => init => $mount
___

在`new Vue()`之后。Vue会调用`_init`函数进行初始化，初始化内容包括*生命周期、事件、props、methods、data、computed与watch等*。通过`Object.defineProperty`设置`setter`与`getter`函数，用以实现【响应式】和【依赖搜集】。

初始化之后调用`$mount`就会挂载组件，如果是运行时编译，即不存在render function但是存在template的情况，需要进行【编译】步骤。

### 编译

compile编译可以分为`parse`、`optimize`和`generate`三个阶段，最终需要得到render function

- parse

用正则等方式解析template模板中的指令、class、style等数据，形成AST

- optimize

标记static静态节点，这是Vue在编译过程的一处优化，后面当`update`更新界面时，会有一个`patch`过程，diff算法会直接跳过静态节点，减少比较过程，优化了`patch`的性能。

- generate

将AST转化为render function的过程，得到结果是render的字符串以及staticRenderFns字段

经过编译阶段后，组件中就存在渲染VNode所需要的render function了。

### 响应式

响应式核心部分

当render function被渲染的时候，因为会读取所需对象的值，所以会触发`getter`函数进行【依赖搜集】，【依赖搜集】的目的是将观察者Watcher对象存放到当前闭包