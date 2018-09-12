import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrapMapToProps'
//跟mapDispatchToProps类似
export function whenMapStateToPropsIsFunction(mapStateToProps) {
  return (typeof mapStateToProps === 'function')
    ? wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
    : undefined
}

export function whenMapStateToPropsIsMissing(mapStateToProps) {
  return (!mapStateToProps)
    ? wrapMapToPropsConstant(() => ({}))
    : undefined
}

export default [
  whenMapStateToPropsIsFunction,
  whenMapStateToPropsIsMissing
]
