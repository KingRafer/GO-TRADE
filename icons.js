/* GO TRADE — shared inline SVG icon set (Feather-style, MIT-style simple line icons).
   Usage: <span data-icon="home"></span>  then call gtRenderIcons() (auto-runs on load). */

const GT_ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V21h3.5a1 1 0 0 0 1-1V9.5"/>',
  sparkles: '<path d="M12 3v3.5M12 17.5V21M3 12h3.5M17.5 12H21M5.6 5.6l2.5 2.5M15.9 15.9l2.5 2.5M18.4 5.6l-2.5 2.5M8.1 15.9l-2.5 2.5"/><circle cx="12" cy="12" r="2.6"/>',
  layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="M3 13.2 12 18l9-4.8"/><path d="M3 17.6 12 22.4l9-4.8"/>',
  wallet: '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V9H6.5A2.5 2.5 0 0 1 4 6.5"/><path d="M4 7.5v10A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V11a2 2 0 0 0-2-2H7"/><circle cx="16" cy="14.5" r="1.2"/>',
  depositIn: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v9M8 13l4 3.5 4-3.5"/>',
  withdrawOut: '<circle cx="12" cy="12" r="9"/><path d="M12 16.5v-9M8 11l4-3.5 4 3.5"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M2.7 20a6.3 6.3 0 0 1 12.6 0"/><path d="M16 8.5a3 3 0 1 1 3.6 2.94"/><path d="M15.4 14.2a6.3 6.3 0 0 1 5.9 5.8"/>',
  gift: '<rect x="3.5" y="9" width="17" height="4" rx="1"/><path d="M5 13v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/><path d="M12 9v12"/><path d="M12 9C10.5 5.5 6 5.5 6 8s3 1.3 6 1Zm0 0c1.5-3.5 6-3.5 6-1s-3 1.3-6 1Z"/>',
  history: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 5v4h4"/><path d="M12 8v4l3 2"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.5 2.5 0 1 1 3.9 2.1c-.9.6-1.4 1.1-1.4 2.1"/><path d="M12 17h.01"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z"/>',
  logout: '<path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2M12 19v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M3 12h2M19 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5"/>',
  moon: '<path d="M20 14.5a8.5 8.5 0 1 1-9-11 7 7 0 0 0 9 11Z"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 19h14"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
  edit: '<path d="M12.5 5.5 18 11l-9 9H4v-5.5l8.5-9Z"/><path d="M16 3.5 20 7.5"/>',
  trash: '<path d="M4.5 7h15"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7 7.3 19a1 1 0 0 0 1 1h7.4a1 1 0 0 0 1-1L17.5 7"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.4 2.4 4.6-5.4"/>',
  shieldOff: '<path d="M5 7.2 12 4l7 3.2V12c0 4.4-2.9 7.7-7 9-4.1-1.3-7-4.6-7-9V7.2Z"/><path d="M4 4l16 16"/>',
  megaphone: '<path d="M3 10v4a1 1 0 0 0 1 1h2l7 4V5L6 9H4a1 1 0 0 0-1 1Z"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M20 7a7 7 0 0 1 0 10"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M9 12h11M4 18h13M19 18h1"/><circle cx="12" cy="6" r="1.8"/><circle cx="7" cy="12" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="17.5" cy="6" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="M8.2 10.8 15.3 7M8.2 13.2l7.1 3.8"/>',
  inbox: '<path d="M4 12h4l1.8 3h4.4l1.8-3h4"/><path d="M6.5 5h11L20 12v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6L6.5 5Z"/>',
  send: '<path d="M4 11 20 4l-5.5 16-3.2-6.5L4 11Z"/><path d="M14.5 13.5 20 4"/>',
  package: '<path d="M12 3 4 7.5 12 12l8-4.5L12 3Z"/><path d="M4 7.5V16l8 4.5 8-4.5V7.5"/><path d="M12 12v8.5"/>',
  trendUp: '<path d="M4 16.5 10 10l4 4 6.5-7.5"/><path d="M15.5 6h5v5"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
  arrowRight: '<path d="M5 12h13"/><path d="m13 6 6 6-6 6"/>',
  building: '<path d="M4 21V6l7-3 7 3v15"/><path d="M4 21h16"/><path d="M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h3v3h-3zM19.5 14v.01M14 19.5h.01M17.5 19.5H20"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18"/><path d="M10.6 5.6c.4-.06.9-.1 1.4-.1 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.9M6.4 6.7C4 8.3 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.2 0 2.3-.2 3.3-.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
};

function gtIconSvg(name, size = 18) {
  const body = GT_ICONS[name] || GT_ICONS.dot;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

function gtRenderIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    const size = el.dataset.iconSize || 18;
    el.innerHTML = gtIconSvg(el.dataset.icon, size);
  });
}

document.addEventListener("DOMContentLoaded", () => gtRenderIcons());
