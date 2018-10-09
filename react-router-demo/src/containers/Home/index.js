import React, { Component } from 'react'
import ScrollList from '../../components/ScrollList'
import Lists from '../../components/List'

export default class Home extends Component {

  render () {
    //const test = (new Array(100)).fill(1)
    return (
      <div className='homeContainer'>
        <div>i am home</div>
        <ScrollList
          render={(pageX, pageY) => (<Lists index={123}
                                           positionX={pageX}
                                           positionY={pageY}
                                           page={234}/>)}
        />
      </div>
    )
  }
}