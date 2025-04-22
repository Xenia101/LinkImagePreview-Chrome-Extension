let isExtensionEnabled = true;
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

function initializeExtension() {
  try {
    if (!isExtensionContextValid()) {
      console.warn('Extension context may be invalid');
      return;
    }

    chrome.storage.sync.get(['enabled', 'language'], (data) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.error('Extension error:', chrome.runtime.lastError);
        return;
      }

      isExtensionEnabled = data.enabled !== undefined ? data.enabled : true;
      currentLanguage = data.language || 'ko';

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

      if (isExtensionEnabled) {
        findAndProcessUrls();
      }
    } else if (message.action === 'updateLanguage') {
      currentLanguage = message.language || 'ko';
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
      if (isExtensionEnabled) {
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
  if (!isExtensionEnabled) return;

  try {
    const textNodes = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while ((node = walk.nextNode())) {
      textNodes.push(node);
    }

    textNodes.forEach((textNode) => {
      try {
        if (!textNode || !textNode.parentNode) return;
        
        const parent = textNode.parentNode;

        if (parent.classList && parent.classList.contains('url-processed')) {
          return;
        }

        const text = textNode.nodeValue;
        if (!text) return;

        const urlRegex =
          /(https?:\/\/(?:(?:[^\s]+\.(jpg|png|gif|jpeg|webp)(?:\?[^\s]*)?)|(?:placehold\.co\/[^\s]+)|(?:placekitten\.com\/[^\s]+)|(?:picsum\.photos\/[^\s]+)|(?:loremflickr\.com\/[^\s]+)))/gi;

        let match;
        let lastIndex = 0;
        let fragment = document.createDocumentFragment();

        while ((match = urlRegex.exec(text)) !== null) {
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
        }

        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        if (lastIndex > 0 && parent.parentNode) {
          parent.replaceChild(fragment, textNode);
        }
      } catch (nodeError) {
        console.error('텍스트 노드 처리 오류:', nodeError);
      }
    });
  } catch (error) {
    console.error('URL 처리 오류:', error);
  }
}

function getContentMessage(key) {
  return new Promise((resolve) => {
    try {
      if (!isExtensionContextValid()) {
        const defaultLang = currentLanguage || 'ko';
        resolve(DEFAULT_MESSAGES[defaultLang]?.[key] || DEFAULT_MESSAGES.ko[key] || key);
        return;
      }

      chrome.storage.sync.get('language', function (data) {
        try {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn('Storage get error:', chrome.runtime.lastError);
            resolve(DEFAULT_MESSAGES[currentLanguage]?.[key] || DEFAULT_MESSAGES.ko[key] || key);
            return;
          }

          const lang = data.language || currentLanguage || 'ko';
          
          if (DEFAULT_MESSAGES[lang] && DEFAULT_MESSAGES[lang][key]) {
            resolve(DEFAULT_MESSAGES[lang][key]);
          } else if (DEFAULT_MESSAGES.ko[key]) {
            resolve(DEFAULT_MESSAGES.ko[key]);
          } else {
            resolve(key);
          }
        } catch (innerError) {
          console.error('Message retrieval inner error:', innerError);
          resolve(DEFAULT_MESSAGES.ko[key] || key);
        }
      });
    } catch (error) {
      console.error('Message retrieval error:', error);
      resolve(DEFAULT_MESSAGES.ko[key] || key);
    }
  });
}

async function showPreview(event) {
  if (!isExtensionEnabled) return;

  try {
    const url = event.target.dataset.imageUrl;
    if (!url) return;

    let preview = document.getElementById('lip-image-preview-popup');
    if (!preview) {
      preview = document.createElement('div');
      preview.id = 'lip-image-preview-popup';
      document.body.appendChild(preview);
    }

    let loadingMessage;
    try {
      loadingMessage = await getContentMessage('loading');
    } catch (error) {
      loadingMessage = '로딩 중...';
      console.error('Failed to get loading message:', error);
    }
    
    preview.innerHTML = `<div class="loading">${loadingMessage}</div>`;
    positionPreview(event, preview);

    const img = new Image();
    
    img.onload = function () {
      try {
        if (!document.body.contains(preview)) return;
        
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        preview.innerHTML = '';
        preview.appendChild(img);

        const maxWidth = Math.min(500, window.innerWidth / 2);
        const maxHeight = Math.min(400, window.innerHeight / 2);

        if (img.width > maxWidth || img.height > maxHeight) {
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
          img.width = img.width * ratio;
          img.height = img.height * ratio;
        }

        (async function addSizeInfo() {
          try {
            if (!document.body.contains(preview)) return;
            if (preview.querySelector('.lip-image-size-info')) return;
            
            const sizeTemplate = await getContentMessage('imageSize');
            const sizeText = sizeTemplate.replace('%w', originalWidth).replace('%h', originalHeight);

            const sizeInfo = document.createElement('div');
            sizeInfo.className = 'lip-image-size-info';
            sizeInfo.textContent = sizeText;
            sizeInfo.style.textAlign = 'center';
            sizeInfo.style.padding = '5px';
            sizeInfo.style.backgroundColor = 'rgb(43, 205, 211)';
            sizeInfo.style.color = 'white';
            sizeInfo.style.fontSize = '12px';

            if (document.body.contains(preview)) {
              preview.appendChild(sizeInfo);
              positionPreview(event, preview);
            }
          } catch (error) {
            console.error('이미지 크기 정보 표시 오류:', error);
          }
        })();
      } catch (error) {
        console.error('이미지 로드 완료 처리 오류:', error);
      }
    };

    img.onerror = async function () {
      try {
        if (!document.body.contains(preview)) return;
        
        let errorMessage;
        try {
          errorMessage = await getContentMessage('loadError');
        } catch (err) {
          errorMessage = '이미지를 불러올 수 없습니다';
        }
        
        preview.innerHTML = `<div class="error">${errorMessage}</div>`;
      } catch (error) {
        console.error('이미지 로드 오류 처리 실패:', error);
      }
    };

    img.src = url;
  } catch (error) {
    console.error('미리보기 표시 오류:', error);
  }
}

function positionPreview(event, preview) {
  try {
    if (!event || !event.target || !preview || !document.body.contains(preview)) return;
    
    const rect = event.target.getBoundingClientRect();

    let left = event.clientX;
    let top = rect.bottom + window.scrollY;

    const previewWidth = preview.offsetWidth;
    const previewHeight = preview.offsetHeight;

    if (left + previewWidth > window.innerWidth + window.scrollX) {
      left = window.innerWidth + window.scrollX - previewWidth - 10;
    }

    if (top + previewHeight > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - previewHeight - 10;
    }

    preview.style.left = left + 'px';
    preview.style.top = top + 'px';
  } catch (error) {
    console.error('미리보기 위치 설정 오류:', error);
  }
}

function hidePreview() {
  try {
    const preview = document.getElementById('lip-image-preview-popup');
    if (preview && document.body.contains(preview)) {
      document.body.removeChild(preview);
    }
  } catch (error) {
    console.error('미리보기 숨기기 오류:', error);
  }
}

