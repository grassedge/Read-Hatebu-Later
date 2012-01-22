const EXPORT = ['LocationBar'];

// TODO. ここではない、どこかへ
RHL.User.login();

RHL.elementGetter(this, 'icon', 'rhl-locationbar-icon', document);
RHL.elementGetter(this, 'contextMenu', "contentAreaContextMenu", document);
RHL.elementGetter(this, 'contextAddlink', "rhl-menu-addlink", document);

var ReadLater = {
    prefs: null,
    rhlTag: "",
    tagList: null,
    rhlList: null,
    user: null,

    init: function() {

        this.setupConfig();
        this.setupContextMenu();

        //let icon = document.getElementById("rhl-locationbar-icon");
        icon.addEventListener('click', this.toggle, false);

        gBrowser.addEventListener('load', this.setIcon, true);
        document.addEventListener('TabSelect', this.setIcon, false);
        //window.setInterval(this.setupRhlList, 10*60*1000);
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
        //var contextMenu = document.getElementById("contentAreaContextMenu");
        if (contextMenu) {
            contextMenu.addEventListener("popupshowing", function(e) {
                //var addlink = document.getElementById("rhl-menu-addlink");
                contextAddlink.setAttribute('hidden', !gContextMenu.onLink);
            }, false);
        }
        // set context action
        //var contextAddlink = document.getElementById("rhl-menu-addlink");
        contextAddlink.addEventListener('click', function(){
            var url = gContextMenu.linkURL;
            if (!RHL.ReadLater.rhlList[url]) {
                RHL.ReadLater.addBookmarkByIcon(url);
                RHL.ReadLater.rhlList[url] = {
                    url: url,
                    tag: RHL.ReadLater.rhlTag
                };
            }
        });
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
            // TODO.
            // 設定のタグが修正されるたびに呼ばれているっぽい。
            // 無駄な更新を行ってしまっているはず。
            RHL.ReadLater.setupRhlList();
            break;
        }
    },

    
    // callback
    toggle: function toggle (){
        //let icon = document.getElementById("rhl-locationbar-icon");
        // 現在開いているタブ
        let tab = gBrowser.selectedBrowser.contentDocument;
        let url = tab.location;
        let registed = icon.getAttribute('registed');
        if (registed == 'true') {
            icon.setAttribute('registed', 'false');
            RHL.ReadLater.deleteBookmark(url);
        } else {
            icon.setAttribute('registed', 'true');
            RHL.ReadLater.addBookmarkByIcon(url);
        }
    },

    // callback
    setIcon: function set_icon () {
        //let icon = document.getElementById("rhl-locationbar-icon");
        // 現在開いているタブ
        let tab = gBrowser.selectedBrowser.contentDocument;
        let url = tab.location;
        if (RHL.ReadLater.rhlList[url]) {
            icon.setAttribute('registed', 'true');
        } else {
            icon.setAttribute('registed', 'false');
        }
    },

    
    // callback
    addBookmarkByContextMenu: function add_bookmark_by_ctx (url) {
    }
    
};


window.addEventListener('load',   function(e) { ReadLater.init(); }, false);
window.addEventListener('unload', function(e) { ReadLater.shutdown(); }, false);

