import React, { Component } from 'react'
import ScrollList from '../../components/ScrollList'
import Lists from '../../components/List'

export default class Home extends Component {

  state = {
    value: 0
  }
  changeValue = () => {
    this.setState({value:this.state.value + 1})
  }
  componentDidMount(){
    this.test.addEventListener('click',() =>{
      this.changeValue()
      console.log(this.state.value)
    })
  }
  render () {
    //const test = (new Array(100)).fill(1)
    return (
      <div className='homeContainer'  ref={(test) => this.test=test}>
        <div>i am home {this.state.value}</div>
        <ScrollList
          render={
            (pageX, pageY) => (<Lists index={123} positionX={pageX} positionY={pageY} page={234}/>)}
        />
      </div>
    )
  }
}
