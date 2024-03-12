const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

headings.forEach(heading => {
    const computedFontSize = window.getComputedStyle(heading).getPropertyValue('font-size');
    const currentFontSize = parseFloat(computedFontSize);
    const newFontSize = currentFontSize * 2;
    heading.style.fontSize = `${newFontSize}px`;
});
