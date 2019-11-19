# react-native踩过的坑

>工作中需要使用到`react-native`进行混合开发一款ios的app，因为我使用的是windows，不是使用的mac电脑（没钱），公司配备了一台ipad用于开发，在开发中也踩过了很多坑在这里进行总结。

## 开发环境的调试（使用mac电脑可以直接跳过这一步）。
因为我使用的是windows，所以只能退而求其次的在window上进行编写代码，在ipad端进行查看效果以及debug。使用官方上的`create-react-native-app`。安装完下载好依赖包之后就可以在windows上愉快的进行开发了。  
    
运行yarn start,在控制台会直接跳出一个二维码以及连接。之后，在ios设备或者安卓设备上进行`expo`的下载。相应的安装包可以再`Google play`或者`apple store`都可以直接搜到。安装完成之后，安卓设备可以直接通过软件内部的二维码扫描控制台的二维码即可预览，苹果设备的话则需要手动输入链接。

## `react-native TextInput`无法输入中文的问题。
切换中文输入法，只要一输入一个字母自动填充金输入框了。看了一下[**issues**](https://github.com/facebook/react-native/pull/18456 "Markdown")发现是rn自己的bug。使用了其中一个人的方法之后经测试没有问题了（ps：看了一下最新的issues，最新版rn好像已经修复了这个问题）

```jsx
import React, {Component} from 'react';
import {Platform, TextInput} from 'react-native';

class MyTextInput extends Component {
  shouldComponentUpdate(nextProps){
    return Platform.OS !== 'ios' || this.props.value === nextProps.value;
  }
  render() {
    return <TextInput {...this.props} />;
  }
};

export default MyTextInput;
```
## 关于图片自适应的问题。
最开始需求是一行四个图片，然后图片根据屏幕宽度自适应的需求，一行四个是完成了。但是图片的高并不像web一样自动撑大或者缩小，图片各种变形。后面试了很多方法，没办法只能在`componentDidMount`生命周期内获取屏幕的宽度计算出图片的实际宽度再按照图片本身的宽高比计算出实际的自适应高度进行样式的填充。**`Dimensions.get('window').width`**为获取屏幕宽度的。

## rn程序的无端崩溃。
在实际集成到项目部署到测试环境的过程中，我们发现程序在运行一段时候之后会莫名的直接崩溃返回主页面，页面直接随机性的崩溃也没有报出红屏的错误。再与ios的开发同事协调之后我们终于定位到了相关的bug。

```javascript
com.squareup.SocketRocket.NetworkThread(18): EXC_BAD_ACCESS
```

 查阅了相关资料之后发现这是因为rn的websocket包出现了问题，查找了`issues`发现了相关人员的评论[**issues**](https://github.com/facebook/react-native/issues/6117 "Markdown")。   
    
参考了[**issues**](https://github.com/facebook/react-native/issues/19489 "Markdown")里pr的`files changed`我们让ios的同事根据`files changed`里的修改修改了`Libraries/WebSocket/RCTSRWebSocket.m`的文件之后，问题解决（我挂了两晚上也没有崩溃）。然而官方这个pr不知道为啥莫名其妙没有通过。。。

## 获取原生保存的数据
在开发的过程中，有时候需要使用到登录用户信息，但是我们有无法监听到用户是否切换了用户。在经过与ios的协调之后，ios会在rn文件的入口处通过props传输我们需要的数据，我们只需在最顶层（app。js）的props中获取原生传给我们的信息。再根据需要时传给子组件还是通过redux保存起来。

## 图标svg的使用。
最开始关于图标的使用最初的方案定在使用svg，但是rn对于svg的兼容并不友好，生态上其实也有类似于`react-native-svg`的库。在经过一些测试后还是被我们否决了，后面发现了一个牛逼的网站[**SVGR : The SVG to JSX transformer**](https://github.com/facebook/react-native/issues/19489 "Markdown")。  
    
这个网站能把web的svg转换成react或者rn都能使用的组件类型。把svg的源码拷贝到左边的输入框中，在左边勾选上React Native会自动帮你生成rn能够使用的组件，直接复制新建一个js文件即可。在项目中直接当做组件引用使用就可以了，还有一些自定义的参数大家可以按需求自动添加。  

![alt](http://img.carrotwu.com/FmyFnCWKtazeqlebb5Rb4xIz93JZ)

## rn路由的使用。
在经过一系列的商量之后，我们选择使用`react-navigation`进行rn路由的跳转。在我们编写项目时，`react-navigation`升级到了v3，提供了许多新的api和用法。当然也踩了许多坑。  

自定义组件的路由跳转。`react-navigation`的路由跳转是通过定义在props上的navigation属性进行调用跳转，一些自定义组件并不能接收到路由跳转的props,得通过`withNavigation`这个高阶组件进行包装

