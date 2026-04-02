// AI to Glorified Autocomplete - Background Service Worker

var tabCounts = {};

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // Content script reporting its replacement count
  if (message.type === "updateCount" && sender.tab) {
    var tabId = sender.tab.id;
    tabCounts[tabId] = message.count;

    // Count is stored for the popup but not shown on the badge
  }

  // Popup requesting count for a tab
  if (message.type === "getCount") {
    sendResponse({ count: tabCounts[message.tabId] || 0 });
    return true;
  }
});

// Clean up when tabs close
chrome.tabs.onRemoved.addListener(function (tabId) {
  delete tabCounts[tabId];
});

// Reset count when a tab navigates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.status === "loading") {
    delete tabCounts[tabId];
  }
});
