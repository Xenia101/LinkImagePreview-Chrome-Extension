const messages = {
  ko: {
    appName: '이미지링크 프리뷰',
    appDesc: '이미지 URL에 마우스를 오버하면 미리보기가 표시됩니다',
    popupTitle: '이미지링크 프리뷰 설정',
    enableExtension: '확장 프로그램 활성화',
    disableExtension: '확장 프로그램 비활성화',
    status: '현재 상태:',
    statusEnabled: '활성화됨',
    statusDisabled: '비활성화됨',
    languageSelect: '언어 선택',
    languageKo: '한국어',
    languageEn: 'English',
    languageJa: '日本語',
    languageZh_CN: '中文',
    loading: '로딩 중...',
    loadError: '이미지를 불러올 수 없습니다',
    excludedSitesTitle: '제외할 사이트',
    enterDomain: 'example.com 또는 *.example.com',
    addButton: '추가',
    excludedSitesHelp: '특정 사이트에서 확장 프로그램이 작동하지 않게 하려면 도메인을 추가하세요. 와일드카드 패턴(*.example.com)도 지원합니다.',
    noExcludedSites: '제외된 사이트가 없습니다',
    maxUrlsTitle: '최대 URL 개수',
    maxUrlsHelp: '페이지에서 처리할 이미지 URL의 최대 개수를 설정합니다. 값이 낮을수록 성능이 향상되지만 표시되는 이미지 URL이 제한됩니다.'
  },
  en: {
    appName: 'Image Link Preview',
    appDesc: 'Displays image previews when hovering over image URLs',
    popupTitle: 'Image Link Preview Settings',
    enableExtension: 'Enable Extension',
    disableExtension: 'Disable Extension',
    status: 'Current status:',
    statusEnabled: 'Enabled',
    statusDisabled: 'Disabled',
    languageSelect: 'Select Language',
    languageKo: 'Korean',
    languageEn: 'English',
    languageJa: 'Japanese',
    languageZh_CN: 'Chinese',
    loading: 'Loading...',
    loadError: 'Unable to load image',
    excludedSitesTitle: 'Excluded Sites',
    enterDomain: 'example.com or *.example.com',
    addButton: 'Add',
    excludedSitesHelp: 'Add domains where the extension should not run. Wildcard patterns (*.example.com) are also supported.',
    noExcludedSites: 'No excluded sites',
    maxUrlsTitle: 'Maximum URLs',
    maxUrlsHelp: 'Set the maximum number of image URLs to process on a page. Lower values improve performance but limit displayed image URLs.'
  },
  ja: {
    appName: 'イメージリンクプレビュー',
    appDesc: '画像URLにマウスを合わせると、プレビューとサイズが表示されます',
    popupTitle: 'イメージリンクプレビュー設定',
    enableExtension: '拡張機能を有効にする',
    disableExtension: '拡張機能を無効にする',
    status: '現在の状態:',
    statusEnabled: '有効',
    statusDisabled: '無効',
    languageSelect: '言語選択',
    languageKo: '韓国語',
    languageEn: '英語',
    languageJa: '日本語',
    languageZh_CN: '中国語',
    loading: '読み込み中...',
    loadError: '画像を読み込めません',
    excludedSitesTitle: '除外サイト',
    enterDomain: 'example.com または *.example.com',
    addButton: '追加',
    excludedSitesHelp: '拡張機能を実行しないドメインを追加します。ワイルドカードパターン(*.example.com)もサポートしています。',
    noExcludedSites: '除外サイトはありません',
    maxUrlsTitle: '最大URL数',
    maxUrlsHelp: 'ページで処理する画像URLの最大数を設定します。値が低いほどパフォーマンスが向上しますが、表示される画像URLが制限されます。'
  },
  zh_CN: {
    appName: '图像链接预览',
    appDesc: '悬停在图像URL上时显示预览和尺寸',
    popupTitle: '图像链接预览设置',
    enableExtension: '启用扩展程序',
    disableExtension: '禁用扩展程序',
    status: '当前状态:',
    statusEnabled: '已启用',
    statusDisabled: '已禁用',
    languageSelect: '选择语言',
    languageKo: '韩语',
    languageEn: '英语',
    languageJa: '日语',
    languageZh_CN: '中文',
    loading: '加载中...',
    loadError: '无法加载图像',
    excludedSitesTitle: '排除网站',
    enterDomain: 'example.com 或 *.example.com',
    addButton: '添加',
    excludedSitesHelp: '添加不应运行扩展程序的域名。也支持通配符模式(*.example.com)。',
    noExcludedSites: '没有排除的网站',
    maxUrlsTitle: '最大URL数量',
    maxUrlsHelp: '设置页面上处理的图像URL的最大数量。较低的值可提高性能，但会限制显示的图像URL。'
  },
};

window.getLocalizedMessage = function (key, language) {
  if (messages[language] && messages[language][key]) {
    return messages[language][key];
  }

  if (messages.ko[key]) {
    return messages.ko[key];
  }

  return key;
};

window.applyI18nMessages = function (language) {
  console.log('메시지 적용 중:', language);
  const elements = document.querySelectorAll('[data-i18n]');

  elements.forEach(function (element) {
    const messageKey = element.getAttribute('data-i18n');
    const translatedMessage = window.getLocalizedMessage(messageKey, language);

    console.log('메시지 키:', messageKey, '번역:', translatedMessage);

    if (translatedMessage) {
      element.textContent = translatedMessage;
    } else {
      console.warn('번역을 찾을 수 없음:', messageKey);
    }
  });
  
  // 플레이스홀더 번역 추가
  const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
  placeholderElements.forEach(function(element) {
    const placeholderKey = element.getAttribute('data-i18n-placeholder');
    const translatedPlaceholder = window.getLocalizedMessage(placeholderKey, language);
    
    if (translatedPlaceholder) {
      element.placeholder = translatedPlaceholder;
    }
  });

  document.documentElement.lang = language;

  const titleMessage = window.getLocalizedMessage('popupTitle', language);
  if (titleMessage) {
    document.title = titleMessage;
  }
};

document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.sync.get(['language', 'enabled'], function (data) {
    const currentLanguage = data.language || 'ko';
    console.log('현재 언어 설정:', currentLanguage);

    window.applyI18nMessages(currentLanguage);

    const statusText = document.getElementById('statusText');
    if (statusText) {
      const isEnabled = data.enabled !== undefined ? data.enabled : true;
      const statusKey = isEnabled ? 'statusEnabled' : 'statusDisabled';
      statusText.textContent = window.getLocalizedMessage(statusKey, currentLanguage);
      statusText.style.color = isEnabled ? '#4CAF50' : '#F44336';
    }
  });
}); 