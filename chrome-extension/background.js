// INTERVEE Chrome Extension Background Service Worker

const DEFAULT_URL = 'http://localhost:3000';

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      appUrl: DEFAULT_URL,
      language: 'mix'
    });

    console.log('[INTERVEE Extension] Installed successfully');
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SETTINGS') {
    chrome.storage.sync.get(['appUrl', 'language']).then(result => {
      sendResponse({
        appUrl: result.appUrl || DEFAULT_URL,
        language: result.language || 'mix'
      });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'OPEN_APP') {
    chrome.storage.sync.get(['appUrl']).then(result => {
      const url = result.appUrl || DEFAULT_URL;
      chrome.tabs.create({ url });
    });
  }
});

// Optional: Add keyboard shortcut support
chrome.commands?.onCommand?.addListener((command) => {
  if (command === 'open-intervee') {
    chrome.storage.sync.get(['appUrl']).then(result => {
      const url = result.appUrl || DEFAULT_URL;
      chrome.tabs.create({ url });
    });
  }
});

console.log('[INTERVEE Extension] Background service worker loaded');
