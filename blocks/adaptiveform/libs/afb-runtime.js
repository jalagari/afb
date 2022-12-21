console.time("script af-core")
//import { formatDate, getSkeleton } from '@aemforms/af-formatters';
import { Formula } from './json-formula.js';

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/** Constant for all properties which can be translated based on `adaptive form specification` */
const translationProps = ['description', 'placeholder', 'enum', 'enumNames', 'label.value', 'constraintMessages.accept', 'constraintMessages.enum', 'constraintMessages.exclusiveMinimum', 'constraintMessages.exclusiveMaximum', 'constraintMessages.format', 'constraintMessages.maxFileSize', 'constraintMessages.maxLength', 'constraintMessages.maximum', 'constraintMessages.maxItems', 'constraintMessages.minLength', 'constraintMessages.minimum', 'constraintMessages.minItems', 'constraintMessages.pattern', 'constraintMessages.required', 'constraintMessages.step', 'constraintMessages.type', 'constraintMessages.validationExpression'];
/** Constant for all properties which are constraints based on `adaptive form specification` */
const constraintProps = ['accept', 'enum', 'exclusiveMinimum', 'exclusiveMaximum', 'format', 'maxFileSize', 'maxLength', 'maximum', 'maxItems', 'minLength', 'minimum', 'minItems', 'pattern', 'required', 'step', 'validationExpression', 'enumNames'];

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Implementation of {@link IValidationError | Validation Error} interface
 */
class ValidationError {
  constructor(fieldName = '', errorMessages = []) {
    this.errorMessages = errorMessages;
    this.fieldName = fieldName;
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
// const primitives = ['string', 'boolean', 'number'];
// const containers = ['object', 'array', 'number'];
const objToMap = o => new Map(Object.entries(o));
const stringViewTypes = objToMap({
  'date': 'date-input',
  'data-url': 'file-input',
  'binary': 'file-input'
});
const typeToViewTypes = objToMap({
  'number': 'number-input',
  'boolean': 'checkbox',
  'object': 'panel',
  'array': 'panel',
  'file': 'file-input',
  'file[]': 'file-input'
});
const arrayTypes = ['string[]', 'boolean[]', 'number[]', 'array'];
/**
 * Returns the default view type for a given form field object based on `adaptive form specification`
 * @param schema    schema item for which default view type is to found
 * @returns default view type
 */
const defaultFieldTypes = schema => {
  const type = schema.type || 'string';
  if ('enum' in schema) {
    const enums = schema.enum;
    if (enums.length > 2 || arrayTypes.indexOf(type) > -1) {
      return 'drop-down';
    } else {
      return 'checkbox';
    }
  }
  if (type === 'string' || type === 'string[]') {
    return stringViewTypes.get(schema.format) || 'text-input';
  }
  return typeToViewTypes.get(type) || 'text-input';
};
const fieldSchema = input => {
  if ('items' in input) {
    const fieldset = input;
    const items = fieldset.items;
    if (fieldset.type === 'array') {
      return {
        type: 'array',
        items: fieldSchema(items[0]),
        minItems: fieldset == null ? void 0 : fieldset.minItems,
        maxItems: fieldset == null ? void 0 : fieldset.maxItems
      };
    } else {
      const iter = items.filter(x => x.name != null);
      return {
        type: 'object',
        properties: Object.fromEntries(iter.map(item => [item.name, fieldSchema(item)])),
        required: iter.filter(x => x.required).map(x => x.name)
      };
    }
  } else {
    var _field$label;
    const field = input;
    const schemaProps = ['type', 'maxLength', 'minLength', 'minimum', 'maximum', 'format', 'pattern', 'step', 'enum'];
    const schema = schemaProps.reduce((acc, prop) => {
      const p = prop;
      if (prop in field && field[p] != undefined) {
        acc[prop] = field[p];
      }
      return acc;
    }, {});
    if (field.dataRef === 'none' || Object.keys(schema).length == 0) {
      return undefined;
    }
    return _extends({
      title: (_field$label = field.label) == null ? void 0 : _field$label.value,
      description: field.description
    }, schema);
  }
};
/**
 * Creates a json schema from form model definition
 * @param form {@link FormJson | form model definition}
 * @returns json schema of form model definition
 */
const exportDataSchema = form => {
  return fieldSchema(form);
};

/**
 * Get the property value form the json
 * @param data      object as json
 * @param key       name of the key
 * @param def       default value
 * @typeParam P     type for the default value
 */
const getProperty = (data, key, def) => {
  if (key in data) {
    return data[key];
  } else if (!key.startsWith(':')) {
    const prefixedKey = `:${key}`;
    if (prefixedKey in data) {
      return data[prefixedKey];
    }
  }
  return def;
};
/**
 * Checks if the input item provided is a form file attachment field
 * @param item  input item it could be {@link FieldsetJson | Fieldset} or {@link FieldJson | Field}
 * @returns `true` if `item` is a form file attachment, `false` otherwise
 */
const isFile = function isFile(item) {
  return (item == null ? void 0 : item.type) === 'file' || (item == null ? void 0 : item.type) === 'file[]' || ((item == null ? void 0 : item.type) === 'string' || (item == null ? void 0 : item.type) === 'string[]') && ((item == null ? void 0 : item.format) === 'binary' || (item == null ? void 0 : item.format) === 'data-url');
};
/**
 * Utility to check if the given form field has any data constraints
 * @param item form field to check
 * @returns `true` if `item` has data constraints, `false` otherwise
 */
const checkIfConstraintsArePresent = function checkIfConstraintsArePresent(item) {
  // @ts-ignore
  return constraintProps.some(cp => item[cp] !== undefined);
};
/**
 * Checks if the input item provided is a form check box field
 * @param item  input item it could be {@link FieldsetJson | Fieldset} or {@link FieldJson | Field}
 * @returns `true` if `item` is a form check box, `false` otherwise
 */
const isCheckbox = function isCheckbox(item) {
  const fieldType = (item == null ? void 0 : item.fieldType) || defaultFieldTypes(item);
  return fieldType === 'checkbox';
};
/**
 * Checks if the input item provided is a form check box group field
 * @param item  input item it could be {@link FieldsetJson | Fieldset} or {@link FieldJson | Field}
 * @returns `true` if `item` is a form check box group, `false` otherwise
 */
const isCheckboxGroup = function isCheckboxGroup(item) {
  const fieldType = (item == null ? void 0 : item.fieldType) || defaultFieldTypes(item);
  return fieldType === 'checkbox-group';
};
/**
 * Checks if the input item provided is a date field
 * @param item  input item it could be {@link FieldsetJson | Fieldset} or {@link FieldJson | Field}
 * @returns `true` if `item` is a form check box group, `false` otherwise
 */
const isDateField = function isDateField(item) {
  const fieldType = (item == null ? void 0 : item.fieldType) || defaultFieldTypes(item);
  return fieldType === 'text-input' && (item == null ? void 0 : item.format) === 'date' || fieldType === 'date-input';
};
/**
 * Clones an object completely including any nested objects or arrays
 * @param obj
 * @param idGenerator
 * @private
 */
function deepClone(obj, idGenerator) {
  let result;
  if (obj instanceof Array) {
    result = [];
    result = obj.map(x => deepClone(x, idGenerator));
  } else if (typeof obj === 'object' && obj !== null) {
    result = {};
    Object.entries(obj).forEach(([key, value]) => {
      result[key] = deepClone(value, idGenerator);
    });
  } else {
    result = obj;
  }
  //if idGenerator is specified, and id exists in the object
  if (idGenerator && result && result.id) {
    result.id = idGenerator();
  }
  return result;
}
/**
 * Checks if the key got added in current object
 * @param currentObj
 * @param prevObj
 * @param objKey
 */
function checkIfKeyAdded(currentObj, prevObj, objKey) {
  if (currentObj != null && prevObj != null) {
    // add the new key
    const newPrvObj = _extends({}, prevObj);
    newPrvObj[objKey] = currentObj[objKey];
    // do compare using json stringify
    const newJsonStr = jsonString(currentObj).replace(jsonString(newPrvObj), '');
    return newJsonStr === '';
  } else {
    return false;
  }
}
/**
 * Prettifies obj as json string
 * @param obj object to prettify
 * @return json string
 */
const jsonString = obj => {
  return JSON.stringify(obj, null, 2);
};

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Implementation of generic event
 * @private
 */
class ActionImpl {
  //@ts-ignore

  constructor(payload, type, _metadata) {
    this._metadata = _metadata;
    this._payload = payload;
    this._type = type;
  }
  get type() {
    return this._type;
  }
  get payload() {
    return this._payload;
  }
  get metadata() {
    return this._metadata;
  }
  get target() {
    return this._target;
  }
  get isCustomEvent() {
    return false;
  }
  payloadToJson() {
    return this.payload;
  }
  toJson() {
    return {
      payload: this.payloadToJson(),
      type: this.type,
      isCustomEvent: this.isCustomEvent
    };
  }
  toString() {
    return JSON.stringify(this.toJson());
  }
}
/**
 * Implementation of `change` event. The change event is triggered on the field whenever the value of the field is changed
 */
class Change extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(payload, dispatch = false) {
    super(payload, 'change', {
      dispatch
    });
  }
  withAdditionalChange(change) {
    return new Change(this.payload.changes.concat(change.payload.changes), this.metadata);
  }
}
/**
 * Implementation of `invalid` event. The invalid event is triggered when a Field’s value becomes invalid after a change event or whenever its value property change
 */
class Invalid extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   */
  constructor(payload = {}) {
    super(payload, 'invalid', {});
  }
}
/**
 * Implementation of `valid` event. The valid event is triggered whenever the field’s valid state is changed from invalid to valid.
 */
class Valid extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   */
  constructor(payload = {}) {
    super(payload, 'valid', {});
  }
}
/**
 * Implementation of an ExecuteRule event.
 * @private
 */
class ExecuteRule extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(payload = {}, dispatch = false) {
    super(payload, 'executeRule', {
      dispatch
    });
  }
}
/**
 * Creates a change event
 * @param propertyName  name of the form field property
 * @param currentValue  current value
 * @param prevValue     previous value
 * @returns {@link Change} change event
 */
const propertyChange = (propertyName, currentValue, prevValue) => {
  return new Change({
    changes: [{
      propertyName,
      currentValue,
      prevValue
    }]
  });
};
/**
 * Implementation of `initialize` event. The event is triggered on all the fields when the form initialisation is complete
 */
class Initialize extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(payload, dispatch = false) {
    super(payload, 'initialize', {
      dispatch
    });
  }
}
/**
 * Implementation of `load` event. The event is when the form initialization is complete
 */
class FormLoad extends ActionImpl {
  /**
   * @constructor
   */
  constructor() {
    super({}, 'load', {
      dispatch: false
    });
  }
}
/**
 * Implementation of `click` event. The event is triggered when user clicks on an element.
 */
class Click extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(payload, dispatch = false) {
    super(payload, 'click', {
      dispatch
    });
  }
}
/**
 * Implementation of `blur` event. The event is triggered when the element loses focus.
 */
class Blur extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(payload, dispatch = false) {
    super(payload, 'blur', {
      dispatch
    });
  }
}
/**
 * Implementation of `ValidationComplete` event. The ValidationComplete event is triggered once validation is completed
 * on the form.
 *
 * An example of using this event,
 * ```
 * function onValidationComplete(event) {
 *	 const x = event.payload[0].id;
 *	 // do something with the invalid field
 * }
 * ```
 */
class ValidationComplete extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload (ie) list of {@link ValidationError | validation errors}
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(payload, dispatch = false) {
    super(payload, 'validationComplete', {
      dispatch
    });
  }
}
class Focus extends ActionImpl {
  /**
   * @constructor
   */
  constructor() {
    super({}, 'focus', {
      dispatch: false
    });
  }
}
/**
 * Implementation of `submit` event. The submit event is triggered on the Form.
 * To trigger the submit event, submit function needs to be invoked or one can invoke dispatchEvent API.
 */
class Submit extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(payload, dispatch = false) {
    super(payload, 'submit', {
      dispatch
    });
  }
}
/**
 * Implementation of `fieldChanged` event. The field changed event is triggered on the field which it has changed.
 */
class FieldChanged extends ActionImpl {
  constructor(changes, field) {
    super({
      field,
      changes
    }, 'fieldChanged');
  }
}
/**
 * Implementation of `custom event`.
 */
class CustomEvent extends ActionImpl {
  /**
   * @constructor
   * @param [eventName] name of the event
   * @param [payload] event payload
   * @param [dispatch] true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
   */
  constructor(eventName, payload = {}, dispatch = false) {
    super(payload, eventName, {
      dispatch
    });
  }
  /**
   * Defines if the event is custom
   */
  get isCustomEvent() {
    return true;
  }
}
/**
 * Implementation of `addItem` event. The event is triggered on a panel to add a new instance of items inside it.
 */
class AddItem extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   */
  constructor(payload) {
    super(payload, 'addItem');
  }
}
/**
 * Implementation of `removeItem` event. The event is triggered on a panel to remove an instance of items inside it.
 */
class RemoveItem extends ActionImpl {
  /**
   * @constructor
   * @param [payload] event payload
   */
  constructor(payload) {
    super(payload, 'removeItem');
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * @private
 */
class DataValue {
  constructor($_name, $_value, $_type = typeof $_value) {
    this.$_fields = [];
    this.$_name = $_name;
    this.$_value = $_value;
    this.$_type = $_type;
  }
  valueOf() {
    return this.$_value;
  }
  get $name() {
    return this.$_name;
  }
  get $value() {
    return this.$_value;
  }
  setValue(typedValue, originalValue, fromField) {
    this.$_value = typedValue;
    this.$_fields.forEach(x => {
      if (fromField !== x) {
        x.value = originalValue;
      }
    });
  }
  get $type() {
    return this.$_type;
  }
  $bindToField(field) {
    if (this.$_fields.indexOf(field) === -1) {
      this.$_fields.push(field);
    }
  }
  $convertToDataValue() {
    return this;
  }
  get $isDataGroup() {
    return false;
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const value = Symbol('NullValue');
class NullDataValueClass extends DataValue {
  constructor() {
    super('', value, 'null');
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setValue() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  $bindToField() {}
  $length() {
    return 0;
  }
  $convertToDataValue() {
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  $addDataNode() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  $removeDataNode() {}
  $getDataNode() {
    return this;
  }
  $containsDataNode() {
    return false;
  }
}
//@ts-ignore
const NullDataValue = new NullDataValueClass();

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * @private
 */
class DataGroup extends DataValue {
  createEntry(key, value) {
    const t = value instanceof Array ? 'array' : typeof value;
    if (typeof value === 'object' && value != null) {
      return new DataGroup(key, value, t);
    } else {
      return new DataValue(key, value, t);
    }
  }
  constructor(_name, _value, _type = typeof _value) {
    super(_name, _value, _type);
    if (_value instanceof Array) {
      this.$_items = _value.map((value, index) => {
        return this.createEntry(index, value);
      });
    } else {
      this.$_items = Object.fromEntries(Object.entries(_value).map(([key, value]) => {
        return [key, this.createEntry(key, value)];
      }));
    }
  }
  get $value() {
    if (this.$type === 'array') {
      return Object.values(this.$_items).filter(x => typeof x !== 'undefined').map(x => x.$value);
    } else {
      return Object.fromEntries(Object.values(this.$_items).filter(x => typeof x !== 'undefined').map(x => {
        return [x.$name, x.$value];
      }));
    }
  }
  get $length() {
    return Object.entries(this.$_items).length;
  }
  $convertToDataValue() {
    return new DataValue(this.$name, this.$value, this.$type);
  }
  $addDataNode(name, value, override = false) {
    if (value !== NullDataValue) {
      if (this.$type === 'array') {
        const index = name;
        if (!override) {
          this.$_items.splice(index, 0, value);
        } else {
          this.$_items[name] = value;
        }
      } else {
        this.$_items[name] = value;
      }
    }
  }
  $removeDataNode(name) {
    //@ts-ignore not calling delete
    this.$_items[name] = undefined;
  }
  $getDataNode(name) {
    if (this.$_items.hasOwnProperty(name)) {
      return this.$_items[name];
    }
  }
  $containsDataNode(name) {
    return this.$_items.hasOwnProperty(name) && typeof this.$_items[name] !== 'undefined';
  }
  get $isDataGroup() {
    return true;
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const TOK_DOT = 'DOT';
const TOK_IDENTIFIER = 'Identifier';
const TOK_GLOBAL = 'Global';
const TOK_BRACKET = 'bracket';
const TOK_NUMBER = 'Number';
const globalStartToken = '$';
const identifier = (value, start) => {
  return {
    type: TOK_IDENTIFIER,
    value,
    start
  };
};
const bracket = (value, start) => {
  return {
    type: TOK_BRACKET,
    value,
    start
  };
};
const global$ = () => {
  return {
    type: TOK_GLOBAL,
    start: 0,
    value: globalStartToken
  };
};
const isAlphaNum = function isAlphaNum(ch) {
  return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch >= '0' && ch <= '9' || ch === '_';
};
const isGlobal = (prev, stream, pos) => {
  // global tokens occur only at the start of an expression
  return prev === null && stream[pos] === globalStartToken;
};
const isIdentifier = (stream, pos) => {
  const ch = stream[pos];
  // $ is special -- it's allowed to be part of an identifier if it's the first character
  if (ch === '$') {
    return stream.length > pos && isAlphaNum(stream[pos + 1]);
  }
  // return whether character 'isAlpha'
  return ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch === '_';
};
const isNum = ch => {
  return ch >= '0' && ch <= '9';
};
class Tokenizer {
  constructor(stream) {
    this._tokens = [];
    this._result_tokens = [];
    this.stream = stream;
    this._current = 0;
  }
  _consumeGlobal() {
    this._current += 1;
    return global$();
  }
  _consumeUnquotedIdentifier(stream) {
    const start = this._current;
    this._current += 1;
    while (this._current < stream.length && isAlphaNum(stream[this._current])) {
      this._current += 1;
    }
    return identifier(stream.slice(start, this._current), start);
  }
  _consumeQuotedIdentifier(stream) {
    const start = this._current;
    this._current += 1;
    const maxLength = stream.length;
    while (stream[this._current] !== '"' && this._current < maxLength) {
      // You can escape a double quote and you can escape an escape.
      let current = this._current;
      if (stream[current] === '\\' && (stream[current + 1] === '\\' || stream[current + 1] === '"')) {
        current += 2;
      } else {
        current += 1;
      }
      this._current = current;
    }
    this._current += 1;
    return identifier(JSON.parse(stream.slice(start, this._current)), start);
  }
  _consumeNumber(stream) {
    const start = this._current;
    this._current += 1;
    const maxLength = stream.length;
    while (isNum(stream[this._current]) && this._current < maxLength) {
      this._current += 1;
    }
    const n = stream.slice(start, this._current);
    const value = parseInt(n, 10);
    return {
      type: TOK_NUMBER,
      value,
      start
    };
  }
  _consumeBracket(stream) {
    const start = this._current;
    this._current += 1;
    let value;
    if (isNum(stream[this._current])) {
      value = this._consumeNumber(stream).value;
    } else {
      throw new Error(`unexpected exception at position ${this._current}. Must be a character`);
    }
    if (this._current < this.stream.length && stream[this._current] !== ']') {
      throw new Error(`unexpected exception at position ${this._current}. Must be a character`);
    }
    this._current++;
    return bracket(value, start);
  }
  tokenize() {
    const stream = this.stream;
    while (this._current < stream.length) {
      const prev = this._tokens.length ? this._tokens.slice(-1)[0] : null;
      if (isGlobal(prev, stream, this._current)) {
        const token = this._consumeGlobal();
        this._tokens.push(token);
        this._result_tokens.push(token);
      } else if (isIdentifier(stream, this._current)) {
        const token = this._consumeUnquotedIdentifier(stream);
        this._tokens.push(token);
        this._result_tokens.push(token);
      } else if (stream[this._current] === '.' && prev != null && prev.type !== TOK_DOT) {
        this._tokens.push({
          type: TOK_DOT,
          value: '.',
          start: this._current
        });
        this._current += 1;
      } else if (stream[this._current] === '[') {
        // No need to increment this._current.  This happens
        // in _consumeLBracket
        const token = this._consumeBracket(stream);
        this._tokens.push(token);
        this._result_tokens.push(token);
      } else if (stream[this._current] === '"') {
        const token = this._consumeQuotedIdentifier(stream);
        this._tokens.push(token);
        this._result_tokens.push(token);
      } else {
        const p = Math.max(0, this._current - 2);
        const s = Math.min(this.stream.length, this._current + 2);
        throw new Error(`Exception at parsing stream ${this.stream.slice(p, s)}`);
      }
    }
    return this._result_tokens;
  }
}
const tokenize = stream => {
  return new Tokenizer(stream).tokenize();
};
const resolveData = (data, input, create) => {
  let tokens;
  if (typeof input === 'string') {
    tokens = tokenize(input);
  } else {
    tokens = input;
  }
  let result = data;
  let i = 0;
  const createIntermediateNode = (token, nextToken, create) => {
    return nextToken === null ? create : nextToken.type === TOK_BRACKET ? new DataGroup(token.value, [], 'array') : new DataGroup(token.value, {});
  };
  while (i < tokens.length && result != null) {
    const token = tokens[i];
    if (token.type === TOK_GLOBAL) {
      result = data;
    } else if (token.type === TOK_IDENTIFIER) {
      if (result instanceof DataGroup && result.$type === 'object') {
        //@ts-ignore
        if (result.$containsDataNode(token.value) && result.$getDataNode(token.value).$value !== null) {
          result = result.$getDataNode(token.value);
        } else if (create) {
          const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;
          const toCreate = createIntermediateNode(token, nextToken, create);
          result.$addDataNode(token.value, toCreate);
          result = toCreate;
        } else {
          result = undefined;
        }
      } else {
        throw new Error(`Looking for ${token.value} in ${result.$value}`);
      }
    } else if (token.type === TOK_BRACKET) {
      if (result instanceof DataGroup && result.$type === 'array') {
        const index = token.value;
        if (index < result.$length) {
          //@ts-ignore
          result = result.$getDataNode(index);
        } else if (create) {
          const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;
          const toCreate = createIntermediateNode(token, nextToken, create);
          result.$addDataNode(index, toCreate);
          result = toCreate;
        } else {
          result = undefined;
        }
      } else {
        throw new Error(`Looking for index ${token.value} in non array${result.$value}`);
      }
    }
    i += 1;
  }
  return result;
};

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __decorate$2 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines the properties that are editable. These properties can be modified during rule execution.
 */
const editableProperties = ['value', 'label', 'description', 'visible', 'enabled', 'readOnly', 'enum', 'enumNames', 'required', 'properties',
// 'enforceEnum', // not exposed for now
'exclusiveMinimum', 'exclusiveMaximum', 'maxLength', 'maximum', 'maxItems', 'minLength', 'minimum', 'minItems', 'step'
// 'placeholder' // not exposed for now.
];
/**
 * Defines props that are dynamic and can be changed at runtime.
 */
const dynamicProps = [...editableProperties, 'valid', 'index', 'activeChild'];
/**
 * Implementation of action with target
 * @private
 */
class ActionImplWithTarget {
  /**
   * @constructor
   * @param _action
   * @param _target
   * @private
   */
  constructor(_action, _target) {
    this._action = _action;
    this._target = _target;
  }
  get type() {
    return this._action.type;
  }
  get payload() {
    return this._action.payload;
  }
  get metadata() {
    return this._action.metadata;
  }
  get target() {
    return this._target;
  }
  get isCustomEvent() {
    return this._action.isCustomEvent;
  }
  get originalAction() {
    return this._action.originalAction;
  }
  toString() {
    return this._action.toString();
  }
}
const target = Symbol('target');
const qualifiedName = Symbol('qualifiedName');
function dependencyTracked() {
  return function (target, propertyKey, descriptor) {
    const get = descriptor.get;
    if (get != undefined) {
      descriptor.get = function () {
        // @ts-ignore
        this.ruleEngine.trackDependency(this);
        return get.call(this);
      };
    }
  };
}
/**
 * Defines a generic base class which all objects of form runtime model should extend from.
 * @typeparam T type of the form object which extends from {@link BaseJson | base type}
 */
class BaseNode {
  //@ts-ignore

  get isContainer() {
    return false;
  }
  /**
   * @constructor
   * @param params
   * @param _options
   * @private
   */
  constructor(params,
  //@ts_ignore
  _options) {
    this._callbacks = {};
    this._dependents = [];
    this._tokens = [];
    this._options = _options;
    //@ts-ignore
    this[qualifiedName] = null;
    this._jsonModel = _extends({}, params, {
      //@ts-ignore
      id: 'id' in params ? params.id : this.form.getUniqueId()
    });
  }
  setupRuleNode() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this._ruleNode = new Proxy(this.ruleNodeReference(), {
      get: (ruleNodeReference, prop) => {
        return self.getFromRule(ruleNodeReference, prop);
      }
    });
  }
  /**
   * @private
   */
  ruleNodeReference() {
    return this;
  }
  /**
   * @private
   */
  getRuleNode() {
    return this._ruleNode;
  }
  getFromRule(ruleNodeReference, prop) {
    if (prop === Symbol.toPrimitive || prop === 'valueOf' && !ruleNodeReference.hasOwnProperty('valueOf')) {
      return this.valueOf;
    } else if (prop === target) {
      return this;
    } else if (typeof prop === 'string') {
      //look for property
      if (prop.startsWith('$')) {
        prop = prop.substr(1);
        //@ts-ignore
        //@todo: create a list of properties that are allowed
        //@ts-ignore
        // return only non functional properties in this object
        if (typeof this[prop] !== 'function') {
          //@ts-ignore
          const retValue = this[prop];
          if (retValue instanceof BaseNode) {
            //$parent
            return retValue.getRuleNode();
          } else if (retValue instanceof Array) {
            //$items
            return retValue.map(r => r instanceof BaseNode ? r.getRuleNode() : r);
          } else {
            return retValue;
          }
        }
      } else {
        //look in the items
        if (ruleNodeReference.hasOwnProperty(prop)) {
          return ruleNodeReference[prop];
        } else if (typeof ruleNodeReference[prop] === 'function') {
          //todo : create allow list of functions
          //to support panel instanceof Array panel1.map(..)
          return ruleNodeReference[prop];
        }
      }
    }
  }
  get id() {
    return this._jsonModel.id;
  }
  get index() {
    return this.parent.indexOf(this);
  }
  get parent() {
    return this._options.parent;
  }
  get type() {
    return this._jsonModel.type;
  }
  get fieldType() {
    return this._jsonModel.fieldType || 'text-input';
  }
  get ':type'() {
    return this._jsonModel[':type'] || this.fieldType;
  }
  get name() {
    return this._jsonModel.name;
  }
  get description() {
    return this._jsonModel.description;
  }
  set description(d) {
    this._setProperty('description', d);
  }
  get dataRef() {
    return this._jsonModel.dataRef;
  }
  get visible() {
    return this._jsonModel.visible;
  }
  set visible(v) {
    if (v !== this._jsonModel.visible) {
      const changeAction = propertyChange('visible', v, this._jsonModel.visible);
      this._jsonModel.visible = v;
      this.notifyDependents(changeAction);
    }
  }
  get form() {
    return this._options.form;
  }
  get ruleEngine() {
    return this.form.ruleEngine;
  }
  get label() {
    return this._jsonModel.label;
  }
  set label(l) {
    if (l !== this._jsonModel.label) {
      const changeAction = propertyChange('label', l, this._jsonModel.label);
      this._jsonModel = _extends({}, this._jsonModel, {
        label: l
      });
      this.notifyDependents(changeAction);
    }
  }
  get uniqueItems() {
    return this._jsonModel.uniqueItems;
  }
  /**
   * Transparent form fields are meant only for creation of view. They are also not part of data
   */
  isTransparent() {
    var _this$parent;
    // named form fields are not transparent
    // @ts-ignore
    // handling array use-case as items of array can be unnamed
    const isNonTransparent = ((_this$parent = this.parent) == null ? void 0 : _this$parent._jsonModel.type) === 'array';
    return !this._jsonModel.name && !isNonTransparent;
  }
  getState() {
    return _extends({}, this._jsonModel, {
      ':type': this[':type']
    });
  }
  /**
   * @private
   */
  subscribe(callback, eventName = 'change') {
    this._callbacks[eventName] = this._callbacks[eventName] || [];
    this._callbacks[eventName].push(callback);
    //console.log(`subscription added : ${this._elem.id}, count : ${this._callbacks[eventName].length}`);
    return {
      unsubscribe: () => {
        this._callbacks[eventName] = this._callbacks[eventName].filter(x => x !== callback);
        //console.log(`subscription removed : ${this._elem.id}, count : ${this._callbacks[eventName].length}`);
      }
    };
  }
  /**
   * @private
   */
  _addDependent(dependent) {
    if (this._dependents.find(({
      node
    }) => node === dependent) === undefined) {
      const subscription = this.subscribe(change => {
        const changes = change.payload.changes;
        const propsToLook = [...dynamicProps, 'items'];
        // @ts-ignore
        const isPropChanged = changes.findIndex(x => {
          return propsToLook.indexOf(x.propertyName) > -1;
        }) > -1;
        if (isPropChanged) {
          dependent.dispatch(new ExecuteRule());
        }
      });
      this._dependents.push({
        node: dependent,
        subscription
      });
    }
  }
  /**
   * @private
   */
  removeDependent(dependent) {
    const index = this._dependents.findIndex(({
      node
    }) => node === dependent);
    if (index > -1) {
      this._dependents[index].subscription.unsubscribe();
      this._dependents.splice(index, 1);
    }
  }
  /**
   * @private
   */
  queueEvent(action) {
    const actionWithTarget = new ActionImplWithTarget(action, this);
    this.form.getEventQueue().queue(this, actionWithTarget, ['valid', 'invalid'].indexOf(actionWithTarget.type) > -1);
  }
  dispatch(action) {
    this.queueEvent(action);
    this.form.getEventQueue().runPendingQueue();
  }
  /**
   * @private
   */
  notifyDependents(action) {
    const handlers = this._callbacks[action.type] || [];
    handlers.forEach(x => {
      x(new ActionImplWithTarget(action, this));
    });
  }
  /**
   * @param prop
   * @param newValue
   * @private
   */
  _setProperty(prop, newValue, notify = true) {
    //@ts-ignore
    const oldValue = this._jsonModel[prop];
    let isValueSame = false;
    if (newValue !== null && oldValue !== null && typeof newValue === 'object' && typeof oldValue === 'object') {
      isValueSame = JSON.stringify(newValue) === JSON.stringify(oldValue);
    } else {
      // @ts-ignore
      isValueSame = oldValue === newValue;
    }
    if (!isValueSame) {
      //@ts-ignore
      this._jsonModel[prop] = newValue;
      const changeAction = propertyChange(prop, newValue, oldValue);
      if (notify) {
        this.notifyDependents(changeAction);
      }
      return changeAction.payload.changes;
    }
    return [];
  }
  /**
   * @private
   */
  _bindToDataModel(contextualDataModel) {
    if (this.id === '$form') {
      this._data = contextualDataModel;
      return;
    }
    const dataRef = this._jsonModel.dataRef;
    let _data,
      _parent = contextualDataModel,
      _key = '';
    if (dataRef === null) {
      // null data binding
      _data = NullDataValue;
    } else if (dataRef !== undefined) {
      // explicit data binding
      if (this._tokens.length === 0) {
        this._tokens = tokenize(dataRef);
      }
      let searchData = contextualDataModel;
      if (this._tokens[0].type === TOK_GLOBAL) {
        searchData = this.form.getDataNode();
      }
      if (typeof searchData !== 'undefined') {
        const name = this._tokens[this._tokens.length - 1].value;
        const create = this.defaultDataModel(name);
        _data = resolveData(searchData, this._tokens, create);
        // @ts-ignore
        _parent = resolveData(searchData, this._tokens.slice(0, -1));
        _key = name;
      }
    } else {
      // name data binding
      if (
      //@ts-ignore
      contextualDataModel !== NullDataValue) {
        _parent = contextualDataModel;
        const name = this._jsonModel.name || '';
        const key = contextualDataModel.$type === 'array' ? this.index : name;
        _key = key;
        if (key !== '') {
          const create = this.defaultDataModel(key);
          if (create !== undefined) {
            _data = contextualDataModel.$getDataNode(key);
            if (_data === undefined) {
              _data = create;
              contextualDataModel.$addDataNode(key, _data);
            }
          }
        } else {
          _data = undefined;
        }
      }
    }
    if (_data) {
      var _data3;
      //@ts-ignore
      if (!this.isContainer && _parent !== NullDataValue && _data !== NullDataValue) {
        var _data2;
        _data = (_data2 = _data) == null ? void 0 : _data2.$convertToDataValue();
        _parent.$addDataNode(_key, _data, true);
      }
      (_data3 = _data) == null ? void 0 : _data3.$bindToField(this);
      this._data = _data;
    }
  }
  /**
   * @private
   */
  getDataNode() {
    return this._data;
  }
  get properties() {
    return this._jsonModel.properties || {};
  }
  set properties(p) {
    this._setProperty('properties', _extends({}, p));
  }
  getNonTransparentParent() {
    let nonTransparentParent = this.parent;
    while (nonTransparentParent != null && nonTransparentParent.isTransparent()) {
      nonTransparentParent = nonTransparentParent.parent;
    }
    return nonTransparentParent;
  }
  /**
   * called after the node is inserted in the parent
   * @private
   */
  _initialize() {
    if (typeof this._data === 'undefined') {
      let dataNode,
        parent = this.parent;
      do {
        //@ts-ignore
        dataNode = parent.getDataNode();
        parent = parent.parent;
      } while (dataNode === undefined);
      this._bindToDataModel(dataNode);
    }
  }
  /**
   * Checks whether there are any updates in the properties. If there are applies them to the
   * json model as well.
   * @param propNames
   * @param updates
   * @private
   */
  _applyUpdates(propNames, updates) {
    return propNames.reduce((acc, propertyName) => {
      //@ts-ignore
      const currentValue = updates[propertyName];
      const changes = this._setProperty(propertyName, currentValue, false);
      if (changes.length > 0) {
        acc[propertyName] = changes[0];
      }
      return acc;
    }, {});
  }
  get qualifiedName() {
    if (this.isTransparent()) {
      return null;
    }
    // @ts-ignore
    if (this[qualifiedName] !== null) {
      // @ts-ignore
      return this[qualifiedName];
    }
    // use qualified name
    const parent = this.getNonTransparentParent();
    if (parent && parent.type === 'array') {
      //@ts-ignore
      this[qualifiedName] = `${parent.qualifiedName}[${this.index}]`;
    } else {
      //@ts-ignore
      this[qualifiedName] = `${parent.qualifiedName}.${this.name}`;
    }
    //@ts-ignore
    return this[qualifiedName];
  }
  focus() {
    if (this.parent) {
      this.parent.activeChild = this;
    }
  }
}
__decorate$2([dependencyTracked()], BaseNode.prototype, "index", null);
__decorate$2([dependencyTracked()], BaseNode.prototype, "description", null);
__decorate$2([dependencyTracked()], BaseNode.prototype, "visible", null);
__decorate$2([dependencyTracked()], BaseNode.prototype, "label", null);
__decorate$2([dependencyTracked()], BaseNode.prototype, "properties", null);

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Defines scriptable aspects (ie rules, events) of form runtime model. Any form runtime object which requires
 * execution of rules/events should extend from this class.
 */
class Scriptable extends BaseNode {
  constructor(...args) {
    super(...args);
    this._events = {};
    this._rules = {};
  }
  get rules() {
    return this._jsonModel.rules || {};
  }
  getCompiledRule(eName, rule) {
    if (!(eName in this._rules)) {
      const eString = rule || this.rules[eName];
      if (typeof eString === 'string' && eString.length > 0) {
        try {
          this._rules[eName] = this.ruleEngine.compileRule(eString);
        } catch (e) {
          this.form.logger.error(`Unable to compile rule \`"${eName}" : "${eString}"\` Exception : ${e}`);
        }
      } else {
        throw new Error(`only expression strings are supported. ${typeof eString} types are not supported`);
      }
    }
    return this._rules[eName];
  }
  getCompiledEvent(eName) {
    if (!(eName in this._events)) {
      var _this$_jsonModel$even;
      let eString = (_this$_jsonModel$even = this._jsonModel.events) == null ? void 0 : _this$_jsonModel$even[eName];
      if (typeof eString === 'string' && eString.length > 0) {
        eString = [eString];
      }
      if (typeof eString !== 'undefined' && eString.length > 0) {
        this._events[eName] = eString.map(x => {
          try {
            return this.ruleEngine.compileRule(x);
          } catch (e) {
            this.form.logger.error(`Unable to compile expression \`"${eName}" : "${eString}"\` Exception : ${e}`);
          }
          return null;
        }).filter(x => x !== null);
      }
    }
    return this._events[eName] || [];
  }
  applyUpdates(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      // @ts-ignore
      // the first check is to disable accessing this.value & this.items property
      // otherwise that will trigger dependency tracking
      if (key in editableProperties || key in this && typeof this[key] !== 'function') {
        try {
          // @ts-ignore
          this[key] = value;
        } catch (e) {
          console.error(e);
        }
      }
    });
  }
  executeAllRules(context) {
    const entries = Object.entries(this.rules);
    if (entries.length > 0) {
      const scope = this.getExpressionScope();
      entries.forEach(([prop, rule]) => {
        const node = this.getCompiledRule(prop, rule);
        if (node) {
          const newVal = this.ruleEngine.execute(node, scope, context, true);
          if (editableProperties.indexOf(prop) > -1) {
            //@ts-ignore
            this[prop] = newVal;
          } else {
            this.form.logger.warn(`${prop} is not a valid editable property.`);
          }
        }
      });
    }
  }
  getExpressionScope() {
    const parent = this.getNonTransparentParent();
    const target = {
      self: this.getRuleNode(),
      siblings: (parent == null ? void 0 : parent.ruleNodeReference()) || {}
    };
    const scope = new Proxy(target, {
      get: (target, prop) => {
        if (prop === Symbol.toStringTag) {
          return 'Object';
        }
        prop = prop;
        // The order of resolution is
        // 1. property
        // 2. sibling
        // 3. child
        if (prop.startsWith('$')) {
          //this returns children as well, so adding an explicit check for property name
          const retValue = target.self[prop];
          if (retValue instanceof BaseNode) {
            //$parent
            return retValue.getRuleNode();
          } else if (retValue instanceof Array) {
            //$items
            return retValue.map(r => r instanceof BaseNode ? r.getRuleNode() : r);
          } else {
            return retValue;
          }
        } else {
          if (prop in target.siblings) {
            return target.siblings[prop];
          } else {
            return target.self[prop];
          }
        }
      },
      has: (target, prop) => {
        prop = prop;
        const selfPropertyOrChild = target.self[prop];
        const sibling = target.siblings[prop];
        return typeof selfPropertyOrChild != 'undefined' || typeof sibling != 'undefined';
      }
    });
    return scope;
  }
  executeEvent(context, node) {
    let updates;
    if (node) {
      updates = this.ruleEngine.execute(node, this.getExpressionScope(), context);
    }
    if (typeof updates !== 'undefined' && updates != null) {
      this.applyUpdates(updates);
    }
  }
  /**
   * Executes the given rule
   * @param event
   * @param context
   * @private
   */
  executeRule(event, context) {
    if (typeof event.payload.ruleName === 'undefined') {
      this.executeAllRules(context);
    }
  }
  executeExpression(expr) {
    const ruleContext = {
      'form': this.form,
      '$form': this.form.getRuleNode(),
      '$field': this.getRuleNode(),
      'field': this
    };
    const node = this.ruleEngine.compileRule(expr);
    return this.ruleEngine.execute(node, this.getExpressionScope(), ruleContext);
  }
  /**
   * Executes the given action
   * @param action    {@link Action | event object}
   */
  executeAction(action) {
    const context = {
      'form': this.form,
      '$form': this.form.getRuleNode(),
      '$field': this.getRuleNode(),
      'field': this,
      '$event': {
        type: action.type,
        payload: action.payload,
        target: this.getRuleNode()
      }
    };
    const eventName = action.isCustomEvent ? `custom:${action.type}` : action.type;
    const funcName = action.isCustomEvent ? `custom_${action.type}` : action.type;
    const node = this.getCompiledEvent(eventName);
    //todo: apply all the updates at the end  or
    // not trigger the change event until the execution is finished
    node.forEach(n => this.executeEvent(context, n));
    // @ts-ignore
    if (funcName in this && typeof this[funcName] === 'function') {
      //@ts-ignore
      this[funcName](action, context);
    }
    this.notifyDependents(action);
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __decorate$1 = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines a generic container class which any form container should extend from.
 * @typeparam T type of the node which extends {@link ContainerJson} and {@link RulesJson}
 */
class Container extends Scriptable {
  constructor(...args) {
    super(...args);
    this._children = [];
    this._itemTemplate = null;
    this._activeChild = null;
  }
  /**
   * @private
   */
  ruleNodeReference() {
    return this._childrenReference;
  }
  //todo : this should not be public
  get items() {
    return this._children;
  }
  get maxItems() {
    return this._jsonModel.maxItems;
  }
  set maxItems(m) {
    this._jsonModel.maxItems = m;
    const minItems = this._jsonModel.minItems || 1;
    const itemsLength = this._children.length;
    const items2Remove = Math.min(itemsLength - m, itemsLength - minItems);
    if (items2Remove > 0) {
      for (let i = 0; i < items2Remove; i++) {
        this.getDataNode().$removeDataNode(m + i);
        this._childrenReference.pop();
      }
      const elems = this._children.splice(m, items2Remove);
      this.notifyDependents(propertyChange('items', elems, null));
    }
  }
  get minItems() {
    return this._jsonModel.minItems;
  }
  /**
   * returns whether the items in the Panel can repeat or not
   */
  hasDynamicItems() {
    return this._itemTemplate != null;
  }
  get isContainer() {
    return true;
  }
  /**
   * Returns the current container state
   */
  getState() {
    return _extends({}, this._jsonModel, {
      ':type': this[':type'],
      items: this._children.map(x => {
        return _extends({}, x.getState());
      })
    });
  }
  _addChildToRuleNode(child, options) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const {
      parent = this
    } = options;
    //the child has not been added to the array, hence using the length as new index
    // this means unnamed panel inside repeatable named parent // this is an edge case, handling it gracefully
    // todo: rules don't work inside repeatable array
    const name = parent.type == 'array' ? parent._children.length + '' : child.name || '';
    if (name.length > 0) {
      Object.defineProperty(parent._childrenReference, name, {
        get: () => {
          if (child.isContainer && child.hasDynamicItems()) {
            self.ruleEngine.trackDependency(child); //accessing dynamic panel directly
          }

          if (self.hasDynamicItems()) {
            self.ruleEngine.trackDependency(self); //accessing a child of dynamic panel
            if (this._children[name] !== undefined) {
              // pop function calls this getter in order to return the item
              return this._children[name].getRuleNode();
            }
          } else {
            return child.getRuleNode();
          }
        },
        configurable: true,
        enumerable: true
      });
    }
  }
  _addChild(itemJson, index, cloneIds = false) {
    // get first non transparent parent
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let nonTransparentParent = this;
    while (nonTransparentParent != null && nonTransparentParent.isTransparent()) {
      // @ts-ignore
      nonTransparentParent = nonTransparentParent.parent;
    }
    if (typeof index !== 'number' || index > nonTransparentParent._children.length) {
      index = this._children.length;
    }
    const form = this.form;
    const itemTemplate = _extends({
      index
    }, deepClone(itemJson, cloneIds ? () => {
      return form.getUniqueId();
    } : undefined));
    //@ts-ignore
    const retVal = this._createChild(itemTemplate, {
      parent: this,
      index
    });
    this._addChildToRuleNode(retVal, {
      parent: nonTransparentParent
    });
    if (index === this._children.length) {
      this._children.push(retVal);
    } else {
      // @ts-ignore
      this._children.splice(index, 0, retVal);
    }
    return retVal;
  }
  indexOf(f) {
    return this._children.indexOf(f);
  }
  /**
   * @private
   */
  defaultDataModel(name) {
    const type = this._jsonModel.type || undefined;
    if (type === undefined) {
      return undefined;
    } else {
      const instance = type === 'array' ? [] : {};
      return new DataGroup(name, instance, type);
    }
  }
  /**
   * @private
   */
  _initialize() {
    super._initialize();
    const items = this._jsonModel.items;
    this._jsonModel.items = [];
    this._childrenReference = this._jsonModel.type == 'array' ? [] : {};
    if (this._jsonModel.type == 'array' && items.length === 1 && this.getDataNode() != null) {
      this._itemTemplate = deepClone(items[0]);
      if (typeof this._jsonModel.minItems !== 'number') {
        this._jsonModel.minItems = 0;
      }
      if (typeof this._jsonModel.maxItems !== 'number') {
        this._jsonModel.maxItems = -1;
      }
      if (typeof this._jsonModel.initialItems !== 'number') {
        this._jsonModel.initialItems = Math.max(1, this._jsonModel.minItems);
      }
      for (let i = 0; i < this._jsonModel.initialItems; i++) {
        //@ts-ignore
        const child = this._addChild(this._itemTemplate);
        child._initialize();
      }
    } else if (items.length > 0) {
      items.forEach(item => {
        const child = this._addChild(item);
        child._initialize();
      });
      this._jsonModel.minItems = this._children.length;
      this._jsonModel.maxItems = this._children.length;
      this._jsonModel.initialItems = this._children.length;
    }
    this.setupRuleNode();
  }
  /**
   * @private
   */
  addItem(action) {
    if (action.type === 'addItem' && this._itemTemplate != null) {
      //@ts-ignore
      if (this._jsonModel.maxItems === -1 || this._children.length < this._jsonModel.maxItems) {
        const dataNode = this.getDataNode();
        let index = action.payload;
        if (typeof index !== 'number' || index > this._children.length) {
          index = this._children.length;
        }
        const retVal = this._addChild(this._itemTemplate, action.payload, true);
        const _data = retVal.defaultDataModel(index);
        if (_data) {
          dataNode.$addDataNode(index, _data);
        }
        retVal._initialize();
        this.notifyDependents(propertyChange('items', retVal.getState, null));
        retVal.dispatch(new Initialize());
        retVal.dispatch(new ExecuteRule());
        for (let i = index + 1; i < this._children.length; i++) {
          this._children[i].dispatch(new ExecuteRule());
        }
      }
    }
  }
  /**
   * @private
   */
  removeItem(action) {
    if (action.type === 'removeItem' && this._itemTemplate != null) {
      if (this._children.length == 0) {
        //can't remove item if there isn't any
        return;
      }
      const index = typeof action.payload === 'number' ? action.payload : this._children.length - 1;
      const state = this._children[index].getState();
      //@ts-ignore
      if (this._children.length > this._jsonModel.minItems) {
        // clear child
        //remove field
        this._childrenReference.pop();
        this._children.splice(index, 1);
        this.getDataNode().$removeDataNode(index);
        for (let i = index; i < this._children.length; i++) {
          this._children[i].dispatch(new ExecuteRule());
        }
        this.notifyDependents(propertyChange('items', null, state));
      }
    }
  }
  /**
   * @private
   */
  queueEvent(action) {
    var _action$metadata;
    super.queueEvent(action);
    if ((_action$metadata = action.metadata) != null && _action$metadata.dispatch) {
      this.items.forEach(x => {
        //@ts-ignore
        x.queueEvent(action);
      });
    }
  }
  validate() {
    return this.items.flatMap(x => {
      return x.validate();
    }).filter(x => x.fieldName !== '');
  }
  /**
   * @private
   */
  dispatch(action) {
    super.dispatch(action);
  }
  /**
   * @private
   */
  importData(contextualDataModel) {
    this._bindToDataModel(contextualDataModel);
    const dataNode = this.getDataNode() || contextualDataModel;
    this.syncDataAndFormModel(dataNode);
  }
  /**
   * prefill the form with data on the given element
   * @param dataModel
   * @param contextualDataModel
   * @param operation
   * @private
   */
  syncDataAndFormModel(contextualDataModel) {
    if ((contextualDataModel == null ? void 0 : contextualDataModel.$type) === 'array' && this._itemTemplate != null) {
      const dataLength = contextualDataModel == null ? void 0 : contextualDataModel.$value.length;
      const itemsLength = this._children.length;
      const maxItems = this._jsonModel.maxItems === -1 ? dataLength : this._jsonModel.maxItems;
      const minItems = this._jsonModel.minItems;
      //@ts-ignore
      let items2Add = Math.min(dataLength - itemsLength, maxItems - itemsLength);
      //@ts-ignore
      const items2Remove = Math.min(itemsLength - dataLength, itemsLength - minItems);
      while (items2Add > 0) {
        items2Add--;
        const child = this._addChild(this._itemTemplate);
        child._initialize();
      }
      if (items2Remove > 0) {
        this._children.splice(dataLength, items2Remove);
        for (let i = 0; i < items2Remove; i++) {
          this._childrenReference.pop();
        }
      }
    }
    this._children.forEach(x => {
      x.importData(contextualDataModel);
    });
  }
  get activeChild() {
    return this._activeChild;
  }
  set activeChild(c) {
    if (c !== this._activeChild) {
      let activeChild = this._activeChild;
      while (activeChild instanceof Container) {
        const temp = activeChild.activeChild;
        activeChild.activeChild = null;
        activeChild = temp;
      }
      const change = propertyChange('activeChild', c, this._activeChild);
      this._activeChild = c;
      if (this.parent && c !== null) {
        this.parent.activeChild = this;
      }
      this._jsonModel.activeChild = c == null ? void 0 : c.id;
      this.notifyDependents(change);
    }
  }
}
__decorate$1([dependencyTracked()], Container.prototype, "maxItems", null);
__decorate$1([dependencyTracked()], Container.prototype, "minItems", null);
__decorate$1([dependencyTracked()], Container.prototype, "activeChild", null);

/**
 * Defines generic form object class which any form runtime model (like textbox, checkbox etc)
 * should extend from.
 * @typeparam T type of the node (for example, {@link MetaDataJson | form meta data}
 */
class Node {
  constructor(inputModel) {
    this._jsonModel = _extends({}, inputModel);
  }
  getP(key, def) {
    return getProperty(this._jsonModel, key, def);
  }
  get isContainer() {
    return false;
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Defines form metadata which implements {@link FormMetaDataModel | Form MetaData Model}
 */
class FormMetaData extends Node {
  get version() {
    return this.getP('version', '');
  }
  get locale() {
    return this.getP('locale', '');
  }
  get grammar() {
    return this.getP('grammar', '');
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Defines a file object which implements the {@link IFileObject | file object interface}
 */
class FileObject {
  constructor(init) {
    this.type = 'application/octet-stream';
    this.name = 'unknown';
    this.size = 0;
    Object.assign(this, init);
  }
  toJSON() {
    return {
      'name': this.name,
      'size': this.size,
      'type': this.type,
      'data': this.data.toString()
    };
  }
  equals(obj) {
    return this.data === obj.data && this.type === obj.type && this.name === obj.name && this.size === obj.size;
  }
}

const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('');
const fileSizeRegex = /^(\d*\.?\d+)(\\?(?=[KMGT])([KMGT])(?:i?B)?|B?)$/i;
/**
 * Utility to generate a random word from seed
 * @param l seed value
 * @returns random word
 */
const randomWord = l => {
  const ret = [];
  for (let i = 0; i <= l; i++) {
    const randIndex = Math.floor(Math.random() * chars.length);
    ret.push(chars[randIndex]);
  }
  return ret.join('');
};
/**
 * Returns the list of attachments with its data reference
 * @param input form model
 * @returns list of file attachments {@link FileObject} present in the form
 */
const getAttachments = input => {
  const items = input.items || [];
  return items == null ? void 0 : items.reduce((acc, item) => {
    let ret = null;
    if (item.isContainer) {
      ret = getAttachments(item);
    } else {
      if (isFile(item.getState())) {
        ret = {}; // @ts-ignore
        const name = item.name || '';
        const dataRef = item.dataRef != null ? item.dataRef : name.length > 0 ? item.name : undefined;
        //@ts-ignore
        if (item.value instanceof Array) {
          // @ts-ignore
          ret[item.id] = item.value.map(x => {
            return _extends({}, x, {
              'dataRef': dataRef
            });
          });
        } else if (item.value != null) {
          // @ts-ignore
          ret[item.id] = _extends({}, item.value, {
            'dataRef': dataRef
          });
        }
      }
    }
    return Object.assign(acc, ret);
  }, {});
};
/**
 * Converts file size in string to bytes based on IEC specification
 * @param str   file size
 * @returns file size as bytes (in kb) based on IEC specification
 */
const getFileSizeInBytes = str => {
  let retVal = 0;
  if (typeof str === 'string') {
    const matches = fileSizeRegex.exec(str.trim());
    if (matches != null) {
      retVal = sizeToBytes(parseFloat(matches[1]), (matches[2] || 'kb').toUpperCase());
    }
  }
  return retVal;
};
/**
 * Converts number to bytes based on the symbol as per IEC specification
 * @param size      size as number
 * @param symbol    symbol to use (for example, kb, mb, gb or tb)
 * @returns number as bytes based on the symbol
 */
const sizeToBytes = (size, symbol) => {
  const sizes = {
    'KB': 1,
    'MB': 2,
    'GB': 3,
    'TB': 4
  };
  // @ts-ignore
  const i = Math.pow(1024, sizes[symbol]);
  return Math.round(size * i);
};
/**
 * ID Generator
 * @param initial
 * @constructor
 * @private
 */
const IdGenerator = function* IdGenerator(initial = 50) {
  const initialize = function initialize() {
    const arr = [];
    for (let i = 0; i < initial; i++) {
      arr.push(randomWord(10));
    }
    return arr;
  };
  const passedIds = {};
  let ids = initialize();
  do {
    let x = ids.pop();
    while (x in passedIds) {
      if (ids.length === 0) {
        ids = initialize();
      }
      x = ids.pop();
    }
    passedIds[x] = true;
    yield ids.pop();
    if (ids.length === 0) {
      ids = initialize();
    }
  } while (ids.length > 0);
};
/**
 * Utility to extract {@link FileObject} from string or HTML File data type
 * @param file
 * @returns list of {@link FileObject}
 */
const extractFileInfo = file => {
  if (file !== null) {
    let retVal = null;
    if (file instanceof FileObject) {
      retVal = file;
    } else if (typeof File !== 'undefined' && file instanceof File) {
      // case: file object
      retVal = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: file
      };
    } else if (typeof file === 'string' && isDataUrl(file)) {
      // case: data URL
      const result = dataURItoBlob(file);
      if (result !== null) {
        const {
          blob,
          name
        } = result;
        retVal = {
          name: name,
          type: blob.type,
          size: blob.size,
          data: blob
        };
      }
    } else {
      var _jFile, _jFile2;
      // case: string as file object
      let jFile = file;
      try {
        jFile = JSON.parse(file);
        retVal = jFile;
      } catch (ex) {
        // do nothing
      }
      if (typeof ((_jFile = jFile) == null ? void 0 : _jFile.data) === 'string' && isDataUrl((_jFile2 = jFile) == null ? void 0 : _jFile2.data)) {
        var _jFile3;
        // case: data URL
        const result = dataURItoBlob((_jFile3 = jFile) == null ? void 0 : _jFile3.data);
        if (result !== null) {
          var _jFile4, _jFile5;
          const blob = result.blob;
          retVal = {
            name: (_jFile4 = jFile) == null ? void 0 : _jFile4.name,
            type: (_jFile5 = jFile) == null ? void 0 : _jFile5.type,
            size: blob.size,
            data: blob
          };
        }
      } else if (typeof jFile === 'string') {
        // case: data as external url
        const fileName = jFile.split('/').pop();
        retVal = {
          name: fileName,
          type: 'application/octet-stream',
          size: 0,
          data: jFile
        };
      } else if (typeof jFile === 'object') {
        var _jFile6, _jFile7, _jFile8, _jFile9;
        // todo: just added for ease of integration for the view layer
        retVal = {
          name: (_jFile6 = jFile) == null ? void 0 : _jFile6.name,
          type: (_jFile7 = jFile) == null ? void 0 : _jFile7.type,
          size: (_jFile8 = jFile) == null ? void 0 : _jFile8.size,
          data: (_jFile9 = jFile) == null ? void 0 : _jFile9.data
        };
      }
    }
    if (retVal !== null && retVal.data != null) {
      return new FileObject(retVal);
    }
    return null;
  } else {
    return null;
  }
};
/**
 * Utility to convert data URI to a `blob` object
 * @param dataURI uri to convert to blob
 * @returns `Blob` object for the data URI
 */
const dataURItoBlob = dataURI => {
  const regex = /^data:([a-z]+\/[a-z0-9-+.]+)?(?:;name=([^;]+))?(;base64)?,(.+)$/;
  const groups = regex.exec(dataURI);
  if (groups !== null) {
    const type = groups[1] || '';
    const name = groups[2] || 'unknown';
    const isBase64 = typeof groups[3] === 'string';
    if (isBase64) {
      const binary = atob(groups[4]);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      const blob = new window.Blob([new Uint8Array(array)], {
        type
      });
      return {
        name,
        blob
      };
    } else {
      const blob = new window.Blob([groups[4]], {
        type
      });
      return {
        name,
        blob
      };
    }
  } else {
    return null;
  }
};

/**
 * Defines generic utilities to validate form runtime model based on the constraints defined
 * as per `adaptive form specification`
 */
// issue with import
//import {FieldJson, isFileObject} from '../types';
const dateRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
const dataUrlRegex = /^data:([a-z]+\/[a-z0-9-+.]+)?;(?:name=(.*);)?base64,(.*)$/;
const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const daysInMonth = (leapYear, month) => {
  if (leapYear && month == 2) {
    return 29;
  }
  return days[month - 1];
};
const isLeapYear = year => {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
};
const isDataUrl = str => {
  return dataUrlRegex.exec(str.trim()) != null;
};
/**
 * Checks whether inputVal is valid number value or not
 *
 * ```
 * const x = checkNumber('12')
 * ```
 * would return
 * ```
 * {
 *     value : 12,
 *     valid : true
 * }
 * ```
 * @param inputVal input value
 * @returns {@link ValidationResult | Validation result}
 */
const checkNumber = inputVal => {
  let value = parseFloat(inputVal);
  const valid = !isNaN(value);
  if (!valid) {
    value = inputVal;
  }
  return {
    value,
    valid
  };
};
const checkInteger = inputVal => {
  let value = parseFloat(inputVal);
  const valid = !isNaN(value) && Math.round(value) === value;
  if (!valid) {
    value = inputVal;
  }
  return {
    value,
    valid
  };
};
/**
 * Wraps a non-null value and not an array value into an array
 * @param inputVal input value
 * @returns wraps the input value into an array
 */
const toArray = inputVal => {
  if (inputVal != null && !(inputVal instanceof Array)) {
    return [inputVal];
  }
  return inputVal;
};
/**
 * Checks whether inputVal is valid boolean value or not
 *
 * ```
 * const x = checkBool('false')
 * ```
 * would return
 * ```
 * {
 *     value : false,
 *     valid : true
 * }
 * ```
 * @param inputVal input value
 * @returns {@link ValidationResult | Validation result}
 */
const checkBool = inputVal => {
  const valid = typeof inputVal === 'boolean' || inputVal === 'true' || inputVal === 'false';
  const value = typeof inputVal === 'boolean' ? inputVal : valid ? inputVal === 'true' : inputVal;
  return {
    valid,
    value
  };
};
/**
 *
 * @param inputVal
 */
const checkFile = inputVal => {
  const value = extractFileInfo(inputVal);
  const valid = value !== null;
  return {
    value: valid ? value : inputVal,
    valid
  };
};
/**
 * validates whether the mediaType is one present in the accepts list
 * @param mediaType
 * @param accepts
 */
const matchMediaType = (mediaType, accepts) => {
  return !mediaType || accepts.some(accept => {
    const trimmedAccept = accept.trim();
    const prefixAccept = trimmedAccept.split('/')[0];
    const suffixAccept = trimmedAccept.split('.')[1];
    return trimmedAccept.includes('*') && mediaType.startsWith(prefixAccept) || trimmedAccept.includes('.') && mediaType.endsWith(suffixAccept) || trimmedAccept === mediaType;
  });
};
/**
 * Validates an array of values using a validator function.
 * @param inputVal
 * @param validatorFn
 * @return an array containing two arrays, the first one with all the valid values and the second one with one invalid
 * value (if there is).
 */
const partitionArray = (inputVal, validatorFn) => {
  const value = toArray(inputVal);
  if (value == null) {
    return [[], [value]];
  }
  return value.reduce((acc, x) => {
    if (acc[1].length == 0) {
      const r = validatorFn(x);
      const index = r.valid ? 0 : 1;
      acc[index].push(r.value);
    }
    return acc;
  }, [[], []]);
};
const ValidConstraints = {
  date: ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'format'],
  string: ['minLength', 'maxLength', 'pattern'],
  number: ['minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum'],
  array: ['minItems', 'maxItems', 'uniqueItems'],
  file: ['accept', 'maxFileSize']
};
/**
 * Implementation of all constraints defined by `adaptive form specification`
 */
const Constraints = {
  /**
   * Implementation of type constraint
   * @param constraint    `type` property of the form object
   * @param inputVal      value of the form object
   * @return {@link ValidationResult | validation result}
   */
  type: (constraint, inputVal) => {
    let value = inputVal;
    if (inputVal == undefined) {
      return {
        valid: true,
        value: inputVal
      };
    }
    let valid = true,
      res;
    switch (constraint) {
      case 'string':
        valid = true;
        value = inputVal.toString();
        break;
      case 'string[]':
        value = toArray(inputVal);
        break;
      case 'number':
        res = checkNumber(inputVal);
        value = res.value;
        valid = res.valid;
        break;
      case 'boolean':
        res = checkBool(inputVal);
        valid = res.valid;
        value = res.value;
        break;
      case 'integer':
        res = checkInteger(inputVal);
        valid = res.valid;
        value = res.value;
        break;
      case 'integer[]':
        res = partitionArray(inputVal, checkInteger);
        valid = res[1].length === 0;
        value = valid ? res[0] : inputVal;
        break;
      case 'file':
        // for file types only, we support setting value via an array
        res = checkFile(inputVal instanceof Array ? inputVal[0] : inputVal);
        valid = res.valid;
        value = res.value;
        break;
      case 'file[]':
        res = partitionArray(inputVal, checkFile);
        valid = res[1].length === 0;
        value = valid ? res[0] : inputVal;
        break;
      case 'number[]':
        res = partitionArray(inputVal, checkNumber);
        valid = res[1].length === 0;
        value = valid ? res[0] : inputVal;
        break;
      case 'boolean[]':
        res = partitionArray(inputVal, checkBool);
        valid = res[1].length === 0;
        value = valid ? res[0] : inputVal;
        break;
    }
    return {
      valid,
      value
    };
  },
  /**
   * Implementation of format constraint
   * @param constraint    `format` property of the form object
   * @param input         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  format: (constraint, input) => {
    let valid = true;
    const value = input;
    if (input === null) {
      return {
        value,
        valid
      };
    }
    let res;
    switch (constraint) {
      case 'date':
        res = dateRegex.exec((input || '').trim());
        if (res != null) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [match, year, month, date] = res;
          const [nMonth, nDate] = [+month, +date];
          const leapYear = isLeapYear(+year);
          valid = nMonth >= 1 && nMonth <= 12 && nDate >= 1 && nDate <= daysInMonth(leapYear, nMonth);
        } else {
          valid = false;
        }
        break;
      case 'data-url':
        // todo: input is of type file, do we need this format ? since value is always of type file object
        //res = dataUrlRegex.exec(input.trim());
        //valid = res != null;
        valid = true;
        break;
    }
    return {
      valid,
      value
    };
  },
  //todo : add support for date
  /**
   * Implementation of minimum constraint
   * @param constraint    `minimum` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  minimum: (constraint, value) => {
    return {
      valid: value >= constraint,
      value
    };
  },
  //todo : add support for date
  /**
   * Implementation of maximum constraint
   * @param constraint    `maximum` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  maximum: (constraint, value) => {
    return {
      valid: value <= constraint,
      value
    };
  },
  /**
   * Implementation of exclusiveMinimum constraint
   * @param constraint    `minimum` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  exclusiveMinimum: (constraint, value) => {
    return {
      valid: value > constraint,
      value
    };
  },
  //todo : add support for date
  /**
   * Implementation of exclusiveMaximum constraint
   * @param constraint    `maximum` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  exclusiveMaximum: (constraint, value) => {
    return {
      valid: value < constraint,
      value
    };
  },
  /**
   * Implementation of the minItems constraint
   * @param constraint `minItems` constraint from object
   * @param value value of the form object
   */
  minItems: (constraint, value) => {
    return {
      valid: value instanceof Array && value.length >= constraint,
      value
    };
  },
  /**
   * Implementation of the maxItems constraint
   * @param constraint `maxItems` constraint from object
   * @param value value of the form object
   */
  maxItems: (constraint, value) => {
    return {
      valid: value instanceof Array && value.length <= constraint,
      value
    };
  },
  /**
   * Implementation of the uniqueItems constraint
   * @param constraint `uniqueItems` constraint from object
   * @param value value of the form object
   */
  uniqueItems: (constraint, value) => {
    return {
      valid: !constraint || value instanceof Array && value.length === new Set(value).size,
      value
    };
  },
  /**
   * Implementation of minLength constraint
   * @param constraint    `minLength` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  minLength: (constraint, value) => {
    return _extends({}, Constraints.minimum(constraint, typeof value === 'string' ? value.length : 0), {
      value
    });
  },
  /**
   * Implementation of maxLength constraint
   * @param constraint    `maxLength` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  maxLength: (constraint, value) => {
    return _extends({}, Constraints.maximum(constraint, typeof value === 'string' ? value.length : 0), {
      value
    });
  },
  /**
   * Implementation of pattern constraint
   * @param constraint    `pattern` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  pattern: (constraint, value) => {
    let regex;
    if (typeof constraint === 'string') {
      regex = new RegExp(constraint);
    } else {
      regex = constraint;
    }
    return {
      valid: regex.test(value),
      value
    };
  },
  /**
   * Implementation of required constraint
   * @param constraint    `required` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  required: (constraint, value) => {
    const valid = constraint ? value != null && value !== '' : true;
    return {
      valid,
      value
    };
  },
  /**
   * Implementation of enum constraint
   * @param constraint    `enum` property of the form object
   * @param value         value of the form object
   * @return {@link ValidationResult | validation result}
   */
  enum: (constraint, value) => {
    return {
      valid: constraint.indexOf(value) > -1,
      value
    };
  },
  /**
   *
   * @param constraint
   * @param value
   */
  accept: (constraint, value) => {
    if (!constraint || constraint.length === 0 || value === null || value === undefined) {
      return {
        valid: true,
        value
      };
    }
    const tempValue = value instanceof Array ? value : [value];
    const invalidFile = tempValue.some(file => !matchMediaType(file.type, constraint));
    return {
      valid: !invalidFile,
      value
    };
  },
  /**
   * @param constraint
   * @param value
   */
  maxFileSize: (constraint, value) => {
    const sizeLimit = typeof constraint === 'string' ? getFileSizeInBytes(constraint) : constraint;
    return {
      valid: !(value instanceof FileObject) || value.size <= sizeLimit,
      value
    };
  }
};

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var __decorate = undefined && undefined.__decorate || function (decorators, target, key, desc) {
  var c = arguments.length,
    r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
    d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/**
 * Defines a form object field which implements {@link FieldModel | field model} interface
 */
class Field extends Scriptable {
  /**
   * @param params
   * @param _options
   * @private
   */
  constructor(params, _options) {
    super(params, _options);
    this._ruleNodeReference = [];
    this._applyDefaults();
    this.queueEvent(new Initialize());
    this.queueEvent(new ExecuteRule());
  }
  /**
   * @private
   */
  _initialize() {
    super._initialize();
    this.setupRuleNode();
  }
  ruleNodeReference() {
    var _this$type;
    if ((_this$type = this.type) != null && _this$type.endsWith('[]')) {
      this._ruleNodeReference = [];
    } else {
      this._ruleNodeReference = this;
    }
    return this._ruleNodeReference;
  }
  _getDefaults() {
    return {
      readOnly: false,
      enabled: true,
      visible: true,
      type: this._getFallbackType()
    };
  }
  /**
   * Returns the fallback type to be used for this field, in case type is not defined. Otherwise returns
   * undefined
   * @protected
   */
  _getFallbackType() {
    const type = this._jsonModel.type;
    if (typeof type !== 'string') {
      const _enum = this.enum;
      return _enum && _enum.length > 0 ? typeof _enum[0] : 'string';
    }
  }
  _applyDefaults() {
    Object.entries(this._getDefaults()).map(([key, value]) => {
      //@ts-ignore
      if (this._jsonModel[key] === undefined && value !== undefined) {
        //@ts-ignore
        this._jsonModel[key] = value;
      }
    });
    const value = this._jsonModel.value;
    if (value === undefined) {
      const typedRes = Constraints.type(this.getInternalType() || 'string', this._jsonModel.default);
      this._jsonModel.value = typedRes.value;
    }
    if (this._jsonModel.fieldType === undefined) {
      //@ts-ignore
      if (this._jsonModel.viewType) {
        //@ts-ignore
        if (this._jsonModel.viewType.startsWith('custom:')) {
          this.form.logger.error('viewType property has been removed. For custom types, use :type property');
        } else {
          this.form.logger.error('viewType property has been removed. Use fieldType property');
        }
        //@ts-ignore
        this._jsonModel.fieldType = this._jsonModel.viewType;
      } else {
        this._jsonModel.fieldType = defaultFieldTypes(this._jsonModel);
      }
    }
    if (this._jsonModel.enum === undefined) {
      const type = this._jsonModel.type;
      if (type === 'boolean') {
        this._jsonModel.enum = [true, false];
      }
    }
    if (typeof this._jsonModel.step !== 'number' || this._jsonModel.type !== 'number') {
      this._jsonModel.step = undefined;
    }
  }
  get editFormat() {
    return this._jsonModel.editFormat;
  }
  get displayFormat() {
    return this._jsonModel.displayFormat;
  }
  get placeholder() {
    return this._jsonModel.placeholder;
  }
  get readOnly() {
    return this._jsonModel.readOnly;
  }
  set readOnly(e) {
    this._setProperty('readOnly', e);
  }
  get language() {
    //todo: add this in the specification and take it as a property
    return Intl.DateTimeFormat().resolvedOptions().locale;
  }
  get enabled() {
    return this._jsonModel.enabled;
  }
  set enabled(e) {
    this._setProperty('enabled', e);
  }
  get valid() {
    return this._jsonModel.valid;
  }
  get emptyValue() {
    if (this._jsonModel.emptyValue === 'null') {
      return null;
    } else if (this._jsonModel.emptyValue === '' && this.type === 'string') {
      return '';
    } else {
      return undefined;
    }
  }
  get enum() {
    return this._jsonModel.enum;
  }
  set enum(e) {
    this._setProperty('enum', e);
  }
  get enumNames() {
    return this._jsonModel.enumNames;
  }
  set enumNames(e) {
    this._setProperty('enumNames', e);
  }
  get required() {
    return this._jsonModel.required || false;
  }
  set required(r) {
    this._setProperty('required', r);
  }
  get maximum() {
    return this._jsonModel.maximum;
  }
  set maximum(m) {
    this._setProperty('maximum', m);
  }
  get minimum() {
    return this._jsonModel.minimum;
  }
  set minimum(m) {
    this._setProperty('minimum', m);
  }
  /**
   * returns whether the value is empty. Empty value is either a '', undefined or null
   * @private
   */
  isEmpty() {
    return this._jsonModel.value === undefined || this._jsonModel.value === null || this._jsonModel.value === '';
  }
  get editValue() {
    const format = this.editFormat;
    if (this.format == 'date' && this.value != null && this.valid !== false) {
      return formatDate(new Date(this.value), this.language, format);
    } else {
      return this.value;
    }
  }
  get displayValue() {
    const format = this.displayFormat;
    if (this.format == 'date' && this.value != null && this.valid !== false) {
      return formatDate(new Date(this.value), this.language, format);
    } else {
      return this.value;
    }
  }
  getDataNodeValue(typedValue) {
    return this.isEmpty() ? this.emptyValue : typedValue;
  }
  get value() {
    if (this._jsonModel.value === undefined) {
      return null;
    } else {
      return this._jsonModel.value;
    }
  }
  set value(v) {
    const Constraints = this._getConstraintObject();
    const typeRes = Constraints.type(this.getInternalType() || 'string', v);
    const changes = this._setProperty('value', typeRes.value, false);
    let uniqueRes = {
      valid: true
    };
    if (changes.length > 0) {
      this._updateRuleNodeReference(typeRes.value);
      const dataNode = this.getDataNode();
      if (typeof dataNode !== 'undefined') {
        dataNode.setValue(this.getDataNodeValue(this._jsonModel.value), this._jsonModel.value, this);
      }
      if (this.parent.uniqueItems && this.parent.type === 'array') {
        // @ts-ignore
        uniqueRes = Constraints.uniqueItems(this.parent.uniqueItems, this.parent.getDataNode().$value);
      }
      let updates;
      if (typeRes.valid && uniqueRes.valid) {
        updates = this.evaluateConstraints();
      } else {
        const _changes = {
          'valid': typeRes.valid && uniqueRes.valid,
          'errorMessage': typeRes.valid && uniqueRes.valid ? '' : this.getErrorMessage('type')
        };
        updates = this._applyUpdates(['valid', 'errorMessage'], _changes);
      }
      if (updates.valid) {
        this.triggerValidationEvent(updates);
      }
      const changeAction = new Change({
        changes: changes.concat(Object.values(updates))
      });
      this.dispatch(changeAction);
    }
  }
  _updateRuleNodeReference(value) {
    var _this$type2;
    if ((_this$type2 = this.type) != null && _this$type2.endsWith('[]')) {
      if (value != null) {
        value.forEach((val, index) => {
          this._ruleNodeReference[index] = val;
        });
        while (value.length !== this._ruleNodeReference.length) {
          this._ruleNodeReference.pop();
        }
      } else {
        while (this._ruleNodeReference.length !== 0) {
          this._ruleNodeReference.pop();
        }
      }
    }
  }
  getInternalType() {
    return this.type;
  }
  valueOf() {
    // @ts-ignore
    const obj = this[target];
    const actualField = obj === undefined ? this : obj;
    actualField.ruleEngine.trackDependency(actualField);
    return actualField._jsonModel.value || null;
  }
  toString() {
    var _actualField$_jsonMod;
    // @ts-ignore
    const obj = this[target];
    const actualField = obj === undefined ? this : obj;
    return ((_actualField$_jsonMod = actualField._jsonModel.value) == null ? void 0 : _actualField$_jsonMod.toString()) || '';
  }
  /**
   * Returns the error message for a given constraint
   * @param constraint
   */
  getErrorMessage(constraint) {
    var _this$_jsonModel$cons;
    return ((_this$_jsonModel$cons = this._jsonModel.constraintMessages) == null ? void 0 : _this$_jsonModel$cons[constraint]) || '';
  }
  /**
   *
   * @private
   */
  _getConstraintObject() {
    return Constraints;
  }
  /**
   * returns whether the field is array type or not
   * @private
   */
  isArrayType() {
    return this.type ? this.type.indexOf('[]') > -1 : false;
  }
  /**
   *
   * @param value
   * @param constraints
   * @private
   */
  checkEnum(value, constraints) {
    if (this._jsonModel.enforceEnum === true && value != null) {
      const fn = constraints.enum;
      if (value instanceof Array && this.isArrayType()) {
        return value.every(x => fn(this.enum || [], x).valid);
      } else {
        return fn(this.enum || [], value).valid;
      }
    }
    return true;
  }
  /**
   * checks whether the value can be achieved by stepping the min/default value by the step constraint.
   * Basically to find a integer solution for n in the equation
   * initialValue + n * step = value
   * @param constraints
   * @private
   */
  checkStep() {
    const value = this._jsonModel.value;
    if (typeof this._jsonModel.step === 'number') {
      const initialValue = this._jsonModel.minimum || this._jsonModel.default || 0;
      return (value - initialValue) % this._jsonModel.step === 0;
    }
    return true;
  }
  /**
   * checks whether the validation expression returns a boolean value or not
   * @private
   */
  checkValidationExpression() {
    if (typeof this._jsonModel.validationExpression === 'string') {
      return this.executeExpression(this._jsonModel.validationExpression);
    }
    return true;
  }
  /**
   * Returns the applicable constraints for a given type
   * @private
   */
  getConstraints() {
    switch (this.type) {
      case 'string':
        switch (this.format) {
          case 'date':
            return ValidConstraints.date;
          case 'binary':
            return ValidConstraints.file;
          case 'data-url':
            return ValidConstraints.file;
          default:
            return ValidConstraints.string;
        }
      case 'file':
        return ValidConstraints.file;
      case 'number':
      case 'integer':
        return ValidConstraints.number;
    }
    if (this.isArrayType()) {
      return ValidConstraints.array;
    }
    return [];
  }
  /**
   * returns the format constraint
   */
  get format() {
    return this._jsonModel.format || '';
  }
  /**
   * @private
   */
  evaluateConstraints() {
    let constraint = 'type';
    const elem = this._jsonModel;
    const value = this._jsonModel.value;
    const Constraints = this._getConstraintObject();
    const supportedConstraints = this.getConstraints();
    let valid = true;
    if (valid) {
      valid = Constraints.required(this.required, value).valid && (this.isArrayType() && this.required ? value.length > 0 : true);
      constraint = 'required';
    }
    if (valid && value != this.emptyValue) {
      const invalidConstraint = supportedConstraints.find(key => {
        if (key in elem) {
          // @ts-ignore
          const restriction = elem[key];
          // @ts-ignore
          const fn = Constraints[key];
          if (value instanceof Array && this.isArrayType()) {
            if (ValidConstraints.array.indexOf(key) !== -1) {
              return !fn(restriction, value).valid;
            } else {
              return value.some(x => !fn(restriction, x).valid);
            }
          } else if (typeof fn === 'function') {
            return !fn(restriction, value).valid;
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
      if (invalidConstraint != null) {
        valid = false;
        constraint = invalidConstraint;
      } else {
        valid = this.checkEnum(value, Constraints);
        constraint = 'enum';
        if (valid && this.type === 'number') {
          valid = this.checkStep();
          constraint = 'step';
        }
        if (valid) {
          valid = this.checkValidationExpression();
          constraint = 'validationExpression';
        }
      }
    }
    if (!valid) {
      //@ts-ignore
      this.form.logger.log(`${constraint} constraint evaluation failed ${this[constraint]}. Received ${this._jsonModel.value}`);
    }
    const changes = {
      'valid': valid,
      'errorMessage': valid ? '' : this.getErrorMessage(constraint)
    };
    return this._applyUpdates(['valid', 'errorMessage'], changes);
  }
  triggerValidationEvent(changes) {
    if (changes.valid) {
      if (this.valid) {
        this.dispatch(new Valid());
      } else {
        this.dispatch(new Invalid());
      }
    }
  }
  /**
   * Validates the current form object
   */
  validate() {
    const changes = this.evaluateConstraints();
    if (changes.valid) {
      this.triggerValidationEvent(changes);
      this.notifyDependents(new Change({
        changes: Object.values(changes)
      }));
    }
    return this.valid ? [] : [new ValidationError(this.id, [this._jsonModel.errorMessage])];
  }
  importData(contextualDataModel) {
    this._bindToDataModel(contextualDataModel);
    const dataNode = this.getDataNode();
    // only if the value has changed, queue change event
    if (dataNode !== undefined && dataNode !== NullDataValue && dataNode.$value !== this._jsonModel.value) {
      const changeAction = propertyChange('value', dataNode.$value, this._jsonModel.value);
      this._jsonModel.value = dataNode.$value;
      this.queueEvent(changeAction);
    }
  }
  /**
   * @param name
   * @private
   */
  defaultDataModel(name) {
    return new DataValue(name, this.getDataNodeValue(this._jsonModel.value), this.type || 'string');
  }
  getState() {
    return _extends({}, super.getState(), {
      editValue: this.editValue,
      displayValue: this.displayValue
    });
  }
}
__decorate([dependencyTracked()], Field.prototype, "readOnly", null);
__decorate([dependencyTracked()], Field.prototype, "enabled", null);
__decorate([dependencyTracked()], Field.prototype, "valid", null);
__decorate([dependencyTracked()], Field.prototype, "enum", null);
__decorate([dependencyTracked()], Field.prototype, "enumNames", null);
__decorate([dependencyTracked()], Field.prototype, "required", null);
__decorate([dependencyTracked()], Field.prototype, "value", null);

function addNameToDataURL(dataURL, name) {
  return dataURL.replace(';base64', `;name=${encodeURIComponent(name)};base64`);
}
function processFiles(files) {
  return Promise.all([].map.call(files, processFile));
}
async function processFile(file) {
  const {
    name,
    size,
    type
  } = file;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fileObj = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      resolve(new FileObject({
        // @ts-ignore
        data: addNameToDataURL(event.target.result, name),
        type,
        name,
        size
      }));
    };
    reader.readAsDataURL(file.data);
  });
  return fileObj;
}
/**
 * Implementation of FileUpload runtime model which extends from {@link Field | field}
 */
class FileUpload extends Field {
  //private _files: FileObject[];
  _getDefaults() {
    return _extends({}, super._getDefaults(), {
      accept: ['audio/*', 'video/*', 'image/*', 'text/*', 'application/pdf'],
      maxFileSize: '2MB',
      type: 'file'
    });
  }
  /**
   * Returns the max file size in bytes as per IEC specification
   */
  get maxFileSize() {
    return getFileSizeInBytes(this._jsonModel.maxFileSize);
  }
  /**
   * Returns the list of mime types which file attachment can accept
   */
  get accept() {
    return this._jsonModel.accept;
  }
  /**
   * Checks whether there are any updates in the properties
   * @param propNames
   * @param updates
   * @private
   */
  _applyUpdates(propNames, updates) {
    return propNames.reduce((acc, propertyName) => {
      //@ts-ignore
      const prevValue = this._jsonModel[propertyName];
      const currentValue = updates[propertyName];
      if (currentValue !== prevValue) {
        acc[propertyName] = {
          propertyName,
          currentValue,
          prevValue
        };
        if (prevValue instanceof FileObject && typeof currentValue === 'object' && propertyName === 'value') {
          // @ts-ignore
          this._jsonModel[propertyName] = new FileObject(_extends({}, prevValue, {
            'data': currentValue.data
          }));
        } else {
          // @ts-ignore
          this._jsonModel[propertyName] = currentValue;
        }
      }
      return acc;
    }, {});
  }
  getInternalType() {
    var _this$type;
    return (_this$type = this.type) != null && _this$type.endsWith('[]') ? 'file[]' : 'file';
  }
  getDataNodeValue(typedValue) {
    let dataNodeValue = typedValue;
    if (dataNodeValue != null) {
      if (this.type === 'string') {
        var _dataNodeValue$data;
        dataNodeValue = (_dataNodeValue$data = dataNodeValue.data) == null ? void 0 : _dataNodeValue$data.toString();
      } else if (this.type === 'string[]') {
        dataNodeValue = dataNodeValue instanceof Array ? dataNodeValue : [dataNodeValue];
        dataNodeValue = dataNodeValue.map(_ => {
          var _$data;
          return _ == null ? void 0 : (_$data = _.data) == null ? void 0 : _$data.toString();
        });
      }
    }
    return dataNodeValue;
  }
  async _serialize() {
    const val = this._jsonModel.value;
    if (val === undefined) {
      return null;
    }
    // @ts-ignore
    const filesInfo = await processFiles(val instanceof Array ? val : [val]);
    return filesInfo;
  }
  importData(dataModel) {
    this._bindToDataModel(dataModel);
    const dataNode = this.getDataNode();
    if (dataNode !== undefined) {
      const value = dataNode == null ? void 0 : dataNode.$value;
      // only if not undefined, proceed further
      if (value != null) {
        const res = Constraints.type(this.getInternalType(), value);
        if (!res.valid) {
          this.form.logger.error(`unable to bind ${this.name} to data`);
        }
        // is this needed ?
        this.form.getEventQueue().queue(this, propertyChange('value', res.value, this._jsonModel.value));
        this._jsonModel.value = res.value;
      } else {
        this._jsonModel.value = null;
      }
    }
  }
}

/**
 * @param offValue
 * @private
 */
const requiredConstraint = offValue => (constraint, value) => {
  const valid = Constraints.required(constraint, value).valid && (!constraint || value != offValue);
  return {
    valid,
    value
  };
};
/**
 * Implementation of check box runtime model which extends from {@link Field | field} model
 */
class Checkbox extends Field {
  offValue() {
    const opts = this.enum;
    return opts.length > 1 ? opts[1] : null;
  }
  /**
   * @private
   */
  _getConstraintObject() {
    const baseConstraints = _extends({}, super._getConstraintObject());
    baseConstraints.required = requiredConstraint(this.offValue());
    return baseConstraints;
  }
  _getDefaults() {
    return _extends({}, super._getDefaults(), {
      enforceEnum: true
    });
  }
  /**
   * Returns the `enum` constraints from the json
   */
  get enum() {
    return this._jsonModel.enum || [];
  }
}

/**
 * Implementation of CheckBoxGroup runtime model which extends from {@link Field | field}
 */
class CheckboxGroup extends Field {
  /**
   * @param params
   * @param _options
   * @private
   */
  constructor(params, _options) {
    super(params, _options);
  }
  /**
   * converts the fallback type, if required, to an array. Since checkbox-group has an array type
   * @protected
   */
  _getFallbackType() {
    const fallbackType = super._getFallbackType();
    if (typeof fallbackType === 'string') {
      return `${fallbackType}[]`;
    }
  }
  _getDefaults() {
    return _extends({}, super._getDefaults(), {
      enforceEnum: true,
      enum: []
    });
  }
}

/*
 *
 *  * Copyright 2022 Adobe, Inc.
 *  *
 *  * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *  *
 *  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
class DateField extends Field {
  _applyDefaults() {
    super._applyDefaults();
    const locale = new Intl.DateTimeFormat().resolvedOptions().locale;
    if (!this._jsonModel.editFormat) {
      this._jsonModel.editFormat = 'short';
    }
    if (!this._jsonModel.displayFormat) {
      this._jsonModel.displayFormat = this._jsonModel.editFormat;
    }
    if (!this._jsonModel.placeholder) {
      this._jsonModel.placeholder = getSkeleton(this._jsonModel.editFormat, locale);
    }
    if (!this._jsonModel.description) {
      this._jsonModel.description = `To enter today's date use ${formatDate(new Date(), locale, this._jsonModel.editFormat)}`;
    }
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Creates a child model inside the given parent
 * @param child
 * @param options
 * @private
 */
const createChild = (child, options) => {
  let retVal;
  if ('items' in child) {
    retVal = new Fieldset(child, options);
  } else {
    if (isFile(child) || child.fieldType === 'file-input') {
      // @ts-ignore
      retVal = new FileUpload(child, options);
    } else if (isCheckbox(child)) {
      retVal = new Checkbox(child, options);
    } else if (isCheckboxGroup(child)) {
      retVal = new CheckboxGroup(child, options);
    } else if (isDateField(child)) {
      retVal = new DateField(child, options);
    } else {
      retVal = new Field(child, options);
    }
  }
  options.form.fieldAdded(retVal);
  return retVal;
};
const defaults = {
  visible: true
};
/**
 * Defines a field set class which extends from {@link Container | container}
 */
class Fieldset extends Container {
  /**
   * @param params
   * @param _options
   * @private
   */
  constructor(params, _options) {
    super(params, _options);
    this._applyDefaults();
    this.queueEvent(new Initialize());
    this.queueEvent(new ExecuteRule());
  }
  _applyDefaults() {
    Object.entries(defaults).map(([key, value]) => {
      //@ts-ignore
      if (this._jsonModel[key] === undefined) {
        //@ts-ignore
        this._jsonModel[key] = value;
      }
    });
    if (this._jsonModel.dataRef && this._jsonModel.type === undefined) {
      this._jsonModel.type = 'object';
    }
  }
  get type() {
    const ret = super.type;
    if (ret === 'array' || ret === 'object') {
      return ret;
    }
    return undefined;
  }
  // @ts-ignore
  _createChild(child, options) {
    const {
      parent = this
    } = options;
    return createChild(child, {
      form: this.form,
      parent: parent
    });
  }
  get items() {
    return super.items;
  }
  get value() {
    return null;
  }
  get fieldType() {
    return 'panel';
  }
  get enabled() {
    return this._jsonModel.enabled;
  }
  set enabled(e) {
    this._setProperty('enabled', e);
  }
}

const levels = {
  off: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
};
/**
 * @private
 */
class Logger {
  debug(msg) {
    this.log(msg, 'debug');
  }
  info(msg) {
    this.log(msg, 'info');
  }
  warn(msg) {
    this.log(msg, 'warn');
  }
  error(msg) {
    this.log(msg, 'error');
  }
  log(msg, level) {
    if (this.logLevel !== 0 && this.logLevel <= levels[level]) {
      console[level](msg);
    }
  }
  constructor(logLevel = 'off') {
    this.logLevel = levels[logLevel];
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Implementation of event node
 * @private
 */
class EventNode {
  constructor(_node, _event) {
    this._node = _node;
    this._event = _event;
  }
  get node() {
    return this._node;
  }
  get event() {
    return this._event;
  }
  isEqual(that) {
    return that !== null && that !== undefined && this._node == that._node && this._event.type == that._event.type;
  }
  toString() {
    return this._node.id + '__' + this.event.type;
  }
  valueOf() {
    return this.toString();
  }
}
/**
 * Implementation of event queue. When a user event, like change or click, is captured the expression to be evaluated
 * must be put in an Event Queue and then evaluated.
 * @private
 */
class EventQueue {
  constructor(logger = new Logger('off')) {
    this._isProcessing = false;
    this._pendingEvents = [];
    this.logger = logger;
    this._runningEventCount = {};
  }
  get length() {
    return this._pendingEvents.length;
  }
  get isProcessing() {
    return this._isProcessing;
  }
  isQueued(node, event) {
    const evntNode = new EventNode(node, event);
    return this._pendingEvents.find(x => evntNode.isEqual(x)) !== undefined;
  }
  queue(node, events, priority = false) {
    if (!node || !events) {
      return;
    }
    if (!(events instanceof Array)) {
      events = [events];
    }
    events.forEach(e => {
      const evntNode = new EventNode(node, e);
      const counter = this._runningEventCount[evntNode.valueOf()] || 0;
      if (counter < EventQueue.MAX_EVENT_CYCLE_COUNT) {
        this.logger.info(`Queued event : ${e.type} node: ${node.id} - ${node.name}`);
        //console.log(`Event Details ${e.toString()}`)
        if (priority) {
          const index = this._isProcessing ? 1 : 0;
          this._pendingEvents.splice(index, 0, evntNode);
        } else {
          this._pendingEvents.push(evntNode);
        }
        this._runningEventCount[evntNode.valueOf()] = counter + 1;
      } else {
        this.logger.info(`Skipped queueing event : ${e.type} node: ${node.id} - ${node.name} with count=${counter}`);
      }
    });
  }
  runPendingQueue() {
    if (this._isProcessing) {
      return;
    }
    this._isProcessing = true;
    while (this._pendingEvents.length > 0) {
      const e = this._pendingEvents[0];
      this.logger.info(`Dequeued event : ${e.event.type} node: ${e.node.id} - ${e.node.name}`);
      //console.log(`Event Details ${e.event.toString()}`);
      e.node.executeAction(e.event);
      this._pendingEvents.shift();
    }
    this._runningEventCount = {};
    this._isProcessing = false;
  }
}
EventQueue.MAX_EVENT_CYCLE_COUNT = 10;

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const request$1 = (url, data = null, options = {}) => {
  const opts = _extends({}, defaultRequestOptions, options);
  return fetch(url, _extends({}, opts, {
    body: data
  })).then(response => {
    var _response$headers$get;
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    if (response != null && (_response$headers$get = response.headers.get('Content-Type')) != null && _response$headers$get.includes('application/json')) {
      return response.json();
    } else {
      return response.text();
    }
  });
};
const defaultRequestOptions = {
  method: 'GET'
};

const getCustomEventName = name => {
  const eName = name;
  if (eName.length > 0 && eName.startsWith('custom:')) {
    return eName.substring('custom:'.length);
  }
  return eName;
};
/**
 * Implementation of generic request API. This API can be used to make external web request
 * @param context                   expression execution context(consists of current form, current field, current event)
 * @param uri                       request URI
 * @param httpVerb                  http verb (for example, GET or POST)
 * @param payload                   request payload
 * @param success                   success handler
 * @param error                     error handler
 * @param headers                   headers
 * @private
 */
const request = async (context, uri, httpVerb, payload, success, error, headers) => {
  const endpoint = uri;
  const requestOptions = {
    method: httpVerb
  };
  let result;
  let inputPayload;
  try {
    if (payload && payload instanceof FileObject && payload.data instanceof File) {
      // todo: have to implement array type
      const formData = new FormData();
      formData.append(payload.name, payload.data);
      inputPayload = formData;
    } else if (payload instanceof FormData) {
      inputPayload = payload;
    } else if (payload && typeof payload === 'object' && Object.keys(payload).length > 0) {
      var _requestOptions$heade;
      const headerNames = Object.keys(headers);
      if (headerNames.length > 0) {
        requestOptions.headers = _extends({}, headers, headerNames.indexOf('Content-Type') === -1 ? {
          'Content-Type': 'application/json'
        } : {});
      } else {
        requestOptions.headers = {
          'Content-Type': 'application/json'
        };
      }
      const contentType = (requestOptions == null ? void 0 : (_requestOptions$heade = requestOptions.headers) == null ? void 0 : _requestOptions$heade['Content-Type']) || 'application/json';
      if (contentType === 'application/json') {
        inputPayload = JSON.stringify(payload);
      } else if (contentType.indexOf('multipart/form-data') > -1) {
        inputPayload = multipartFormData(payload);
      } else if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
        inputPayload = urlEncoded(payload);
      }
    }
    result = await request$1(endpoint, inputPayload, requestOptions);
  } catch (e) {
    //todo: define error payload
    context.form.logger.error('Error invoking a rest API');
    const _eName = getCustomEventName(error);
    context.form.dispatch(new CustomEvent(_eName, {}, true));
    return;
  }
  const eName = getCustomEventName(success);
  context.form.dispatch(new CustomEvent(eName, result, true));
};
const urlEncoded = data => {
  const formData = new URLSearchParams();
  Object.entries(data).forEach(([key, value]) => {
    if (value != null && typeof value === 'object') {
      formData.append(key, jsonString(value));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};
/**
 * Create multi part form data using form data and form attachments
 * @param data              form data
 * @param attachments       form events
 * @private
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const multipartFormData = (data, attachments) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value != null && typeof value === 'object') {
      formData.append(key, jsonString(value));
    } else {
      formData.append(key, value);
    }
  });
  const addAttachmentToFormData = (objValue, formData) => {
    if ((objValue == null ? void 0 : objValue.data) instanceof File) {
      let attIdentifier = `${objValue == null ? void 0 : objValue.dataRef}/${objValue == null ? void 0 : objValue.name}`;
      if (!attIdentifier.startsWith('/')) {
        attIdentifier = `/${attIdentifier}`;
      }
      formData.append(attIdentifier, objValue.data);
    }
  };
  if (attachments) {
    // @ts-ignore
    Object.keys(attachments).reduce((acc, curr) => {
      const objValue = attachments[curr];
      if (objValue && objValue instanceof Array) {
        return [...acc, ...objValue.map(x => addAttachmentToFormData(x, formData))];
      } else {
        return [...acc, addAttachmentToFormData(objValue, formData)];
      }
    }, []);
  }
  return formData;
};
const submit = async (context, success, error, submitAs = 'application/json', input_data = null) => {
  const endpoint = context.form.action;
  let data = input_data;
  if (typeof data != 'object' || data == null) {
    data = context.form.exportData();
  }
  // todo: have to implement sending of attachments here
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const attachments = getAttachments(context.form);
  let submitContentType = submitAs;
  let formData;
  if (Object.keys(attachments).length > 0 || submitAs === 'multipart/form-data') {
    formData = multipartFormData({
      'data': data
    }, attachments);
    submitContentType = 'multipart/form-data';
  } else {
    formData = {
      'data': data
    };
  }
  // submitContentType = submitAs;
  // note: don't send multipart/form-data let browser decide on the content type
  await request(context, endpoint, 'POST', formData, success, error, {
    'Content-Type': submitContentType
  });
};
/**
 * Helper function to create an action
 * @param name          name of the event
 * @param payload       event payload
 * @param dispatch      true to trigger the event on all the fields in DFS order starting from the top level form element, false otherwise
 * @private
 */
const createAction = (name, payload = {}) => {
  switch (name) {
    case 'change':
      return new Change(payload);
    case 'submit':
      return new Submit(payload);
    case 'click':
      return new Click(payload);
    case 'addItem':
      return new AddItem(payload);
    case 'removeItem':
      return new RemoveItem(payload);
    default:
      console.error('invalid action');
  }
};
/**
 * Implementation of function runtime
 * @private
 */
class FunctionRuntimeImpl {
  constructor() {
    this.customFunctions = {};
  }
  registerFunctions(functions) {
    Object.entries(functions).forEach(([name, funcDef]) => {
      let finalFunction = funcDef;
      if (typeof funcDef === 'function') {
        finalFunction = {
          _func: args => {
            // eslint-disable-next-line @typescript-eslint/ban-types
            return funcDef(...args);
          },
          _signature: []
        };
      }
      if (!finalFunction.hasOwnProperty('_func')) {
        console.warn(`Unable to register function with name ${name}.`);
        return;
      }
      this.customFunctions[name] = finalFunction;
    });
  }
  unregisterFunctions(...names) {
    names.forEach(name => {
      if (name in this.customFunctions) {
        delete this.customFunctions[name];
      }
    });
  }
  getFunctions() {
    // todo: remove these once json-formula exposes a way to call them from custom functions
    function isArray(obj) {
      if (obj !== null) {
        return Object.prototype.toString.call(obj) === '[object Array]';
      }
      return false;
    }
    function valueOf(a) {
      if (a === null || a === undefined) {
        return a;
      }
      if (isArray(a)) {
        return a.map(i => valueOf(i));
      }
      return a.valueOf();
    }
    function toString(a) {
      if (a === null || a === undefined) {
        return '';
      }
      return a.toString();
    }
    const defaultFunctions = {
      validate: {
        _func: (args, data, interpreter) => {
          const element = args[0];
          let validation;
          if (typeof element === 'string' || typeof element === 'undefined') {
            validation = interpreter.globals.form.validate();
          } else {
            validation = interpreter.globals.form.getElement(element.$id).validate();
          }
          if (Array.isArray(validation) && validation.length) {
            interpreter.globals.form.logger.error('Form Validation Error');
          }
          return validation;
        },
        _signature: []
      },
      setFocus: {
        _func: (args, data, interpreter) => {
          const element = args[0];
          try {
            const field = interpreter.globals.form.getElement(element.$id);
            interpreter.globals.form.setFocus(field);
          } catch (e) {
            interpreter.globals.form.logger.error('Invalid argument passed in setFocus. An element is expected');
          }
        },
        _signature: []
      },
      getData: {
        _func: (args, data, interpreter) => {
          // deprecated. left for backward compatability.
          interpreter.globals.form.logger.warn('The `getData` function is depricated. Use `exportData` instead.');
          return interpreter.globals.form.exportData();
        },
        _signature: []
      },
      exportData: {
        _func: (args, data, interpreter) => {
          return interpreter.globals.form.exportData();
        },
        _signature: []
      },
      importData: {
        _func: (args, data, interpreter) => {
          const inputData = args[0];
          if (typeof inputData === 'object' && inputData !== null) {
            interpreter.globals.form.importData(inputData);
          }
          return {};
        },
        _signature: []
      },
      submitForm: {
        _func: (args, data, interpreter) => {
          // success: string, error: string, submit_as: 'json' | 'multipart' = 'json', data: any = null
          const success = toString(args[0]);
          const error = toString(args[1]);
          const submit_as = args.length > 2 ? toString(args[2]) : 'application/json';
          const submit_data = args.length > 3 ? valueOf(args[3]) : null;
          interpreter.globals.form.dispatch(new Submit({
            success,
            error,
            submit_as,
            data: submit_data
          }));
          return {};
        },
        _signature: []
      },
      // todo: only supports application/json for now
      request: {
        _func: (args, data, interpreter) => {
          const uri = toString(args[0]);
          const httpVerb = toString(args[1]);
          const payload = valueOf(args[2]);
          let success,
            error,
            headers = {};
          if (typeof args[3] === 'string') {
            interpreter.globals.form.logger.warn('This usage of request is deprecated. Please see the documentation and update');
            success = valueOf(args[3]);
            error = valueOf(args[4]);
          } else {
            headers = valueOf(args[3]);
            success = valueOf(args[4]);
            error = valueOf(args[5]);
          }
          request(interpreter.globals, uri, httpVerb, payload, success, error, headers);
          return {};
        },
        _signature: []
      },
      /**
       *
       * @name dispatchEvent
       * @param [element] element on which to trigger the event. If not defined the event will be triggered on entire form
       * @param eventName name of the event to trigger
       * @param payload payload to pass in the event
       */
      dispatchEvent: {
        _func: (args, data, interpreter) => {
          const element = args[0];
          let eventName = valueOf(args[1]);
          let payload = args.length > 2 ? valueOf(args[2]) : undefined;
          let dispatch = false;
          if (typeof element === 'string') {
            payload = eventName;
            eventName = element;
            dispatch = true;
          }
          let event;
          if (eventName.startsWith('custom:')) {
            event = new CustomEvent(eventName.substring('custom:'.length), payload, dispatch);
          } else {
            event = createAction(eventName, payload);
          }
          if (event != null) {
            if (typeof element === 'string') {
              interpreter.globals.form.dispatch(event);
            } else {
              interpreter.globals.form.getElement(element.$id).dispatch(event);
            }
          }
          return {};
        },
        _signature: []
      }
    };
    return _extends({}, defaultFunctions, this.customFunctions);
  }
}
const FunctionRuntime = new FunctionRuntimeImpl();

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Defines `form model` which implements {@link FormModel | form model}
 */
class Form extends Container {
  /**
   * @private
   */

  /**
   * @private
   */

  /**
   * @param n
   * @param _ruleEngine
   * @param _eventQueue
   * @param logLevel
   * @private
   */
  constructor(n, _ruleEngine, _eventQueue = new EventQueue(), logLevel = 'off') {
    //@ts-ignore
    super(n, {});
    this._fields = {};
    this._invalidFields = [];
    this.dataRefRegex = /("[^"]+?"|[^.]+?)(?:\.|$)/g;
    this._ruleEngine = _ruleEngine;
    this._eventQueue = _eventQueue;
    this._logger = new Logger(logLevel);
    this.queueEvent(new Initialize());
    this.queueEvent(new ExecuteRule());
    this._ids = IdGenerator();
    this._bindToDataModel(new DataGroup('$form', {}));
    this._initialize();
    this.queueEvent(new FormLoad());
  }
  get logger() {
    return this._logger;
  }
  get metaData() {
    const metaData = this._jsonModel.metadata || {};
    return new FormMetaData(metaData);
  }
  get action() {
    return this._jsonModel.action;
  }
  _createChild(child) {
    return createChild(child, {
      form: this,
      parent: this
    });
  }
  importData(dataModel) {
    this._bindToDataModel(new DataGroup('$form', dataModel));
    this.syncDataAndFormModel(this.getDataNode());
    this._eventQueue.runPendingQueue();
  }
  exportData() {
    var _this$getDataNode;
    return (_this$getDataNode = this.getDataNode()) == null ? void 0 : _this$getDataNode.$value;
  }
  setFocus(field) {
    const parent = field.parent;
    const currentField = field;
    while (parent != null && parent.activeChild != currentField) {
      parent.activeChild = currentField;
    }
  }
  /**
   * Returns the current state of the form
   *
   * To access the form data and attachments, one needs to use the `data` and `attachments` property.
   * For example,
   * ```
   * const data = form.getState().data
   * const attachments = form.getState().attachments
   * ```
   */
  getState() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const res = super.getState();
    res.id = '$form';
    Object.defineProperty(res, 'data', {
      get: function () {
        return self.exportData();
      }
    });
    Object.defineProperty(res, 'attachments', {
      get: function () {
        return getAttachments(self);
      }
    });
    return res;
  }
  get type() {
    return 'object';
  }
  isTransparent() {
    return false;
  }
  get form() {
    return this;
  }
  get ruleEngine() {
    return this._ruleEngine;
  }
  getUniqueId() {
    if (this._ids == null) {
      return '';
    }
    return this._ids.next().value;
  }
  /**
   * @param field
   * @private
   */
  fieldAdded(field) {
    this._fields[field.id] = field;
    field.subscribe(action => {
      if (this._invalidFields.indexOf(action.target.id) === -1) {
        this._invalidFields.push(action.target.id);
      }
    }, 'invalid');
    field.subscribe(action => {
      const index = this._invalidFields.indexOf(action.target.id);
      if (index > -1) {
        this._invalidFields.splice(index, 1);
      }
    }, 'valid');
    field.subscribe(action => {
      //@ts-ignore
      const field = action.target.getState();
      if (field) {
        const fieldChangedAction = new FieldChanged(action.payload.changes, field);
        this.dispatch(fieldChangedAction);
      }
    });
  }
  validate() {
    const validationErrors = super.validate();
    // trigger event on form so that user's can customize their application
    this.dispatch(new ValidationComplete(validationErrors));
    return validationErrors;
  }
  /**
   * Checks if the given form is valid or not
   * @returns `true`, if form is valid, `false` otherwise
   */
  isValid() {
    return this._invalidFields.length === 0;
  }
  /**
   * @param field
   * @private
   */
  dispatch(action) {
    if (action.type === 'submit') {
      super.queueEvent(action);
      this._eventQueue.runPendingQueue();
    } else {
      super.dispatch(action);
    }
  }
  /**
   * @param action
   * @private
   */
  executeAction(action) {
    if (action.type !== 'submit' || this._invalidFields.length === 0) {
      super.executeAction(action);
    }
  }
  /**
   * @param action
   * @param context
   * @private
   */
  submit(action, context) {
    // if no errors, only then submit
    if (this.validate().length === 0) {
      const payload = (action == null ? void 0 : action.payload) || {};
      submit(context, payload == null ? void 0 : payload.success, payload == null ? void 0 : payload.error, payload == null ? void 0 : payload.submit_as, payload == null ? void 0 : payload.data);
    }
  }
  getElement(id) {
    if (id == this.id) {
      return this;
    }
    return this._fields[id];
  }
  get qualifiedName() {
    return '$form';
  }
  /**
   * @private
   */
  getEventQueue() {
    return this._eventQueue;
  }
  get name() {
    return '$form';
  }
  get value() {
    return null;
  }
  get id() {
    return '$form';
  }
  get title() {
    return this._jsonModel.title || '';
  }
}

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/**
 * Implementation of rule engine
 * @private
 */
class RuleEngine {
  constructor() {
    this._globalNames = ['$form', '$field', '$event'];
  }
  compileRule(rule) {
    const customFunctions = FunctionRuntime.getFunctions();
    return new Formula(rule, customFunctions, undefined, this._globalNames);
  }
  execute(node, data, globals, useValueOf = false) {
    const oldContext = this._context;
    this._context = globals;
    let res = undefined;
    try {
      node.debug = []; // clean previous debug info
      res = node.search(data, globals);
    } catch (err) {
      var _this$_context, _this$_context$form, _this$_context$form$l;
      (_this$_context = this._context) == null ? void 0 : (_this$_context$form = _this$_context.form) == null ? void 0 : (_this$_context$form$l = _this$_context$form.logger) == null ? void 0 : _this$_context$form$l.error(err);
    }
    for (const debugInfo of node.debug) {
      var _this$_context2, _this$_context2$form, _this$_context2$form$;
      (_this$_context2 = this._context) == null ? void 0 : (_this$_context2$form = _this$_context2.form) == null ? void 0 : (_this$_context2$form$ = _this$_context2$form.logger) == null ? void 0 : _this$_context2$form$.debug(debugInfo);
    }
    let finalRes = res;
    if (useValueOf) {
      if (typeof res === 'object' && res !== null) {
        finalRes = Object.getPrototypeOf(res).valueOf.call(res);
      }
    }
    this._context = oldContext;
    return finalRes;
  }
  /**
   * Listen to subscriber for
   * @param subscriber
   */
  trackDependency(subscriber) {
    if (this._context && this._context.field !== undefined && this._context.field !== subscriber) {
      subscriber._addDependent(this._context.field);
    }
  }
}

/**
 * Creates form instance using form model definition as per `adaptive form specification`
 * @param formModel form model definition
 * @param callback a callback that recieves the FormModel instance that gets executed before any event in the Form
 * is executed
 * @param logLevel Logging Level for the form. Setting it off will disable the logging
 * @param fModel existing form model, this is additional optimization to prevent creation of form instance
 * @returns {@link FormModel | form model}
 */
const createFormInstance = (formModel, callback, logLevel = 'error', fModel = undefined) => {
  try {
    let f = fModel;
    if (f == null) {
      f = new Form(_extends({}, formModel), new RuleEngine(), new EventQueue(new Logger(logLevel)), logLevel);
    }
    const formData = formModel == null ? void 0 : formModel.data;
    if (formData) {
      f.importData(formData);
    }
    if (typeof callback === 'function') {
      callback(f);
    }
    // Once the field or panel is initialized, execute the initialization script
    // this means initialization happens after prefill and restore
    // Before execution of calcExp, visibleExp, enabledExp, validate, options, navigationChange, we execute init script
    //f.queueEvent(new Initialize(undefined, true));
    //f.queueEvent(new ExecuteRule(undefined, true));
    f.getEventQueue().runPendingQueue();
    return f;
  } catch (e) {
    console.error(`Unable to create an instance of the Form ${e}`);
    throw new Error(e);
  }
};
/**
 * Validates Form model definition with the given data
 * @param formModel     form model definition
 * @param data          form data
 * @deprecated use validateFormData
 * @returns `true`, if form is valid against the given form data, `false` otherwise
 */
const validateFormInstance = (formModel, data) => {
  try {
    const f = new Form(_extends({}, formModel), new RuleEngine());
    if (data) {
      f.importData(data);
    }
    return f.validate().length === 0;
  } catch (e) {
    throw new Error(e);
  }
};
/**
* Validates Form model definition with the given data
* @param formModel     form model definition
* @param data          form data
* @deprecated use validateFormData
* @returns {messages: [], valid: boolean}
*/
const validateFormData = (formModel, data) => {
  try {
    const f = new Form(_extends({}, formModel), new RuleEngine());
    if (data) {
      f.importData(data);
    }
    const res = f.validate();
    return {
      messages: res,
      valid: res.length === 0
    };
  } catch (e) {
    throw new Error(e);
  }
};
/**
 * Helper API to fetch form model definition from an AEM instance
 * @param url       URL of the instance
 * @param headers   HTTP headers to pass to the aem instance
 * @returns promise which resolves to the form model definition
 */
const fetchForm = (url, headers = {}) => {
  const headerObj = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    headerObj.append(key, value);
  });
  return request$1(`${url}.model.json`, null, {
    headers
  }).then(formObj => {
    if ('model' in formObj) {
      const {
        model
      } = formObj;
      formObj = model;
    }
    return jsonString(formObj);
  });
};

/*
 * Copyright 2022 Adobe, Inc.
 *
 * Your access and use of this software is governed by the Adobe Customer Feedback Program Terms and Conditions or other Beta License Agreement signed by your employer and Adobe, Inc.. This software is NOT open source and may not be used without one of the foregoing licenses. Even with a foregoing license, your access and use of this file is limited to the earlier of (a) 180 days, (b) general availability of the product(s) which utilize this software (i.e. AEM Forms), (c) January 1, 2023, (d) Adobe providing notice to you that you may no longer use the software or that your beta trial has otherwise ended.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL ADOBE NOR ITS THIRD PARTY PROVIDERS AND PARTNERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/** Token used while creating translation specific properties from `adaptive form specification` */
const TRANSLATION_TOKEN = '##';
/** Name of the object which holds all translation specific properties */
const TRANSLATION_ID = 'afs:translationIds';
const CUSTOM_PROPS_KEY = 'properties';
const defaultBcp47LangTags = ['de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'ko-KR', 'pt-BR', 'zh-CN', 'zh-TW'];
/**
 * @private
 */
const invalidateTranslation = (input, updates) => {
  translationProps.forEach(prop => {
    var _input$CUSTOM_PROPS_K, _input$CUSTOM_PROPS_K2;
    if (prop in updates && input != null && (_input$CUSTOM_PROPS_K = input[CUSTOM_PROPS_KEY]) != null && (_input$CUSTOM_PROPS_K2 = _input$CUSTOM_PROPS_K[TRANSLATION_ID]) != null && _input$CUSTOM_PROPS_K2[prop]) {
      var _input$CUSTOM_PROPS_K3, _input$CUSTOM_PROPS_K4;
      input == null ? true : (_input$CUSTOM_PROPS_K3 = input[CUSTOM_PROPS_KEY]) == null ? true : (_input$CUSTOM_PROPS_K4 = _input$CUSTOM_PROPS_K3[TRANSLATION_ID]) == null ? true : delete _input$CUSTOM_PROPS_K4[prop];
    }
  });
};
/**
 * @private
 */
const addTranslationId = (input, additionalTranslationProps = []) => {
  // don't create a schema copy, add it to the existing
  const model = input;
  const transProps = [...translationProps, ...additionalTranslationProps];
  _createTranslationId(model, '', transProps);
  return model;
};
/**
 * @private
 */
const _createTranslationId = (input, path, transProps) => {
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value == 'object') {
      if (input instanceof Array) {
        if (value && 'name' in value) {
          // @ts-ignore
          _createTranslationId(value, `${path === '' ? path : path + TRANSLATION_TOKEN}${value.name}`, transProps);
        }
      } else {
        _createTranslationId(value, key === 'items' ? path : `${path === '' ? path : path + TRANSLATION_TOKEN}${key}`, transProps);
      }
    } else {
      // set it only if either of type or fieldType properties is present
      if (':type' in input || 'type' in input || 'fieldType' in input) {
        for (const transProp of transProps) {
          // if property exist add it
          if (getOrElse(input, transProp) != null) {
            // if translation id is not yet set, set it
            if (!(CUSTOM_PROPS_KEY in input)) {
              input[CUSTOM_PROPS_KEY] = {};
            }
            if (!(TRANSLATION_ID in input[CUSTOM_PROPS_KEY])) {
              input[CUSTOM_PROPS_KEY][TRANSLATION_ID] = {};
            }
            // if transprop is not yet set, set it
            // this is done to prevent overwrite
            if (!(transProp in input[CUSTOM_PROPS_KEY][TRANSLATION_ID])) {
              input[CUSTOM_PROPS_KEY][TRANSLATION_ID][transProp] = `${path}${TRANSLATION_TOKEN}${transProp}${TRANSLATION_TOKEN}${Math.floor(Math.random() * 10000) + 1}`;
            }
          }
        }
      }
    }
  });
};
/**
 * @param input
 * @param translationObj
 * @param translationProps
 * @private
 */
const _createTranslationObj = (input, translationObj, translationProps) => {
  Object.values(input).forEach(value => {
    if (typeof value == 'object') {
      _createTranslationObj(value, translationObj, translationProps);
    } else {
      for (const translationProp of translationProps) {
        var _input$CUSTOM_PROPS_K5, _input$CUSTOM_PROPS_K6;
        const objValue = getOrElse(input, translationProp);
        if (objValue && input != null && (_input$CUSTOM_PROPS_K5 = input[CUSTOM_PROPS_KEY]) != null && (_input$CUSTOM_PROPS_K6 = _input$CUSTOM_PROPS_K5[TRANSLATION_ID]) != null && _input$CUSTOM_PROPS_K6[translationProp]) {
          // todo: right now we create only for english
          if (objValue instanceof Array) {
            objValue.forEach((item, index) => {
              if (typeof item === 'string') {
                // only if string, then convert, since values can also be boolean
                // @ts-ignore
                translationObj[`${input[CUSTOM_PROPS_KEY][TRANSLATION_ID][translationProp]}${TRANSLATION_TOKEN}${index}`] = item;
              }
            });
          } else {
            // @ts-ignore
            translationObj[`${input[CUSTOM_PROPS_KEY][TRANSLATION_ID][translationProp]}`] = objValue;
          }
        }
      }
    }
  });
};
/**
 * Gets the value for the given key from the input, in case of no value, default is returned
 * @param input             input object
 * @param key               key to return from input object (key could be comma separated, example, label.value)
 * @param defaultValue      default value
 */
const getOrElse = (input, key, defaultValue = null) => {
  if (!key) {
    return defaultValue;
  }
  const arr = Array.isArray(key) ? key : key.split('.');
  let objValue = input,
    index = 0;
  while (index < arr.length && objValue.hasOwnProperty(arr[index])) {
    objValue = objValue[arr[index]];
    index++;
  }
  return index == arr.length ? objValue : defaultValue;
};
/**
 * @param input
 * @param additionalTranslationProps
 * @private
 */
const createTranslationObj = (input, additionalTranslationProps = []) => {
  const obj = {};
  const transProps = [...translationProps, ...additionalTranslationProps];
  _createTranslationObj(input, obj, transProps);
  return obj;
};
/**
 * Creates translation object with [BCP 47](https://tools.ietf.org/search/bcp47) language tags as key and value is a translation object. Key of translation object is
 * generated based on the form hierarchy and it is separated by "##" token to signify that the id is machine generated (ie its not a human generated string)
 * @param input             form model definition
 * @param additionalTranslationProps    optional properties which needs to be translated, by default, only OOTB properties of form model definition is translated
 * @param bcp47LangTags     optional additional language tags
 * @returns translation object for each bcp 47 language tag
 */
const createTranslationObject = (input, additionalTranslationProps = [], bcp47LangTags = []) => {
  const transProps = [...translationProps, ...additionalTranslationProps];
  // create a copy of the input
  const inputCopy = JSON.parse(JSON.stringify(input));
  const obj = createTranslationObj(addTranslationId(inputCopy, additionalTranslationProps), transProps);
  const langTags = [...defaultBcp47LangTags, ...bcp47LangTags];
  const allLangs = {};
  for (const langTag of langTags) {
    // todo: added temporarily to test
    // todo: need to fix this as per machine translation
    allLangs[langTag] = JSON.parse(JSON.stringify(obj));
  }
  return [inputCopy, allLangs];
};

export { ActionImpl, AddItem, BaseNode, Blur, CUSTOM_PROPS_KEY, Change, Checkbox, CheckboxGroup, Click, Container, CustomEvent, ExecuteRule, Field, FieldChanged, Fieldset, FileObject, FileUpload, Focus, Form, FormLoad, FormMetaData, FunctionRuntime, Initialize, Invalid, Node, RemoveItem, Scriptable, Submit, TRANSLATION_ID, TRANSLATION_TOKEN, Valid, ValidationComplete, ValidationError, addTranslationId, checkIfConstraintsArePresent, checkIfKeyAdded, constraintProps, createFormInstance, createTranslationObj, createTranslationObject, deepClone, defaultFieldTypes, exportDataSchema, extractFileInfo, fetchForm, getFileSizeInBytes, getOrElse, getProperty, invalidateTranslation, isCheckbox, isCheckboxGroup, isDateField, isFile, jsonString, propertyChange, request, translationProps, validateFormData, validateFormInstance };
//# sourceMappingURL=index.modern.mjs.map
console.timeEnd("script af-core")