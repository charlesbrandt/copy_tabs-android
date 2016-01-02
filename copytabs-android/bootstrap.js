const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import("resource://gre/modules/Prompt.jsm");

var gWindow;
var menuId;
var mainTab = false;

function checkClosedTab(aEvent) {
  // the target is a XUL browser element
  let browser = aEvent.target;
  // check if the closed tab is our I/O mainTab... if so, update to false
  // then we can re-open on future calls to copyTabs or pasteTabs
  let tab = gWindow.BrowserApp.getTabForBrowser(aBrowser);
  if (tab == mainTab) {
    gWindow.console.log("main CopyTabs output tab closed");
    mainTab = false;
    
  }
}

function loadIntoWindow(window) {
  if (!window)
    return;
  gWindow = window;
  menuId = window.NativeWindow.menu.add("Copy Tabs", null, function() {
    copyTabs(window);
  });

  window.BrowserApp.deck.addEventListener("TabClose", checkClosedTab, false);
  
}

function unloadFromWindow(window) {
  if (!window)
    return;
  window.NativeWindow.menu.remove(menuId);
  window.BrowserApp.deck.removeEventListener("TabClose", checkClosedTab, false);

}

function copyTabs(window) {
  var links = [];
  var tab;
  window.console.log("copy tabs called!!!");
  for (var i = 0; i < window.BrowserApp.tabs.length; i++) {
    tab = window.BrowserApp.tabs[i];
    // these do not apply to Android version:
    // see also cur_tab.loadURI
    // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/browser#p-currentURI

    // this is correct
    // https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android/API/Tab
    window.console.log(tab);
    if (tab.window.document.documentURI) {
      // this might be another way to retrieve the URL:
      //window.BrowserApp.addTab("view-source:" + window.content.location.href);
      links.push(tab.window.document.documentURI);
      links.push(tab.window.document.title);
    }
  }

  window.console.log(links);

  var links_data = links.join('\n');
  window.console.log(links_data);

  // try creating a new tab to show the data in

  // this might also work as a way to implement paste...
  // have a standard <textarea> to get multi-lined input

  if (! mainTab) {
    window.console.log('adding new tab');
    mainTab = window.BrowserApp.addTab('about:blank');
  }

  window.console.log(mainTab);
  
  window.BrowserApp.selectTab(mainTab);
  window.console.log('selected main tab');

  // this works after the new tab is already open:

  mainTab.window.document.body.innerHTML = '<textarea cols="80" rows="40">' + links_data + '</textarea>';

  /*
  //static content... was not easy to select on android:
  mainTab.window.document.body.innerHTML = '';
  var cur_line;
  for (var i = 0; i < links.length; i++) {
    cur_line = links[i];
    var newDiv = mainTab.window.document.createElement("div"); 
    var newContent = mainTab.window.document.createTextNode(cur_line); 
    newDiv.appendChild(newContent);
    mainTab.window.document.body.appendChild(newDiv);
  }
  */

  //no direct access to clipboard [2014.06.20 13:04:34]
  //https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Mobile_development
  //(find "clipboard")

  /*
  // Prompt won't work due to mulitline issues in Textbox 
  // all links end up on a single line
  var p = new Prompt({
    window: window,
    title: "Copy Tabs",
    message: "Select all of the text below to copy it to your clipboard",
    buttons: ["OK"]
  }).addTextbox({
    //Textboxs in Prompts seem to have issues with multiple line data
    //which we need
    //https://support.mozilla.org/en-US/questions/929258
    autofocus: true,
    value: links_data,
    hint: "paste list of links here"
  }).show(function(data) {
    alert("Clicked on: " + data.button);
  });
  */

}

// boilerplate code:
// https://developer.mozilla.org/en-US/Add-ons/Firefox_for_Android/Initialization_and_Cleanup#template_code


var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("UIReady", function onLoad() {
      domWindow.removeEventListener("UIReady", onLoad, false);
      loadIntoWindow(domWindow);
    }, false);
  },
 
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(aData, aReason) {
  // Load into any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }

  // Load into any new windows
  Services.wm.addListener(windowListener);
}

function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;

  // Stop listening for new windows
  Services.wm.removeListener(windowListener);

  // Unload from any existing windows
  let windows = Services.wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}

function install(aData, aReason) {}
function uninstall(aData, aReason) {}

