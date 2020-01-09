/*
* typescript学习
* */
//定义变量 ts定义变量是需要添加冒号来声明类型 比如 string boolean number

//定义 变量 字符串 以及boolean 类型的话
let stringA: string = '123456'
let numberA: number = 123456
let booleanA: boolean = false
//stringA = 123 错误
//定义了类型之后 只能替换想用类型的数据 如果需要变换类型需要使用到any
let anyA: any = '231313'
anyA = 312313
anyA = true
//对于一些复杂雷丁的声明 数组 元组 枚举 任何类型

//数组 有几种情况

//如果数组内部都是统一类型的了的话 有两种表达方式 这时候数组内部的元素都必须是用一种类型
let arraySim: number[] = [123, 456]
let arraySim1: Array<number> = [123, 333]
//arrayA.push('321312') 会报错
arraySim.push(1231) //这是可以的
//如果知道数组内部有有数种类型的话 可以用泛型表示

//第一种
let arrayDouble: (string | number)[] = [1, 2, 3, '1231']
//第二种
let arrayDoubleTwo: Array<number | string> = [123, 321, '32131']
//另外一种就是数组内部可以为任意元素的话或者一开始不清楚 可以使用any类型
let arrayAny: any[] = [123, '123', booleanA, [1231]]

//联合类型 一个变量可以有多重类型比如说number或者string 符号使用 | 来表示

let doubleA: string | number = 'test'
doubleA = 123455

//元组类型 类似于数组 不过规定了数组前几项的类型
let arrayTuple: [string, number] = ['123', 456]
arrayTuple[0] = '312321'
//arrayTuple[0]=55555555 不允许再变换类型

//枚举 枚举的类似于数组 先定义一些常亮 变量的切换只能从枚举的值中变化 可以通过类似数组小标的方式来获取 当然你也可以认为修改数组下标
enum enumObject {varA = 1, varB = 4, varC = 5}

let enumA: string = enumObject[1]
//let enumB:enumObject = '2131231' 错误

//void 表示那些没有返回值的类型 比如没有return具体指的函数 又或者直接就是undefined或者bull
function fnA(): void {

}


/* ----------------------------------------------接口--------------------------------------- */
//接口的定义通过interface来声明 接口的作用就是定义一些规则  类似于number string 这种类似的接口定义规则
// 如果定义一些参数可能不是比传的 可以再冒号前面加上问好即可  其中readonly用于接口的只读 并不能修改
//接口的命名一般首字母用大小来表示
interface TestInt {
  readonly paramA: string,
  paramB?: number,
  paramC: Array<number>
}

//变量可以使用
let paramC: TestInt = {
  paramA: '123',
  paramC: [123]
}

//函数可以使用
function test(testParam: TestInt) {
  console.log(testParam)
}

//任意属性 有时候我们会需要某个接口除了规定的属性之外，可以有任意的属性 这时候可以使用[propName:string] : any

interface InterfaceB {
  readonly a: string,
  b?: number,

  [propName: string]: any
}

let interfaceBTest: InterfaceB = {
  a: '123',
  b: 123,
  c: true,
  d: []
}

//定义好了的接口数据必须严格相等 不能多传 也不能少传
test({paramA: '123', paramC: [123], paramB: 123})

//当然 接口也可以表示数组
interface arrayTesthello {
  [propName: number]: number
}

let arrayTestHello: arrayTesthello = [1, 2, 3, 4]

/* -------------------------------------------------------函数------------------------------------------------------------*/
//ts中 函数的声明分为输入和输出 所以对于输入和输出都要声明类型  声明的大概wei (parama:string,paramb:number) : number
//其中括号外部的numbwe为return的返回值

//用接口来定义函数的接口方式 这里的意思就是这个函数必须传入a 可传b 同时必须返回number类型
interface FnInterface {
  (a: string, b?: number): number
}

//使用方法
let fn1: FnInterface
fn1 = (a: string, b: number) => a.length + b

/*---------------------------------------------------类型断言-------------------------------------------------------------*/
//类型断言的意思就是比如一个变量具有多个类型 比如说number|string|array 或者any  这时候如果你自身明确知道当前的类型是某个类型（比如判断length是否存在）
//如果不是类型共有的方法的话 ts会报错 这时候就需要用到类型断言 明确告诉ts 相信我，我知道这个类型是什么 有两种表达方式一种是<类型>值 一种是 值 as 类型 推荐使用第二种 因为react只支持第二种

function fnTestAs(a: string | number, b: string) {
  //理论上不能获取 a.length的属性
  //当然你也可以使用<string>a.length
  if( (a as string).length ) return (a as string).length + b
  return a + b
}

/*---------------------------------------------------声明文件--------------------------------------------------------------*/
//在引用第三方库的时候会用到一些变量 为了ts文件的正确使用 需要声明传入参数的类型  通过declare来声明
//比如 我们引入了jquery第三方库 我们需要声明jquery变量
//declare const  $:(selector:string) => any


/* -------------------------------------------------类型别名----------------------------------------------------------------*/
//类型别名简单说就是给一些新类型取其他名字 一般用来配合联合类型 有点类似于接口 用type来声明
type name = string
type nameFn = () => string
type nameOrNameFn = name | nameFn

function nameOrNameFnFn (a:nameOrNameFn){
  console.log(a)
}
//当然也可以来限制一些变量选择区域 类似于enum的枚举类型
type enumSimilar = 'hello' | 'are' | 'you'

let testAA : enumSimilar = 'hello'

/*----------------------------------------------------元组----------------------------------------------------------------*/
//元组就是类似于限制了类型的数组 初始化时只能有默认设置的类型 数量不能多不能少 但是后面可以添加或者减少
let turbleA:[string,number]
//元组在初始化值得过程中必须严格按照顺序来进行初始化值，而且值只能限定在规定的类型之中
turbleA = ['12',12]
turbleA.push(12)
//turbleA.push(true) 错误

/*-------------------------------------------------ts中的类---------------------------------------------------------------*/
//es6或者已经熟悉额我并不会讲 只会将一些新加的或者不熟悉的
//存取器 其实类似于object。definedProperty 可以通过get set重写属性的方法
class animal {
  constructor(name){
    this.name = name
  }
  get name(){
    return 'hhh my name is get-----'+name
  }
  set name(value){
    console.log(`我知道你想设置name 为${value}这个值,但是不存在的`)
  }
}
/* private protect public三种修饰符 都可以用来修饰属性和方法*/
//private 只能在当前类的内部访问属性或者方法 外部不能访问
//public 默认 啥都可以访问
//protect 外部不能访问 不过在集成的子类中通过super()可以进行访问 private是不行滴

//abstract抽象类用法 简单说就是抽象类并不能进行实例  可以用于其他类的继承 同理方法也可以被抽象 父类的抽象方法 子类中必须实例化
abstract class hh {
  abstract say()
}
class ff extends hh {
  //这里不实例化父类的抽象方法会报错
  public say(){
    console.log('ssss')
  }
}
new ff()
//new hh() 报错



interface Methods<T> {
  [keys: string]: (value: T, ...args: any[]) => T;
}

type FilterFirstFn<T, U> = T extends (value:U, ...args: infer P) => void ? (...args: P) => void : T;

type ReturnMethods<U,T> = {
  [P in keyof U]: FilterFirstFn<U[P], T>;
}
function useReducerHook<T, K extends Methods<T>, U extends keyof K>(
  initState: T,
  methods: K
): [T, ReturnMethods<K, T>] {
  const [value, setValue] = useState<T>(() => initState);
  const boundMethods = Object.keys(methods).reduce((newMethods, name) => {
    const fn = methods[name];
    // @ts-ignore
    newMethods[name] = (...args: any[]) => {
      setValue(value => fn(value, ...args));
    }
    return newMethods;
  }, {} as ReturnMethods<K, T>);
  return [value, boundMethods];
}

const c = {
  get(state: string, test: number) {
    return state.slice() + test;
  },
  add(state: string) {
    return state + "-";
  }
}

const [value, hhhh] = useReducerHook("测试", c);

hhhh.get(123)

