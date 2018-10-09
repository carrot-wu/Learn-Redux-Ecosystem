import React, { Component } from 'react'
import {HashRouter,Switch,Redirect} from 'react-router-dom'
import './App.css'
import mapRoutes from './util/mapRoutes'
import {routers} from './router'


class App extends Component {
  render () {
    return (
      <div className="App">
        <HashRouter>
          <Switch>
            {mapRoutes(routers)}
            <Redirect to='/404'/>
          </Switch>
        </HashRouter>
      </div>
    )
  }
}

export default App
