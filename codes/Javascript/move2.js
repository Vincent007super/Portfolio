let cardPoint = [];
const textures = [
    'textures/who2.png',
    'textures/who2.png',
    'textures/who2.png',
    'textures/who2.png',
    'textures/who2.png'
];
let delta = -230;
let current = 0;
let startZ = 52;
let canScroll = true;
const speed = 0.03;

// Aanmaken van cardpoints
for (let i = 0; i < textures.length +1; i++) {
    cardPoint.push(delta * i);
}

// Scrolling functie
window.addEventListener('wheel', onWheelScroll, { passive: false });

function onWheelScroll(event) {
    let scrollDelta = event.deltaY;

    if (canScroll) {
        if (scrollDelta > 0) {
            current--;
        } else {
            current++;
        }
        if (current <= textures.length * -1) {
            current = (textures.length - 1) * -1;
        }
        if (current >= 0) {
            current = 0;
        }
        console.log((current * delta) + startZ, current)
        canScroll = false;
        setTimeout(function () {
            canScroll = true
        }, 200)
    }
}
