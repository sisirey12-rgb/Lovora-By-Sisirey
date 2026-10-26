/* Lovora Meow embed button. Usage: <script src="https://YOUR-SITE/embed.js" data-label="Make a surprise" async></script> */
(function () {
  var s = document.currentScript; if (!s) return
  var origin = new URL(s.src).origin, label = s.getAttribute('data-label') || 'Make a surprise 🎁'
  var a = document.createElement('a'); a.href = origin + '/?ref=embed'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label
  a.style.cssText = 'display:inline-block;padding:14px 24px;border-radius:99px;background:linear-gradient(135deg,#ff8fc2,#ffd36e);color:#2a1038;font:700 16px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 12px 30px -10px rgba(255,120,190,.7)'
  s.parentNode.insertBefore(a, s)
})()
