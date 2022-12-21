import { Constants } from "./constants.js";
import { getLabelValue, getTooltipValue, getViewId, isLabelVisible, isTooltipVisible } from "./afb-model.js";

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock 
 * 
 * @return {HTMLInputElement}
 */
export let defaultInputRender = (state, bemBlock, tag = "input") => {
    let input = document.createElement(tag);
        input.className = `${bemBlock}__widget`;
        input.title = isTooltipVisible(state) ? getTooltipValue(state) : '';
        input.name = state?.name || "";
        input.value = state?.value || "";
        input.placeholder = state?.placeholder || ""
        input.required = state?.required === true;
        input.setAttribute("aria-label", isLabelVisible(state) ? getLabelValue(state) : '' );
        setDisabledAttribute(state, input);
        setReadonlyAttribute(state, input);
        setStringContraints(state, input);
        setNumberConstraints(state, input);

    if(input instanceof HTMLInputElement) {
        input.type = state?.fieldType || "text";
    }
    return input;
}

/**
 * 
 * @param {any} model FieldJson
 * @param {string} bemBlock 
 * @param {Function} renderInput 
 * 
 * @return {HTMLDivElement}
 */
export let renderField = (model, bemBlock, renderInput) => {
    renderInput = renderInput || defaultInputRender;
    let state = model?.getState();

    let element = createWidgetWrapper(state, bemBlock);
    let label = createLabel(state, bemBlock);
    let inputs = renderInput(state, bemBlock);
    let longDesc = createLongDescHTML(state, bemBlock);
    let help = createQuestionMarkHTML(state, bemBlock);
    let error = createErrorHTML(state, bemBlock);

    label ? element.appendChild(label) : null;
    inputs ? element.appendChild(inputs) : null;
    longDesc ?  element.appendChild(longDesc) : null;
    help ? element.appendChild(help) : null;
    error? element.appendChild(error): null;

    return element;
}

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock 
 */
export const createWidgetWrapper = (state, bemBlock) => {
    let element = document.createElement("div");
    element.id = getViewId(state, bemBlock);
    element.className = bemBlock;
    element.dataset.cmpVisible = (state?.visible === true) + "";
    element.dataset.cmpEnabled = (state?.enabled === true) + "";
    element.dataset.cmpIs = bemBlock;
    //element.dataset.cmpAdaptiveformcontainerPath = getFormContainerPath();

    //@ts-ignore
    if(state?.style) {
        //@ts-ignore
        element.className += " " + state?.style;
    }
    return element;
}

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock 
 */
export const createLabel = (state, bemBlock) => {
    if(isLabelVisible(state)) {
        let label = document.createElement("label");
        label.id = getViewId(state, bemBlock) + "-label";
        label.htmlFor = getViewId(state, bemBlock);
        label.className = bemBlock + "__label";
        label.textContent = getLabelValue(state);
        return label;
    }
}

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock 
 */
export const createQuestionMarkHTML = (state, bemBlock) => {
    if(state?.tooltip) {
        let button = document.createElement("button");
        button.title = state?.tooltip;
        button.className = bemBlock + `__${Constants.QM} ${Constants.ADAPTIVE_FORM_QM}`;
        return button;
    }
}

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock 
 */
export const createLongDescHTML = (state, /** @type {string} */ bemBlock) => {
    if(state?.description) {
        let div = document.createElement("div");
        div.setAttribute("aria-live", "polite");
        div.id = getViewId(state, bemBlock)+"-"+Constants.LONG_DESC;
        div.className = bemBlock + `__${Constants.LONG_DESC} ${Constants.ADAPTIVE_FORM_LONG_DESC}`;
    
        let p = document.createElement("p");
        p.innerHTML = state?.description|| ""
        div.append(p);
        return div;
    }
}

/**
 * @param {any} state FieldJson
 * @param {string} bemBlock 
 */
export const createErrorHTML = (state, /** @type {string} */ bemBlock) => {
    let div = document.createElement("div");
    div.id = getViewId(state, bemBlock)+`-${Constants.ERROR_MESSAGE}`;
    div.className = bemBlock + `__${Constants.ERROR_MESSAGE}`;
    return div;
}

/**
 * @param {any} state FieldJson
 * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} element 
 */
export const setDisabledAttribute = (state, element) => {
    element.disabled = state?.enabled === false
}

/**
 * @param {any} state FieldJson 
 * @param {HTMLInputElement | HTMLTextAreaElement} element 
 */
export const setReadonlyAttribute = (state,element) => {
    element.readOnly = state?.readOnly === 'true'
}

/**
 * @param {any} state FieldJson
 * @param {HTMLInputElement | HTMLTextAreaElement} element 
 */
export const setStringContraints = (state, element) => {
    let maxLength = state?.maxLength || 0;
    let minLength = state?.minLength || 0;
    if(minLength > 0) element.minLength = minLength
    if(maxLength > 0) element.maxLength = maxLength
    if(element instanceof HTMLInputElement && state?.pattern) 
        element.pattern = state?.pattern;
}

/**
 * @param {any} state FieldJson
 * @param {HTMLInputElement} element 
 */
export const setNumberConstraints = ( state, element) => {
    let max = state?.maximum || 0;
    let min = state?.minimum || 0;
    if(max > 0) element.max = max?.toString();
    if(min > 0) element.min = min?.toString();
}

/**
 * 
 * @param {HTMLDivElement} element 
 * @returns 
 */
export const getWidget = (element) => {
    return element?.querySelector(`[class$='${Constants.WIDGET}']`)
}