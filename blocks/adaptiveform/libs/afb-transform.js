
const PROPERTY = "property";
const PROPERTY_RULES = "rules.properties";

export default class ExcelToFormModel {
    
    fieldPropertyMapping = {
        "Default" : "default",
        "MaxLength" : "maxLength",
        "MinLength" : "minLength",
        "Maximum" : "maximum",
        "Minimum" : "minimum",
        "Step" : "step",
        "Pattern" : "pattern",
        "Value" : "value",
        "Placeholder": "placeholder",
        "Field" : "name",
        "ReadOnly": "readOnly",
        "Description": "description",
        "Type" : "fieldType",
        "Label" : "label.value",
        "Mandatory": "required",
        "Options" : "enum"
    }
    static fieldMapping = new Map([
        ["text-input", "text"],
        ["number-input", "number"],
        ["date-input", "datetime-local"],
        ["file-input", "file"],
        ["drop-down", "select"],
        ["radio-group", ""],
        ["checkbox-group", ""],
        ["plain-text", "plain-text"],
        ["checkbox", "checkbox"],
        ["multiline-input", "text-area"],
        ["panel", "panel"],
        ["submit", "button"]
    ]);

    /**
     * @param {string} formPath
     */
    async _getForm(formPath) {
        if(!formPath) {
            throw new Error("formPath is required");
        }
        const resp = await fetch(formPath);
        const json = await resp.json();
        return json;
    }

    /**
     * @param {string} formPath
     */
    #initFormDef(formPath) {
        return {
            adaptiveform: "0.10.0",
            metadata: {
              grammar: "json-formula-1.0.0",
              version: "1.0.0"
            },
            properties: {},
            rules: {},
            items: [],
            action: formPath?.split('.json')[0]
          }
    }

    #initField() {
        return {
            constraintMessages: {
                required: "Please fill in this field."
            }
        }
    }

    /**
     * @param {string} formPath
     */
    async getFormModel(formPath)  {
        if(formPath) {
            console.time("Get Excel JSON")
            let exData = await this._getForm(formPath);
            console.timeEnd("Get Excel JSON")
            return this.transform(exData, formPath);
        }
    }

    /**
     * @param {{ total?: number; offset?: number; limit?: number; data: any; ":type"?: string; adaptiveform?: any; }} exData
     * @param {string} formPath
     * 
     * @return {{formDef: any, excelData: any}} response
     */
    transform(exData, formPath) {
        // if its adaptive form json just return it.
        if(exData?.adaptiveform) {
            return {formDef : exData, excelData : null}
        }
        if(!exData || !exData.data) {
            throw new Error("Unable to retrieve the form details from " + formPath);
        }
        const formDef = this.#initFormDef(formPath);
        var stack = [];
        stack.push(formDef.items);
        let currentPanel = formDef;
        exData.data.forEach((/** @type {{ [s: string]: any; } | ArrayLike<any>} */ item)=> {

            let source = Object.fromEntries(Object.entries(item).filter(([_, v]) => (v != null && v!= "")));
            let field = {...source, ...this.#initField()};
            this.#transformFieldNames(field);

            if(this.#isProperty(field)) {
                this.#handleProperites(formDef, field);
            }
             else {
                currentPanel.items.push(this.#handleField(field));
            }
        });
        this.#transformPropertyRules(formDef);
        return {formDef : formDef, excelData : exData};
    }

    /**
     * @param {any} formDef Headless Form definition
     * @param {any} field
     */
    #handleProperites(formDef, field) {
        formDef.properties[field.name] = field.default
        if(field.hasOwnProperty(PROPERTY_RULES)) {
            if(!formDef.rules.properties) {
                formDef.rules.properties = [];
            }
            formDef.rules.properties.push(`{${field.name}: ${field[PROPERTY_RULES]}}`)
        }
    }

    /**
     * @param {any} formDef Headless Form definition
     */
    #transformPropertyRules(formDef) {
        if(formDef.rules.properties) {
            let properites = "merge($properties"
            formDef.rules.properties.forEach((/** @type {string} */ rule) => {
                properites = properites + "," + rule
            })
            properites += ")"
            formDef.rules.properties = properites;
        }
    }

    /**
     * Transform flat field to Crispr Field
     * @param {any} field
     * @returns
     */
    #handleField(field) {
        this.#transformFieldType(field);
        this.#transformFlatToHierarchy(field);

        this.#handleMultiValues(field, "enum");
        this.#handleMultiValues(field, "enumNames");

        this.#handleFranklinSpecialCases(field);
        return field;
    }

    /**
     * Transform CRISPR fieldType to HTML Input Type.
     * @param {any} field FieldJson
     */
    #transformFieldType(field) {
        if(ExcelToFormModel.fieldMapping.has(field?.fieldType)) {
            field.fieldType = ExcelToFormModel.fieldMapping.get(field?.fieldType) 
        }
    }

    /**
     * Convert Field names from Franklin Form to crispr def.
     * @param {any} field Form Def received from excel
     */
    #transformFieldNames(field) {
        Object.keys(this.fieldPropertyMapping).forEach((key) => {
            if(field[key]) {
                field[this.fieldPropertyMapping[key]] = field[key];
                delete field[key]
            }
        })
    }

    /**
     * Convert flat field to hierarchy based on dot notation.
     * @param {any} item Flat field Definition
     * @returns 
     */
    #transformFlatToHierarchy(item) {
        Object.keys(item).forEach((key) => {
            if(key.includes(".")) {
                let temp = item;
                key.split('.').map((k, i, values) => {
                    temp = (temp[k] = (i == values.length - 1 ? item[key] : (temp[k] != null ? temp[k] : {})))
                });
                delete item[key];
            }
        });
    }

    /**
     * handle multivalues field i.e. comma seprator to array.
     * @param {{ [x: string]: any; }} item
     * @param {string | number} key
     */
    #handleMultiValues(item, key) {
        let values;
        if(item && item[key]) {
            values = item[key].split(",").map((value)=> value.trim());
            item[key] = values;
        }
    }

    /**
     * Handle special use cases of Franklin.
     * @param {{ required: string | boolean; }} item
     */
    #handleFranklinSpecialCases(item) {
        //Franklin Mandatory uses x for true.
        item.required = (item.required == "x" || item.required == "true");
    }

    /**
     * @param {any} field FieldJson
     */
    #isProperty(field) {
        return field && field.fieldType == PROPERTY;
    }
}