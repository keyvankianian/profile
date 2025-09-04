document.addEventListener('DOMContentLoaded', () => {
  const tabs = ['artiklar', 'bilder', 'Performance', 'Performance_med_kortare_text'];
  const activeTab = localStorage.getItem('activeTab') || 'Performance';

  document.querySelector(`.tablink[data-tab="${activeTab}"]`)?.click();

  tabs.forEach(tab => renderTabFromJson(tab, `${tab}.json`));
  renderPdfTab('pdfs', 'pdfs.json');
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);

  const sidebarToggle = document.querySelector('.sidebar-toggle');
  sidebarToggle.addEventListener('click', () => {
    const activeTab = document.querySelector('.tabcontent.active');
    const sidebar = activeTab?.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.add('open');
      document.querySelector('.overlay').classList.add('show');
      document.body.classList.add('sidebar-open');
      sidebarToggle.style.display = 'none';
    }
  });
  document.querySelector('.overlay').addEventListener('click', closeSidebar);

});

const renderTabFromJson = async (tabId, jsonUrl) => {
  const res = await fetch(jsonUrl);
  const data = await res.json();
  const sidebar = document.querySelector(`#${tabId} .sidebar`);
  const content = document.querySelector(`#${tabId} .content`);

  sidebar.innerHTML = '';
  content.innerHTML = '';

  data.forEach(item => {
    sidebar.innerHTML += `<a href="#${item.id}">${item.title}</a>`;

    const imgs = Array.isArray(item.img)
      ? item.img.map((src, i) => `<img class="thumbnail${i ? '' : ' selected'}" src="${src}" alt="${item.title} thumbnail ${i + 1}" />`).join('')
      : '';
    let video = '';
    if (Array.isArray(item.video)) {
      const mainSrc = item.video[0];
      const thumbs = item.video.slice(1).map((src, i) =>
        `<video class="video-thumb${!i ? ' selected' : ''}" src="${src}" preload="metadata" muted></video>`
      ).join('');
      const thumbRow = thumbs ? `<div class="video-thumb-row">${thumbs}</div>` : '';
      video = `<div class="video-container">
                    <video id="local-${item.id}" class="video-frame" controls ${item.poster ? `poster="${item.poster}"` : ''} src="${mainSrc}"></video>
                  </div>${thumbRow}`;
    } else if (item.video) {
      video = `<div class="video-container">
                    <video id="local-${item.id}" class="video-frame" controls ${item.poster ? `poster="${item.poster}"` : ''} src="${item.video}"></video>
                  </div>`;
    } else if (item.videoID) {
      if (item.poster) {
        video = `<div class="video-container"><img class="video-poster" data-video-id="${item.videoID}" data-item-id="${item.id}" src="${item.poster}" alt="${item.title} poster"></div>`;
      } else {
        video = `<div class="video-container"><iframe id="yt-player-${item.id}" src="https://www.youtube.com/embed/${item.videoID}?enablejsapi=1" frameborder="0" allowfullscreen></iframe></div>`;
      }
    }
    content.innerHTML += `<div id="${item.id}" class="performance-item">
      <h2>${item.title}</h2>
      ${imgs ? `<img class="main-image" src="${item.img[0]}" alt="${item.title}" />` : ''}
      ${imgs ? `<div class="thumbnail-row">${imgs}</div>` : ''}
      ${video}
      <p>${convertTimeToSpan(item.text)}</p>
      ${item.source ? `<p><strong>Källa:</strong> <a href="${item.source.url}" target="_blank">${item.source.url}</a></p>` : ''}
    </div>`;
    attachTimeJumpListeners(item.id);
  });

  setupScrollSpy(tabId);
  setupSidebarLinks(tabId);
  setupThumbnailClicks(tabId);
  setupVideoThumbnailClicks(tabId);
  setupVideoPosterClicks(tabId);
};

const convertTimeToSpan = text => text.replace(/(\d{1,2}):(\d{2})/g, (_, m, s) => `<span class="time-jump" data-time="${+m * 60 + +s}">${m}:${s}</span>`);

const setupScrollSpy = tabId => {
  const observer = new IntersectionObserver(entries => entries.forEach(e => document.querySelector(`#${tabId} .sidebar a[href="#${e.target.id}"]`)?.classList.toggle('active-link', e.isIntersecting)), { rootMargin: '0px 0px -80% 0px', threshold: 0.1 });
  document.querySelectorAll(`#${tabId} .performance-item`).forEach(el => observer.observe(el));
};

const openTab = (tabName, buttonEl) => {
  document.querySelectorAll('.tabcontent, .tablink').forEach(el => el.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  buttonEl.classList.add('active');
  localStorage.setItem('activeTab', tabName);
};

const ytPlayers = {};
window.onYouTubeIframeAPIReady = () => {
  document.querySelectorAll('iframe[id^="yt-player-"]').forEach(iframe => {
    const id = iframe.id;
    const itemId = id.replace('yt-player-', '');
    const start = parseInt(iframe.dataset.startSeconds, 10);
    ytPlayers[id] = new YT.Player(id, {
      events: {
        'onReady': ({ target }) => {
          attachTimeJumpListeners(itemId);
          if (!Number.isNaN(start)) {
            target.seekTo(start, true);
            target.playVideo();
            iframe.removeAttribute('data-start-seconds');
          }
        }
      }
    });
  });
};

const attachTimeJumpListeners = (itemId) => {
  const container = document.getElementById(itemId);
  if (!container) return;

  container.querySelectorAll('.time-jump').forEach(el => {
    el.onclick = () => {
      const seconds = parseInt(el.dataset.time, 10);
      let ytPlayer = ytPlayers[`yt-player-${itemId}`];
      if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
        ytPlayer.seekTo(seconds, true);
        ytPlayer.playVideo();
      } else {
        const posterImg = container.querySelector('.video-poster');
        if (posterImg) {
          replacePosterWithPlayer(posterImg, seconds);
        } else {
          const video = container.querySelector('.video-frame');
          if (video) {
            video.currentTime = seconds;
            video.play();
          }
        }
      }
    };
  });
};

const renderPdfTab = async (tabId, jsonUrl) => {
  const res = await fetch(jsonUrl);
  const data = await res.json();
  const sidebar = document.querySelector(`#${tabId} .sidebar`);
  const content = document.querySelector(`#${tabId} .content`);

  content.innerHTML = '';

  const nav = document.createElement('div');
  nav.className = 'pdf-nav';
  content.appendChild(nav);
  const viewer = document.createElement('div');
  viewer.className = 'pdf-viewer';
  content.appendChild(viewer);

  const showPdf = (item, idx) => {
    viewer.innerHTML = `<div><h2>${item.title}</h2><iframe src="${item.pdf}" class="pdf-frame"></iframe></div>`;
    sidebar.querySelectorAll('a').forEach(a => a.classList.remove('active-link'));
    sidebar.querySelectorAll('a')[idx].classList.add('active-link');
    nav.querySelectorAll('.pdf-thumb').forEach(b => b.classList.remove('selected'));
    nav.querySelectorAll('.pdf-thumb')[idx].classList.add('selected');
  };

  data.forEach((item, i) => {
    const link = document.createElement('a');
    link.textContent = item.title;
    link.onclick = (e) => { e.preventDefault(); showPdf(item, i); };

    sidebar.append(link);
    const btn = document.createElement('button');
    btn.textContent = item.title;
    btn.className = 'pdf-thumb';
    btn.onclick = () => showPdf(item, i);
    nav.appendChild(btn);
  });
  if (data.length) {
    showPdf(data[0], 0);
  }

  setupSidebarLinks(tabId);
};

const setupSidebarLinks = (tabId) => {
  const sidebar = document.querySelector(`#${tabId} .sidebar`);
  if (!sidebar) return;
  sidebar.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
};

const closeSidebar = () => {
  document.querySelectorAll('.sidebar').forEach(sb => sb.classList.remove('open'));
  document.querySelector('.overlay').classList.remove('show');
  document.body.classList.remove('sidebar-open');
  document.querySelector('.sidebar-toggle').style.display = '';
};

const setupThumbnailClicks = (tabId) => {
  document.querySelectorAll(`#${tabId} .performance-item`).forEach(item => {
    const mainImage = item.querySelector('.main-image');
    if (!mainImage) return;
    item.querySelectorAll('.thumbnail').forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        mainImage.src = thumbnail.src;
        item.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('selected'));
        thumbnail.classList.add('selected');
      });
    });
  });
};

const setupVideoThumbnailClicks = (tabId) => {
  document.querySelectorAll(`#${tabId} .performance-item`).forEach(item => {
    const mainVideo = item.querySelector('.video-frame');
    if (!mainVideo) return;
    item.querySelectorAll('.video-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        if (mainVideo.src !== thumb.src) {
          mainVideo.src = thumb.src;
          mainVideo.load();
        }
        item.querySelectorAll('.video-thumb').forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
      });
    });
  });
};

const setupVideoPosterClicks = (tabId) => {
  document.querySelectorAll(`#${tabId} .video-poster`).forEach(img => {
    img.addEventListener('click', () => {
      replacePosterWithPlayer(img);
    }, { once: true });
  });
};

function replacePosterWithPlayer(img, startSeconds = null) {
  const { videoId, itemId } = img.dataset;
  const container = img.parentElement;
  const startAttr = startSeconds !== null ? ` data-start-seconds="${startSeconds}"` : '';
  container.innerHTML = `<iframe id="yt-player-${itemId}"${startAttr} src="https://www.youtube.com/embed/${videoId}?enablejsapi=1" frameborder="0" allowfullscreen></iframe>`;
  const onReady = (player) => {
    attachTimeJumpListeners(itemId);
    if (startSeconds !== null) {
      player.seekTo(startSeconds, true);
      player.playVideo();
      container.querySelector('iframe')?.removeAttribute('data-start-seconds');
    }
  };
  if (window.YT && typeof YT.Player === 'function') {
    ytPlayers[`yt-player-${itemId}`] = new YT.Player(`yt-player-${itemId}`, {
      events: { 'onReady': ({ target }) => onReady(target) }
    });
  } else {
    attachTimeJumpListeners(itemId);
  }
}