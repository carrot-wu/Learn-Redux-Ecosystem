// 一些使用react hooks的注意项

// 使用useEffect时最好需要明确指出 内部的依赖项
function Demo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => {
      clearInterval(id);
    };
  }, []);

  return count;
}
// 解决办法 添加count 重复创建
// 去除依赖 换成updater方法 count => count + 1
// useReducer
// useRef

// 依赖项函数问题
function Demo() {
  const [count, setCount] = useState(0);

  function awaitdata(query) {
    return `http://demo${query}`
    // return `http://demo${query}${count}`
  }

  useEffect(() => {
    const url = awaitdata('redux')
    console.log(url)
  }, [awaitdata]);

  const alertCount = useCallback(() => {
    console.log(count)
  }, [count])
  // 试想这里不加count会怎么样
  return (
    <div>
      <button type="btn" onClick={() => setCount(count + 1)}>点我加一</button>
      <button type="btn" onClick={alertCount}>点我console.log</button>
    </div>
  );
}
// 每次的函数其实都是新创建的 所以是不一样的引用
// 这时候有几种写法
// 第一种直接移除 不推荐 有可能引用了某个hooks变量 造成拿到的依然是就的值
// 如果这个函数没有引用组件变量 那么可以提取到最外层 当然这时候也没必要放到依赖项中
// 如果函数引用到了hooks的变量 就不能提升作用域 一种是声明放到effect中

// 一些优化点 因为每次重渲染的时候  函数组件都会进行重新卸载生成
// 1 对于一些不依赖hook state变量的函数或者变量 可以提取到最外层作用域中 这样子不会多次创建
// 对于引用到hook的函数可以用useCallback包一层 但是记住不要忘记填写内部的依赖
//

/*
interface LoadFnParams<T> {
  page: number, pageSize: number, list: T[]
}
interface FnRes<T> {
  currentPage: number,
  totalPage: number,
  data: T[],
  [props: string]: any
}
interface LoadFnInterface<T> {
  (params: LoadFnParams<T>): Promise<FnRes<T>>
}
interface optionsInterface {
  pageSize: number = 20,
    defaultPage: number = 0
}
function useInfinite<T>(loadFn: LoadFnInterface<T>, options: optionsInterface) {
  const {pageSize = 20, defaultPage = 0} = options
  // loadFn 是一个异步函数 最终返回的res 包含 {data, pageNo, totalPage}
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(defaultPage)
  const [list, setList] = useState<T[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useError(null)

  const initLoad = useCallback(async() => {
    try {
      setError(null)
      setLoading(true)
      const result = await loadFn({page, pageSize, list})
      const {
        currentPage,
        totalPage,
        data
      } = result
      setList(list.concat(data))
      setPage(currentPage)
      if(currentPage >= totalPage){
        setHasMore(false)
      }
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }

  }, [pageSize])

  return {
    loading,
    hasMore,
    list,
    error
  }
}
*/
