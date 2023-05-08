let input;

const updateView = (_input, state) => {
  _input.value = state.value;
  _input.placeholder = state.placeholder;
  _input.required = state.required;
  _input.disabled = !state.enabled;
  _input.readOnly = state.readOnly;
  _input.step = state.step;

  if (state?.label?.value) {
    _input.setAttribute('aria-label', state?.label?.value);
  }

  // Set Constraints
  if (state?.max) {
    _input.max = state.max;
  }
  if (state?.min) {
    _input.min = state.min;
  }
};

const addView = (block, model, state) => {
  input = document.createElement('input');
  input.type = 'date';
  input.className = 'cmp-adaptiveform-date__widget';
  input.title = state.tooltip;
  input.name = state.name;
  updateView(input, state);

  // Replace Default text input with custom
  const textInput = block.querySelector('input');
  if (textInput) {
    textInput.replaceWith(input);
  }

  input.addEventListener('blur', (event) => {
    model.value = event.target.value;
  });
  return input;
};

export default async function decorate(block, model, state) {
  if (block && state) {
    if (!input) {
      input = addView(block, model, state);
    } else {
      updateView(input, state);
    }
  }
}
