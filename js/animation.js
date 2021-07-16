// animasi scroll effect

var scroll = window.requestAnimationFrame || function(callback){
    window.setTimeout(callback, 1000/60)
}

var elementsShow = document.querySelectorAll('.scroll-animasi');

function ulang(){
    elementsShow.forEach(function(element) {
        if (isElementInViewport(element)){
            element.classList.add('is-visible');
        } else{
            element.classList.remove('is-visible');
        }
    });
    scroll(ulang);
}
ulang();

function isElementInViewport (el) {

    // Special bonus for those using jQuery
    if (typeof jQuery === "function" && el instanceof jQuery) {
        el = el[0];
    }

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}