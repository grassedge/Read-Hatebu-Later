function hello() {
    //alert("Hello, world! hoge");
    var xhr = new XMLHttpRequest();
    xhr.mozBackgroundRequest = true;
    xhr.open('GET', 'http://localhost/', false);
    xhr.send(null);
    alert(xhr.responseText);
    
    //alert(window.content.document.location);
    //window.open("chrome://findfile/content/findfile.xul","","chrome");
}
