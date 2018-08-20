# 代理模式

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
    var img = new Img;
    img.onload = function () {
        myImg.setSrc(this.src);
    }

    return {
        setSrc: function () {
            myImg.setSrc('./loading.gif');
            img.src = src;
        }
    }
})()
```
