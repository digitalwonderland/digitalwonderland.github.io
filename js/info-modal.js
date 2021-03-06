// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


// changing cours everysecond
var i = 0;

function change() {
    var doc = document.getElementById("background-changer");
    var color = ["#bcf1ff", "#800080", "#ffe300", "#fbae17"];
    doc.style.backgroundColor = color[i];
    i = (i + 1) % color.length;
}
setInterval(change, 1000);


$('#toggle').click(function() {
    $(this).toggleClass('active');
    $('#overlay').toggleClass('open');
});

//kingatron-modal JSON.stringify

document.addEventListener('DOMContentLoaded', function() {
    var checkbox = document.querySelector('#nav-toggle');
    var checkboxLabel = document.querySelector('#nav-toggle-label');

    function removeActive() {
        checkboxLabel.classList.remove('nav-toggle-label--active');
    }

    checkbox.onclick = function() {
        if (checkbox.checked) {
            checkboxLabel.classList.add('nav-toggle-label--active');
        } else {
            removeActive();
        }
    };

    var menu = document.querySelector('.menu');
    menu.onclick = function() {
        removeActive();
        checkbox.checked = false;
    };

});