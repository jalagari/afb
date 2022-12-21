

import { getWidget, setActive } from "../../libs/afb-interaction.js";
import { DefaultField } from "../defaultInput.js";

export class Range extends DefaultField {

     blockName = 'cmp-adaptiveform-textinput'
     
     addListener() {
        if(this.element) {
            let widget = getWidget(this.block);
            widget?.addEventListener('change', (e) => {
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
}
export default async function decorate(block, model) {
    let range = new Range(block, model);
    range.render();
}
