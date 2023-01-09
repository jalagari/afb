// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
(function showTooltip() {
    let questionMarks = document.querySelectorAll(".cmp-adaptiveform__questionmark");

    Array.prototype.forEach.call(questionMarks, (questionMark) => {
        questionMark.setAttribute("data-text", questionMark.title);
        questionMark.removeAttribute("title");

        let tooltip = document.createElement("div");
        tooltip.className = "cmp-adaptiveform__questionmark-tooltip"
        tooltip.textContent =  questionMark.getAttribute("data-text");
        tooltip.style.position = "absolute";

        questionMark.addEventListener("mouseover", (event) => {
            let target = event.target;

            tooltip.style.visibility = "hidden";
            document.body.append(tooltip);

            let targetPos = target.getBoundingClientRect();
            let tooltipPos = tooltip.getBoundingClientRect();

            tooltip.style.top = targetPos.top + window.scrollY - (tooltipPos.height + 10) + "px";
            tooltip.style.left = targetPos.left + window.scrollX - (tooltipPos.width/2) + "px";

            tooltip.style.visibility = "visible";
            event.stopPropagation();
        });

        questionMark.addEventListener("mouseout", (event) => {
            tooltip.remove();

            event.stopPropagation();
        });
    })
})();
