import Home from '../containers/Home/index'
import PageA from '../containers/PageA/index'
import PageADetail from '../containers/PageADetail/index'
import UnHandlePage from '../components/404'

const routers = [
  {
    path:'/',
    exact:true,
    shouldLogin:false,
    permission:['admin'],
    name:'index',
    component:Home
  },
  {
    path:'/home',
    shouldLogin:false,
    permission:['admin'],
    name:'home',
    component:Home
  },
  {
    path:'/pageA',
    shouldLogin:false,
    permission:['admin'],
    name:'pageA',
    component:PageA,
    children:[
      {
        path:'/pageA/:id',
        shouldLogin:false,
        permission:['admin'],
        name:'pageADetail',
        component:PageADetail
      },
    ]
  },
  {
    path:'/404',
    shouldLogin:false,
    permission:['admin'],
    name:'404',
    component:UnHandlePage
  },
]
export  {routers}