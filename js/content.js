let isExtensionEnabled = true;
let excludedSites = [];
let maxUrls = 50;
const DEFAULT_MESSAGES = {
  ko: {
    loading: '로딩 중...',
    loadError: '이미지를 불러올 수 없습니다',
    imageSize: '이미지 크기: %w x %h 픽셀',
  },
  en: {
    loading: 'Loading...',
    loadError: 'Unable to load image',
    imageSize: 'Image size: %w x %h pixels',
  },
  zh_CN: {
    loading: '加载中...',
    loadError: '无法加载图片',
    imageSize: '图片尺寸: %w x %h 像素',
  },
  ja: {
    loading: '読み込み中...',
    loadError: '画像を読み込めません',
    imageSize: '画像サイズ: %w x %h ピクセル',
  }
};
let currentLanguage = 'ko';

function isExtensionContextValid() {
  return typeof chrome !== 'undefined' && chrome.runtime && !chrome.runtime.lastError;
}

function isExcludedSite() {
  const currentHost = window.location.hostname;
  return excludedSites.some(site => {
    if (site.startsWith('*.')) {
      const domain = site.substring(2);
      return currentHost.endsWith(domain);
    }
    return currentHost === site;
  });
}

function initializeExtension() {
  try {
    if (!isExtensionContextValid()) {
      console.warn('Extension context may be invalid');
      return;
    }

    chrome.storage.sync.get(['enabled', 'language', 'excludedSites', 'maxUrls'], (data) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.error('Extension error:', chrome.runtime.lastError);
        return;
      }

      isExtensionEnabled = data.enabled !== undefined ? data.enabled : true;
      currentLanguage = data.language || 'ko';
      excludedSites = data.excludedSites || [];
      maxUrls = data.maxUrls || 50;

      if (isExcludedSite()) {
        console.log('현재 사이트는 제외 목록에 있어 확장 프로그램이 비활성화되었습니다:', window.location.hostname);
        return;
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (isExtensionEnabled) {
            findAndProcessUrls();
            setupMutationObserver();
          }
        });
      } else {
        if (isExtensionEnabled) {
          findAndProcessUrls();
          setupMutationObserver();
        }
      }
    });
  } catch (error) {
    console.error('Extension initialization error:', error);
    
    if (document.readyState !== 'loading') {
      findAndProcessUrls();
      setupMutationObserver();
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        findAndProcessUrls();
        setupMutationObserver();
      });
    }
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (!isExtensionContextValid()) {
      console.warn('Message received but extension context is invalid');
      sendResponse({ received: false, error: 'Extension context invalid' });
      return true;
    }

    if (message.action === 'updateState') {
      isExtensionEnabled = message.enabled;

      if (!isExtensionEnabled) {
        removeAllPreviews();
      }

      if (isExtensionEnabled && !isExcludedSite()) {
        findAndProcessUrls();
      }
    } else if (message.action === 'updateLanguage') {
      currentLanguage = message.language || 'ko';
    } else if (message.action === 'updateExcludedSites') {
      excludedSites = message.excludedSites || [];
      
      if (isExcludedSite()) {
        removeAllPreviews();
      } else if (isExtensionEnabled) {
        findAndProcessUrls();
      }
    } else if (message.action === 'updateMaxUrls') {
      maxUrls = message.maxUrls || 50;
      
      if (isExtensionEnabled && !isExcludedSite()) {
        findAndProcessUrls();
      }
    }

    sendResponse({ received: true });
  } catch (error) {
    console.error('Message handling error:', error);
    sendResponse({ received: false, error: error.message });
  }
  return true;
});

initializeExtension();

function removeAllPreviews() {
  try {
    const preview = document.getElementById('lip-image-preview-popup');
    if (preview && document.body.contains(preview)) {
      document.body.removeChild(preview);
    }

    const urlElements = document.querySelectorAll('.lip-image-url-hover');
    urlElements.forEach((element) => {
      try {
        element.removeEventListener('mouseenter', showPreview);
        element.removeEventListener('mouseleave', hidePreview);
      } catch (error) {
        console.error('이벤트 리스너 제거 오류:', error);
      }
    });
  } catch (error) {
    console.error('미리보기 제거 오류:', error);
  }
}

function setupMutationObserver() {
  try {
    const observer = new MutationObserver((mutations) => {
      if (isExtensionEnabled && !isExcludedSite()) {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            findAndProcessUrls();
          }
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.error('MutationObserver 설정 오류:', error);
  }
}

function findAndProcessUrls() {
  if (!isExtensionEnabled || isExcludedSite()) return;

  try {
    const textNodes = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    
    let urlCount = 0;

    let node;
    while ((node = walk.nextNode())) {
      textNodes.push(node);
    }

    for (let i = 0; i < textNodes.length && urlCount < maxUrls; i++) {
      const textNode = textNodes[i];
      try {
        if (!textNode || !textNode.parentNode) continue;
        
        const parent = textNode.parentNode;

        if (parent.classList && parent.classList.contains('url-processed')) {
          continue;
        }

        const text = textNode.nodeValue;
        if (!text) continue;

        const urlRegex =
          /(https?:\/\/(?:(?:[^\s]+\.(jpg|png|gif|jpeg|webp)(?:\?[^\s]*)?)|(?:placehold\.co\/[^\s]+)|(?:placekitten\.com\/[^\s]+)|(?:picsum\.photos\/[^\s]+)|(?:loremflickr\.com\/[^\s]+)))/gi;

        let match;
        let lastIndex = 0;
        let fragment = document.createDocumentFragment();
        let urlsInThisNode = 0;

        while ((match = urlRegex.exec(text)) !== null) {
          if (urlCount >= maxUrls) break;
          
          if (match.index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
          }

          let cleanUrl = match[1];
          cleanUrl = cleanUrl.replace(/[,.)}\]]+$/, '');

          const urlSpan = document.createElement('span');
          urlSpan.className = 'url-processed lip-image-url-hover';
          urlSpan.textContent = cleanUrl;
          urlSpan.dataset.imageUrl = cleanUrl;

          urlSpan.addEventListener('mouseenter', showPreview);
          urlSpan.addEventListener('mouseleave', hidePreview);

          fragment.appendChild(urlSpan);

          if (cleanUrl.length < match[1].length) {
            const punctuation = match[1].substring(cleanUrl.length);
            fragment.appendChild(document.createTextNode(punctuation));
          }

          lastIndex = match.index + match[1].length;
          urlCount++;
          urlsInThisNode++;
        }

        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        if (urlsInThisNode > 0 && parent.parentNode) {
          parent.replaceChild(fragment, textNode);
        }
      } catch (nodeError) {
        console.error('텍스트 노드 처리 오류:', nodeError);
      }
    }
  } catch (error) {
    console.error('URL 처리 오류:', error);
  }
}

function showPreview(event) {
  if (!isExtensionEnabled || isExcludedSite()) return;

  try {
    const target = event.currentTarget;
    const imageUrl = target.dataset.imageUrl;

    if (!imageUrl) return;

    hidePreview();

    const previewEl = document.createElement('div');
    previewEl.id = 'lip-image-preview-popup';
    document.body.appendChild(previewEl);

    const loadingMessage = getLocalizedMessage('loading');
    previewEl.innerHTML = `<div class="loading">${loadingMessage}</div>`;

    const targetRect = target.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    
    previewEl.style.maxWidth = '500px';
    
    previewEl.style.position = 'absolute';
    previewEl.style.left = targetRect.left + 'px';
    previewEl.style.top = (targetRect.top + scrollY - 5) + 'px';
    previewEl.style.transform = 'translateY(-100%)';
    
    const img = new Image();
    img.onload = function() {
      if (!document.getElementById('lip-image-preview-popup')) return;
      
      const sizeMessage = getLocalizedMessage('imageSize')
        .replace('%w', img.naturalWidth)
        .replace('%h', img.naturalHeight);
      
      previewEl.innerHTML = `
        <img src="${imageUrl}" alt="이미지 미리보기">
        <div class="image-size">${sizeMessage}</div>
      `;
      
      const previewRect = previewEl.getBoundingClientRect();
      
      if (previewRect.right > window.innerWidth) {
        const rightOverflow = previewRect.right - window.innerWidth;
        previewEl.style.left = Math.max(0, (targetRect.left - rightOverflow)) + 'px';
      }
      
      if (previewRect.top < 0) {
        previewEl.style.top = (targetRect.bottom + scrollY + 5) + 'px';
        previewEl.style.transform = 'none';
      }
    };

    img.onerror = function() {
      if (!document.getElementById('lip-image-preview-popup')) return;
      
      const errorMessage = getLocalizedMessage('loadError');
      previewEl.innerHTML = `<div class="error">${errorMessage}</div>`;
    };

    img.src = imageUrl;
  } catch (error) {
    console.error('미리보기 표시 오류:', error);
  }
}

function hidePreview() {
  try {
    const previewEl = document.getElementById('lip-image-preview-popup');
    if (previewEl && document.body.contains(previewEl)) {
      document.body.removeChild(previewEl);
    }
  } catch (error) {
    console.error('미리보기 숨김 오류:', error);
  }
}

function getLocalizedMessage(key) {
  try {
    if (DEFAULT_MESSAGES[currentLanguage] && DEFAULT_MESSAGES[currentLanguage][key]) {
      return DEFAULT_MESSAGES[currentLanguage][key];
    }
    
    return DEFAULT_MESSAGES.ko[key] || '';
  } catch (error) {
    console.error('메시지 가져오기 오류:', error);
    return '';
  }
} 