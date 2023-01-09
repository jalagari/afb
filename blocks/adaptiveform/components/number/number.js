import * as builder from "../../libs/afb-builder.js";
import { getWidget, subscribe, updateValue } from "../../libs/afb-interaction.js";
import { Constants } from "../../libs/constants.js";
import { DefaultField } from "../defaultInput.js";

export class NumberInput extends DefaultField {

    blockName = Constants.NUMBER;

    widgetFormatter;

    _updateValue = (element ,value) =>{
        let widget = getWidget(element);
        /*if (this.widgetFormatter == null && (this.model.editFormat || this.model.displayFormat)) {
            this.widgetFormatter = new NumericInputWidget(widget, this.model)
        }*/
        if (this.widgetFormatter) {
            this.widgetFormatter.setValue(value);
        } else {
            updateValue(element, value);
        }
    }

    render() {
        this.element = builder?.default?.renderField(this.model, this.blockName)
        this.block.appendChild(this.element);
        this.addListener();
        subscribe(this.model, this.element, {value : this._updateValue});
    }
}

export default async function decorate(block, model) {
    let textinput = new NumberInput(block, model);
    textinput.render();
}
