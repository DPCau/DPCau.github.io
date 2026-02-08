// 公共主题和语言配置脚本
// 用于index.html和about.html的复用

// 全局翻译对象
let translations = {};

// 保存页面原始内容
let originalContent = {};

// 主题相关函数

// 在页面加载前就检查并应用主题，避免闪烁
(function() {
    // 检查localStorage中的主题偏好
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 设置初始主题类
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
    } else if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
    } else {
        // auto模式或没有保存的主题时，根据系统设置应用主题
        if (prefersDark) {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.add('light-theme');
        }
    }
})();

// 更新主题显示
function updateThemeDisplay(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeText = document.getElementById('theme-text');
    const themeToggle = document.getElementById('themeToggle');
    
    // 更新SVG图标显示（针对about.html）
    if (themeToggle) {
        const sunIcon = themeToggle.querySelector('.sun-icon');
        const moonIcon = themeToggle.querySelector('.moon-icon');
        const autoIcon = themeToggle.querySelector('.auto-icon');
        
        // 移除所有active类
        if (sunIcon) sunIcon.classList.remove('active');
        if (moonIcon) moonIcon.classList.remove('active');
        if (autoIcon) autoIcon.classList.remove('active');
        
        // 根据当前主题添加active类
        if (theme === 'light') {
            if (sunIcon) sunIcon.classList.add('active');
        } else if (theme === 'dark') {
            if (moonIcon) moonIcon.classList.add('active');
        } else {
            if (autoIcon) autoIcon.classList.add('active');
        }
    }
    
    // 更新文本和emoji图标（针对index.html）
    if (themeIcon && themeText) {
        if (theme === 'dark') {
            themeIcon.textContent = '🌙';
            themeText.textContent = '深色模式';
        } else if (theme === 'light') {
            themeIcon.textContent = '☀️';
            themeText.textContent = '浅色模式';
        } else {
            themeIcon.textContent = '⚙️';
            themeText.textContent = '跟随系统';
        }
    }
}

// 根据系统主题更新
function updateThemeBySystem() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'auto' || !savedTheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.classList.add('dark-theme');
            document.documentElement.classList.remove('light-theme');
        } else {
            document.documentElement.classList.add('light-theme');
            document.documentElement.classList.remove('dark-theme');
        }
    }
}

// 初始化主题显示
function initThemeDisplay() {
    const savedTheme = localStorage.getItem('theme');
    
    // 监听系统主题变化
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', updateThemeBySystem);
    
    if (savedTheme) {
        updateThemeDisplay(savedTheme);
    } else {
        updateThemeDisplay('auto');
    }
}

// 切换主题
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme');
    let nextTheme;
    
    if (currentTheme === 'dark') {
        nextTheme = 'light';
    } else if (currentTheme === 'light') {
        nextTheme = 'auto';
    } else {
        nextTheme = 'dark';
    }
    
    localStorage.setItem('theme', nextTheme);
    
    // 应用新主题
    if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
    } else if (nextTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
    } else {
        updateThemeBySystem();
    }
    
    updateThemeDisplay(nextTheme);
}

// 语言配置相关函数

// 加载语言配置文件
async function loadLanguageConfig(lang) {
    try {
        // 根据页面路径确定正确的翻译文件路径
        const basePath = window.location.pathname.includes('/pages/') ? '../locales/' : 'locales/';
        const response = await fetch(`${basePath}${lang}.json`);
        if (response.ok) {
            return await response.json();
        } else {
            console.warn(`Language file for ${lang} not found`);
        }
    } catch (error) {
        console.error(`Error loading language file for ${lang}:`, error);
    }
    
    // 如果加载失败，返回空对象
    return {};
}

// 系统语言偏好检测
function getSystemLanguage() {
    // 获取浏览器的语言偏好
    const browserLang = navigator.language || navigator.userLanguage;
    
    // 如果是中文相关的语言代码，返回相应的语言
    if (browserLang.startsWith('zh')) {
        // 检测是否是繁体中文
        if (browserLang.includes('TW') || browserLang.includes('tw') || browserLang.includes('HK') || browserLang.includes('hk')) {
            return 'zh-tw';
        } else {
            return 'zh';
        }
    }
    
    // 如果不是支持的语言，返回中文
    return 'zh';
}

// 获取当前语言设置
function getCurrentLanguage() {
    const savedLang = localStorage.getItem('language');
    
    // 如果保存的是'auto'或没有保存，则使用系统语言
    if (savedLang === 'auto' || !savedLang) {
        return getSystemLanguage();
    }
    
    return savedLang;
}

// 切换语言
async function changeLanguage(lang) {
    // 支持'auto'、'zh'、'zh-tw'、'en'和'wyw'五种选项
    if (['auto', 'zh', 'zh-tw', 'en', 'wyw'].includes(lang)) {
        localStorage.setItem('language', lang);
        
        // 如果是自动模式，获取系统语言
        const currentLang = lang === 'auto' ? getSystemLanguage() : lang;
        
        // 加载语言配置
        if (currentLang !== 'zh') {
            translations[currentLang] = await loadLanguageConfig(currentLang);
        }
        
        applyTranslation(currentLang);
        
        // 更新语言下拉框的选中状态
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.value = lang;
            
            // 调整下拉框宽度以匹配新选中的选项
            adjustLanguageSelectWidth();
        }
        
        // 移除或添加AI翻译标注（根据当前语言）
        const existingNote = document.querySelector('div[style*="text-align: center"]');
        if (existingNote) {
            existingNote.remove();
        }
        // 文言文不添加AI翻译标注
        if (currentLang !== 'zh' && currentLang !== 'zh-tw' && currentLang !== 'wyw') {
            addAITranslationNote();
        }
        
        // 语言切换后触发通知检查（如果页面定义了该函数）
        if (typeof checkNotification === 'function') {
            checkNotification();
        }
    }
}

// 应用翻译
function applyTranslation(lang) {
    // 简体中文：恢复页面原始内容
    if (lang === 'zh') {
        // 恢复页面原始内容
        if (Object.keys(originalContent).length > 0) {
            // 恢复页面标题（通过data-translate-key属性）
            const titleElement = document.querySelector('title[data-translate-key]');
            if (titleElement) {
                const key = titleElement.getAttribute('data-translate-key');
                if (originalContent[key] !== undefined) {
                    document.title = originalContent[key];
                }
            } else {
                // 兼容旧版本：直接使用pageTitle
                document.title = originalContent.pageTitle;
            }
            
            // 自动恢复所有带有data-translate-key属性的元素
            const elements = document.querySelectorAll('[data-translate-key]');
            elements.forEach(element => {
                const key = element.getAttribute('data-translate-key');
                if (originalContent[key] !== undefined) {
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = originalContent[key];
                    } else if (element.hasAttribute('aria-label')) {
                        element.setAttribute('aria-label', originalContent[key]);
                    } else {
                        const mode = element.getAttribute('data-translate-mode');
                        if (mode === 'html') {
                            element.innerHTML = originalContent[key];
                        } else {
                            element.textContent = originalContent[key];
                        }
                    }
                }
            });
        }
        
        // 更新搜索框占位符（仅当页面实现了该函数）
        if (typeof updateSearchPlaceholder === 'function') {
            updateSearchPlaceholder();
        }
        
        // 根据当前UI语言统一更新“自动”选项的文本
        updateAutoOptionText();
        return;
    }
    
    // 其他语言：使用外部配置文件
    const translation = translations[lang];
    if (translation) {
        // 自动翻译所有带有data-translate-key属性的元素
        const elements = document.querySelectorAll('[data-translate-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate-key');
            if (translation[key] !== undefined) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = translation[key];
                } else if (element.hasAttribute('aria-label')) {
                    element.setAttribute('aria-label', translation[key]);
                } else {
                    const mode = element.getAttribute('data-translate-mode');
                    if (mode === 'html') {
                        element.innerHTML = translation[key];
                    } else {
                        element.textContent = translation[key];
                    }
                }
            }
        });
        
        // 特殊处理页面标题（通过data-translate-key属性）
        const titleElement = document.querySelector('title[data-translate-key]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-translate-key');
            if (translation[key] !== undefined) {
                document.title = translation[key];
            }
        } else {
            // 兼容旧版本：使用硬编码的页面标题逻辑
            const defaultTitle = window.location.pathname.includes('/pages/') ? '关于 About' : '地址发布页 Address Page';
            document.title = translation['page_title'] || defaultTitle;
        }
        
        // 更新搜索框占位符（仅当页面实现了该函数）
        if (typeof updateSearchPlaceholder === 'function') {
            updateSearchPlaceholder();
        }
        
        // 根据当前UI语言统一更新“自动”选项的文本
        updateAutoOptionText();
    }
}

// 初始化语言配置
async function initializeTranslations() {
    const currentLang = getCurrentLanguage();
    
    // 加载当前语言配置
    translations[currentLang] = await loadLanguageConfig(currentLang);
    
    // 简体中文使用页面原始内容，不加载外部配置
    if (currentLang === 'zh') {
        // 简体中文使用页面原始内容，translations['zh']保持为空
        // 这样applyTranslation函数会使用页面原始内容
    }
    
    // 应用翻译
    applyTranslation(currentLang);
}

// 调整语言选择下拉框宽度以匹配当前选中选项的宽度
function adjustLanguageSelectWidth() {
    const select = document.getElementById('language-select');
    const wrapper = select.parentElement;
    
    // 检查是否已经存在副本元素，如果不存在则创建
    let copy = wrapper.querySelector('.language-select-copy');
    if (!copy) {
        copy = document.createElement('div');
        copy.className = 'language-select-copy';
        wrapper.appendChild(copy);
    }
    
    // 获取当前选中选项的文本
    const selectedText = select.options[select.selectedIndex].text;
    
    // 设置副本文本以测量宽度
    copy.textContent = selectedText;
    
    // 测量副本元素的宽度并设置给下拉框
    const width = copy.offsetWidth;
    select.style.width = (width + 10) + 'px'; // 添加一些额外空间
}

// 统一更新语言选择器中“自动”选项的文本，使其随UI语言变化
function updateAutoOptionText() {
    const languageSelect = document.getElementById('language-select');
    if (!languageSelect) return;
    
    // UI语言以用户选择为准（localStorage）
    const savedLang = localStorage.getItem('language') || 'auto';
    const systemLang = getSystemLanguage();
    
    // 系统语言显示名称，随UI语言变化
    let systemLangName = '简体中文';
    if (savedLang === 'zh') {
        systemLangName = systemLang === 'zh' ? '简体中文' : (systemLang === 'zh-tw' ? '繁體中文' : 'English');
    } else {
        const uiTranslation = translations[savedLang] || {};
        systemLangName = systemLang === 'zh' ? (uiTranslation['language_zh'] || '简体中文') :
                         systemLang === 'zh-tw' ? (uiTranslation['language_zh_tw'] || '繁體中文') :
                         (uiTranslation['language_en'] || 'English');
    }
    
    // “自动”文本本身，随UI语言变化
    let autoLabel = '自动';
    if (savedLang === 'en') {
        autoLabel = (translations['en'] && translations['en']['auto_language']) || 'auto';
    } else if (savedLang === 'zh-tw') {
        autoLabel = (translations['zh-tw'] && translations['zh-tw']['auto_language']) || '自動';
    } else if (savedLang === 'wyw') {
        autoLabel = (translations['wyw'] && translations['wyw']['auto_language']) || '自動';
    } else {
        autoLabel = '自动';
    }
    
    languageSelect.options[0].text = `${autoLabel} (${systemLangName})`;
    
    // 保持当前选中的语言不变
    const currentValue = languageSelect.value;
    languageSelect.value = currentValue;
    
    // 宽度调整以适配新文本
    adjustLanguageSelectWidth();
}

// 保存页面原始内容
function saveOriginalContent() {
    originalContent = {};
    
    // 保存页面标题（通过data-translate-key属性）
    const titleElement = document.querySelector('title[data-translate-key]');
    if (titleElement) {
        const key = titleElement.getAttribute('data-translate-key');
        originalContent[key] = document.title;
    } else {
        // 兼容旧版本：直接保存pageTitle
        originalContent.pageTitle = document.title;
    }
    
    // 自动保存所有带有data-translate-key属性的元素的原始内容
    const elements = document.querySelectorAll('[data-translate-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate-key');
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            originalContent[key] = element.value;
        } else if (element.hasAttribute('aria-label')) {
            originalContent[key] = element.getAttribute('aria-label');
        } else {
            const mode = element.getAttribute('data-translate-mode');
            originalContent[key] = mode === 'html' ? element.innerHTML : element.textContent;
        }
    });
}

// 处理语言选择变化
function handleLanguageChange(lang) {
    if (['auto', 'zh', 'zh-tw', 'en', 'wyw'].includes(lang)) {
        changeLanguage(lang);
    }
}

// AI翻译标注函数（需要页面特定实现）
function addAITranslationNote() {
    // 这个函数需要页面特定实现，因为标注的位置和样式可能不同
    // 在common.js中只定义空函数，具体实现在各个页面中
}