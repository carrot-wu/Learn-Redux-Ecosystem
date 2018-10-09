import React from 'react'
import { Route } from 'react-router-dom'

const mapRoutes = routes => {
  if (!routes || routes.length === 0) {
    return null
  }
  return routes.map(route => {
    const { component, children, ...extraProps } = route
    return <Route {...extraProps}
                  key={route.name}
                  render={(props) => (
                    <route.component {...props}>
                      {mapRoutes(children)}
                    </route.component>
                  )}
    />
  })

}
export default mapRoutes