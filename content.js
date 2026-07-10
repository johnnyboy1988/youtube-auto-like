// ============================================
// YOUTUBE AUTO LIKE - CAÇA AO BOTÃO
// ============================================

console.log('%c🎯 YouTube Auto Like ', 'font-size: 16px; font-weight: bold; color: #ff0000;');

// CONFIGURAÇÕES
const LIKE_DELAY = 20000;
const MAX_RETRIES = 30;

// ESTADO
let state = {
    isEnabled: true,
    isLiked: false,
    videoId: null,
    timer: null,
    retryCount: 0,
    foundButtons: []
};

// ============================================
// FUNÇÃO ULTRA AGRESSIVA PARA ENCONTRAR O BOTÃO
// ============================================

function findLikeButton() {
    // console.log('🔍 [CAÇADA] Procurando botão de like...');
    // console.log('📊 Total de botões na página:', document.querySelectorAll('button').length);
    
    // ==========================================
    // ESTRATÉGIA 1: Por aria-label exato
    // ==========================================
    const exactLabels = [
        'Like this video',
        'like this video',
        'Like',
        'like',
        'I like this',
        'Gostei deste vídeo',
        'Me gusta este video',
        'J\'aime cette vidéo',
        'Dieses Video gefällt mir'
    ];
    
    for (const label of exactLabels) {
        const btn = document.querySelector(`button[aria-label="${label}"]`);
        if (btn) {
            // console.log(`✅ Encontrado por aria-label exato: "${label}"`);
            return btn;
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 2: Por aria-label contendo "like"
    // ==========================================
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
        const ariaLabel = btn.getAttribute('aria-label') || '';
        const ariaLabelLower = ariaLabel.toLowerCase();
        
        if (ariaLabelLower.includes('like') && !ariaLabelLower.includes('dislike')) {
            // console.log(`✅ Encontrado por aria-label contendo "like": "${ariaLabel}"`);
            return btn;
        }
        
        // Tenta também em português
        if (ariaLabelLower.includes('gostei') && !ariaLabelLower.includes('não gostei')) {
            // console.log(`✅ Encontrado por aria-label em português: "${ariaLabel}"`);
            return btn;
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 3: Por classe CSS específica
    // ==========================================
    const classSelectors = [
        '.ytd-segmented-like-dislike-button-renderer:first-child button',
        '.ytd-toggle-button-renderer[is-icon-button]:first-child button',
        '.style-scope.ytd-segmented-like-dislike-button-renderer:first-child',
        'button.style-default-active'
    ];
    
    for (const selector of classSelectors) {
        try {
            const btn = document.querySelector(selector);
            if (btn && btn.closest('button')) {
                const button = btn.closest('button') || btn;
                // console.log(`✅ Encontrado por seletor: ${selector}`);
                return button;
            }
        } catch (e) {}
    }
    
    // ==========================================
    // ESTRATÉGIA 4: Por ícone "like"
    // ==========================================
    // Procura por qualquer ícone com "like"
    const iconSelectors = [
        'yt-icon[icon="like"]',
        'yt-icon[icon="like-filled"]',
        'svg[viewBox="0 0 24 24"]'
    ];
    
    for (const selector of iconSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
            // Verifica se o ícone é de like
            const parent = el.closest('button');
            if (parent) {
                const ariaLabel = parent.getAttribute('aria-label') || '';
                if (ariaLabel.toLowerCase().includes('like') || 
                    ariaLabel.toLowerCase().includes('gostei')) {
                    // console.log('✅ Encontrado por ícone + aria-label');
                    return parent;
                }
            }
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 5: Por estrutura do YouTube
    // ==========================================
    const containers = [
        '#top-level-buttons',
        '#actions',
        'ytd-video-primary-info-renderer #actions',
        'ytd-menu-renderer',
        '#menu-container',
        'ytd-watch-metadata'
    ];
    
    for (const container of containers) {
        const el = document.querySelector(container);
        if (el) {
            const btns = el.querySelectorAll('button');
            for (const btn of btns) {
                const ariaLabel = btn.getAttribute('aria-label') || '';
                if (ariaLabel.toLowerCase().includes('like') && 
                    !ariaLabel.toLowerCase().includes('dislike')) {
                    // console.log(`✅ Encontrado no container ${container}`);
                    return btn;
                }
            }
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 6: Por posição (primeiro botão antes do dislike)
    // ==========================================
    const dislikeBtn = document.querySelector('button[aria-label*="dislike" i]');
    if (dislikeBtn) {
        const parent = dislikeBtn.closest('div, ytd-toggle-button-renderer');
        if (parent) {
            const siblings = parent.parentElement?.querySelectorAll('button') || [];
            for (const btn of siblings) {
                const ariaLabel = btn.getAttribute('aria-label') || '';
                if (!ariaLabel.toLowerCase().includes('dislike')) {
                    // console.log('✅ Encontrado por posição (antes do dislike)');
                    return btn;
                }
            }
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 7: Busca por texto "Like" no conteúdo
    // ==========================================
    for (const btn of buttons) {
        const text = btn.textContent || '';
        if ((text === 'Like' || text === 'like' || text === '👍') && 
            !text.includes('Dislike')) {
            // console.log(`✅ Encontrado por texto: "${text}"`);
            return btn;
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 8: Busca por data-tooltip-target-id
    // ==========================================
    const tooltipBtn = document.querySelector('button[data-tooltip-target-id*="like" i]');
    if (tooltipBtn) {
        // console.log('✅ Encontrado por data-tooltip-target-id');
        return tooltipBtn;
    }
    
    // ==========================================
    // ESTRATÉGIA 9: Busca por aria-pressed
    // ==========================================
    for (const btn of buttons) {
        if (btn.getAttribute('aria-pressed') !== null) {
            const ariaLabel = btn.getAttribute('aria-label') || '';
            if (ariaLabel.toLowerCase().includes('like') || 
                ariaLabel.toLowerCase().includes('gostei')) {
                // console.log('✅ Encontrado por aria-pressed');
                return btn;
            }
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 10: Busca por path SVG específico do like
    // ==========================================
    const svgPaths = document.querySelectorAll('svg path');
    for (const path of svgPaths) {
        const d = path.getAttribute('d') || '';
        // Padrão do ícone de like do YouTube (preenchido)
        if (d.includes('M14 9v2h-3v3H9v-3H6V9h3V6h2v3h3z') || 
            d.includes('M14.5 9v2h-3v3h-2v-3h-3V9h3V6h2v3h3z')) {
            const svg = path.closest('svg');
            if (svg) {
                const btn = svg.closest('button');
                if (btn) {
                    // console.log('✅ Encontrado por padrão SVG do like');
                    return btn;
                }
            }
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 11: Busca pelo ícone de like no pseudo-elemento
    // ==========================================
    // Alguns botões usam ::before ou ::after para ícones
    for (const btn of buttons) {
        const style = window.getComputedStyle(btn, '::before');
        const content = style.content || '';
        if (content.includes('like') || content.includes('👍') || content.includes('❤️')) {
            // console.log('✅ Encontrado por pseudo-elemento');
            return btn;
        }
    }
    
    // ==========================================
    // ESTRATÉGIA 12: Busca pelo atributo "title"
    // ==========================================
    for (const btn of buttons) {
        const title = btn.getAttribute('title') || '';
        if (title.toLowerCase().includes('like') && !title.toLowerCase().includes('dislike')) {
            // console.log(`✅ Encontrado por title: "${title}"`);
            return btn;
        }
    }
    
    // ==========================================
    // NENHUMA ESTRATÉGIA FUNCIONOU - DIAGNÓSTICO
    // ==========================================
    //console.log('❌ NENHUMA ESTRATÉGIA ENCONTROU O BOTÃO!');
    //console.log('📋 Diagnóstico completo:');
    diagnosticarPagina();
    
    return null;
}

// ============================================
// DIAGNÓSTICO COMPLETO
// ============================================

function diagnosticarPagina() {
    //console.log('═══════════════════════════════════════');
    //console.log('📋 DIAGNÓSTICO COMPLETO');
    //console.log('═══════════════════════════════════════');
    
    //console.log('1. URL:', window.location.href);
    //console.log('2. Título:', document.title);
    
    // Verifica containers
    //console.log('\n3. CONTAINERS PRINCIPAIS:');
    const containers = ['#top-level-buttons', '#actions', 'ytd-video-primary-info-renderer', 'ytd-menu-renderer', '#menu-container'];
    for (const c of containers) {
        const el = document.querySelector(c);
        //console.log(`   ${c}: ${el ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO'}`);
        if (el) {
            const btns = el.querySelectorAll('button');
            //console.log(`      Botões dentro: ${btns.length}`);
            btns.forEach((b, i) => {
                const label = b.getAttribute('aria-label') || 'sem label';
                //console.log(`      ${i+1}. aria-label="${label}"`);
            });
        }
    }
    
    // Lista TODOS os botões com aria-label
    //console.log('\n4. TODOS OS BOTÕES COM ARIA-LABEL:');
    const btns = document.querySelectorAll('button[aria-label]');
    //console.log(`   Total: ${btns.length}`);
    btns.forEach((b, i) => {
        const label = b.getAttribute('aria-label');
        if (label && label.length < 50) {
            //console.log(`   ${i+1}. "${label}"`);
        } else if (label) {
            //console.log(`   ${i+1}. "${label.substring(0, 50)}..."`);
        }
    });
    
    // Verifica player
    //console.log('\n5. PLAYER:');
    //console.log(`   #movie_player: ${document.querySelector('#movie_player') ? '✅' : '❌'}`);
    //console.log(`   video element: ${document.querySelector('video') ? '✅' : '❌'}`);
    
    // Verifica se tem like no storage
    //console.log('\n6. ESTADO:');
    //console.log(`   Video ID: ${state.videoId}`);
    //console.log(`   Já curtido: ${state.isLiked}`);
    //console.log(`   Tentativas: ${state.retryCount}`);
    
    //console.log('═══════════════════════════════════════');
}

// ============================================
// VERIFICA SE JÁ CURTIU
// ============================================

function isVideoLiked(button) {
    if (!button) return false;
    
    //console.log('🔍 Verificando se já curtido...');
    
    // 1. aria-pressed
    if (button.getAttribute('aria-pressed') === 'true') {
        //console.log('✅ ARIA-PRESSED = TRUE');
        return true;
    }
    
    // 2. classe active
    if (button.classList.contains('style-default-active')) {
        //console.log('✅ CLASSE ACTIVE');
        return true;
    }
    
    // 3. cor do ícone
    const icon = button.querySelector('yt-icon, svg');
    if (icon) {
        const color = window.getComputedStyle(icon).color || '';
        if (color.includes('065fd4') || color.includes('rgb(6, 95, 212)')) {
            //console.log('✅ COR DO ÍCONE AZUL');
            return true;
        }
    }
    
    // 4. ícone preenchido
    const svg = button.querySelector('svg');
    if (svg) {
        const path = svg.querySelector('path');
        if (path) {
            const d = path.getAttribute('d') || '';
            if (d.includes('M14 9v2') || d.includes('M14 9v2h-3v3H9v-3H6V9h3V6h2v3h3z')) {
                //console.log('✅ ÍCONE PREENCHIDO');
                return true;
            }
        }
    }
    
    //console.log('❌ NÃO CURTIDO');
    return false;
}

// ============================================
// DAR LIKE
// ============================================

function giveLike() {
    //console.log('👍 TENTANDO DAR LIKE...');
    
    if (state.isLiked) {
        //console.log('⏭️ Já curtido, ignorando');
        return;
    }
    
    if (!state.isEnabled) {
        //console.log('⏸️ AutoLike desativado');
        return;
    }
    
    const button = findLikeButton();
    
    if (!button) {
        //console.log('❌ Botão não encontrado');
        mostrarMensagem('❌ Botão não encontrado', '#e74c3c');
        
        // Tenta novamente após 2 segundos
        setTimeout(() => {
            //console.log('🔄 Tentando encontrar botão novamente...');
            giveLike();
        }, 2000);
        return;
    }
    
    if (isVideoLiked(button)) {
        state.isLiked = true;
        //console.log('✅ VÍDEO JÁ CURTIDO!');
        mostrarMensagem('❤️ Vídeo já curtido!', '#4CAF50');
        return;
    }
    
    // DÁ LIKE
    try {
        //console.log('🎯 CLICANDO NO BOTÃO...');
        button.click();
        
        // Força o clique com evento
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        button.dispatchEvent(event);
        
        //console.log('✅ CLIQUE EXECUTADO!');
        
        // Verifica se funcionou
        setTimeout(() => {
            if (isVideoLiked(button)) {
                state.isLiked = true;
                //console.log('🎉🎉🎉 LIKE DADO COM SUCESSO! 🎉🎉🎉');
                mostrarMensagem('👍 Like adicionado!', '#065fd4');
                document.querySelector('.auto-like-countdown')?.remove();
            } else {
                //console.log('⚠️ Like pode não ter sido aplicado');
                // Tenta novamente
                setTimeout(giveLike, 3000);
            }
        }, 1500);
        
    } catch (error) {
        //console.log('❌ Erro ao clicar:', error);
    }
}

// ============================================
// MOSTRAR MENSAGEM
// ============================================

function mostrarMensagem(texto, cor = '#065fd4') {
    const old = document.querySelector('.auto-like-message');
    if (old) old.remove();
    
    const div = document.createElement('div');
    div.className = 'auto-like-message';
    div.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: ${cor};
        color: white;
        padding: 14px 24px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        font-size: 15px;
        font-weight: 600;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        animation: slideIn 0.3s ease;
        border: 2px solid rgba(255,255,255,0.2);
    `;
    div.textContent = texto;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.5s';
        setTimeout(() => div.remove(), 500);
    }, 4000);
}

// ============================================
// CONTADOR
// ============================================

function mostrarContador() {
    document.querySelector('.auto-like-countdown')?.remove();
    
    const div = document.createElement('div');
    div.className = 'auto-like-countdown';
    div.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        background: rgba(0,0,0,0.9);
        color: #fff;
        padding: 12px 22px;
        border-radius: 25px;
        font-family: Arial, sans-serif;
        font-size: 15px;
        font-weight: 600;
        z-index: 999999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        border: 2px solid #065fd4;
        animation: slideIn 0.3s ease;
    `;
    div.textContent = `⏱️ Like em ${LIKE_DELAY/1000}s`;
    document.body.appendChild(div);
    
    let segundos = LIKE_DELAY / 1000;
    const interval = setInterval(() => {
        segundos--;
        if (segundos <= 0) {
            clearInterval(interval);
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.5s';
            setTimeout(() => div.remove(), 500);
        } else {
            div.textContent = `⏱️ Like em ${segundos}s`;
        }
    }, 1000);
    
    return interval;
}

// ============================================
// INICIAR PROCESSO
// ============================================

function iniciarProcesso() {
    //console.log('🚀 INICIANDO PROCESSO...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (!videoId) {
        //console.log('❌ Nenhum vídeo encontrado');
        return;
    }
    
    //console.log(`📺 Vídeo ID: ${videoId}`);
    
    if (state.videoId !== videoId) {
        //console.log('🔄 Novo vídeo detectado');
        state.videoId = videoId;
        state.isLiked = false;
        state.retryCount = 0;
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }
    }
    
    if (state.isLiked) {
        //console.log('⏭️ Vídeo já curtido');
        return;
    }
    
    if (!state.isEnabled) {
        //console.log('⏸️ AutoLike desativado');
        return;
    }
    
    // Tenta encontrar o botão
    const button = findLikeButton();
    
    if (!button) {
        if (state.retryCount < MAX_RETRIES) {
            state.retryCount++;
            //console.log(`⏳ Tentativa ${state.retryCount}/${MAX_RETRIES}...`);
            setTimeout(iniciarProcesso, 2000);
            return;
        }
        //console.log('❌ Botão não encontrado após todas as tentativas');
        mostrarMensagem('❌ Botão não encontrado', '#e74c3c');
        return;
    }
    
    // Verifica se já curtido
    if (isVideoLiked(button)) {
        state.isLiked = true;
        //console.log('✅ Vídeo já curtido!');
        mostrarMensagem('❤️ Vídeo já curtido!', '#4CAF50');
        return;
    }
    
    state.retryCount = 0;
    
    // Mostra contador
    state.timer = mostrarContador();
    
    // Agenda like
    setTimeout(() => {
        //console.log('⏰ TEMPO ESGOTADO!');
        giveLike();
    }, LIKE_DELAY);
    
    //console.log(`⏰ Like agendado para ${LIKE_DELAY/1000} segundos`);
}

// ============================================
// MONITORAMENTO DE MUDANÇAS
// ============================================

let ultimaUrl = location.href;

const observer = new MutationObserver(() => {
    const url = location.href;
    if (url !== ultimaUrl && url.includes('/watch')) {
        //console.log(`🔄 URL mudou: ${url}`);
        ultimaUrl = url;
        state.videoId = null;
        state.isLiked = false;
        if (state.timer) {
            clearInterval(state.timer);
            state.timer = null;
        }
        setTimeout(iniciarProcesso, 2000);
    }
});

observer.observe(document, { subtree: true, childList: true });

// ============================================
// MENSAGENS
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    //console.log(`📨 Mensagem: ${message.action}`);
    
    if (message.action === 'toggleAutoLike') {
        state.isEnabled = message.enabled;
        //console.log(`AutoLike ${state.isEnabled ? 'ativado' : 'desativado'}`);
        chrome.storage.local.set({ 'youtube_auto_like_status': state.isEnabled });
        
        if (state.isEnabled) {
            iniciarProcesso();
        } else {
            if (state.timer) {
                clearInterval(state.timer);
                state.timer = null;
            }
            document.querySelector('.auto-like-countdown')?.remove();
        }
        sendResponse({ success: true });
        return true;
    }
    
    if (message.action === 'getStatus') {
        sendResponse({
            enabled: state.isEnabled,
            liked: state.isLiked,
            videoId: state.videoId,
            retryCount: state.retryCount
        });
        return true;
    }
    
    if (message.action === 'manualLike') {
        //console.log('📌 LIKE MANUAL');
        giveLike();
        sendResponse({ success: true });
        return true;
    }
    
    if (message.action === 'diagnose') {
        diagnosticarPagina();
        sendResponse({ success: true });
        return true;
    }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

// Adiciona CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .auto-like-message, .auto-like-countdown {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

// Carrega configuração
chrome.storage.local.get('youtube_auto_like_status', (result) => {
    if (result.youtube_auto_like_status !== undefined) {
        state.isEnabled = result.youtube_auto_like_status;
    }
    //console.log(`⚙️ Config: ${state.isEnabled ? 'ATIVADO' : 'DESATIVADO'}`);
    
    if (window.location.href.includes('/watch')) {
        //console.log('🎬 Vídeo detectado!');
        setTimeout(iniciarProcesso, 3000);
    } else {
        //console.log('📄 Aguardando vídeo...');
    }
});

// Comandos no console
window.autoLike = {
    start: iniciarProcesso,
    find: findLikeButton,
    diagnose: diagnosticarPagina,
    status: () => console.log('Estado:', state),
    like: giveLike
};

// console.log('✅ AutoLike carregado!');
// console.log('💡 Comandos:');
// console.log('  autoLike.start()    - Iniciar');
// console.log('  autoLike.find()     - Procurar botão');
// console.log('  autoLike.diagnose() - Diagnóstico');
// console.log('  autoLike.like()     - Dar like agora');