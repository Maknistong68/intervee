// INTERVEE Chrome Extension Popup Script

const DEFAULT_URL = 'http://localhost:3000';

// DOM Elements
const openAppBtn = document.getElementById('openApp');
const openFullscreenBtn = document.getElementById('openFullscreen');
const langButtons = document.querySelectorAll('.lang-btn');
const appUrlInput = document.getElementById('appUrl');
const saveUrlBtn = document.getElementById('saveUrl');
const helpLink = document.getElementById('helpLink');

// Load saved settings
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['appUrl', 'language']);

    // Set URL
    const url = result.appUrl || DEFAULT_URL;
    appUrlInput.value = url;

    // Set language
    const lang = result.language || 'mix';
    langButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  } catch (err) {
    console.error('Failed to load settings:', err);
    appUrlInput.value = DEFAULT_URL;
  }
}

// Save settings
async function saveSettings(key, value) {
  try {
    await chrome.storage.sync.set({ [key]: value });
    return true;
  } catch (err) {
    console.error('Failed to save settings:', err);
    return false;
  }
}

// Get current app URL
async function getAppUrl() {
  try {
    const result = await chrome.storage.sync.get(['appUrl']);
    return result.appUrl || DEFAULT_URL;
  } catch {
    return DEFAULT_URL;
  }
}

// Open app in current tab
openAppBtn.addEventListener('click', async () => {
  const url = await getAppUrl();

  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab) {
    chrome.tabs.update(tab.id, { url });
  }

  window.close();
});

// Open app in new tab
openFullscreenBtn.addEventListener('click', async () => {
  const url = await getAppUrl();
  chrome.tabs.create({ url });
  window.close();
});

// Language selection
langButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    const lang = btn.dataset.lang;

    // Update UI
    langButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Save preference
    await saveSettings('language', lang);

    // Also try to update the app if it's open
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const appUrl = await getAppUrl();
        if (tab.url.startsWith(appUrl) || tab.url.includes('localhost:3000')) {
          // Send message to content script to update language
          chrome.tabs.sendMessage(tab.id, { type: 'SET_LANGUAGE', language: lang }).catch(() => {});
        }
      }
    } catch (err) {
      // Ignore errors - app might not be open
    }
  });
});

// Save URL
saveUrlBtn.addEventListener('click', async () => {
  const url = appUrlInput.value.trim() || DEFAULT_URL;

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    appUrlInput.classList.add('error');
    setTimeout(() => appUrlInput.classList.remove('error'), 1000);
    return;
  }

  const success = await saveSettings('appUrl', url);

  if (success) {
    saveUrlBtn.classList.add('success');
    appUrlInput.classList.add('saved');

    setTimeout(() => {
      saveUrlBtn.classList.remove('success');
      appUrlInput.classList.remove('saved');
    }, 1500);
  }
});

// Enter key to save URL
appUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    saveUrlBtn.click();
  }
});

// Help link
helpLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'https://github.com/anthropics/claude-code/issues' });
  window.close();
});

// Initialize
loadSettings();
