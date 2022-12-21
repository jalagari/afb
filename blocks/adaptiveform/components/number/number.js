import { renderField } from "../../libs/afb-builder.js";
import { getWidget, setActive, subscribe, updateValue } from "../../libs/afb-interaction.js";
import { DefaultField } from "../defaultInput.js";
import NumericInputWidget from "./NumberInputWidget.js";

export class NumberInput extends DefaultField {

    blockName = 'cmp-adaptiveform-numberinput';

    widgetFormatter;

    _updateValue = (element ,value) =>{
        let widget = getWidget(element);
        if (this.widgetFormatter == null && (this.model.editFormat || this.model.displayFormat)) {
            this.widgetFormatter = new NumericInputWidget(widget, this.model)
        }
        if (this.widgetFormatter) {
            this.widgetFormatter.setValue(value);
        } else {
            updateValue(element, value);
        }
    }

    render() {
        this.element = renderField(this.model, this.blockName)
        this.block.appendChild(this.element);
        this.addListener();
        subscribe(this.model, this.element, {value : this._updateValue});
    }
}

export default async function decorate(block, model) {
    let textinput = new NumberInput(block, model);
    textinput.render();
}
