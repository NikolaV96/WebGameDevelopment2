const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.5}s`
            }
        });

        burger.classList.toggle('toggle');
    });

}

navSlide();

function smoothScroll(target,duration){
    var target = document.querySelector(target);
    var targetPosition = target.getBoundingClientRect().top;
    var startPosition = window.pageYOffset;
    var distance = targetPosition - startPosition;
    var startTime = null;

    function animation(currentTime){
        if(startTime === null) startTime = currentTime;
        var timeElapsed = currentTime - startTime;
        var run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if(timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease (t, b, c, d) {
        t /= d/2;
        if (t < 1) return c/2*t*t + b;
        t--;
        return -c/2 * (t*(t-2) - 1) + b;
    }
    requestAnimationFrame(animation);
}

var section1 = document.querySelector('.section1');
var section2 = document.querySelector('.section2');
var section3 = document.querySelector('.section3');
var section4 = document.querySelector('.section4');

section1.addEventListener('click', function(){
    smoothScroll ('.box1', 1300);
});
section2.addEventListener('click', function(){
    smoothScroll ('.box2', 1300);
});
section3.addEventListener('click', function(){
    smoothScroll ('.box3', 1300);
});
section4.addEventListener('click', function(){
    smoothScroll ('.box4', 1300);
});

function scrollAppear(){
    var introText1 = document.querySelector('.intro-text1');
    var introText2 = document.querySelector('.intro-text2');
    var introText3 = document.querySelector('.intro-text3');
    var introText4 = document.querySelector('.intro-text4');
    var introPosition1 = introText1.getBoundingClientRect().top;
    var introPosition2 = introText2.getBoundingClientRect().top;
    var introPosition3 = introText3.getBoundingClientRect().top;
    var introPosition4 = introText4.getBoundingClientRect().top;
    var screenPosition = window.innerHeight / 1.3;

    if(introPosition1 < screenPosition){
        introText1.classList.add('intro-appear');
    }
    if(introPosition2 < screenPosition){
        introText2.classList.add('intro-appear');
    }
    if(introPosition3 < screenPosition){
        introText3.classList.add('intro-appear');
    }
    if(introPosition4 < screenPosition){
        introText4.classList.add('intro-appear');
    }
}

window.addEventListener('scroll', scrollAppear); 