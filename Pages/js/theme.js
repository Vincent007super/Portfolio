const toggleTheme = document.getElementById('toggle-theme');
const body = document.body;
const back = document.querySelector('.back');

toggleTheme.addEventListener('change', function() {
    if (this.checked) {
        body.style.setProperty('--text', 'var(--dark-text)');
        body.style.setProperty('--bg', 'var(--dark-bg)');
        body.style.setProperty('--bg', 'var(--dark-bg)');
    } else {
        body.style.setProperty('--text', 'var(--light-text)');
        body.style.setProperty('--bg', 'var(--light-bg)');
    }
});
