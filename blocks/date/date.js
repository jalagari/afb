let input;

export default async function decorate(block, model, state) {

    if(block && state) {
        if(!input) {
            input = addView(block, model, state);
        } else {
            updateView(input, state);
        }
    }
}

let addView = (block, model, state) => {
    input = document.createElement("input");
    input.type = "date"
    input.className = "cmp-adaptiveform-date__widget";
    input.title = state.tooltip;
    input.name = state.name;
    updateView(input, state);

    // Replace Default text input with custom 
    let textInput = block.querySelector("input");
    if(textInput) {
        textInput.replaceWith(input);
    }

    input.addEventListener("blur", (event) => {
        model.value = event.target.value;
    });
    return input;
}

let updateView = (input, state) => {
    input.value = state.value;
    input.placeholder = state.placeholder;
    input.required = state.required;
    input.disabled = !state.enabled;
    input.readOnly = state.readOnly;
    input.step = state.step;
    
    if(state?.label?.value) {
        input.setAttribute("aria-label", state?.label?.value );
    }

    // Set Constraints 
    if(state?.max) {
        input.max = state.max;
    }
    if(state?.min) {
        input.min = state.min;
    }

}