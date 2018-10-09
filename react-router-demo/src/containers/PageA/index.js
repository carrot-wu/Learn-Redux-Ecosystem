import React,{Component,Children} from 'react'
import './style.css'
export default class PageA extends Component{
  constructor(props){
    super(props)
    this.state = {
     test : (new Array(100)).fill(1)
    }
  }
  clickItem = (index) =>{
    console.log(1)
    this.props.history.push(`/pageA/${index}`)
  }
  render () {
    console.log(React.Children)
    return (
      <div>
        <div className='pageA'>
          <div>i am pageA</div>
          {
            this.state.test.map((item, index) => (
              <div
                key={index}
                onClick={(index) => this.clickItem(index)}
              >{index + 1}</div>
            ))
          }
        </div>
        {this.props.children}

      </div>
    )
  }
}