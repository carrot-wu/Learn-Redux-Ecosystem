import React,{Component} from 'react'
import './style.css'
export default class PageADetail extends Component{
  render(){
    console.log(this.props)
    return (
      <div className='page'>i am PageADetail</div>
    )
  }
}