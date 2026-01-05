async function loadJSON(path){
  const res = await fetch(path, { cache: "no-store" });
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function el(id){ return document.getElementById(id); }

function imgTag(src){
  if(!src) return "";
  return `<img src="${src}" alt="">`;
}

function renderFooter(site){
  const f = site.footer || {};
  const links = [
    { label: "וואטסאפ", href: f.whatsapp || "#" },
    { label: "טלפון", href: f.phone ? `tel:${f.phone.replace(/[^0-9+]/g,'')}` : "#" },
    { label: "מייל", href: f.email ? `mailto:${f.email}` : "#" }
  ];

  el("footerLinks").innerHTML = links.map(l => `<a class="footer-btn" href="${l.href}">${l.label}</a>`).join("");
}

async function initHome(){
  const [site, topicsData] = await Promise.all([
    loadJSON("/content/site.json"),
    loadJSON("/content/topics.json")
  ]);

  el("siteTitle").innerHTML = `${site.title.split(" ")[0] || site.title} <span style="color:var(--brand-orange)">${site.title.split(" ").slice(1).join(" ") || ""}</span>`.trim();
  el("siteSubtitle").textContent = site.subtitle || "";
  el("siteLead").textContent = site.lead || "";

  const topics = (topicsData.topics || []).filter(t => t.slug && t.title);
  el("topicsGrid").innerHTML = topics.map(t => `
    <article class="card">
      <a class="thumb" href="/topic.html?slug=${encodeURIComponent(t.slug)}" aria-label="${t.title}">
        ${t.cover ? `<img src="${t.cover}" alt="">` : ""}
      </a>
      <div class="body">
        <h3 class="name"><a href="/topic.html?slug=${encodeURIComponent(t.slug)}">${t.title}</a></h3>
        <p class="desc">${(t.description || "").replace(/</g,"&lt;")}</p>
        <a class="btn" href="/topic.html?slug=${encodeURIComponent(t.slug)}">לכניסה לנושא</a>
      </div>
    </article>
  `).join("");

  renderFooter(site);
}

function renderSection(containerId, title, data){
  const lead = (data && data.lead) ? data.lead : "";
  const imgs = (data && Array.isArray(data.images)) ? data.images : [];
  const i1 = imgs[0] || "";
  const i2 = imgs[1] || "";
  const i3 = imgs[2] || "";

  el(containerId).innerHTML = `
    <div class="rule"></div>
    <section>
      <h2 class="section-title">${title}</h2>
      <p class="section-lead">${lead}</p>
      <div class="three">
        <div class="box">${imgTag(i1)}</div>
        <div class="box">${imgTag(i2)}</div>
        <div class="box">${imgTag(i3)}</div>
      </div>
    </section>
  `;
}

async function initTopic(){
  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");

  const [site, topicsData] = await Promise.all([
    loadJSON("/content/site.json"),
    loadJSON("/content/topics.json")
  ]);

  renderFooter(site);

  const topic = (topicsData.topics || []).find(t => t.slug === slug);
  if(!topic){
    el("topicTitle").textContent = "נושא לא נמצא";
    el("topicIntro").textContent = "חזור לדף הבית ונסה שוב.";
    return;
  }

  el("topicTitle").textContent = topic.title || "";
  el("topicIntro").textContent = topic.intro || "";

  renderSection("secEdu", "תוכן חינוכי", topic.edu);
  renderSection("secSlides", "מצגות", topic.slides);
  renderSection("secGames", "משחקים", topic.games);
  renderSection("secDesign", "עיצוב גרפי", topic.design);
}

window.Tochen = { initHome, initTopic };
