const EXPORT = ['ReadLater'];
var rhlTag = Application.prefs.get('extensions.readhatebulater.tag').value;
    //dump(prefs.getCharPref('tag'));

var ReadLater = {
    prefs: null,
    rhlTag: "",

    init: function() {
        dump('init init init \n');

        // this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
        //     .getService(Components.interfaces.nsIPrefService)
        //     .getBranch("stockwatcher2.");
        // this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        // this.prefs.addObserver("", this, false);
	// 
        // this.tickerSymbol = this.prefs.getCharPref("symbol").toUpperCase();
        // 
        // this.refreshInformation();
        // window.setInterval(this.refreshInformation, 10*60*1000);
    }
};

window.addEventListener('load', function(e) { ReadLater.init(); }, false);

window.addEventListener('load', function() {

    var prefs = Components.classes["@mozilla.org/preferences-service;1"]  
         .getService(Components.interfaces.nsIPrefService)  
         .getBranch("extensions.readhatebulater.");
    prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);  
    //prefs.addObserver("", this, false);  

    var nsISupportsString = Components.interfaces.nsISupportsString;


    prefs.setCharPref('tag', unescape(encodeURIComponent('*あとで読め')));
    dump('\n');
    dump('\n');
    var str = prefs.getComplexValue('tag', nsISupportsString);
    dump(str);
    dump(str.data);
    // //dump(prefs.getCharPref('tag'));
    dump('\n');
    dump('\n');
   
    
    
    // set context appearance
    var contextMenu = document.getElementById("contentAreaContextMenu");
    if (contextMenu) {
        contextMenu.addEventListener("popupshowing", function(e) {
            var addlink = document.getElementById("rhl-menu-addlink");
            addlink.setAttribute('hidden', !gContextMenu.onLink);
        }, false);
    }


    RHL.User.login();
    //dump('\nhogeeeex:');dump(RHL.User.user);dump('\n');
    let icon = document.getElementById("rhl-locationbar-icon");
    let context_addlink = document.getElementById("rhl-menu-addlink");

    icon.addEventListener('click', function(){
        //dump('rhl: ' + RHL.User.user + '\n');
        let user = RHL.User.user;
        // for (let k in user) {
        //     dump(k + ' : ' + user[k] + '\n');
        // }
        // ログインユーザー名を取得
        let name = user.name;
        let tab = gBrowser.selectedBrowser.contentDocument;
        // 現在開いているタブのURL
        let url = tab.location;
        let registed = icon.getAttribute('registed');
        if (registed == 'true') {
            icon.setAttribute('registed', 'false');
            delete_bookmark(url);
            delete cache[url];
        } else {
            icon.setAttribute('registed', 'true');
            add_bookmark(url);
            cache[url] = {
                url: url,
                tag: rhlTag
            };
        }
    });

    context_addlink.addEventListener('click', function(){
        let url = gContextMenu.linkURL;
        if (!cache[url]) {
            add_bookmark(url);
            dump('bookmark!');
            cache[url] = {
                url: url,
                tag: rhlTag
            };
        } else {
            dump('already bookmarked');
        }
    });
    
    var bookmarks = [];
    var cache = {};
    var LF = String.fromCharCode(10); // 改行コード LF
    var TAB = String.fromCharCode(9); // タブコード
    var req = new XMLHttpRequest();
    req.open('GET', 'http://b.hatena.ne.jp/hatsu48/search.data', true);
    req.onreadystatechange = function (aEvt) {
        if (req.readyState == 4) {
            if(req.status == 200) {
                var i, j, len;
                var data = req.responseText.split(LF);
                for (i = 0, len = data.length / 4 * 3; i < len; i += 3) {
                    bookmarks.push({
                        title: data[i],
                        tag  : data[i + 1],
                        url  : data[i + 2]
                    });
                }
                for (i = data.length / 4 * 3, j = 0, len = data.length;
                     i < len; i++, j++) {
                    var bookmarkNumAndDate = data[i].split(TAB);
                    bookmarks[j].bookmarkNum = bookmarkNumAndDate[0];
                    bookmarks[j].date        = bookmarkNumAndDate[1];
                }
                for (i = 0, len = bookmarks.length; i < len; i++) {
                    let bookmark = bookmarks[i];
                    if (bookmark.tag.indexOf(rhlTag) != -1) {
                        cache[bookmark.url] = bookmark;
                    }
                }
            } else
                dump("Error loading page\n");
        }
    };
    req.send(null);

    gBrowser.addEventListener('load', function() {
        let tab = gBrowser.selectedBrowser.contentDocument;
        // 現在開いているタブのURL
        let url = tab.location;
        //dump('through here? \n');
        if (cache[url]) {
            icon.setAttribute('registed', 'true');
        } else {
            icon.setAttribute('registed', 'false');
        }
        //dump('document loaded.\n');
    }, true);

    document.addEventListener('TabSelect', function() {
        let tab = gBrowser.selectedBrowser.contentDocument;
        // 現在開いているタブのURL
        let url = tab.location;
        //dump('through here? \n');
        if (cache[url]) {
            icon.setAttribute('registed', 'true');
        } else {
            icon.setAttribute('registed', 'false');
        }
    }, false);
});

function add_bookmark(url) {
    var request = new XMLHttpRequest();
    request.mozBackgroundRequest = true;
    request.open('POST', 'http://b.hatena.ne.jp/' + RHL.User.user.name + '/add.edit.json?editer=fxaddon');
    request.addEventListener('error', function(e){dump('error...');}, false);
    let headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie":       "rk=" + RHL.User.user.rk
    };
    for (let [field, value] in Iterator(headers))
        request.setRequestHeader(field, value);
    let query = {
        url:url,
        comment:'[' + rhlTag + ']',
        rks: RHL.User.user.rks
    };
    request.send(net.makeQuery(query));
}

function delete_bookmark(url) {
    var request = new XMLHttpRequest();
    request.mozBackgroundRequest = true;
    request.open('POST', 'http://b.hatena.ne.jp/' + RHL.User.user.name + '/api.delete_bookmark.json?editer=fxaddon');
    //request.open('POST', 'http://b.hatena.ne.jp/' + RHL.User.user.name + '/add.edit.json?editer=fxaddon');
    request.addEventListener('error', function(e){dump('error...');}, false);
    let headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie":       "rk=" + RHL.User.user.rk
    };
    for (let [field, value] in Iterator(headers))
        request.setRequestHeader(field, value);
    let query = {
        url:url,
        comment:'[' + rhlTag + ']',
        rks: RHL.User.user.rks
    };
    request.send(net.makeQuery(query));
}

var net = {};
net.makeQuery =  function net_makeQuery (data) {
    let pairs = [];
    let regexp = /%20/g;
    let toString = Object.prototype.toString;
    for (let k in data) {
        if (typeof data[k] == 'undefined') continue;
        let n = encodeURIComponent(k);
        let v = data[k];
        if (toString.call(v) === '[object Array]') {
            pairs.push(v.map(function (c) {
                return n + '=' + encodeURIComponent(c).replace(regexp, '+');
            }).join('&'));
        } else {
            pairs.push(n + '=' + encodeURIComponent(v).replace(regexp, '+'));
        }
    }
    return pairs.join('&');
};

// document.addEventListener('TabSelect', (function() {
//     let icon;
//     return function() {
//         if (!icon)
//             icon = document.getElementById("rhl-locationbar-icon");
//         icon.setAttribute('registed', 'false');
//     };
// })(), false);

