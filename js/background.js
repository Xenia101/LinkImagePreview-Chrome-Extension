chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['enabled', 'excludedSites'], (data) => {
    if (data.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
    
    if (data.excludedSites === undefined) {
      chrome.storage.sync.set({ excludedSites: [] });
    }
  });
});

chrome.action.setPopup({ popup: 'popup.html' }); 