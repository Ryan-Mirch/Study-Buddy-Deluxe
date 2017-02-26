started=0;

audio = new Audio("alarm.mp3");

function setalarm(t)
{
	started=1;
	timeout=setTimeout(function() {
		chrome.storage.local.set({'starttime': 0, 'timelimit': 0});
		chrome.storage.local.get({'sound': 1}, function(result){
		if (result.sound==1) audio.play();
    	});
    	started=0;
    	nID = new Date();
		nID = nID.getTime();
		nID = nID/1000 | 0;
		nID = nID.toString();
		chrome.notifications.create(nID, { type: 'basic', title: 'Time is up!', message: 'Stop studying and have some fun!', priority: 2, iconUrl: "img1.png" }, function() { });
    	
	}, t);

}

function clearalarm()
{
	clearTimeout(timeout);
	started=0;
}

var PREFS = defaultPrefs();

function defaultPrefs() {
  return {
    siteList: [
      'facebook.com',
      'youtube.com',
      'twitter.com',
      'tumblr.com',
      'pinterest.com',
      'myspace.com',
      'livejournal.com',
      'digg.com',
      'stumbleupon.com',
      'reddit.com',
      'kongregate.com',
      'newgrounds.com',
      'addictinggames.com',
      'hulu.com',
	  'etsy.com',
	  'ebay.com',
	  'amazon.com',
	  'netflix.com',
	  'iwastesomuchtime.com'
    ],
    whitelist: false
  }
}

function locationsMatch(location, listedPattern) {
  return domainsMatch(location.domain, listedPattern.domain) &&
    pathsMatch(location.path, listedPattern.path);
}

function parseLocation(location) {
  var components = location.split('/');
  return {domain: components.shift(), path: components.join('/')};
}

function pathsMatch(test, against) {
  return !against || test.substr(0, against.length) == against;
}

function domainsMatch(test, against) { // tests if the domain matches one on the list
  if(test === against) {
    return true;
  } else {
    var testFrom = test.length - against.length - 1;
	
    if(testFrom < 0) {
      return false;
    } else {
      return test.substr(testFrom) === '.' + against;
    }
  }
}

function isLocationBlocked(location) {
  for(var k in PREFS.siteList) {
    listedPattern = parseLocation(PREFS.siteList[k]);
    if(locationsMatch(location, listedPattern)) {
      return !PREFS.whitelist;
    }
  }
  return PREFS.whitelist;
}

var intervalID = window.setInterval(loop, 500);

function loop() {
  if(started == 1){
	 executeInAllBlockedTabs('block');
  }
}

function executeInTabIfBlocked(action, tab) {
  var file = "content_scripts/" + action + ".js", location;
  location = tab.url.split('://');
  location = parseLocation(location[1]);
  
  if(isLocationBlocked(location)) {
	var removing = chrome.tabs.remove(tab.id);
	removing.then(onRemoved, onError);
    
  }
}


function executeInAllBlockedTabs(action) {
  var windows = chrome.windows.getAll({populate: true}, function (windows) {
    var tabs, tab, domain, listedDomain;
    for(var i in windows) {
      tabs = windows[i].tabs;
      for(var j in tabs) {
        executeInTabIfBlocked(action, tabs[j]);
      }
    }
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if(mainPomodoro.mostRecentMode == 'work') {
    executeInTabIfBlocked('block', tab);
  }
});

chrome.notifications.onClicked.addListener(function (id) {
  // Clicking the notification brings you back to Chrome, in whatever window
  // you were last using.
  chrome.windows.getLastFocused(function (window) {
    chrome.windows.update(window.id, {focused: true});
  });
});