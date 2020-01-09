## 单例模式

**单例模式** （Singleton Pattern）又称为单体模式，保证**一个类只有一个实例**，并提供一个访问它的全局访问点。也就是说，**第二次使用同一个类创建新对象的时候，应该得到与第一次创建的对象完全相同的对象**。
具体实现:
```ts
class Single {
  name: string
  private static _instance : Single
  constructor (name: string) {
    this.name = name
  }
  tellName () {
    console.log(this.name)
  }
  static getInstance (name: string) {
    if (!Single._instance) {
      Single._instance = new Single(name)
    }
    return Single._instance
  }
}
console.log(Single.getInstance('hh') === Single.getInstance('hh')) //true
```

### 优点
1. 单例模式在创建后在内存中只存在一个实例，节约了内存开支和实例化时的性能开支，特别是需要重复使用一个创建开销比较大的类时，比起实例不断地销毁和重新实例化，单例能节约更多资源，比如数据库连接；
2. 单例模式可以解决对资源的多重占用，比如写文件操作时，因为只有一个实例，可以避免对一个文件进行同时操作；
3. 只使用一个实例，也可以减小垃圾回收机制 GC（Garbage Collecation） 的压力，表现在浏览器中就是系统卡顿减少，操作更流畅，CPU 资源占用更少；
### 缺点
1. 单例模式对扩展不友好，一般不容易扩展，因为单例模式一般自行实例化，没有接口；
2. 与单一职责原则冲突，一个类应该只关心内部逻辑，而不关心外面怎么样来实例化；

## 工厂模式
工厂模式 （Factory Pattern），根据不同的输入返回不同类的实例，一般用来创建** 同一类对象**。工厂方式的主要思想是将**对象的创建与对象的实现分离**

```ts
type AnimalType = 'cat' | 'dog'
// 工厂类
class AnimalFactory {
  static getInstance(type:AnimalType, name:string):Cat | Dog {
    switch (type) {
      case 'cat':
        return new Cat(name)
        break;
  
      case 'dog':
        return new Dog(name)
        break;
      
        default:
        break;
    }
  }
}
// 声明两个产品类 
class Cat {
  name: string
  constructor(name: string) {
    this.name = name
  }
  say() {
    console.log(`cat name is ${this.name}`)
  }
  miao() {
    console.log(`cat ${this.name} miao miao miao`)
  }
}
class Dog {
  name: string
  constructor(name: string) {
    this.name = name
  }
  say() {
    console.log(`Dog name is ${this.name}`)
  }
}
```  
![alt](http://img.carrotwu.com/FsHjHLKWpKrrmHU6W1OKQzIUpWno)  

1. 工厂类用于进行实现相关逻辑的实现，外部只需要传入相关的参数即可获取类的实例，外部并不用关系如何创建。内部自动进行处理创建。
2. 产品类用于逻辑的具体实现，外部并不会直接调用或者实例化产品类，而是通过工厂模式实现的工厂类去实例化。

### 优缺点
1. 良好的封装，代码结构清晰，**访问者无需知道对象的创建流程**，特别是创建比较复杂的情况下；
2. 扩展性优良，通过工厂方法**隔离了用户和创建流程隔离**，符合开放封闭原则；
3. 解耦了高层逻辑和底层产品类，符合最少知识原则，不需要的就不要去交流； 

工厂模式的缺点：带来了额外的系统复杂度，增加了抽象性；

## 抽象工厂模式
> 前面说了：工厂模式 （Factory Pattern），根据不同的输入返回不同类的实例，一般用来创建** 同一类对象**。工厂方式的主要思想是将**对象的创建与对象的实现分离**。  

抽象工厂：通过对类的工厂抽象使其业务用于对产品类簇的创建，而不是**负责创建某一类产品的实例**。关键在于使用抽象类制定了实例的结构，调用者直接面向实例的结构编程，从实例的具体实现中解耦。   

总结： 抽象工厂其实就是对工厂模式中工厂类和产品类的进一层抽象，把一些通过逻辑并且方法封装成类进一步继承抽象，这个类就叫抽象类。注意这个抽象类不允许进行实例化，只允许继承。

以上文的工厂模式为例，Cat和Dog类都具有name属性，并且有相同的say原型方法，因此我们可以通过进一步抽象成抽象类的形式进行继承来复用代码，这就是抽象类。

```ts
  type AnimalType = 'cat' | 'dog'
  // 工厂类
  class AnimalFactory {
    static getInstance(type:AnimalType, name:string):Cat | Dog {
      switch (type) {
        case 'cat':
          return new Cat(name)
          break;
    
        case 'dog':
          return new Dog(name)
          break;
        
          default:
          break;
      }
    }
  }
  //ts 中可以通过加上abstract关键词声明抽象类 es6中可以通过构造函数在实例化是抛出错误

  // class Test {
  //   constructor() {
  //     if(this instanceof Test) {
  //       throw new Error('抽象类不允许实例化')
  //     }
  //   }
  // }
  // 声明一个抽象类
  abstract class AbstractAnimal {
    name: string
    type: string
    constructor(type: string, name:string) {
      this.name = name
      this.type = type
    }

    say() {
      console.log(`${this.type} name is ${this.name}`)
    }
  }

  // 具体的cat 和dog类继承
  class Cat extends AbstractAnimal {
    name: string
    constructor(name: string) {
      super('cat',name)
    }
    miao() {
      console.log(`${this.type} ${this.name} miao miao miao`)
    }
  }
  class Dog extends AbstractAnimal {
    name: string
    constructor(name: string) {
      super('dog',name)
    }
    bark() {
      console.log(`${this.type} ${this.name} bark me ~~~~`)
    }
  }
}
```  
例子里只是对动物类进行了抽象，动物工厂AnimalFactory类依然可以进行抽象，不过会提升复杂度。抽象工厂主要有下面几个概念。  

1. **Factory** ：工厂，负责返回产品实例；
2. **AbstractFactory** ：虚拟工厂，制定工厂实例的结构（抽象类）；
3. **Product** ：产品，访问者从工厂中拿到的产品实例，实现抽象类；
4. **AbstractProduct** ：产品抽象类，由具体产品实现，制定产品实例的结构（抽象类）；  

![alt](http://img.carrotwu.com/FhpPhbzUwzXr6oyMSQTtVx-RG5mS)  

### 优缺点
抽象模式的优点：抽象产品类将**产品的结构抽象出来**，访问者不需要知道产品的具体实现，只需要面向产品的结构编程即可，从产品的具体实现中解耦。  

抽象模式的缺点：  

1. 扩展新类簇的产品类比较困难，因为需要创建新的抽象产品类，并且还要修改工厂类，违反开闭原则；
2. 带来了系统复杂度，增加了新的类，和新的继承关系；

## 建造者模式（生成器模式）
建造者模式（Builder Pattern）又称生成器模式，**分步**构建一个复杂对象，并允许**按步骤构造**。同样的构建过程可以采用不同的表示，将**一个复杂对象的构建层与其表示层分离**。  

>把一个复杂的对象的构造拆分成多个简单的对象，实现买个简单的对象后进行组装。

接下来，我们通过建造一辆车来梳理建造者的几个基础概念。试想用户想要买一辆车（product），这一辆车由汽车公司（director）用零件进行组件的，而不同的零件（轮胎，车架）又交给不同的厂家（builder）进行生产，最终交付到买家手中。所以建造者模式涉及到三个概念。  

1. **Director**： 指挥者，调用建造者中的部件具体实现进行部件装配，相当于整车组装厂，最终返回装配完毕的产品；
2. **Builder**： 建造者，含有不同部件的生产方式给指挥者调用，是部件真正的生产者，但没有部件的装配流程；
3. **Product**： 产品，要返回给访问者的复杂对象；  

建造者模式的主要功能是构建复杂的产品，并且是**复杂的、需要分步骤构建的产品**，其构建的算法是统一的，构建的过程由指挥者决定，只要配置不同的指挥者，就可以构建出不同的复杂产品来。也就是说，建造者模式**将产品装配的算法和具体部件的实现分离**，这样构建的算法可以扩展和复用，部件的具体实现也可以方便地扩展和复用，从而可以灵活地通过组合来构建出不同的产品对象。

![alt](http://img.carrotwu.com/Frz23AmQHxIi0X_27WoJhacNcBbg)  


```ts
// 建造者模式
{
  // 零件组件者
  class Builder {
    params: object
    part1: string
    part2: string
    constructor(params:object = {}) {
      this.params = params
    }
    buildPart1() {
      // 也可以调用其他类的方然
      this.part1 = 'part1'
      // this.part1 = new LunTai(params)
      return this
    }
    buildPart2() {
      // 也可以调用其他类的方然
      this.part2 = 'part1'
      // this.part1 = new LunTai(params)
      return this
    }
  }

  // 组装者
  class Director {
    params: object
    constructor(params:object = {}) {
      this.params = params
      return new Builder(params).buildPart1().buildPart2()
      // 这里其实也可以不通过类通过方法实现
      // buildLuntai(this)
      // buildCheJia(this)
    }
  }

  const params = {}
  // 获取产品
  const product = new Director(params)
}

```
### 优缺点
建造者模式的优点：

1. 使用建造者模式可以使**产品的构建流程和产品的表现分离**，也就是将产品的创建算法和产品组成的实现隔离，访问者不必知道产品部件实现的细节；
2. **扩展方便**，如果希望生产一个**装配顺序**或方式不同的新产品，那么直接新建一个指挥者即可，不用修改既有代码，符合开闭原则；
3. **更好的复用性**，建造者模式将产品的创建算法和产品组成的实现分离，所以产品创建的算法可以复用，产品部件的实现也可以复用，带来很大的灵活性；  

建造者模式的缺点：

1. 建造者模式一般适用于产品之间组成部件类似的情况，如果产品之间**差异性很大、复用性不高**，那么不要使用建造者模式；
2. 实例的创建增加了许多额外的结构，无疑增加了许多复杂度，如果对象粒度不大，那么我们最好直接创建对象；


## 代理模式

代理模式 （Proxy Pattern）又称委托模式，它在访问者与目标对象之间创建了一个新的代理对象，以控制对目标对象的访问。  

> 直接拦截对原对象的访问，类似于中间加了一个中间商，对原对象的任何访问处理都必须通过代理对象。

代理模式把代理对象插入到访问者和目标对象之间，从而为访问者对目标对象的访问引入一定的间接性。正是这种间接性，给了代理对象很多操作空间，比如在调用目标对象前和调用后进行一些预操作和后操作，从而实现新的功能或者扩展目标的功能。  

代理对象主要有访问者（vistor），代理对象（proxy），目标对象（target）三个概念。  

1. vistor: 对目标对象的访问者。
2. proxy: 对目标对象的代理者，负责引用目标对象，以及对访问的过滤和预处理。
3. target: 目标对象，被代理的对象也是具体业务的执行者。  

现实中每一个明星都有一个经纪人，导演需要找明星拍电影。这时候导演都是直接去询问经纪人，而不是直接与明星进行联系。在这其中，导演就是访问者（vistor），经纪人就是代理对象（proxy），明星就是目标对象（target）。

![alt](http://img.carrotwu.com/FnjYZ8Qleg7mmWWGTdRwHgVp84gY)  

```ts
  // 代理模式
  // 明星类 只负责拍电影
  class Singer {
    name: string
    constructor(name: string) {
      this.name = name
    }
    playMovie(movieName: string) {
      console.log(`${this.name} begin playing movie ${movieName}`)
    }
  }

  // 经纪人
  class Assitant {
    name: string
    mySinger: Singer
    minMoney: number
    constructor(name: string) {
      this.name = name
    }
    // 设置为谁的经纪人
    setSinger(singer: Singer, minMoney: number) {
      this.mySinger = singer
      this.minMoney = minMoney
    }
    // 接电影通告
    adjustMovie(money: number, movieName: string) {
      if(!this.mySinger){
        throw new Error('暂无工作')
      }
      if(money < this.minMoney){
        throw new Error('给我爬， 价格太低了')
      }
      this.mySinger.playMovie(movieName)
    }
  }
  const cxk = new Singer('cxk')
  const cxkjjr = new Assitant('cxkjjr')
  cxkjjr.setSinger(cxk, 10000000)

  cxkjjr.adjustMovie(10000, '打篮球') // 给我爬， 价格太低了
  cxkjjr.adjustMovie(100000000, '鸡你太美') // cxk begin playing movie 鸡你太美
}
```

### 优缺点
代理模式的主要优点有：

1. 代理对象在访问者与目标对象之间可以起到**中介和保护目标对象**的作用；
2. 代理对象可以**扩展**目标对象的功能；
3. 代理模式能将访问者与目标对象分离，在一定程度上降低了系统的耦合度，如果我们希望适度**扩展目标对象的一些功能，通过修改代理对象**就可以了，符合开闭原则；  

代理模式的缺点主要是增加了系统的复杂度，要斟酌当前场景是不是真的需要引入代理模式（十八线明星就别请经纪人了）。

## 享元模式
享元模式 （Flyweight Pattern）运用**共享技术**来有效地支持大量**细粒度对象的复用**，以**减少创建**的对象的数量。  
享元模式的主要思想是共享细粒度对象，也就是说如果系统中存在多个相同的对象，那么只需共享一份就可以了，不必每个都去实例化每一个对象，这样来精简内存资源，提升性能和效率。  

>把多实例限制成限定数量的几个实例，减少内存，通过队列机制进行排队运行。

就像靠驾照时候，考试车只有几部但是考试人员可能会有几百名。还没轮到的人进行排队，一个考试完空出来的考试车继续进行考试。其中的几部考试车就是享元模式的体现，不然每人一个考试车这就太浪费资源了。

```ts
  // 考试车
  class ExamCar {
    readonly carId: number
    isUsing: boolean
    constructor(carId: number) {
      this.carId = carId
      this.isUsing = false
    }

    examine(studentId: number) {
      this.isUsing = true
      console.log(`${studentId}在${this.carId}开始考试`)
      const time = Math.ceil(Number(Math.random()) * 3)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.isUsing = false
          console.log(`${studentId}在${this.carId}考试车经过${time}s后考试完毕`)
          resolve()
        }, time * 1000)
      })
    }
  }

  // 资源池
  class ExamCarPool {
    carPool: ExamCar[]
    taskQueue: (() => Promise<void>)[]
    constructor() {
      this.carPool = []
      this.taskQueue = []
    }
    // 增加考试车
    addExamCar(car: ExamCar) {
      this.carPool.push(car)
    }
    // 初始化考试车
    initExamCar(carIdArray: number[]) {
      for(let id of carIdArray) {
        this.addExamCar(new ExamCar(id))
      }
    }
    // 增加考试人员
    addExamStudent(studentIdArray: number[]) {
      const taskArray:(() => Promise<void>)[] = studentIdArray.map(studentId => {
        return async () => {
          const car = this.getUnUsedCar()
          await car.examine(studentId)
          this.next()
        }
      })
      this.taskQueue = [...this.taskQueue, ...taskArray]
    }
    // 获取没人使用的车辆
    getUnUsedCar() {
      return this.carPool.find(car => !car.isUsing)
    }
    next() {
      const task = this.taskQueue.shift()
      if(typeof task === 'function'){
        task()
      }
    }
    // 开始考试
    startExam() {
      for(let i =0 ; i< this.carPool.length; i++) {
        this.next()
      }
    }
  }

  const carExam = new ExamCarPool()
  carExam.initExamCar([11, 22, 33])
  carExam.addExamCar(new ExamCar(44))
  carExam.addExamStudent([99 , 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88 ])
  carExam.startExam()
```

### 优缺点
享元模式的优点：

1. 由于减少了**系统中的对象数量**，提高了程序运行效率和性能，精简了内存占用，加快运行速度；
2. 外部状态相对独立，不会影响到内部状态，所以享元对象能够在不同的环境被共享；  

享元模式的缺点：

1. 引入了**共享对象**，使对象结构变得复杂；
2. 共享对象的**创建、销毁**等需要维护，带来额外的复杂度（如果需要把共享对象维护起来的话）；

## 装饰者模式

装饰者模式 （Decorator Pattern）又称装饰器模式，在**不改变原对象**的基础上，通过对其**添加属性或方法**来进行包装拓展，使得原有对象可以动态具有更多功能。  

>对原有方法或者类的能力进行增强。

本质是功能**动态组合**，即动态地给一个对象添加额外的职责，就增加功能角度来看，使用装饰者模式比用继承更为灵活。好处是有效地把对象的核心职责和装饰功能区分开，并且通过动态增删装饰去除目标对象中重复的装饰逻辑。  

![alt](http://img.carrotwu.com/FlYzOQ8b-iOWtE_dg9Glw9GeL-qx)  


>下面的装饰器讲直接使用ts的装饰器  

ts已经自带了装饰器，声明是一个函数，接受三个参数。
```ts
function eat(target, key, descriptor) {
  // 修饰类是 target指代的是修的类 key descriptor都为void
  // 修饰类的方法时 target指代的依然是类 key指代的是要装饰的属性名 descriptor表示该属性的描述对象
}
```
注意的是多个装饰器应用使用在同一个声明上时：

1. 由上至下依次对装饰器表达式求值；
2. 求值的结果会被当成函数，由下至上依次调用；

```ts
function f() {
    console.log("f(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("f(): called");
    }
}

function g() {
    console.log("g(): evaluated");
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log("g(): called");
    }
}

class C {
    @f()
    @g()
    method() {}
}

// f(): evaluated
// g(): evaluated
// g(): called
// f(): called
```
```ts
  // 装饰器模式
  class Test {
    miao: boolean
    constructor() {}
    @log
    test(val: number) {
      return val + 1
    }
  }

  function log(target:any, key:string, descriptor:PropertyDescriptor) {
    // 给类加上静态属性
    target.miao = true
    // 获取旧的属性方法 赋值新的方法
    const oldFn = descriptor.value
    descriptor.value = (...args: any[]) => {
      console.log(`log -----`)
      oldFn.apply(args)
    }
  }
```

## 桥接模式
桥接模式（Bridge Pattern）又称桥梁模式，将**抽象部分与它的实现部分**分离，使它们都可以独立地变化。使用**组合关系代替继承关系**，降低抽象和实现两个可变维度的耦合度。（有点像建造者模式）主要有三个部分组成。
> 简单说就是把某个方法的实现拆分成多个部分，有点类似于建造者模式。就像桥一样进行组合拼装可以组成不同类型的桥。与建造者的区别更像是建造者如何造一个桥（水泥，桥墩。。），桥接模式是如何造一个多功能的桥（有灯，有多车道）

1. Product： 产品，由多个独立部件组成的产品；
2. Component： 部件，组成产品的部件类；
3. Instance： 部件类的实例；

![alt](http://img.carrotwu.com/FusYyb4bB6BlsaX0lA4dtDa4ZIIA)  

```ts
  // 桥接模式

  // 组件一个人
  class Person {
    leg: Leg
    arm: Arm
    head: Head
    constructor(headLength: number, armLength: number, legLength: number) {
      this.head = new Head(headLength)
      this.arm = new Arm(armLength)
      this.leg = new Leg(legLength)
    }
    move() {
      this.head.move()
      this.arm.move()
      this.leg.move()

    }
  }
  // 头部
  class Head {
    head: string
    constructor(length: number) {
        this.head =`${length}米长的头`
    }
    
    move() {
        console.log(this.head + '疯狂晃动')
    }
  }
  // 手臂
  class Arm {
    arm: string
    constructor(length: number) {
        this.arm =`${length}米长的手臂`
    }
    
    move() {
        console.log(this.arm + '疯狂摇摆')
    }
  }
  // 腿部
  class Leg {
    leg: string
    constructor(length: number) {
        this.leg =`${length}米长的大腿`
    }
    
    move() {
        console.log(this.leg + '疯狂骚动')
    }
  }
```
### 优缺点

桥接模式的优点：

1. 分离了抽象和实现部分，将实现层（DOM 元素事件触发并执行具体修改逻辑）和抽象层（ 元素外观、尺寸部分的修改函数）解耦，有利于分层；
2. 提高了可扩展性，多个维度的部件自由组合，避免了类继承带来的强耦合关系，也减少了部件类的数量；
3. 使用者不用关心细节的实现，可以方便快捷地进行使用；  


桥接模式的缺点：

1. 桥接模式要求两个部件没有耦合关系，否则无法独立地变化，因此要求正确的对系统变化的维度进行识别，使用范围存在局限性；
2. 桥接模式的引入增加了系统复杂度；

## 发布订阅模式（观察者模式）

发布-订阅模式 （Publish-Subscribe Pattern, pub-sub）又叫观察者模式（Observer Pattern），它定义了一种**一对多**的关系，让**多个订阅者对象同时监听某一个发布者**，或者叫主题对象，这个主题对象的状态发生变化时就会**通知所有订阅自己的订阅者对象**，使得它们能够自动更新自己。

![alt](http://img.carrotwu.com/FngySlszWokSIOdJERt0yUMCSPuV)  


主要有下面几个概念：

1. Publisher ：发布者，当消息发生时负责通知对应订阅者
2. Subscriber ：订阅者，当消息发生时被通知的对象
3. SubscriberMap ：持有不同 type 的数组，存储有所有订阅者的数组
4. type ：消息类型，订阅者可以订阅的不同消息类型
5. subscribe ：该方法为将订阅者添加到 SubscriberMap 中对应的数组中
6. unSubscribe ：该方法为在 SubscriberMap 中删除订阅者
7. notify ：该方法遍历通知 SubscriberMap 中对应 type 的每个订阅者

```ts
  interface EventsType {
    [key: string]: undefined | ((...args:any[]) => any)[]
  }
  // 发布订阅模式
  class EventEmitter {
    private events: EventsType
    private maxLength:number
    private static _instance: EventEmitter
    constructor(maxLength = 10) {
      this.events = Object.create(null)
      this.maxLength = maxLength
    }
    //添加订阅
    addListners(type:string, cb: (...args:any[]) => any) {
      const eventType = this.events[type]
      if(Array.isArray(eventType)){
        if(eventType.length >= this.maxLength){
          throw new Error(`超出${this.maxLength}个监听事件限制啦`)
        }
        eventType.push(cb)
      }else {
        this.events[type] = [cb]
      }
    }
    // 订阅依次
    once(type:string, cb: (...args:any[]) => any) {
      const onceCb = (...args:any[]) => {
        cb && cb.apply(this,args)
        // 执行完成之后删除相应的订阅
        this.removeListners(type, onceCb)
      }
      this.addListners(type, onceCb)
    }
    // 删除订阅
    removeListners(type:string, cb?:(...args:any[]) => any):void {
      // 如果添加了cb 那么只删除一个订阅 不然全部进行删除
      const typeEvents = this.events[type]
      if(!typeEvents){
        return 
      }
      if(!cb){
        this.events[type] = undefined
        return 
      }
      if(typeof cb === 'function'){
        this.events[type] = typeEvents.filter(event => event !== cb)
      }
    }
    // 发布事件
    emitEvents(type: string, ...args: any[]) {
      const eventType = this.events[type]
      if(Array.isArray(eventType)){
        eventType.forEach(cb => cb.apply(this, args))
      }
    }
    // 设置最大订阅数量
    setMaxListners(maxLength: number) {
      if(typeof maxLength === 'number' && maxLength > 0) {
        this.maxLength = maxLength
      }
    }
    // 设置单例
    static getInstance (maxLength: number) {
      if (!EventEmitter._instance) {
        EventEmitter._instance = new EventEmitter(maxLength)
      }
      return EventEmitter._instance
    }
  }
}
```

### 优缺点

发布-订阅模式最大的优点就是**解耦**：

1. 时间上的解耦 ：注册的订阅行为由消息的发布方来决定何时调用，订阅者不用持续关注，当消息发生时发布者会负责通知；
2. 对象上的解耦 ：发布者不用提前知道消息的接受者是谁，发布者只需要遍历处理所有订阅该消息类型的订阅者发送消息即可（迭代器模式），由此解耦了发布者和订阅者之间的联系，互不持有，都依赖于抽象，不再依赖于具体；

发布-订阅模式也有缺点：

1. 增加消耗 ：创建结构和缓存订阅者这两个过程需要消耗计算和内存资源，即使订阅后始终没有触发，订阅者也会始终存在于内存；
2. 增加复杂度 ：订阅者被缓存在一起，如果多个订阅者和发布者层层嵌套，那么程序将变得难以追踪和调试，参考一下 Vue 调试的时候你点开原型链时看到的那堆 deps/subs/watchers 们

### 发布订阅者与观察者模式之间的区别
-----8-------------

区别主要在发布-订阅模式中间的这个 Event Channel：

1. 观察者模式 中的观察者和被观察者之间还存在耦合，被观察者还是知道观察者的；
2. 发布-订阅模式 中的发布者和订阅者不需要知道对方的存在，他们通过消息代理来进行通信，解耦更加彻底；

就像杀手工会，老板下单，工会悬赏，杀手接单。杀手并不能知道是谁下的单，这就是发布订阅模式，中间隔着一个用于发布和订阅的工会。而老板直接指定某个杀手下单，这就是观察者模式，发布者和订阅者都明确知道对反过的信息。

### 策略模式
策略模式 （Strategy Pattern）又称政策模式，其定义一系列的**算法**，把它们一个个封装起来，并且使它们可以互相替换。封装的策略算法一般是独立的，策略模式根据输入来调整采用哪个算法。关键是策略的实现和使用分离。  

>个人认为就是把一些相似或者同一逻辑下不同条件的方法进行封装，通过表驱动的方式。 

```ts
  // 策略模式
  let a = 2;
  let b;
  if (a === 1) {
    b = "1";
  } else if (a === 2) {
    b = "2";
  } else if (a === 3) {
    b = "3";
  } else if (a === 4) {
    b = "4";
  }

  const aMap: any = {
    1: '1',
    2: '2',
    3: '3',
    4: '4'
  }

  // 使用表驱动
  let c = aMap[a]

  // 检查类型的策略模式
  type TypeChecker = {
    'number': number
    'boolean': boolean
    'array': Array<any>
    'object': object
    'function': (...args: any[]) => any
    'string': string
    'null': null
    'undefined': undefined
    'symbol': symbol
    'date': Date
    'error': Error
  }
  const toString = Object.prototype.toString
  const checkType = <U extends keyof TypeChecker>(type: U) => {
    // 检查是否相应的类型
    return function(val: unknown):val is TypeChecker[U]{
      return toString.call(val).slice(8, -1) === type.toLowerCase()
    }
  }
  const isNumber = checkType('number')
  const isArray = checkType('array')
  const isBoolean = checkType('boolean')
  const isObject = checkType('object')
  const isFunction = checkType('function')
  const isUndefined= checkType('undefined')
  const isString = checkType('string')
  const isSymbol = checkType('symbol')
  const isDate = checkType('date')
  const isError = checkType('error')
  const a: number[] | string = Math.random() > 0.5 ? [1] : 'str'
  if(isArray(a)){
    a.push(1)
  }else {
    a.split(',')
  }

}
```

### 优缺点

策略模式将算法的实现和使用拆分，这个特点带来了很多优点：

1. 策略之间相互独立，但策略可以自由切换，这个策略模式的特点给策略模式带来很多灵活性，也提高了策略的复用率；
2. 如果不采用策略模式，那么在选策略时一般会采用多重的条件判断，采用策略模式可以避免多重条件判断，增加可维护性；
3. 可扩展性好，策略可以很方便的进行扩展；

策略模式的缺点：

1. 策略相互独立，因此一些复杂的算法逻辑无法共享，造成一些资源浪费；
2. 如果用户想采用什么策略，必须了解策略的实现，因此所有策略都需向外暴露，这是违背迪米特法则/最少知识原则的，也增加了用户对策略对象的使用成本。

## 职责链模式

职责链有以下特点:  

1. 请求在一系列对象中传递，形成一条链；
2. 链中的请求接受者对请求进行分析，要么处理这个请求，要么把这个请求传递给链的下一个接受者；

就像我们进行请假审批一样，可能需要在app上进行申请，然后hr小姐姐批转完成之后，再推送给部门负责人，部门负责人批准后推送给中心负责人，中心负责人再推送给老板等等等...  

其中，这就是一条完整的职责链，每个人就干自己责任内的事情。另外一个清晰的例子就是redux中的中间件，每个中间件都会对数据进行处理，最后会把数据传递給下一个中间件进行处理以此类推。当然还有`rxjs`的pipe方法等。

### 原理
职责链模式可能在真实的业务代码中见的不多，但是作用域链、原型链、DOM 事件流的事件冒泡，都有职责链模式的影子:

1. 作用域链： 查找变量时，先从当前上下文的变量对象中查找，如果没有找到，就会从父级执行上下文的变量对象中查找，一直找到全局上下文的变量对象。
2. 原型链： 当读取实例的属性时，如果找不到，就会查找当前对象关联的原型中的属性，如果还查不到，就去找原型的原型，一直找到最顶层为止。
3. 事件冒泡： 事件在 DOM 元素上触发后，会从最内层的元素开始发生，一直向外层元素传播，直到全局 document 对象。

### 模拟实现
```ts
  // 职责链模式

  abstract  class Leader {
    nextLeader: Leader
    name: string
    constructor(name:string) {
      this.name = name
    }
    // 执行逻辑方法
    handle(day: number){ }
    //
    pipe(nextLeader: Leader) {
      const _nextLeader = this.nextLeader
      if(_nextLeader){
        _nextLeader.pipe(nextLeader)
      }else {
        this.nextLeader = nextLeader
      }
      return this
    }
  }

  class FirstLeader extends Leader {
    constructor(name: string) {
      super(name)
    }
    handle(day: number) {
      // 大于1天的假期批不了
      if(day > 1) {
        return this.nextLeader.handle(day)
      }else {
        console.log(`可以放假了，${this.name}准你${day}天的假期`)
      }
    }
  }
  class SecondLeader extends Leader {
    constructor(name: string) {
      super(name)
    }
    handle(day: number) {
      // 大于1天的假期批不了
      if(day > 2 && Math.random() > 0.2) {
        return this.nextLeader.handle(day)
      }else {
        console.log(`可以放假了，${this.name}准你${day}天的假期`)
      }
    }
  }
  class ThirdLeader extends Leader {
    constructor(name: string) {
      super(name)
    }
    handle(day: number) {
      // 大于1天的假期批不了
      if(day > 3) {
        return this.nextLeader.handle(day)
      }else {
        console.log(`可以放假了，${this.name}准你${day}天的假期`)
      }
    }
  }
  const zhangsan = new FirstLeader('zhangsan')
  const lisi = new SecondLeader('lisi')
  const zhaowu = new ThirdLeader('zhaowu')

  zhangsan.pipe(lisi).pipe(zhaowu).handle(2)
```

### 优缺点
职责链模式的优点：

1. 和命令模式类似，由于处理请求的职责节点可能是职责链上的任一节点，所以请求的发送者和接受者是解耦的；
2. 通过改变链内的节点或调整节点次序，可以动态地修改责任链，符合开闭原则；  


职责链模式的缺点：

1. 并不能保证请求一定会被处理，有可能到最后一个节点还不能处理；
2. 调试不便，调用层次会比较深，也有可能会导致循环引用；

## 中介者模式
中介者模式 （Mediator Pattern）又称调停模式，使得各对象不用显式地相互引用，将对象与对象之间紧密的耦合关系变得松散，从而可以独立地改变他们。**核心是多个对象之间复杂交互的封装**。

### 原理

解除对象与对象之间的紧耦合关系。增加一个中介者对象后，所有的相关对象都通过**中介者对象来通信**，而不是互相引用，所有当一个对象发生改变时，只需要通知中介者对象即可。中介者使各对象之间耦合松散，而且可以独立地改变它们之间的交互。中介者模式使网状的**多对多**关系变成了相对简单的**一对多**关系。  


1. Colleague： 同事对象，只知道中介者而不知道其他同事对象，通过中介者来与其他同事对象通信；
2. Mediator： 中介者，负责与各同事对象的通信；  

![alt](http://img.carrotwu.com/FtsAF0vMxV3n-f_0FNtnYv9kSjZa)  


### 模拟实现--泡泡堂游戏
```ts
  // 中介者模式
  type Color = "red" | "blue" | "yellow" | "green";
  type State = "die" | "alive";
  class Player {
    name: string;
    teamColor: Color;
    state: State;
    partners: Player[];
    enemies: Player[];
    constructor(name: string, color: Color) {
      this.partners = []; // 队友列表
      this.enemies = []; // 敌人列表
      this.state = "alive"; // 玩家状态
      this.name = name; // 角色名字
      this.teamColor = color; // 队伍颜色
    }
    // 一位玩家死了 需要通知其他玩家把队友列表或者敌人列表清除 并且如果所有队友都死了 那就得打印失败
    setDie() {
      this.state = "die";
      let all_dead = true
      // 遍历队友列表
      for (var i = 0, partner; (partner = this.partners[i++]); ) {
        if (partner.state !== "die") {
          all_dead = false;
          break;
        }
      }
      // 如果队友全部死亡
      if (all_dead === true) {
        this.lose();
        // 通知所有队友玩家游戏失败
        for (var i = 0, partner; (partner = this.partners[i++]); ) {
          partner.lose();
        }

        // 通知所有敌人游戏胜利
        for (var i = 0, enemy; (enemy = this.enemies[i++]); ) {
          enemy.win();
        }
      }
    }
    lose() {
      console.log(`${this.teamColor} 颜色队伍失败`)
    }
    win() {
      console.log(`${this.teamColor} 颜色队伍胜利`)
    }
  }
```

试想如果有8个玩家一起在游玩游戏，每个玩家都必须与另外七个玩家的状态相关联，一个玩家的死亡会影响另外七个玩家的状态，可想而知后续逻辑会非常复杂。所以我们可以通过引入中介者模式——增加一个导演类来控制玩家间的状态。
```ts
  // 中介者模式
  type Color = "red" | "blue" | "yellow" | "green";
  type State = "die" | "alive";

  interface PlayerParams {
    name: string;
    color: Color;
    director: Director;
  }
  // 玩家类
  class Player {
    name: string;
    teamColor: Color;
    state: State;
    director: Director;
    constructor(params: PlayerParams) {
      const { name, color, director } = params;
      this.state = "alive"; // 玩家状态
      this.name = name; // 角色名字
      this.teamColor = color; // 队伍颜色
      this.director = director; //导演
    }
    // 一位玩家死了通知导演 导演进行处理
    die() {
      this.state = "die";
      this.director.notifyDie(this);
    }
    lose() {
      console.log(`玩家${this.name}失败`);
    }
    win() {
      console.log(`玩家${this.name}胜利`);
    }
  }

  type TeamPlayers = {
    [P in Color]?: Player[];
  };
  // 导演类 用于控制玩家之间的状态
  class Director {
    teamPlayers: TeamPlayers;
    // 任然处于处于活着状态的队伍
    aliveTeam: Color[];
    createPlayer(name: string, color: Color) {
      return new Player({ name, color, director: this });
    }
    addPlayer(player: Player) {
      const { teamColor } = player;
      const currentTeam = this.teamPlayers[teamColor];
      this.teamPlayers[teamColor] = currentTeam
        ? currentTeam.concat(player)
        : [player];
      return this;
    }
    // 删除某位玩家
    removePlayer(player: Player) {
      const { teamColor, name } = player;
      const currentTeam = this.teamPlayers[teamColor];
      this.teamPlayers[teamColor] = currentTeam.filter(
        player => player.name !== name
      );
      return this;
    }
    // 玩家换队伍
    toggleTeam(player: Player, toggleTeamColor: Color) {
      this.removePlayer(player);
      player.teamColor = toggleTeamColor;
      this.addPlayer(player);
    }
    // 某位玩家死亡
    notifyDie(player: Player) {
      // 检验当前颜色的团队是否都死亡
      const { teamColor } = player;
      const teamArray = this.teamPlayers[teamColor];
      const isTeamAllDie = teamArray.every(player => player.state === "die");
      if (isTeamAllDie) {
        // 全部死掉 通知队友打印失败
        teamArray.forEach(player => player.die());
        // 移除当前队伍
        this.aliveTeam = this.aliveTeam.filter(color => color !== teamColor);
        // 如果队伍只剩一只 打印当前队伍的胜利
        if (this.aliveTeam.length === 1) {
          const winTeamColor = this.aliveTeam[0];
          this.teamPlayers[winTeamColor].forEach(player => player.win());
        }
      }
    }
  }
```