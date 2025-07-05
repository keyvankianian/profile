document.addEventListener('DOMContentLoaded', () => {
  const tabs = ['interviews', 'performances', 'efter2023', 'important'];
  const activeTab = localStorage.getItem('activeTab') || 'important';
  
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
    const video = item.videoID ? `<div class="video-container"><iframe id="yt-player-${item.id}" src="https://www.youtube.com/embed/${item.videoID}?enablejsapi=1" frameborder="0" allowfullscreen></iframe>
     </div>`
      : '';

    content.innerHTML += `<div id="${item.id}" class="performance-item">
      <h2>${item.title}</h2>
      ${imgs ? `<img class="main-image" src="${item.img[0]}" alt="${item.title}" />` : ''}
      ${imgs ? `<div class="thumbnail-row">${imgs}</div>` : ''}
      ${video}
      <p>${convertTimeToSpan(item.text)}</p>
      ${item.source ? `<p><strong>Källa:</strong> <a href="${item.source.url}" target="_blank">${item.source.label}</a></p>` : ''}
    </div>`;
  });

  setupScrollSpy(tabId);
  setupSidebarLinks(tabId);
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
    ytPlayers[id] = new YT.Player(id, {
      events: { 'onReady': () => attachTimeJumpListeners(id) }
    });
  });
};

const attachTimeJumpListeners = (ytIframeId) => {
  const itemId = ytIframeId.replace('yt-player-', '');
  const container = document.getElementById(itemId);
  if (!container) return;

  container.querySelectorAll('.time-jump').forEach(el => {
    el.onclick = () => {
      const seconds = parseInt(el.dataset.time, 10);
      const ytPlayer = ytPlayers[ytIframeId];
      if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
          ytPlayer.seekTo(seconds, true);
          ytPlayer.playVideo();
        }
    };
  });
};

const renderPdfTab = async (tabId, jsonUrl) => {
  const res = await fetch(jsonUrl);
  const data = await res.json();
  const sidebar = document.querySelector(`#${tabId} .sidebar`);
  const content = document.querySelector(`#${tabId} .content`);

  sidebar.innerHTML = '';

  data.forEach((item, i) => {
    const link = document.createElement('a');
    link.textContent = item.title;
    link.onclick = (e) => {
      e.preventDefault();
      content.innerHTML = `<div><h2>${item.title}</h2><iframe src="${item.pdf}" class="pdf-frame"></iframe></div>`;
      sidebar.querySelectorAll('a').forEach(a => a.classList.remove('active-link'));
      link.classList.add('active-link');
    };
    sidebar.append(link);
    if (!i) link.click();
  });
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



