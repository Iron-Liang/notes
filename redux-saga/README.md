**Effects**

**`call`**

阻塞调用，任务完成之前Generator函数会阻塞。

**`put`**

dispatch an action !

**`take`**

监听未来的action，返回action。

**`fork`**

无阻塞调用，返回一个task，可用`cancel`取消。

**`race`**

多个Effects之间启动竞赛