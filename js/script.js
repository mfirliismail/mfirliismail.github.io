


document.getElementById("button-dark").addEventListener("click", function (e) {
    var target = e.target;

    target.classList.toggle("fa-moon");
    target.classList.toggle("fa-sun");

    var home = document.getElementById('home');
    var footer = document.getElementById('footer');
    var works = document.getElementById('works');
    var section = document.getElementById('main-section');
    var header = document.getElementById('head-nav');
    var contacts = document.getElementById('contacts');
    home.classList.toggle("dark-mode");
    header.classList.toggle("dark-mode");
    section.classList.toggle("dark-mode");
    works.classList.toggle("dark-mode");
    footer.classList.toggle("dark-mode");
    contacts.classList.toggle("dark-mode");
}, false);

function openPage(PageName, elmnt, color){
    var i, tabcontent,tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for(i = 0; i < tabcontent.length; i++){
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for(i = 0; i < tablinks.length; i++){
        tablinks[i].style.backgroundColor = "";
        
    }
    
    document.getElementById(PageName).style.display = "block";
    elmnt.style.backgroundColor = color;
    

}

document.getElementById("defaultOpen").click();

