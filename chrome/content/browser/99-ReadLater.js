const EXPORT = ['ReadLater'];

let E = createElementBindDocument(document, XHTML_NS);

elementGetter(this, 'readlaterPanel', 'hBookmark-panel-readlater', document);
elementGetter(this, 'readlaterButton', 'hBookmark-readlater', document);
elementGetter(this, 'statusbar', 'status-bar', document);
elementGetter(this, 'readlaterList', 'hBookmark-readlater-list', document);

let userIcon = function(username) {
    return E('img', {
                 src: UserUtils.getProfileIcon(username),
                 className: 'usericon',
                 width: '16px',
                 height: '16px',
                 alt: username
             });
}

// TODO. readlater.properties を作成する。
let strings =
    new Strings('chrome://hatenabookmark/locale/commentViewer.properties');

var Readlater = {
    buttonClickHandler: function() {
        // test.
        //var s = '';
        //var models = Model.Bookmark.findAll();
        var models = Model.Bookmark.findByTags(['Java']);
        //for (var i = 0; i < models.length; i++) {
        //    s += '(' + models[i].url + ',' + models[i].title + ')';
        //}
        //alert(s);

        //var xhr = new XMLHttpRequest();
        //xhr.mozBackgroundRequest = true;
        //xhr.open('GET', 'http://b.hatena.ne.jp/hatsu48/rss', false);
        //xhr.send(null);
        //alert(xhr.responseXML.textContent);
        
        //var doc = xhr.responseXML;
        //var titles = doc.getElementsByTagName('title');
        //var links = doc.getElementsByTagName('link');
        //alert(titles[0].textContent);
        let fragment = document.createDocumentFragment();



        for (var i = 0; i < models.length; i++) {
            let li = E('li');
            let container = E('span', {className: highlightContainerClass});
            let a  = E('a', {href: models[i].url}, models[i].title);
            a.className = 'username';
            //a.appendChild(models[i].title);
            //alert(models[i].title);
            //a.setAttribute('href', models[i].url);
            container.appendChild(a);
            li.appendChild(container);
            fragment.appendChild(li);
        }
        /*
        for (var i = 1; i < titles.length; i++) {
            let li = E('li');
            let a = E('a');
            a.appendChild(titles[i].firstChild);

            //a.href = links[i].firstChild.textContent;
            a.setAttribute('href', links[i].firstChild.textContent);
            li.appendChild(a);
            //li.appendChild(titles[i].firstChild);//document.TextNode()

            fragment.appendChild(li);
        }
         */

        readlaterList.appendChild(fragment);
        readlaterPanel.openPopup(statusbar, 'before_end', -20, 0,false,false);
    },
    loadHandler: function() {
        readlaterButton.addEventListener(
            'mousedown',  Readlater.buttonClickHandler, true
        );
    }
};

EventService.createListener('load', Readlater.loadHandler);
