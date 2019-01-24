# 命令模式

实现请求发送者和请求接收者之间的松耦合关系。

## 传统命令模式的实现

通过 setCommand 函数负责往按钮上安装命令，点击某个按钮会执行某个 command 命令，执行命令的动作约定为调用 command 对象的 execute()方法。

```js
var setCommand = function(button, command) {
  button.onclick = function() {
    command.execute();
  };
};
```

功能对象

```js
var MenuBar = {
  refresh() {
    console.log('刷新菜单目录');
  },
};

var SubMenu = {
  add() {
    console.log('增加子菜单');
  },
  del() {
    console.log('删除子菜单');
  },
};
```

封装功能对象到命令类中

```js
var RefreshMenuBarCommand = function(receiver) {
  this.receiver = receiver;
};

RefreshMenuBarCommand.prototype.execute = function() {
  this.receiver.refresh();
};

var AddSubMenuCommand = function(receiver) {
  this.receiver = receiver;
};

AddSubMenuCommand.prototype.execute = function() {
  this.receiver.add();
};

var DelSubMenuCommand = function(receiver) {
  this.receiver = receiver;
};

DelSubMenuCommand.prototype.execute = function() {
  this.receiver.del();
};
```

实例化 command 对象，并安装

```js
var refreshMenuBarCommand = new RefreshMenuBarCommand();
// ...
setCommand(button1, refreshMenuBarCommand);
```

## 用闭包实现命令模式

接受者被封闭再闭包产生的环境当中。

```js
var setCommand = function(button, func) {
  button.onclick = function() {
    func();
  };
};

var MenuBar = {
  refresh() {
    console.log('刷新菜单界面');
  },
};

var RefreshMenuBarCommand = function(receiver) {
  return function() {
    receiver.refresh();
  };
};

var refreshMenuBarCommand = RefreshMenuBarCommand(MenuBar);

setCommand(button1, refreshMenuBarCommand);
```

为了明确命令模式，并提供撤销命令等操作，最好还是把执行函数改为调用 execute 方法

```js
var RefreshMenuBarCommand = function(receiver) {
  return {
    execute: function() {
      receiver.refresh();
    },
  };
};

var setCommand = function(button, command) {
  button.click = function() {
    command.execute();
  };
};

var refreshMenuBarCommand = RefreshMenuBarCommand(MenuBar);
setCommand(button1, refreshMenuBarCommand);
```

## 撤销命令

小球运动的实例

```html
<body>
  <div id="ball" style="position:absolute;background:#000;width:50px;height:50px"></div>
  输入小球移动后的位置：<input id="pos" />
  <button id="moveBtn">开始移动</button>
</body>
```

```js
var getElementById = document.getElementById;
var ball = getElementById('ball');
var pos = getElementById('pos');
var moveBtn = getElementById('moveBtn');

moveBtn.onclick = function() {
  var animate = new Animation(ball);
  animate.start('left', pos.value, 1000, 'strongEaseOut');
};
```

改为命令模式实现

```js
var MoveCommand = function(receiver, pos) {
  this.receiver = receiver;
  this.pos = pos;
};

MoveCommand.prototype.execute = function() {
  this.receiver.start('left', pos.value, 1000, 'strongEaseOut');
};

var moveCommand;
moveBtn.onclick = function() {
  var animate = new Animate(ball);
  moveCommand = new MoveCommand(animate, pos.value);
  moveCommand.execute();
};
```

增加撤销操作

```js
var MoveCommand = function(receiver, pos) {
  this.receiver = receiver;
  this.pos = pos;
  this.oldPos = null;
};

MoveCommand.prototype.execute = function() {
  this.receiver.start('left', pos.value, 1000, 'strongEaseOut');
  this.oldPos = this.receiver.dom.getBoundingClientRect()[
    this.receiver.propertyName
  ];
};
MoveCommand.prototype.undo = function() {
  this.receiver.start('left', this.oldPos, 1000, 'strongEaseOut');
};
```

## 重做

有的时候，撤销操作是不容易实现的。这时可以把操作都封装成命令，执行过的命令放到堆栈中，从头开始执行命令，达到重做的目的。

```js
var Ryu = {
  attack() {
    console.log('攻击');
  },
  defense() {
    console.log('防御');
  },
  jump() {
    console.log('跳跃');
  },
  crouch() {
    console.log('蹲下');
  },
};

var makeCommand = function(receiver, state) {
  return function() {
    receiver[state]();
  };
};

var commands = {
  '119': 'jump',
  '115': 'crouch',
  '97': 'defense',
  '100': 'attack',
};

var commandStack = [];

document.onkeypress = function(ev) {
  var keyCode = ev.keyCode,
    command = makeCommand(Ryu, commands[keyCode]);
  if (command) {
    command();
    commandStack.push(command);
  }
};

document.getElementById('replay').onclick = function() {
  var command;
  while ((command = commandStack.shift())) {
    command();
  }
};
```
