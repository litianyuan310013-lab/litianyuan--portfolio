// 滚动进入视口的电影感渐显特效
document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    // 放映机“光影闪烁”
                    setTimeout(() => {
                        entry.target.style.opacity = Math.random() > 0.5 ? '0.9' : '1';
                        setTimeout(() => entry.target.style.opacity = '1', 50);
                    }, Math.random() * 500);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".cinematic-fade-in").forEach((el) => {
        observer.observe(el);
    });

    // 胶卷入场特效：只保留丝滑展开
    const filmRollContainer = document.querySelector('.film-roll-container');
    if (filmRollContainer) {
        const rollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-opened');
                }
            });
        }, { threshold: 0.1 });
        rollObserver.observe(filmRollContainer);
    }

    // 胶片滑动时的光影特效及胶片灼烧转场逻辑
    const filmStrip = document.querySelector('.film-strip-horizontal');
    const burnOverlay = document.getElementById('burn-overlay');
    const burnVid = document.getElementById('burn-vid');
    const burnSources = [
        'assets/burn-1.mp4',
        'assets/burn-2.mp4',
        'assets/burn-3.mp4',
        'assets/burn-4.mp4'
    ];
    let isScrolling;
    let isBurnPlaying = false;
    let initialLoad = true;

    if (filmStrip) {
        // 监听视频播放结束，隐藏遮罩
        if (burnVid) {
            burnVid.addEventListener('ended', () => {
                burnOverlay.classList.remove('opacity-100');
                burnOverlay.classList.add('opacity-0');
                isBurnPlaying = false;
            });
        }

        // 使用 IntersectionObserver 监听每帧进入视口中央
        const frames = filmStrip.querySelectorAll('.film-frame-h');
        const frameObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (initialLoad) return; // 初始加载时不触发转场
                    
                    if (!isBurnPlaying && burnVid) {
                        isBurnPlaying = true;
                        
                        // 将灼烧遮罩移动到当前帧的视频框内
                        const videoContainer = entry.target.querySelector('.relative.w-full.aspect-video');
                        if (videoContainer && burnOverlay) {
                            videoContainer.appendChild(burnOverlay);
                        }
                        
                        // 随机选择一个灼烧素材
                        const randomBurn = burnSources[Math.floor(Math.random() * burnSources.length)];
                        burnVid.src = randomBurn;
                        
                        // 显示并播放
                        burnOverlay.classList.remove('opacity-0');
                        burnOverlay.classList.add('opacity-100');
                        burnVid.play().catch(e => {
                            console.log("Burn video play prevented", e);
                            isBurnPlaying = false;
                        });
                    }
                }
            });
        }, {
            root: filmStrip,
            threshold: 0.6 // 当一帧有 60% 进入视口时触发
        });

        frames.forEach(frame => frameObserver.observe(frame));

        // 延迟解除 initialLoad，避免初始排版触发
        setTimeout(() => { initialLoad = false; }, 1000);

        filmStrip.addEventListener('scroll', () => {
            // 添加滚动状态的类，触发基础 CSS 动画
            filmStrip.classList.add('is-scrolling');

            // 清除之前的定时器
            window.clearTimeout(isScrolling);

            // 设置定时器，当滚动停止 150ms 后
            isScrolling = setTimeout(() => {
                filmStrip.classList.remove('is-scrolling');
            }, 150);
        }, false);
    }

    // 背景图片切换逻辑
    const bgImage = document.getElementById('bg-image');
    const bioSection = document.getElementById('bio');
    const aigcSection = document.getElementById('aigc-lab');

    if (bgImage && bioSection && aigcSection) {
        const bgObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.target.id === 'bio' && entry.isIntersecting) {
                    // 首屏：显示个人照片素材
                    bgImage.style.backgroundImage = "url('assets/698837d2aic5736d025e5569160b351c.jpeg')";
                    bgImage.style.opacity = '0.2';
                } else if (entry.target.id === 'aigc-lab' && entry.isIntersecting) {
                    bgImage.style.backgroundImage = "url('assets/325c20de5g116ce9e6e972774c0d2e4c.tiff')";
                    bgImage.style.opacity = '0.05';
                }
            });
        }, { threshold: 0.2 });

        bgObserver.observe(bioSection);
        bgObserver.observe(aigcSection);
    }

});

// 摄影书翻页初始化
window.addEventListener('load', () => {
    const bookElement = document.getElementById('flipbook');
    if (bookElement && window.St && window.St.PageFlip) {
        const pageFlip = new St.PageFlip(bookElement, {
            width: 400,
            height: 550,
            size: "stretch",
            minWidth: 150,
            maxWidth: 500,
            minHeight: 200,
            maxHeight: 700,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: true,
            usePortrait: false, // 强制双页显示，防止因响应式单双页切换导致的重叠闪烁BUG
            startPage: 0,
            drawShadow: true,
            flippingTime: 800,
            useMouseEvents: true,
            swipeDistance: 30,
            clickEventForward: true
        });
        
        const pages = document.querySelectorAll('.page');
        pageFlip.loadFromHTML(pages);

        const bookWrapper = document.getElementById('book-wrapper');
        let hasOpened = false;
        
        if (bookWrapper) {
            bookWrapper.addEventListener('mouseenter', () => {
                if (!hasOpened && pageFlip.getCurrentPageIndex() === 0) {
                    pageFlip.flipNext();
                    hasOpened = true;
                }
            });
        }
    }
});

// 视频点击播放逻辑
function playVideo(element) {
    const videoContainer = element.querySelector('.video-container');
    if (videoContainer) {
        const realVideo = videoContainer.querySelector('.real-video');
        
        if (realVideo) {
            const videoSrc = realVideo.querySelector('source')?.src || realVideo.src;
            
            if (videoSrc) {
                const modal = document.getElementById('video-modal');
                const modalPlayer = document.getElementById('video-modal-player');
                
                modalPlayer.src = videoSrc;
                modal.classList.add('active');
                
                modalPlayer.play();
            }
        }
    }
}

function closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const modalPlayer = document.getElementById('video-modal-player');
    
    modal.classList.remove('active');
    modalPlayer.pause();
    modalPlayer.src = '';
}

// 导演剪辑版浮层数据
const modalData = {
    'modal-1': {
        title: '《女儿的信》',
        content: `
            <p class="mb-4"><strong class="font-serif text-lg">叙事策略：真心换真心</strong></p>
            <p class="mb-2">本项目突破了传统的营销话术，采用第一人称的情感视点，挖掘用户深层的心理共鸣。我们收集了大量真实的通信记录，提炼出“跨代际沟通”的情绪内核。</p>
            <p class="mb-4">在剪辑节奏上，采用留白与呼吸感结合的胶片质感，放慢叙事步调，让情感自然流露。</p>
            <div class="border-l-2 border-accent pl-4 text-xs mt-4">
                > 数据表现：2w+ 点赞，114w+ 播放量。<br>
                > 核心洞察：在这个快节奏时代，最稀缺的是愿意倾听的耐心。
            </div>
        `
    },
    'modal-2': {
        title: '《滴字经》',
        content: `
            <p class="mb-4"><strong class="font-serif text-lg">品牌符号的年轻化重构</strong></p>
            <p class="mb-2">00 后系列爆款代表作。我们将中国传统启蒙读物《三字经》的韵律结构与现代网约车出行场景进行碰撞，形成强烈的反差萌与记忆点。</p>
            <p class="mb-4">文案抛弃“说教”，拥抱“玩梗”，结合热点网络语境，极大地降低了传播门槛。</p>
            <div class="border-l-2 border-accent pl-4 text-xs mt-4">
                > 数据表现：10w+ 播放量。<br>
                > 核心洞察：用年轻人熟悉的语言重塑品牌心智。
            </div>
        `
    },
    'modal-3': {
        title: '《马步定桩》',
        content: `
            <p class="mb-4"><strong class="font-serif text-lg">传统武术的现代视觉化表达</strong></p>
            <p class="mb-2">将硬核的武术基本功进行拆解，通过极具视觉张力的运镜和剪辑节奏，展现力量与静谧的平衡。</p>
            <p class="mb-4">不仅仅是动作展示，更是在探寻一种定力和内在的修养，在浮躁的互联网环境中打下一根定海神针。</p>
            <div class="border-l-2 border-accent pl-4 text-xs mt-4">
                > 核心洞察：视觉奇观与文化底蕴的结合是破圈的关键。
            </div>
        `
    },
    'modal-4': {
        title: '2024 潍坊风筝节',
        content: `
            <p class="mb-4"><strong class="font-serif text-lg">低成本高曝光的整合营销</strong></p>
            <p class="mb-2">通过挖掘现场奇葩风筝的“野生”属性，策划了一系列极具网感的话题事件。没有昂贵的制景，全靠现场抓梗和快速反应。</p>
            <p class="mb-4">把一次地方性节庆打造成了全网年轻人的线上狂欢。</p>
            <div class="border-l-2 border-accent pl-4 text-xs mt-4">
                > 数据表现：1472w+ 传播量。<br>
                > 核心洞察：内容即营销，网感是第一生产力。
            </div>
        `
    }
};

const modal = document.getElementById('director-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');

// 打开浮层
function openModal(id) {
    const data = modalData[id];
    if (data) {
        modalTitle.textContent = data.title;
        modalContent.innerHTML = data.content;
        
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.classList.add('pointer-events-auto', 'opacity-100');
        
        const modalInner = modal.querySelector('div');
        modalInner.classList.remove('scale-95');
        modalInner.classList.add('scale-100');
        
        document.body.style.overflow = 'hidden'; // 阻止背景滚动
    }
}

// 关闭浮层
function closeModal() {
    modal.classList.remove('pointer-events-auto', 'opacity-100');
    modal.classList.add('pointer-events-none', 'opacity-0');
    
    const modalInner = modal.querySelector('div');
    modalInner.classList.remove('scale-100');
    modalInner.classList.add('scale-95');
    
    document.body.style.overflow = '';
}

// 点击背景关闭浮层
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// ESC 键关闭浮层
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closePhotoModal();
    }
});

// 照片放大浮层逻辑
const photoModal = document.getElementById('photo-modal');
const photoModalImg = document.getElementById('photo-modal-img');

function openPhotoModal(element) {
    const img = element.querySelector('img');
    if (img) {
        photoModalImg.src = img.src;
        
        photoModal.classList.remove('pointer-events-none', 'opacity-0');
        photoModal.classList.add('pointer-events-auto', 'opacity-100');
        
        photoModalImg.classList.remove('scale-90');
        photoModalImg.classList.add('scale-100');
        
        document.body.style.overflow = 'hidden';
    }
}

function closePhotoModal() {
    photoModal.classList.remove('pointer-events-auto', 'opacity-100');
    photoModal.classList.add('pointer-events-none', 'opacity-0');
    
    photoModalImg.classList.remove('scale-100');
    photoModalImg.classList.add('scale-90');
    
    document.body.style.overflow = '';
}

// 点击背景关闭照片浮层
photoModal.addEventListener('click', (e) => {
    if (e.target === photoModal) {
        closePhotoModal();
    }
});

// 图片放大功能
function openImageZoom(src) {
    const modal = document.getElementById('image-zoom-modal');
    const img = document.getElementById('zoomed-image');
    
    img.src = src;
    
    // Show modal
    modal.classList.remove('pointer-events-none');
    
    // Trigger animation
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        img.classList.remove('scale-95');
        img.classList.add('scale-100');
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeImageZoom() {
    const modal = document.getElementById('image-zoom-modal');
    const img = document.getElementById('zoomed-image');
    
    // Reverse animation
    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    img.classList.remove('scale-100');
    img.classList.add('scale-95');
    
    // Hide modal after animation
    setTimeout(() => {
        modal.classList.add('pointer-events-none');
        img.src = '';
        // Restore body scroll
        document.body.style.overflow = '';
    }, 300);
}

// 摄影书封面点击播放音频
const photobookCover = document.getElementById('photobook-cover');
const backgroundMusic = document.getElementById('background-music');
let musicPlaying = false;

if (photobookCover && backgroundMusic) {
    backgroundMusic.volume = 0.3;
    
    photobookCover.addEventListener('click', () => {
        if (!musicPlaying) {
            backgroundMusic.play().catch(err => {
                console.log('音频播放失败:', err);
            });
            musicPlaying = true;
        }
    });
}

const sakamotoAudio = new Audio('assets/sakamoto.mp3');
sakamotoAudio.preload = 'metadata';
sakamotoAudio.volume = 0.1; // 调小音量
sakamotoAudio.loop = true;

// 初始化 BGM 控制逻辑
document.addEventListener('DOMContentLoaded', () => {
    const bgmModal = document.getElementById('bgm-prompt-modal');
    const btnPlay = document.getElementById('btn-play-bgm');
    const btnMute = document.getElementById('btn-mute-bgm');
    
    if (bgmModal && btnPlay && btnMute) {
        // 防止页面背后滚动
        document.body.style.overflow = 'hidden';

        btnPlay.addEventListener('click', () => {
            sakamotoAudio.play().catch(err => {
                console.log('坂本龙一音乐播放失败:', err);
            });
            closeBgmModal();
        });

        btnMute.addEventListener('click', () => {
            closeBgmModal();
        });

        function closeBgmModal() {
            bgmModal.classList.add('opacity-0');
            setTimeout(() => {
                bgmModal.style.display = 'none';
                document.body.style.overflow = ''; // 恢复滚动
            }, 500);
        }
    }
});