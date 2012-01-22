if (!RHL) { var RHL = {}; }

Components.utils.import("resource://rhl/modules/00-utils.jsm", RHL);
//Components.utils.import("resource://rhl/modules/81-HttpWatcher.js", RHL);
//if (!("autoload" in RHL) || RHL.autoload) {
RHL.loadModules();
//    RHL.load("chrome://hatenabookmark/content/common/");
//    RHL.load(location.href.replace(/\.\w+$/, "/"));
//}
dump('autoloader\n');
