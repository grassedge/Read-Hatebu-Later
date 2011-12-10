TARGET          = rhl@shibahata.net.xpi
CONTENT_PACKAGE = rhl.jar

LOCALE_DIR    = locale
SKIN_DIR      = skin
CONTENT_DIR   = content

CHROME_DIR    = chrome
DEFAULTS_DIR  = defaults
RESOURCES_DIR = resources

package: $(TARGET)

$(TARGET): $(CONTENT_PACKAGE)
	mv chrome.manifest chrome.manifest.bak
	sed -e 's/chrome\//jar:chrome\/rhl.jar!\//g' chrome.manifest.bak > chrome.manifest
	zip -r $(TARGET) chrome.manifest install.rdf $(RESOURCES_DIR) $(DEFAULTS_DIR)
	zip -u $(TARGET) $(CHROME_DIR)/$(CONTENT_PACKAGE)
	mv chrome.manifest.bak chrome.manifest

$(CONTENT_PACKAGE):
	cd $(CHROME_DIR); zip -r $(CONTENT_PACKAGE) *

clean:
	rm $(TARGET)
