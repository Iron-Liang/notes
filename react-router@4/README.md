**基础组件**

三类基础组件

- router components
- route matching components
- navigation components

这三类组件都引用自`react-router-dom`

**Routers**

`<BrowserRouter/>`：有响应服务器使用

`<HashRouter/>`：静态资源服务器使用

```js
import { BrowserRouter } from 'react-router-dom';
ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  holder,
);
```

**Router Matching**

`<Route/>`

该组件的 path 属性将和当前的 pathname 比较，匹配就渲染内容，不匹配就返回 `null`。没有 path 属性的`<Route/>`将始终渲染。

`<Switch/>`

将`<Route/>`分组，只渲染匹配的第一个`<Route />`。如果都没命中，则渲染最后一个没有 path 的`<Route />`（用于处理 404）。

```js
import { Switch, Route } from 'react-router-dom';

<Switch>
  <Route exact path="/" component={Home} />
  <Route path="/about" component={About} />
  <Route path="/contact" component={Contact} />
  {/* 如果没有匹配成功，渲染NoMatch */}
  <Route component={NoMatch} />
</Switch>;
```

**Route Rendering Props**

有三种方式渲染`<Route />`组件。

1.  component props
2.  render props
3.  children

可以用`component`指定已有组件，或者使用`render`内联函数。

但*不要*使用`component`内联函数，这会导致不必要的重新渲染。

**Navigation**

`<Link />`: 链接，相当于`<a></a>`

`<NavLink />`: 拥有`activeClassName`属性的`<Link />`

`<Redirect />`: 重定向到`to`属性

---

**Code Splitting**

依赖 webpack、babel-plugin-syntax-dynamic-import、react-loadable

```json
// .babelrc
{
  "presets": ["react"],
  "plugins": ["syntax-dynamic-import"]
}
```

```js
import Loadable from 'react-loadable';
import Loading from './Loading';

const LoadableComponent = Loadable({
  loader: () => import('./Dashboard'), // 异步加载的组件
  loading: Loading, // 加载中的渲染
});

export default class LoadableDashboard extends React.Component {
  render() {
    return <LoadableComponent />;
  }
}
```

---

**Scroll to top**

使用一个`<ScrollToTop />`组件包裹 App

```js
// ScrollToTop.js
class ScrollToTop extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scroll(0, 0);
    }
  }
  render() {
    return this.props.children;
  }
}

export default withRouter(ScrollToTop); // 使ScrollToTop组件能够拿到match, history, location props
```

```js
const App = () => {
  <Router>
    <ScrollToTop>
      <App />
    </ScrollToTop>
  </Router>;
};
```
