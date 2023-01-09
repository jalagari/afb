import * as builder from "../../libs/afb-builder.js";
import { getWidget, subscribe, updateValue } from "../../libs/afb-interaction.js";
import { DefaultField } from "../defaultInput.js";
import { Constants } from "../../libs/constants.js";
import NumericInputWidget from "./NumberInputWidget.js";

export class NumberInput extends DefaultField {

    blockName = Constants.NUMBER;

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

    // @todo customize using better way
    renderInput(state, bemBlock) {
        let inputs = builder?.default?.defaultInputRender(state, bemBlock)
        if(state && state.displayFormat) {
            let div = document.createElement("div");
            div.className = `${bemBlock}__widget-wrapper`;

            let span = document.createElement("span");
            span.className = `${bemBlock}__widget-format`;
            span.textContent = state.displayFormat.replace("{}", "");

            div.append(span, inputs);
            return div;
        }

        return inputs;
    }

    render() {
        this.element = builder?.default?.renderField(this.model, this.blockName, this.renderInput);
        this.block.appendChild(this.element);
        this.addListener();
        subscribe(this.model, this.element, {value : this._updateValue});
    }
}

export default async function decorate(block, model) {
    let textinput = new NumberInput(block, model);
    textinput.render();
}
