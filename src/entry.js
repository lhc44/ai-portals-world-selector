import { WORLDS } from './worlds/index.js';

// A curated entry, not an extra random world: the 3D engine is loaded only after selection.
const params = new URLSearchParams(location.search);
const chosen = params.get('world');
if (chosen && WORLDS.some(w => w.id === chosen)) {
  document.body.classList.add('is-exploring');
  import('./main.js');
} else {
  document.body.classList.add('is-hub');
  document.querySelector('#veil').style.display = 'none';
  document.title = '世界漫游 · 选择一个世界';
  const kinds = {
    all: '全部世界', wilderness: '自然', city: '城市', ocean: '海洋', sky: '天空',
    interior: '室内', domestic: '生活', alien: '异星', bizarre: '奇幻',
    prehistoric: '史前', artists: '艺术', books: '文学', screen: '影视',
  };
  const shell = document.createElement('div');
  shell.id = 'world-hub';
  shell.innerHTML = `
    <div class="hub-glow"></div>
    <header class="hub-header"><a href="./" class="hub-brand"><span class="hub-brand-icon">◈</span> WORLD ATLAS <small>世界漫游</small></a>
      <span class="hub-header-note">探索一处风景 · 不再随机跳转</span>
    </header>
    <main>
      <section class="hub-hero">
        <div class="hub-eyebrow"><span class="hub-spark"></span> 471 PROCEDURAL WORLDS</div>
        <h1>世界那么大，<br><em>选一处慢慢探索。</em></h1>
        <p>从雪山、奇幻城市到星际深处。选定你喜欢的世界，进入原生 3D 场景，自由调整视角，沿着风景路线漫游。不会被自动送往另一个世界。</p>
        <div class="hub-pills"><span>✦ 3D 实时渲染</span><span>✦ 同一世界探索</span><span>✦ 键鼠 / 触控</span></div>
      </section>
      <section class="hub-catalog" aria-label="世界列表">
        <div class="hub-list-title"><div><span class="hub-small">DISCOVER</span><h2>探索世界 <span id="hub-count"></span></h2></div><div class="hub-actions"><input id="hub-search" type="search" placeholder="搜索世界名称或描述..." aria-label="搜索世界"><select id="hub-sort" aria-label="排序"><option value="featured">精选推荐</option><option value="name">名称 A–Z</option><option value="strange">奇幻优先</option></select></div></div>
        <div id="hub-tabs" role="group" aria-label="世界分类"></div>
        <div id="hub-grid"></div><div id="hub-none" hidden>没有找到匹配的世界，试试其他关键词。</div>
      </section>
    </main>
    <footer class="hub-footer">基于 Ethan Mollick 的开源项目 Portals · CC BY-NC-SA 4.0 · 非商业用途</footer>`;
  document.body.appendChild(shell);
  const grid = shell.querySelector('#hub-grid'), tabs = shell.querySelector('#hub-tabs'),
    count = shell.querySelector('#hub-count'), search = shell.querySelector('#hub-search'),
    sort = shell.querySelector('#hub-sort'), none = shell.querySelector('#hub-none');
  let selected = 'all';
  const cat = w => w.category || 'other';
  const names = new Map([['all', '全部'] , ...Object.entries(kinds).filter(([id]) => id !== 'all').map(([id,name])=>[id,name])]);
  const present = [...new Set(WORLDS.map(cat))];
  for (const [id, label] of names) {
    if (id !== 'all' && !present.includes(id)) continue;
    const button = document.createElement('button');
    button.className = 'hub-tab'; button.type = 'button'; button.textContent = label;
    button.dataset.kind = id;
    button.onclick = () => { selected = id; paint(); };
    tabs.appendChild(button);
  }
  const grade = w => Number(w.band) || 0;
  const ordered = [...WORLDS].sort((a,b) => grade(b)-grade(a) || a.name.localeCompare(b.name));
  function paint() {
    for (const b of tabs.children) { b.classList.toggle('on',b.dataset.kind === selected); b.setAttribute('aria-pressed',String(b.dataset.kind === selected)); }
    const term = search.value.toLocaleLowerCase().trim();
    const filtered = ordered.filter(w => (selected === 'all' || cat(w) === selected) &&
      (!term || [w.name,w.id,w.line,w.book,w.after,w.screen,w.place].filter(Boolean).join(' ').toLocaleLowerCase().includes(term)));
    if (sort.value === 'name') filtered.sort((a,b) => a.name.localeCompare(b.name));
    if (sort.value === 'strange') filtered.sort((a,b) => b.weirdness - a.weirdness || grade(b)-grade(a));
    count.textContent = `/ ${filtered.length} 个世界`;
    grid.replaceChildren();
    none.hidden = !!filtered.length;
    const frag = document.createDocumentFragment();
    for (const w of filtered) {
      const a = document.createElement('a'); a.className = 'hub-card';
      a.href = '?world=' + encodeURIComponent(w.id) + '&explore=1';
      const pic = document.createElement('div'); pic.className = 'hub-image';
      const img = document.createElement('img'); img.loading = 'lazy'; img.decoding = 'async';
      img.alt = w.name; img.src = './thumbs/' + encodeURIComponent(w.id) + '.jpg';
      img.onerror = () => img.remove();
      pic.append(img);
      const overlay = document.createElement('div'); overlay.className = 'hub-image-overlay';
      const tag = document.createElement('span'); tag.className = 'hub-category'; tag.textContent = kinds[cat(w)] || cat(w);
      const go = document.createElement('span'); go.className = 'hub-go'; go.textContent = '进入世界 ↗';
      overlay.append(tag,go); pic.appendChild(overlay);
      const body = document.createElement('div'); body.className = 'hub-card-body';
      const title = document.createElement('h3'); title.textContent = w.name || w.id;
      const desc = document.createElement('p'); desc.textContent = w.line || '进入这个程序化生成的 3D 世界。';
      body.append(title, desc); a.append(pic,body); frag.append(a);
    }
    grid.append(frag);
  }
  search.addEventListener('input',paint); sort.addEventListener('change',paint);
  paint();
}