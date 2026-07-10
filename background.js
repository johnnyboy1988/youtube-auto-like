// Service Worker simples
console.log('🎯 YouTube Auto Like - Background');

chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ Extensão instalada!');
});

// Listener para mensagens
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getStatus') {
        chrome.storage.local.get('youtube_auto_like_status', (result) => {
            sendResponse({
                enabled: result.youtube_auto_like_status !== false
            });
        });
        return true;
    }
});