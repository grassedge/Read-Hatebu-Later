const EXPORT = ['ReadLater'];

var ReadLater = {
    prefs: null,
    rhlTag: "",
    tagList: null,
    rhlList: null,
    user: null,

    init: function() {

        RHL.User.login();
        // ログインユーザー名を取得
        // this.user = RHL.User.user; // まだ取得できていないので無意味

        this.setupConfig();
        this.setupContextMenu();
        this.setupRhlList();

        let icon = document.getElementById("rhl-locationbar-icon");
        icon.addEventListener('click', this.toggle, false);

        gBrowser.addEventListener('load', this.setIcon, true);
        document.addEventListener('TabSelect', this.setIcon, false);
        window.setInterval(this.setupRhlList, 10*60*1000);
    },

    shutdown: function() {
	this.prefs.removeObserver("", this);
    },

    setupConfig: function Setup_config() {
        // 設定を初期化
        var nsISupportsString = Components.interfaces.nsISupportsString;
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
            .getService(Components.interfaces.nsIPrefService)
            .getBranch("extensions.readhatebulater.");
        this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
        this.prefs.addObserver("", this, false);
	
        this.rhlTag = this.prefs.getComplexValue('tag', nsISupportsString).data;
        
    },

    setupContextMenu: function() {
        // コンテキストメニューを初期化
        // set context appearance
        var contextMenu = document.getElementById("contentAreaContextMenu");
        if (contextMenu) {
            contextMenu.addEventListener("popupshowing", function(e) {
                var addlink = document.getElementById("rhl-menu-addlink");
                addlink.setAttribute('hidden', !gContextMenu.onLink);
            }, false);
        }
        // set context action
        var contextAddlink = document.getElementById("rhl-menu-addlink");
        contextAddlink.addEventListener('click', function(){
            var url = gContextMenu.linkURL;
            if (!ReadLater.rhlList[url]) {
                ReadLater.addBookmark(url);
                ReadLater.rhlList[url] = {
                    url: url,
                    tag: ReadLater.rhlTag
                };
            }
        });
    },

    setupRhlList: function setup_rhl_list() {
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
                        var tag = [];
                        var tmp = data[i + 1].match(/\[(.*?)\]/g);
                        if (tmp) for (j = 0; j < tmp.length; j++) {
                            tag.push(tmp[j].slice(1,-1));
                        }
                        bookmarks.push({
                            title: data[i],
                            tag  : tag,
                            url  : data[i + 2]
                        });
                    }
                    // ブックマーク数、自分がタグ付けした日付を取得
                    for (i = data.length / 4 * 3, j = 0, len = data.length;
                         i < len; i++, j++) {
                        var bookmarkNumAndDate = data[i].split(TAB);
                        bookmarks[j].bookmarkNum = bookmarkNumAndDate[0];
                        bookmarks[j].date        = bookmarkNumAndDate[1];
                    }
                    // [*あとで読む]のタグがついてるものをcacheに確保
                    for (i = 0, len = bookmarks.length; i < len; i++) {
                        let bookmark = bookmarks[i];
                        for (j = 0; j < bookmark.tag.length; j++) {
                            if (bookmark.tag[j] == ReadLater.rhlTag) {
                                cache[bookmark.url] = bookmark;
                            }
                        }
                    }
                } else {
                    dump("Error loading page\n");
                }
            }
        };
        req.send(null);
        ReadLater.rhlList = cache;
    },
    

    // callback
    observe: function(subject, topic, data) {
	if (topic != "nsPref:changed") {
	    return;
	}
	switch(data) {
          case 'tag':
            var nsISupportsString = Components.interfaces.nsISupportsString;
            ReadLater.rhlTag = this.prefs.getComplexValue('tag', nsISupportsString).data;
            break;
        }
    },

    // callback
    toggle: function toggle (){
        dump('toggle\n');
        let icon = document.getElementById("rhl-locationbar-icon");
        // 現在開いているタブ
        let tab = gBrowser.selectedBrowser.contentDocument;
        let url = tab.location;
        let registed = icon.getAttribute('registed');
        if (registed == 'true') {
            icon.setAttribute('registed', 'false');
            ReadLater.deleteBookmark(url);
            delete ReadLater.rhlList[url];
        } else {
            icon.setAttribute('registed', 'true');
            ReadLater.addBookmark(url);
            ReadLater.rhlList[url] = {
                url: url,
                tag: [ReadLater.rhlTag]
            };
        }
    },

    // callback
    setIcon: function set_icon () {
        let icon = document.getElementById("rhl-locationbar-icon");
        // 現在開いているタブ
        let tab = gBrowser.selectedBrowser.contentDocument;
        let url = tab.location;
        if (ReadLater.rhlList[url]) {
            icon.setAttribute('registed', 'true');
        } else {
            icon.setAttribute('registed', 'false');
        }
    },

    addBookmark: function add_bookmark(url) {
        dump('add bookmark\n');
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
            comment:'[' + ReadLater.rhlTag + ']',
            rks: RHL.User.user.rks
        };
        request.send(net.makeQuery(query));
    },
    
    deleteBookmark: function delete_bookmark(url) {
        dump('delete bookmark\n');
        var request = new XMLHttpRequest();
        request.mozBackgroundRequest = true;
        request.open('POST', 'http://b.hatena.ne.jp/' + RHL.User.user.name + '/api.delete_bookmark.json?editer=fxaddon');
        request.addEventListener('error', function(e){dump('error...');}, false);
        let headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie":       "rk=" + RHL.User.user.rk
        };
        for (let [field, value] in Iterator(headers))
            request.setRequestHeader(field, value);
        let query = {
            url:url,
            comment:'[' + ReadLater.rhlTag + ']',
            rks: RHL.User.user.rks
        };
        request.send(net.makeQuery(query));
    }
    
};

window.addEventListener('load',   function(e) { ReadLater.init(); }, false);
window.addEventListener('unload', function(e) { ReadLater.shutdown(); }, false);


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
