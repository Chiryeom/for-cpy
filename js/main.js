/**
 * 乙女游戏角色收藏网站 - 主交互逻辑重构版
 */

// 当前状态
let currentCharacter = null;
let currentFlipCharacter = null;
let userName = "";
let userNickname = "";

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    setupScrollHint();
    setupKeyboardEvents();
    
    // 延迟显示登录弹窗
    setTimeout(() => {
        openModal('loginModal');
    }, 500);
});

/**
 * 登录功能
 */
function confirmLogin() {
    userName = document.getElementById('userName').value || "游客";
    userNickname = document.getElementById('userNickname').value || "亲爱的";
    
    // 更新欢迎词
    const welcomeText = document.getElementById('welcomeText');
    welcomeText.textContent = `${userNickname}，欢迎回来。请选择你要翻的牌子吧~`;
    
    closeModal('loginModal');
}

function closeLogin() {
    confirmLogin(); // 即使点叉也执行默认登录
}

/**
 * 弹窗控制
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // 如果是详情页，重置抽取结果
        if (modalId === 'characterDetailModal') {
            document.getElementById('drawResult').style.display = 'none';
            document.getElementById('resultImageContainer').style.display = 'none';
            document.getElementById('resultQuoteContainer').style.display = 'none';
        }
    }
}

/**
 * 翻牌子功能
 */
function flipCard() {
    if (!characters || characters.length === 0) return;
    
    // 随机选择角色
    const randomIndex = Math.floor(Math.random() * characters.length);
    currentFlipCharacter = characters[randomIndex];
    
    // 重置翻牌状态
    const cardFlip = document.getElementById('cardFlip');
    const flipResultInfo = document.getElementById('flipResultInfo');
    cardFlip.classList.remove('flipped');
    flipResultInfo.style.display = 'none';
    
    // 设置名字
    document.getElementById('flipResultName').textContent = currentFlipCharacter.name;
    
    openModal('flipModal');
    
    // 延迟执行翻转
    setTimeout(() => {
        cardFlip.classList.add('flipped');
        setTimeout(() => {
            flipResultInfo.style.display = 'block';
        }, 800);
    }, 500);
}

/**
 * 进入角色详情页 (从翻牌子进入)
 */
function enterCharacterDetail() {
    currentCharacter = currentFlipCharacter;
    closeModal('flipModal');
    
    document.getElementById('detailCharName').textContent = currentCharacter.name;
    
    // 重置心形
    const heartBtn = document.getElementById('heartBtn');
    heartBtn.querySelector('.empty').style.display = 'inline';
    heartBtn.querySelector('.filled').style.display = 'none';
    
    openModal('characterDetailModal');
}

/**
 * 抽取图片 (从所有思绪/邀请函文件夹中随机抽取)
 */
function drawImage() {
    if (!currentCharacter || !currentCharacter.cards) return;
    
    // 随机选择一个文件夹(思绪)
    const randomCard = currentCharacter.cards[Math.floor(Math.random() * currentCharacter.cards.length)];
    // 从该文件夹中随机选择一张图
    const randomImg = randomCard.images[Math.floor(Math.random() * randomCard.images.length)];
    
    const drawResult = document.getElementById('drawResult');
    const resultImageContainer = document.getElementById('resultImageContainer');
    const resultQuoteContainer = document.getElementById('resultQuoteContainer');
    const resultImage = document.getElementById('resultImage');
    
    resultImage.src = randomImg;
    resultImage.onclick = () => previewImage(randomImg);
    
    // 显示结果
    drawResult.style.display = 'flex';
    resultImageContainer.style.display = 'block';
    resultQuoteContainer.style.display = 'none';
    
    // 动画
    drawResult.style.opacity = '0';
    setTimeout(() => {
        drawResult.style.opacity = '1';
        drawResult.style.transition = 'opacity 0.5s';
    }, 50);
}

/**
 * 抽取文字 (从台词库中随机抽取)
 */
function drawQuoteAndVoice() {
    if (!currentCharacter || !currentCharacter.quotes) return;
    
    const drawResult = document.getElementById('drawResult');
    const resultImageContainer = document.getElementById('resultImageContainer');
    const resultQuoteContainer = document.getElementById('resultQuoteContainer');
    const resultQuote = document.getElementById('resultQuote');
    
    // 随机选择台词
    const randomQuote = currentCharacter.quotes[Math.floor(Math.random() * currentCharacter.quotes.length)];
    resultQuote.textContent = `「${randomQuote}」`;
    
    // 显示结果
    drawResult.style.display = 'flex';
    resultImageContainer.style.display = 'none';
    resultQuoteContainer.style.display = 'flex';
    
    // 动画
    drawResult.style.opacity = '0';
    setTimeout(() => {
        drawResult.style.opacity = '1';
        drawResult.style.transition = 'opacity 0.5s';
    }, 50);
}

/**
 * 心形按钮切换
 */
function toggleHeart() {
    const heartBtn = document.getElementById('heartBtn');
    const empty = heartBtn.querySelector('.empty');
    const filled = heartBtn.querySelector('.filled');
    
    if (empty.style.display !== 'none') {
        empty.style.display = 'none';
        filled.style.display = 'inline';
        filled.style.color = '#ff8fab';
    } else {
        empty.style.display = 'inline';
        filled.style.display = 'none';
    }
}

/**
 * 亲自选择功能
 */
function showAllCharacters() {
    const list = document.getElementById('charactersNameList');
    list.innerHTML = characters.map(c => `
        <div class="name-item" onclick="viewFullCharacter(${c.id})">${c.name}</div>
    `).join('');
    
    openModal('charactersModal');
}

/**
 * 查看角色所有内容 (按文件夹整理展示)
 */
function viewFullCharacter(id) {
    const char = characters.find(c => c.id === id);
    if (!char) return;
    
    closeModal('charactersModal');
    
    document.getElementById('fullCharName').textContent = char.name;
    
    // 生成画廊 (按卡片/思绪文件夹分组)
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = char.cards.map(card => `
        <div class="card-group" style="grid-column: 1 / -1; margin-top: 20px; border-bottom: 2px solid #ffc2d1; padding-bottom: 10px;">
            <h3 style="color: #fb6f92;">◈ ${card.name} ◈</h3>
        </div>
        ${card.images.map(img => `
            <img src="${img}" class="gallery-img" onclick="previewImage('${img}')" onerror="this.src='assets/images/placeholder.svg'">
        `).join('')}
    `).join('');
    
    // 台词列表
    const quotesList = document.getElementById('quotesList');
    quotesList.innerHTML = char.quotes.map(q => `
        <div class="quote-item">${q}</div>
    `).join('');
    
    openModal('characterFullModal');
}

/**
 * 今日运势
 */
function showFortune() {
    const drawArea = document.getElementById('fortuneDrawArea');
    const resultArea = document.getElementById('fortuneResult');
    
    drawArea.style.display = 'flex';
    resultArea.style.display = 'none';
    
    openModal('fortuneModal');
    
    setTimeout(() => {
        generateFortuneContent();
        drawArea.style.display = 'none';
        resultArea.style.display = 'block';
    }, 2000);
}

const fortuneLevels = ['大吉', '中吉', '小吉', '吉', '末吉'];
const fortuneMsgs = [
    "这是一个承诺，一份约定，也是我对余生最真诚的期许。",
    "如果我们的人生也是一部电影，我想注定会发生的事只有一件。所有情节中，只有我们的相爱有迹可循。",
    "夕阳下的大海……美丽得有些不真实……也浪漫得有些不像话。",
    "就算我们被撕成碎片，也会有无数相同志向的同类，去完成这段未尽的旅程。最后，终有人会抵达彼方。",
    "但如果真的能预见结局，我希望自己能搭上一辆循环的列车，带着答案回来见现在的你...",
    "会有意想不到的小惊喜在等着你哦。",
    "平稳而温馨的一天，享受当下的宁静吧。",
    "保持微笑，好运自然会降临在你身边。"
];

function generateFortuneContent() {
    const level = fortuneLevels[Math.floor(Math.random() * fortuneLevels.length)];
    const msg = fortuneMsgs[Math.floor(Math.random() * fortuneMsgs.length)];
    const char = characters[Math.floor(Math.random() * characters.length)];
    
    document.getElementById('fortuneLevel').textContent = level;
    document.getElementById('fortuneCharImage').src = char.image;
    document.getElementById('fortuneCharName').textContent = char.name;
    document.getElementById('fortuneMessage').textContent = msg;
}

function regenerateFortune() {
    showFortune();
}

/**
 * 图片预览
 */
function previewImage(src) {
    const fullPreviewImage = document.getElementById('fullPreviewImage');
    fullPreviewImage.src = src;
    openModal('imagePreviewModal');
}

/**
 * 基础辅助函数
 */
function setupScrollHint() {
    const hint = document.querySelector('.scroll-hint');
    if (hint) {
        hint.addEventListener('click', () => {
            document.getElementById('mainSection').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

function setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(m => closeModal(m.id));
        }
    });
}
