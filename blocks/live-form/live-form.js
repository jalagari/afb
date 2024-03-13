import { buildBlock, decorateBlock, loadBlock } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const anchor = block.querySelector('a');
  if (anchor) {
    const p = document.createElement('p');
    p.innerText = 'See the form in ';
    const btn = document.createElement('a');
    btn.innerText = 'action';
    btn.href = '#';
    p.append(btn);
    block.innerHTML = '';
    block.append(p);
    const form = buildBlock('form', [[anchor]]);
    block.append(form);
    form.style.display = 'none';
    decorateBlock(form);
    await loadBlock(form);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      form.querySelector('form [type="submit"]').disabled = true;
      form.style.display = 'block';
      p.style.display = 'none';
    });
  }
}
