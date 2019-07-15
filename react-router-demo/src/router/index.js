import Home from '../containers/Home/index'
import PageA from '../containers/PageA/index'
import PageB from '../containers/pageB/index'
import PageADetail from '../containers/PageADetail/index'
import UnHandlePage from '../components/404'

const routers = [
  {
    path:'/',
    exact:true,
    shouldLogin:false,
    name:'index',
    component:Home
  },
  {
    path:'/home',
    name:'home',
    component:Home
  },
  {
    path:'/pageA',
    name:'pageA',
    component:PageA,
    children:[
      {
        path:'/pageA/:id',
        shouldLogin:false,
        name:'pageADetail',
        component:PageADetail
      },
    ]
  },
  {
    path:'/pageB',
    name:'pageB',
    render: (props) => isUserInfoAccomplish ? <PageB {...props}/> : <Redirect to="/studentInfo"/>
  },
  {
    path:'/404',
    name:'404',
    component:UnHandlePage
  },
]
export  {routers}
