import * as defaultBuilder from './default-builder.js'
import * as customerBuilder from '../customer/afb-builder.js'

const result = {...defaultBuilder, ...customerBuilder}
export default result;