// /*
// * 设计模式的总结
// * */

// /**
//  * 单例模式
//  */
// class Single {
//   name: string
//   private static _instance : Single
//   constructor (name: string) {
//     this.name = name
//   }
//   tellName () {
//     console.log(this.name)
//   }
//   static getInstance (name: string) {
//     if (!Single._instance) {
//       Single._instance = new Single(name)
//     }
//     return Single._instance
//   }
// }

// console.log(Single.getInstance('hh') === Single.getInstance('hh')) //true
// /*策略模式*/
// //之后对于一些需要判断ifelse的操作其实都可以通过策略模式来实现 这样子的话对于后期的维护也是十分的简单
// //其实就是把不同的操作通过对象的key值来获取 而不是通过switch 或者 if else来实现 有点类似于状态机
// //假设一个状态机有4个状态 0关闭  1付款中  2已付款  3已取消
// const status = {
//   0: () => {
//     console.log('close')
//   },
//   1: () => {
//     console.log('paying')
//   },
//   2: () => {
//     console.log('paid')
//   },
//   3: () => {
//     console.log('cancel')
//   }
// }

// /* 观察者模式*/

// //其实就是类似于 jquery里面的on方法
// class eventEmitter {
//   constructor (maxLength = 10) {
//     this._events = Object.create(null)
//     this.maxLength = maxLength
//   }

//   addListners (type, cb) {
//     //判断是否已经添加了这个方法了 如若添加了的话必须放进去一个数组中 超过的话直接报错
//     if (this._events[type] && this._events[type].length === this.maxLength) throw new Error(`超出${this.maxLength}个监听事件限制啦`)
//     this._events[type] = this._events[type] ? [...this._events[type], cb] : [cb]

//   }

//   emitEvents (type, ...args) {
//     if (this._events[type]) {
//       this._events[type].forEach((listner) => {
//         listner.apply(this, args)
//       })
//     }
//   }

//   //监听一次 只触发一次就要删除
//   once (type, cb) {
//     //先绑定 在addListners的基础上调用之后就删除 重新声明一个函数
//     function onceListners (...args) {
//       cb && cb.apply(this, args)
//       //调用完成之后删除这个监听器
//       this.removeListner(type, onceListners)

//     }

//     this.addListners(type, onceListners)
//   }

//   removeListner (type, cb) {
//     const removeTarget = this._events[type]
//     if (removeTarget) {
//       //如果没传cb 说明全部删除
//       if (!cb) {
//         this._events[type] = []
//       }
//       this._events[type] = this._events[type].reduce((prev, cur) => {
//         if (cur !== cb) {
//           prev.push(cur)
//         }

//         return prev
//       }, [])

//     }
//   }

//   //设置最大监听数
//   setMaxListners (n = 10) {
//     this.maxmaxLength = n
//   }

//   static getInstance (maxLength = 10) {
//     if (eventEmitter._instance) {
//       return eventEmitter._instance
//     } else {
//       eventEmitter._instance = new eventEmitter(maxLength)
//       return eventEmitter._instance
//     }
//   }
// }

// /*适配器模式*/
// //不同国家的插头不通用可以用一个适配器进行适配
// //其实这个地方一般常用于重构老方法的依赖包 但是老方法的api调用又暂时无法测地抛弃掉的时候 比如老版本我用了jquery的 $.ajax 这时候重构掉抛弃了jquery 可以重写$.ajax方法进行适配

// /*工厂模式*/

// //把重复性的操作进行封装 比如创建一些类似的对象
// function createObject (type) {
//   switch (type) {
//     case '1':
//       return { type, name: 'object' }
//     default:
//       return []
//   }
// }

// /*代理模式*/
// //可以把分模块的api请求 共同引用到一个api文件中 这样子所有的请求都可以引入这个api文件进行条用

// /*装饰器模式*/
// //钢铁写知道吧 基本就是人 但是可以铁架不同的功能进行增强功能 原理就是装饰器模式 其实就是类似于类的继承进行添加实例方法或者重写方法
// //es7的装饰器函数其实可以写啊 function(target,name,descortor)

{
  type AnimalType = "cat" | "dog";
  // 工厂类
  class AnimalFactory {
    static getInstance(type: AnimalType, name: string): Cat | Dog {
      switch (type) {
        case "cat":
          return new Cat(name);
          break;

        case "dog":
          return new Dog(name);
          break;

        default:
          break;
      }
    }
  }
  // 声明两个产品类
  class Cat {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
    say() {
      console.log(`cat name is ${this.name}`);
    }
    miao() {
      console.log(`cat ${this.name} miao miao miao`);
    }
  }
  class Dog {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
    say() {
      console.log(`Dog name is ${this.name}`);
    }
  }
}
// 抽象工厂
{
  type AnimalType = "cat" | "dog";
  // 工厂类
  class AnimalFactory {
    static getInstance(type: AnimalType, name: string): Cat | Dog {
      switch (type) {
        case "cat":
          return new Cat(name);
          break;

        case "dog":
          return new Dog(name);
          break;

        default:
          break;
      }
    }
  }
  // 声明一个抽象类
  abstract class AbstractAnimal {
    name: string;
    type: string;
    constructor(type: string, name: string) {
      this.name = name;
      this.type = type;
    }

    say() {
      console.log(`${this.type} name is ${this.name}`);
    }
  }

  // 具体的cat 和dog类继承
  class Cat extends AbstractAnimal {
    name: string;
    constructor(name: string) {
      super("cat", name);
    }
    miao() {
      console.log(`${this.type} ${this.name} miao miao miao`);
    }
  }
  class Dog extends AbstractAnimal {
    name: string;
    constructor(name: string) {
      super("dog", name);
    }
    bark() {
      console.log(`${this.type} ${this.name} bark me ~~~~`);
    }
  }
}

// 建造者模式
{
  // 零件组件者
  class Builder {
    params: object;
    part1: string;
    part2: string;
    constructor(params: object = {}) {
      this.params = params;
    }
    buildPart1() {
      // 也可以调用其他类的方然
      this.part1 = "part1";
      // this.part1 = new LunTai(params)
      return this;
    }
    buildPart2() {
      // 也可以调用其他类的方然
      this.part2 = "part1";
      // this.part1 = new LunTai(params)
      return this;
    }
  }

  // 组装者
  class Director {
    params: object;
    constructor(params: object = {}) {
      this.params = params;
      return new Builder(params).buildPart1().buildPart2();
    }
  }

  const params = {};
  // 获取产品
  const product = new Director(params);
}

{
  // 代理模式
  // 明星类 只负责拍电影
  class Singer {
    name: string;
    constructor(name: string) {
      this.name = name;
    }
    playMovie(movieName: string) {
      console.log(`${this.name} begin playing movie ${movieName}`);
    }
  }

  // 经纪人
  class Assitant {
    name: string;
    mySinger: Singer;
    minMoney: number;
    constructor(name: string) {
      this.name = name;
    }
    // 设置为谁的经纪人
    setSinger(singer: Singer, minMoney: number) {
      this.mySinger = singer;
      this.minMoney = minMoney;
    }
    // 接电影通告
    adjustMovie(money: number, movieName: string) {
      if (!this.mySinger) {
        throw new Error("暂无工作");
      }
      if (money < this.minMoney) {
        throw new Error("给我爬， 价格太低了");
      }
      this.mySinger.playMovie(movieName);
    }
  }
  const cxk = new Singer("cxk");
  const cxkjjr = new Assitant("cxkjjr");
  cxkjjr.setSinger(cxk, 10000000);

  cxkjjr.adjustMovie(10000, "打篮球"); // 给我爬， 价格太低了
  cxkjjr.adjustMovie(100000000, "鸡你太美"); // cxk begin playing movie 鸡你太美
}

// 享元模式
{
  // 考试车
  class ExamCar {
    readonly carId: number;
    isUsing: boolean;
    constructor(carId: number) {
      this.carId = carId;
      this.isUsing = false;
    }

    examine(studentId: number) {
      this.isUsing = true;
      console.log(`${studentId}在${this.carId}开始考试`);
      const time = Math.ceil(Number(Math.random()) * 3);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.isUsing = false;
          console.log(
            `${studentId}在${this.carId}考试车经过${time}s后考试完毕`
          );
          resolve();
        }, time * 1000);
      });
    }
  }

  // 资源池
  class ExamCarPool {
    carPool: ExamCar[];
    taskQueue: (() => Promise<void>)[];
    constructor() {
      this.carPool = [];
      this.taskQueue = [];
    }
    // 增加考试车
    addExamCar(car: ExamCar) {
      this.carPool.push(car);
    }
    // 初始化考试车
    initExamCar(carIdArray: number[]) {
      for (let id of carIdArray) {
        this.addExamCar(new ExamCar(id));
      }
    }
    // 增加考试人员
    addExamStudent(studentIdArray: number[]) {
      const taskArray: (() => Promise<void>)[] = studentIdArray.map(
        studentId => {
          return async () => {
            const car = this.getUnUsedCar();
            await car.examine(studentId);
            this.next();
          };
        }
      );
      this.taskQueue = [...this.taskQueue, ...taskArray];
    }
    // 获取没人使用的车辆
    getUnUsedCar() {
      return this.carPool.find(car => !car.isUsing);
    }
    next() {
      const task = this.taskQueue.shift();
      if (typeof task === "function") {
        task();
      }
    }
    // 开始考试
    startExam() {
      for (let i = 0; i < this.carPool.length; i++) {
        this.next();
      }
    }
  }

  const carExam = new ExamCarPool();
  carExam.initExamCar([11, 22, 33]);
  carExam.addExamCar(new ExamCar(44));
  carExam.addExamStudent([99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88]);
  carExam.startExam();
}

{
  // 装饰器模式

  class Test {
    miao: boolean;
    constructor() {}
    @log
    test(val: number) {
      return val + 1;
    }
  }

  function log(target: any, key: string, descriptor: PropertyDescriptor) {
    // 给类加上静态属性
    target.miao = true;
    // 获取旧的属性方法 赋值新的方法
    const oldFn = descriptor.value;
    descriptor.value = (...args: any[]) => {
      console.log(`log -----`);
      oldFn.apply(args);
    };
  }
}

{
  // 桥接模式

  // 组件一个人
  class Person {
    leg: Leg;
    arm: Arm;
    head: Head;
    constructor(headLength: number, armLength: number, legLength: number) {
      this.head = new Head(headLength);
      this.arm = new Arm(armLength);
      this.leg = new Leg(legLength);
    }
    move() {
      this.head.move();
      this.arm.move();
      this.leg.move();
    }
  }
  // 头部
  class Head {
    head: string;
    constructor(length: number) {
      this.head = `${length}米长的头`;
    }

    move() {
      console.log(this.head + "疯狂晃动");
    }
  }
  // 手臂
  class Arm {
    arm: string;
    constructor(length: number) {
      this.arm = `${length}米长的手臂`;
    }

    move() {
      console.log(this.arm + "疯狂摇摆");
    }
  }
  // 腿部
  class Leg {
    leg: string;
    constructor(length: number) {
      this.leg = `${length}米长的大腿`;
    }

    move() {
      console.log(this.leg + "疯狂骚动");
    }
  }
}

{
  interface EventsType {
    [key: string]: undefined | ((...args: any[]) => any)[];
  }
  // 发布订阅模式
  class EventEmitter {
    private events: EventsType;
    private maxLength: number;
    private static _instance: EventEmitter;
    constructor(maxLength = 10) {
      this.events = Object.create(null);
      this.maxLength = maxLength;
    }
    //添加订阅
    addListners(type: string, cb: (...args: any[]) => any) {
      const eventType = this.events[type];
      if (Array.isArray(eventType)) {
        if (eventType.length >= this.maxLength) {
          throw new Error(`超出${this.maxLength}个监听事件限制啦`);
        }
        eventType.push(cb);
      } else {
        this.events[type] = [cb];
      }
    }
    // 订阅依次
    once(type: string, cb: (...args: any[]) => any) {
      const onceCb = (...args: any[]) => {
        cb && cb.apply(this, args);
        // 执行完成之后删除相应的订阅
        this.removeListners(type, onceCb);
      };
      this.addListners(type, onceCb);
    }

    // 删除订阅
    removeListners(type: string, cb?: (...args: any[]) => any): void {
      // 如果添加了cb 那么只删除一个订阅 不然全部进行删除
      const typeEvents = this.events[type];
      if (!typeEvents) {
        return;
      }
      if (!cb) {
        this.events[type] = undefined;
        return;
      }
      if (typeof cb === "function") {
        this.events[type] = typeEvents.filter(event => event !== cb);
      }
    }
    // 发布事件
    emitEvents(type: string, ...args: any[]) {
      const eventType = this.events[type];
      if (Array.isArray(eventType)) {
        eventType.forEach(cb => cb.apply(this, args));
      }
    }
    // 设置最大订阅数量
    setMaxListners(maxLength: number) {
      if (typeof maxLength === "number" && maxLength > 0) {
        this.maxLength = maxLength;
      }
    }
    static getInstance(maxLength: number) {
      if (!EventEmitter._instance) {
        EventEmitter._instance = new EventEmitter(maxLength);
      }
      return EventEmitter._instance;
    }
  }
}

{
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
    1: "1",
    2: "2",
    3: "3",
    4: "4"
  };

  // 使用表驱动
  let c = aMap[a];
}

{
  type TypeChecker = {
    number: number;
    boolean: boolean;
    array: Array<any>;
    object: object;
    function: (...args: any[]) => any;
    string: string;
    null: null;
    undefined: undefined;
    symbol: symbol;
    date: Date;
    error: Error;
  };
  const toString = Object.prototype.toString;
  const checkType = <U extends keyof TypeChecker>(type: U) => {
    return function(val: unknown): val is TypeChecker[U] {
      return toString.call(val).slice(8, -1) === type.toLowerCase();
    };
  };
  const isNumber = checkType("number");
  const isArray = checkType("array");
  const isBoolean = checkType("boolean");
  const isPlainObject = checkType("object");
  const isFunction = checkType("function");
  const isUndefined = checkType("undefined");
  const isString = checkType("string");
  const isSymbol = checkType("symbol");
  const isDate = checkType("date");
  const isError = checkType("error");
  const a: number[] | string = Math.random() > 0.5 ? [1] : "str";
  if (isArray(a)) {
    a.push(1);
  } else {
    a.split(",");
  }
}

{
  // 职责链模式

  abstract class Leader {
    nextLeader: Leader;
    name: string;
    constructor(name: string) {
      this.name = name;
    }
    // 执行逻辑方法
    handle(day: number) {}
    //
    pipe(nextLeader: Leader) {
      const _nextLeader = this.nextLeader;
      if (_nextLeader) {
        _nextLeader.pipe(nextLeader);
      } else {
        this.nextLeader = nextLeader;
      }
      return this;
    }
  }

  class FirstLeader extends Leader {
    constructor(name: string) {
      super(name);
    }
    handle(day: number) {
      // 大于1天的假期批不了
      if (day > 1) {
        return this.nextLeader.handle(day);
      } else {
        console.log(`可以放假了，${this.name}准你${day}天的假期`);
      }
    }
  }
  class SecondLeader extends Leader {
    constructor(name: string) {
      super(name);
    }
    handle(day: number) {
      // 大于1天的假期批不了
      if (day > 2 && Math.random() > 0.2) {
        return this.nextLeader.handle(day);
      } else {
        console.log(`可以放假了，${this.name}准你${day}天的假期`);
      }
    }
  }
  class ThirdLeader extends Leader {
    constructor(name: string) {
      super(name);
    }
    handle(day: number) {
      // 大于1天的假期批不了
      if (day > 3) {
        return this.nextLeader.handle(day);
      } else {
        console.log(`可以放假了，${this.name}准你${day}天的假期`);
      }
    }
  }
  const zhangsan = new FirstLeader("zhangsan");
  const lisi = new SecondLeader("lisi");
  const zhaowu = new ThirdLeader("zhaowu");

  zhangsan
    .pipe(lisi)
    .pipe(zhaowu)
    .handle(2);
}

{
  // 中介者模式
  type Color = "red" | "blue" | "yellow" | "green";
  type State = "die" | "alive";

  interface PlayerParams {
    name: string,
    color: Color,
    director: Director
  }
  // 玩家类
  class Player {
    name: string;
    teamColor: Color;
    state: State;
    director: Director;
    constructor(params: PlayerParams) {
      const {name, color, director} = params
      this.state = "alive"; // 玩家状态
      this.name = name; // 角色名字
      this.teamColor = color; // 队伍颜色
      this.director = director; //导演
    }
    // 一位玩家死了通知导演 导演进行处理
    die() {
      this.state = 'die'
      this.director.notifyDie(this)
    }
    lose() {
      console.log(`玩家${this.name}失败`)
    }
    win() {
      console.log(`玩家${this.name}胜利`)
    }
  }

  type TeamPlayers = {
    [P in Color]?: Player[]
  }
    // 导演类 用于控制玩家之间的状态
    class Director {
      teamPlayers: TeamPlayers;
      // 任然处于处于活着状态的队伍
      aliveTeam: Color[];
      createPlayer(name: string, color: Color) {
        return new Player({name, color, director: this})
      }
      addPlayer(player: Player) {
        const {teamColor} = player
        const currentTeam = this.teamPlayers[teamColor]
        this.teamPlayers[teamColor] = currentTeam ? currentTeam.concat(player) : [player]
        return this
      }
      // 删除某位玩家
      removePlayer(player: Player) {
        const {teamColor, name} = player
        const currentTeam = this.teamPlayers[teamColor]
        this.teamPlayers[teamColor] = currentTeam.filter(player => player.name !== name)
        return this
      }
      // 玩家换队伍
      toggleTeam(player: Player, toggleTeamColor: Color) {
        this.removePlayer(player)
        player.teamColor = toggleTeamColor
        this.addPlayer(player)
      }
      // 某位玩家死亡
      notifyDie(player: Player) {
        // 检验当前颜色的团队是否都死亡
        const {teamColor} = player
        const teamArray = this.teamPlayers[teamColor]
        const isTeamAllDie = teamArray.every(player => player.state === 'die')
        if(isTeamAllDie) {
          // 全部死掉 通知队友打印失败
          teamArray.forEach(player => player.die())
          // 移除当前队伍
          this.aliveTeam = this.aliveTeam.filter(color => color !== teamColor)
          // 如果队伍只剩一只 打印当前队伍的胜利
          if(this.aliveTeam.length === 1) {
            const winTeamColor = this.aliveTeam[0]
            this.teamPlayers[winTeamColor].forEach(player => player.win())
          }
        }
      }
    }
  
}
