const getPrototypeString = Object.prototype.toString
type Type = {
    'Null': null;
    'Undefined': undefined
    'Boolean': boolean
    'String': string
    'Number': number
    'Object': object
    'Function': Function
    'Array': Array<any>
    'Error': Error,
    'Date': Date,
    'Symbol': symbol
}

interface IsType {
    <U extends keyof Type, P extends Type[U]>(type: U): (val: unknown) => val is P
}
let checkType: IsType = function(type) {
    return (val) => getPrototypeString.call(val) === `[object ${type}]`
}
const a: string |[number, string, number[]] = Math.random() > 0.5 ? '123' : [1, '2', [1,2]]

function isStringTest(val:unknown):val is string {
    return 
}

const isNumber = checkType('Number')
const isNull = checkType('Null')
const isFunction = checkType('Function')
const isObject = checkType('Object')
const isArray = checkType('Array')
const isError = checkType('Error')
const isBoolean = checkType('Boolean')
const isUndefined = checkType('Undefined')
const isDate = checkType('Date')
const isSymbol = checkType('Symbol')
if(isArray(a)){
 a.push(1)
}else {
 a.trim()
}
