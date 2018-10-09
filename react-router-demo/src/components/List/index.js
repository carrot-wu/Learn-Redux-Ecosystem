import React, { Component } from 'react'
import './style.css'
/*
const Lists = ({index = 1,positionX,positionY})=>(
  <div className='list'>
    <div>i am index</div>
    <div >{positionX}</div>
    <div >{positionY}</div>
  </div>

)
*/

export default class Lists extends Component{
  render(){
    const {index = 1,positionX,positionY} = this.props

    return (
      <div className='list'>
        <div>i am index</div>
        <div >{positionX}</div>
        <div >{positionY}</div>
      </div>

    )
  }
}