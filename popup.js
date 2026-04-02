var toggle = document.getElementById("toggle");
var highlightToggle = document.getElementById("highlight");
var siteBtn = document.getElementById("site-toggle");
var countEl = document.getElementById("count");

var currentHostname = "";
var currentTabId = null;

// Get active tab and initialize UI
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (!tabs[0]) return;
  currentTabId = tabs[0].id;

  try {
    currentHostname = new URL(tabs[0].url).hostname;
  } catch (e) {
    currentHostname = "";
  }

  // Fetch replacement count from background
  chrome.runtime.sendMessage(
    { type: "getCount", tabId: currentTabId },
    function (response) {
      if (response && response.count) {
        countEl.textContent = response.count;
      }
    }
  );

  // Load settings
  chrome.storage.local.get(
    { enabled: true, highlight: false, blocklist: [] },
    function (result) {
      toggle.checked = result.enabled;
      highlightToggle.checked = result.highlight;

      var isBlocked = result.blocklist.indexOf(currentHostname) !== -1;
      updateSiteButton(isBlocked);
    }
  );
});

// Enable/disable — auto-reloads the tab
toggle.addEventListener("change", function () {
  chrome.storage.local.set({ enabled: toggle.checked }, function () {
    reloadActiveTab();
  });
});

// Highlight toggle — auto-reloads the tab
highlightToggle.addEventListener("change", function () {
  chrome.storage.local.set({ highlight: highlightToggle.checked }, function () {
    reloadActiveTab();
  });
});

// Per-site blocklist toggle
siteBtn.addEventListener("click", function () {
  if (!currentHostname) return;

  chrome.storage.local.get({ blocklist: [] }, function (result) {
    var blocklist = result.blocklist;
    var idx = blocklist.indexOf(currentHostname);

    if (idx !== -1) {
      blocklist.splice(idx, 1);
      updateSiteButton(false);
    } else {
      blocklist.push(currentHostname);
      updateSiteButton(true);
    }

    chrome.storage.local.set({ blocklist: blocklist }, function () {
      reloadActiveTab();
    });
  });
});

function updateSiteButton(isBlocked) {
  if (isBlocked) {
    siteBtn.textContent = "Enable on " + currentHostname;
    siteBtn.classList.add("blocked");
  } else {
    siteBtn.textContent = "Disable on " + currentHostname;
    siteBtn.classList.remove("blocked");
  }
}

function reloadActiveTab() {
  if (currentTabId) {
    chrome.tabs.reload(currentTabId);
    // Close the popup after triggering reload
    window.close();
  }
}
