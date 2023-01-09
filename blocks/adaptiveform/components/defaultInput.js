import { setActive, subscribe } from "../libs/afb-interaction.js";
import * as builder from "../libs/afb-builder.js";
import { Constants } from "../libs/constants.js";

export class DefaultField {
    blockName = 'cmp-adaptiveform-textinput'

    block;
    element;
    model;

    constructor(block, model) {
        this.block = block;
        this.model = model;
    }

    addListener() {
        if(this.element) {
            let widget = builder?.default?.getWidget(this.block);
            widget?.addEventListener('blur', (e) => {
                this.model.value = e.target.value;
                if(this.element)
                    setActive(this.element, false);
            });
            widget?.addEventListener('focus', (e) => {
                if(this.element)
                    setActive(this.element, true);
            });
        }
    }

    render() {
        this.element = builder?.default?.renderField(this.model, this.blockName)
        this.block.className = Constants.ADAPTIVE_FORM+"-"+this.model?.fieldType
        this.block.appendChild(this.element);
        this.addListener();
        subscribe(this.model, this.element);
    }
}

export default async function decorate(block, model) {
    let textinput = new DefaultField(block, model);
    textinput.render();
}
