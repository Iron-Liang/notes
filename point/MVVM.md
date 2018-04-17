# MVVM原理

现代MVVM框架，基本都是通过**数据劫持+发布订阅模式**

实现靠的是ES5提供的`Object.defineProperty`，只支持IE8+

## 实例

```html
<body>
    <div id="app">
        <h1>{{ song }}</h1>
        <p>《{{ album.name }}》是{{ singer }}2005年11月发行的专辑</p>
        <p>主打歌为{{ album.theme }}</p>
        <p>作词人为{{singer}}等人</p>
        为你弹奏肖邦的{{ album.theme }}
    </div>
    <script src="mvvm.js"></script>
    <script>
        let mvvm = new Mvvm({
            el: '#app',
            data: {
                song: '发如雪',
                album: {
                    name: '十一月的萧邦',
                    theme: '夜曲'
                },
                singer: '周杰伦'
            }
        })
    </script>
</body>
```

## 打造MVVM

```javascript
// Mvvm构造函数
function Mvvm(options = {}) {
    // 将所有属性挂载到$options上
    this.$options = options

    let data = this._data = this.$options.data

    // 数据劫持
    observe(data)
}
```

### 数据劫持

```javascript
// 创建一个Observe构造函数
function Observe(data) {
    // 数据劫持的实现就是给对象属性增加get,set
    for (let key in data) {
        let val = data[key]
        observe(val) //递归实现深度的数据劫持
        Object.defineProperty(data, key, {
            configurable: true,
            get () {
                return val
            },
            set (newVal) {
                if (val === newVal) {
                    return
                }
                val = newVal // 通过闭包，再次获取值的时候，将新值返回出去
                observe(newVal) // 如果为属性赋值的值是一个对象，则需要对子属性实现数据劫持
            }
        })
    }
}

function observe(data) {
    if (!data || typeof data !== 'object') return
    return new Observe(data)
}
```

### 数据代理

数据代理就是让我们每次拿data里的数据时，不用每次都写一长串。例如`mvvm._data.a.b`直接写`mvvm.a.b`这种方式。

```javascript
function Mvvm(options = {}) {
    observe(options.data)
    for (let key in options.data) {
        Object.defineProperty(this, key, {
            configurable: true,
            get () {
                return options.data[key]
            },
            set (newVal) {
                options.data[key] = newVal
            }
        })
    }
}
```

### 数据编译

```javascript
// 编译构造函数
function Compile(el, vm) {
    vm.$el = document.querySelector(el)
    let fragment = document.createDcoumentFragment()
    while (child = vm.$el.firstChild) {
        fragment.appendChild(child)
    }
    // 对el里面的内容进行替换
    function replace(frag) {
        Array.from(frag.childNodes).forEach(node => {
            let txt = node.textContent
            let reg = /\{\{(.*?)\}\}/g

            if (node.nodeType === 3 && reg.test(txt)) { // 即是文本节点又有大括号的情况{{}}
                console.log(RegExp.$1) // 匹配到的第一个分组
                let arr = RegExp.$1.split('.')
                let val = vm
                arr.forEach(key => {
                    val = val[key]
                })
                node.textContent = txt.replace(reg, val).trim()
            }
            if (node.childNodes && node.childNodes.length) {
                replace(node)
            }
        })
    }
    replace(fragment)
    vm.$el.appendChild(fragment)
}
```

### 发布订阅模式

```javascript
function Dep () {
    this.subs = []
}

Dep.prototype = {
    addSub (sub) {
        this.subs.push(sub)
    },
    noify () {
        this.subs.forEach(sub => sub.update())
    }
}

// 监听函数，通过watcher创建实例，都拥有update方法
function Watcher(fn) {
    this.fn = fn
}

Watcher.prototype.update = function () {
    this.fn()
}

let watcher = new Watcher(() => console.log(111))
let dep = new Dep()
dep.addSub(watcher)
dep.addSub(watcher)
dep.noify() // 111, 111
```

### 数据更新视图

```javascript
function replace(frag) {
    // ...
    node.textContent = txt.replace(reg, val).trim()
    // 监听变化
    new Wathcer(vm, RegExp.$1, newVal => {
        node.textContent = txt.replace(reg, newVal).trim()
    })
}

// 重写Watcher构造函数
function Watcher(vm, exp, fn) {
    this.fn = fn
    this.vm = vm
    this.exp = exp
    Dep.target = this
    let arr = exp.split('.')
    let val = vm
    arr.forEach(key => {
        val = val[key]
    })
    Dep.target = null
}
```

更新数据劫持的get方法

```javascript
function Observe(data) {
    let dep = new Dep()
    // ...
    Object.defineProperty(data, key => {
        get () {
            Dep.target && dep.addSub(Dep.target) // [watcher]
            return val
        },
        set (newVal) {
            if (val === newVal) {
                return
            }
            val = newVal
            observe(newVal)
            dep.noify()
        }
}
```