import React, { Component } from 'react'
import './style.css'
export default class ScrollList extends Component{
    state = {
      positionX:0,
      positionY:0,
    }

    mouseOverFn = (e) =>{
      this.setState({
        positionX:e.screenX,
        positionY:e.screenY
      })
      console.log(e.screenX,e.screenY)
    }
    render(){
      const {positionX,positionY} = this.state
      return (
        <div onMouseMove={(e)=>this.mouseOverFn(e)}>
          {this.props.render(positionX,positionY)}
        </div>
      )
    }
  }


