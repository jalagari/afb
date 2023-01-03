import * as builder from "../libs/afb-builder.js";
import { createLabel as cl } from '../libs/default-builder.js';

/**
 * Example of overriding to inlcude start
 * @param {*} state 
 * @param {*} bemBlock 
 * @returns 
 */
export const createLabel = (state, bemBlock) => {
    const label = cl(state, bemBlock)
    if(label) {
        label.textContent = state?.required ? label?.textContent + " *" : label?.textContent;
        return label;
    }
}


export let renderField = (model, bemBlock, renderInput) => {
    renderInput = renderInput || builder?.default?.defaultInputRender;
    let state = model?.getState();

    let element = builder?.default?.createWidgetWrapper(state, bemBlock);
    let label = builder?.default?.createLabel(state, bemBlock);
    let inputs = renderInput(state, bemBlock);
    let longDesc = builder?.default?.createLongDescHTML(state, bemBlock);
    let help = builder?.default?.createQuestionMarkHTML(state, bemBlock);
    let error = builder?.default?.createErrorHTML(state, bemBlock);

    inputs ? element.appendChild(inputs) : null;
    label ? element.appendChild(label) : null;
    longDesc ?  element.appendChild(longDesc) : null;
    help ? element.appendChild(help) : null;
    error? element.appendChild(error): null;

    return element;
}
