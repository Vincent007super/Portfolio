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

let page = document.querySelectorAll('.wrapper1');
let page2 = document.getElementsByClassName('Page2');
let curPage = 0;

function setPage(){
    console.log("test setPage werkt!")
    for (let i = 0; i < page.length; i++) {
        if(i < curPage){
            page[i].classList.remove("active")
            page[i].classList.add("remove")
        }else if(i > curPage){
            page[i].classList.add("waiting");
            page[i].classList.remove("active");
        }else{

            page[i].classList.remove("remove")
            page[i].classList.remove("waiting")
            page[i].classList.add("active");
        }
    }
}

setPage();