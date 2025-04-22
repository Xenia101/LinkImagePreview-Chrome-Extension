chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('enabled', (data) => {
    if (data.enabled === undefined) {
      chrome.storage.sync.set({ enabled: true });
    }
  });
});

chrome.action.setPopup({ popup: 'popup.html' });
