document.addEventListener('DOMContentLoaded', function () {
  const toggleElement = document.getElementById('toggleExtension');
  const statusText = document.getElementById('statusText');
  const langKoBtn = document.getElementById('langKo');
  const langEnBtn = document.getElementById('langEn');
  const langJaBtn = document.getElementById('langJa');
  const langZh_CNBtn = document.getElementById('langZh_CN');
  const excludeSiteForm = document.getElementById('excludeSiteForm');
  const excludeSiteInput = document.getElementById('excludeSiteInput');
  const excludedSitesList = document.getElementById('excludedSitesList');
  const maxUrlsInput = document.getElementById('maxUrlsInput');

  chrome.storage.sync.get(['enabled', 'language', 'excludedSites', 'maxUrls'], function (data) {
    const isEnabled = data.enabled !== undefined ? data.enabled : true;

    toggleElement.checked = isEnabled;
    
    const currentMaxUrls = data.maxUrls || 50;
    maxUrlsInput.value = currentMaxUrls;

    updateContentScriptState(isEnabled);

    const currentLanguage = data.language || 'ko';
    updateLanguageUI(currentLanguage);

    updateStatusMessage(isEnabled, currentLanguage);
    
    const excludedSites = data.excludedSites || [];
    renderExcludedSites(excludedSites);
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
  
  excludeSiteForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const site = excludeSiteInput.value.trim();
    if (!site) return;
    
    chrome.storage.sync.get('excludedSites', function (data) {
      const excludedSites = data.excludedSites || [];
      
      if (!excludedSites.includes(site)) {
        excludedSites.push(site);
        chrome.storage.sync.set({ excludedSites });
        renderExcludedSites(excludedSites);
        updateContentScriptsWithExcludedSites(excludedSites);
      }
      
      excludeSiteInput.value = '';
    });
  });

  maxUrlsInput.addEventListener('change', function() {
    let newMaxUrls = parseInt(maxUrlsInput.value);
    
    if (isNaN(newMaxUrls) || newMaxUrls < 10) {
      newMaxUrls = 10;
      maxUrlsInput.value = 10;
    } else if (newMaxUrls > 500) {
      newMaxUrls = 500;
      maxUrlsInput.value = 500;
    }
    
    chrome.storage.sync.set({ maxUrls: newMaxUrls });
    updateContentScriptsWithMaxUrls(newMaxUrls);
  });

  function setLanguage(language) {
    chrome.storage.sync.set({ language: language }, function () {
      updateLanguageUI(language);

      window.applyI18nMessages(language);

      chrome.storage.sync.get(['enabled', 'excludedSites'], function (data) {
        const isEnabled = data.enabled !== undefined ? data.enabled : true;
        updateStatusMessage(isEnabled, language);
        
        const excludedSites = data.excludedSites || [];
        renderExcludedSites(excludedSites);
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
  
  function renderExcludedSites(sites) {
    excludedSitesList.innerHTML = '';
    
    if (sites.length === 0) {
      chrome.storage.sync.get('language', function (data) {
        const currentLanguage = data.language || 'ko';
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = window.getLocalizedMessage('noExcludedSites', currentLanguage);
        emptyMessage.className = 'empty-list';
        excludedSitesList.appendChild(emptyMessage);
      });
      return;
    }
    
    sites.forEach(site => {
      const li = document.createElement('li');
      li.textContent = site;
      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.className = 'remove-site';
      removeBtn.setAttribute('title', '제거');
      removeBtn.addEventListener('click', function() {
        removeSite(site);
      });
      
      li.appendChild(removeBtn);
      excludedSitesList.appendChild(li);
    });
  }
  
  function removeSite(site) {
    chrome.storage.sync.get('excludedSites', function(data) {
      const excludedSites = data.excludedSites || [];
      const updatedSites = excludedSites.filter(s => s !== site);
      chrome.storage.sync.set({ excludedSites: updatedSites });
      renderExcludedSites(updatedSites);
      updateContentScriptsWithExcludedSites(updatedSites);
    });
  }
  
  function updateContentScriptsWithExcludedSites(excludedSites) {
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        chrome.tabs
          .sendMessage(tab.id, { action: 'updateExcludedSites', excludedSites })
          .catch(function(error) {
            console.log('탭에 메시지를 보낼 수 없습니다:', error);
          });
      });
    });
  }

  function updateContentScriptsWithMaxUrls(maxUrls) {
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        chrome.tabs
          .sendMessage(tab.id, { action: 'updateMaxUrls', maxUrls })
          .catch(function (error) {
            console.log('탭에 메시지를 보낼 수 없습니다:', error);
          });
      });
    });
  }
}); 