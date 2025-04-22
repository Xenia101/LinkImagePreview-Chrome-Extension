document.addEventListener('DOMContentLoaded', function () {
  const toggleElement = document.getElementById('toggleExtension');
  const statusText = document.getElementById('statusText');
  const langKoBtn = document.getElementById('langKo');
  const langEnBtn = document.getElementById('langEn');
  const langJaBtn = document.getElementById('langJa');
  const langZh_CNBtn = document.getElementById('langZh_CN');

  chrome.storage.sync.get(['enabled', 'language'], function (data) {
    const isEnabled = data.enabled !== undefined ? data.enabled : true;

    toggleElement.checked = isEnabled;

    updateContentScriptState(isEnabled);

    const currentLanguage = data.language || 'ko';
    updateLanguageUI(currentLanguage);

    updateStatusMessage(isEnabled, currentLanguage);
  });

  toggleElement.addEventListener('change', function () {
    const isEnabled = toggleElement.checked;

    chrome.storage.sync.set({ enabled: isEnabled });

    chrome.storage.sync.get('language', function (data) {
      const currentLanguage = data.language || 'ko';
      updateStatusMessage(isEnabled, currentLanguage);
    });

    updateContentScriptState(isEnabled);
  });

  langKoBtn.addEventListener('click', function () {
    setLanguage('ko');
  });

  langEnBtn.addEventListener('click', function () {
    setLanguage('en');
  });

  langJaBtn.addEventListener('click', function () {
    setLanguage('ja');
  });

  langZh_CNBtn.addEventListener('click', function () {
    setLanguage('zh_CN');
  });

  function setLanguage(language) {
    chrome.storage.sync.set({ language: language }, function () {
      updateLanguageUI(language);

      window.applyI18nMessages(language);

      chrome.storage.sync.get('enabled', function (data) {
        const isEnabled = data.enabled !== undefined ? data.enabled : true;
        updateStatusMessage(isEnabled, language);
      });
    });
  }

  function updateLanguageUI(language) {
    langKoBtn.classList.remove('active');
    langEnBtn.classList.remove('active');
    langJaBtn.classList.remove('active');
    langZh_CNBtn.classList.remove('active');

    switch (language) {
      case 'ko':
        langKoBtn.classList.add('active');
        break;
      case 'en':
        langEnBtn.classList.add('active');
        break;
      case 'ja':
        langJaBtn.classList.add('active');
        break;
      case 'zh_CN':
        langZh_CNBtn.classList.add('active');
        break;

      case 'jp':
        langJaBtn.classList.add('active');

        chrome.storage.sync.set({ language: 'ja' });
        break;
      case 'ch':
        langZh_CNBtn.classList.add('active');

        chrome.storage.sync.set({ language: 'zh_CN' });
        break;
      default:
        langKoBtn.classList.add('active');
    }

    document.documentElement.lang = language;
  }

  function updateStatusMessage(isEnabled, language) {
    if (statusText) {
      if (language) {
        const statusKey = isEnabled ? 'statusEnabled' : 'statusDisabled';
        statusText.textContent = window.getLocalizedMessage(statusKey, language);
        statusText.style.color = isEnabled ? '#4CAF50' : '#F44336';
      } else {
        chrome.storage.sync.get('language', function (data) {
          const currentLanguage = data.language || 'ko';
          const statusKey = isEnabled ? 'statusEnabled' : 'statusDisabled';
          statusText.textContent = window.getLocalizedMessage(statusKey, currentLanguage);
          statusText.style.color = isEnabled ? '#4CAF50' : '#F44336';
        });
      }
    }
  }

  function updateContentScriptState(isEnabled) {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs
          .sendMessage(tab.id, { action: 'updateState', enabled: isEnabled })
          .catch(function (error) {
            console.log('탭에 메시지를 보낼 수 없습니다:', error);
          });
      });
    });
  }
});
