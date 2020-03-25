## fiber是什么
在讲fiber是什么之前，我觉得有必要理一下没有fiber的react16之前的一些问题。
### 没有fiber
假设我们有这么一个很简单的组件`ArticleList`来描述文章列表。
```jsx
class ArticleList extends React.Component {
  state = {
    val : 1
  }
  render() {
    return (
      <div>
        {val}
        <Article/>
        <Article/>
      </div>
      )
    }
}
```
