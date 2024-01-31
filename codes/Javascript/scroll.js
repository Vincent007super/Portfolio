let scrollCount = 0;
let maxScroll = document.querySelector('body').offsetHeight;
let scroll = maxScroll / 5;
let background = document.getElementById("back");

function handleScroll(e) {
    scrollCount = this.scrollY
    if (scrollCount < (scroll * 1)) {
        setClassesBack(1)
    } else if (scrollCount < (scroll * 2))  {
        setClassesBack(2)
    } else if (scrollCount < (scroll * 3))  {
        setClassesBack(3)
    } else if (scrollCount < (scroll * 4))  {
        setClassesBack(4)
    } else if (scrollCount < (scroll * 5))  {
        setClassesBack(5)
    }
    console.log(scrollCount)
}

function setClassesBack(num){
    background.classList.remove("back"+(num-1));
    background.classList.add("back"+num);
    background.classList.remove("back"+(num+1));
}

window.addEventListener("scroll", handleScroll);
