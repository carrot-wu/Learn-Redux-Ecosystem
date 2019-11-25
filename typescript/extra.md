## any,unknown和never
`any`,`unknown`是所有非空集合的超级类型(数学上称为全集)，什么类型都可以赋值给这两个类型，又把这两个类型称为顶级类型。
`never`代表空集合，任何值都不能冠以类型，因此也被称为低端集合。  
底端和顶端集合可分别借助操作符 union（|） 和 intersection（&）来识别，比如，给定类型 T，则：
```ts
// [1,2] | [2,3] => [1,3] 
// [1,2] | []什么都没有 => [1,2]
T | never => T 
// [1,2] & [-无穷，+无穷] => [1,2]
T & unknown => T
```

### any
一般情况下，我们并不知道某个变量的具体类型或者在编程过程中，因为一些原因我们并不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查。一般这种情况为我们就会使用`any`这个类型声明
```ts
let a:any = '123'
a = 123
a = {
    a: 123
}
```
`any`类型是多人协作项目的大忌，很可能把`Typescript`变成`AnyScript`，通常在不得已的情况下，不应该首先考虑使用此类型。

### unknown
`unknown` 和 `any` 的主要区别是 `unknown` 类型会更加严格:在对unknown类型的值执行大多数操作之前,我们必须进行某种形式的检查,而在对 `any` 类型的值执行操作之前,我们不必进行任何检查。  
直接使用 `unknown` 没什么意义，但是你可借助“类型守卫”在块级作用域内收敛类型，并由此获得准确的类型检查。什么意思呢，具体可以下面的例子:  
```ts
function getValue(params: unknown): string {
  if (Array.isArray(params)) {
    return `type is array, value is ${params.join(",")}`;
  }
  if (typeof params === "number") {
    return `type is number, value is ${params / 1}`;
  }
  if (params instanceof Date) {
    return `type is Date, time is ${params.getTime()}`;
  }
  return "test";
}
```
`unknown`和`any`十分相似，它们都可以是任何类型。但是`unknown`相比会更加安全，`unknown`会进行类型检查并且类型被确定是某个类型之前,它不能被进行任何操作比如实例化、getter、函数执行等等。
```ts
let value:unknown
value() 
value.b
value.a()
// 上述三个全部报错

// any 可行
let anyValue:any 
anyValue()
anyValue.b
anyValue.a()
```

### never
`never` 类型表示的是那些永不存在的值的类型，never 类型是任何类型的子类型，也可以赋值给任何类型；然而，没有类型是 `never` 的子类型或可以赋值给 `never` 类型（除了never本身之外）,`never` 用于那些永不可发生的情况
```ts
// 仅仅只是抛出异常的函数
// 以往返回值会返回void 看起来没问题
function error1(message: string): void {
  // 假设我在这之前就进行了返回void 不会报错 但是函数的使用就不正确了
  // return void
  throw new Error(message);
}

// 使用never
function error2(message: string): never {
    // 这之前返回void 会报错 因为任何类型赋值给void都会报错
  return void 0
  throw new Error(message);
}

```

### 如何在 never、unknown、any 之间作出选择
1. 在那些将或既不能取得任何值的地方，使用 `never`
2. 在那些将或既取得任意值，但不知类型的地方，请使用 `unknown`
3. 除非你有意忽略类型检查，不要使用 `any`