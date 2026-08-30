/*!
 * Raja Faith Ministries — Prayer Companion chatbot widget
 * Drop-in, self-contained. No build step, no server, no dependencies.
 *
 * INSTALL: add this one line just before </body> on every page:
 *   <script src="assets/js/prayer-bot.js" defer></script>
 *
 * CONFIGURE: edit the CONFIG block below (WhatsApp number / email).
 */
(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */
  var CONFIG = {
    whatsappNumber: "919000320028", // no + no spaces
    email: "connect@rajafaithministries.com",
    botName: "Prayer Companion",
    botSubtitle: "Raja Faith Ministries",
    greeting: "Hi 🙏 I'm here for you. What are you suffering with today?"
  };

  /* ---------------- CONTENT: topic → verse + prayer ---------------- */
  var TOPICS = {
    health: {
      label: "Health & Sickness",
      keywords: ["sick", "sickness", "ill", "illness", "health", "pain", "hospital", "disease", "cancer", "surgery", "medicine", "heal"],
      verse: "\u201CHe forgiveth all thine iniquities; he healeth all thy diseases.\u201D — Psalm 103:3 (KJV)",
      prayer: "Lord, we bring this body and this weariness before You. You are Jehovah Rapha, the God who heals. Touch every place of pain, steady every trembling heart, and give strength for today. In Jesus' name, amen."
    },
    finances: {
      label: "Financial Struggles",
      keywords: ["money", "job", "finance", "financial", "debt", "poverty", "unemployment", "salary", "income", "loan", "poor"],
      verse: "\u201CBut my God shall supply all your need according to his riches in glory by Christ Jesus.\u201D — Philippians 4:19 (KJV)",
      prayer: "Father, You know every bill and every burden we carry. Open a way where we see none, provide for this need, and give peace while we wait on You. In Jesus' name, amen."
    },
    family: {
      label: "Family & Relationships",
      keywords: ["family", "marriage", "husband", "wife", "children", "divorce", "relationship", "spouse", "son", "daughter", "parents"],
      verse: "\u201CAnd above all these things put on charity, which is the bond of perfectness.\u201D — Colossians 3:14 (KJV)",
      prayer: "Lord, heal what feels broken in this family. Replace bitterness with patience, and distance with love that binds us together. In Jesus' name, amen."
    },
    anxiety: {
      label: "Anxiety & Fear",
      keywords: ["anxiety", "anxious", "fear", "afraid", "stress", "stressed", "worry", "worried", "depress", "depressed", "depression", "sad", "overwhelmed", "panic"],
      verse: "\u201CBe careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.\u201D — Philippians 4:6 (KJV)",
      prayer: "Father, calm this anxious heart. Where there is fear, give courage; where there is weight, give rest. Wrap Your peace around this moment. In Jesus' name, amen."
    },
    grief: {
      label: "Grief & Loss",
      keywords: ["death", "died", "loss", "grief", "grieving", "funeral", "lost", "mourning", "passed away"],
      verse: "\u201CThe LORD is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.\u201D — Psalm 34:18 (KJV)",
      prayer: "Lord, sit with us in this sorrow. You are close to the brokenhearted, so hold this grief gently and remind us that this is not the end of the story. In Jesus' name, amen."
    },
    loneliness: {
      label: "Loneliness",
      keywords: ["lonely", "alone", "isolated", "isolation", "abandoned", "nobody"],
      verse: "\u201CFear thou not; for I am with thee: be not dismayed; for I am thy God.\u201D — Isaiah 41:10 (KJV)",
      prayer: "Father, remind this heart that it is never truly alone. Send Your presence close, and send people around to walk this season together. In Jesus' name, amen."
    },
    addiction: {
      label: "Addiction & Habits",
      keywords: ["addiction", "addicted", "alcohol", "drugs", "habit", "smoking", "drinking"],
      verse: "\u201CTherefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.\u201D — 2 Corinthians 5:17 (KJV)",
      prayer: "Lord, break every chain that holds this life captive. Give strength for today's fight and hope for lasting freedom in You. In Jesus' name, amen."
    },
    faith: {
      label: "Faith & Doubt",
      keywords: ["faith", "doubt", "god", "believe", "sin", "forgive", "forgiveness", "guilt", "guilty", "sinner"],
      verse: "\u201CLord, I believe; help thou mine unbelief.\u201D — Mark 9:24 (KJV)",
      prayer: "Father, meet us in our doubt. Strengthen what little faith we hold, and remind us Your grace is bigger than every failure. In Jesus' name, amen."
    },
    _default: {
      label: "Something else",
      keywords: [],
      verse: "\u201CCome unto me, all ye that labour and are heavy laden, and I will give you rest.\u201D — Matthew 11:28 (KJV)",
      prayer: "Lord, whatever this burden is, You already know it fully. Meet this need in Your way and in Your time, and give peace right now. In Jesus' name, amen."
    }
  };

  var TOPIC_ORDER = ["health", "finances", "family", "anxiety", "grief", "loneliness", "addiction", "faith"];

  function matchTopic(text) {
    var t = text.toLowerCase();
    for (var i = 0; i < TOPIC_ORDER.length; i++) {
      var key = TOPIC_ORDER[i];
      var kws = TOPICS[key].keywords;
      for (var j = 0; j < kws.length; j++) {
        if (t.indexOf(kws[j]) !== -1) return key;
      }
    }
    return null;
  }

  /* ---------------- STYLES (scoped, self-injecting) ---------------- */
  var css = "\n"
    + ".pcb-launcher{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;z-index:9999;"
    + "background:linear-gradient(135deg,var(--gold,#f0c674),var(--gold-2,#ffdc9a));box-shadow:0 8px 30px rgba(240,198,116,.4);"
    + "display:flex;align-items:center;justify-content:center;transition:transform .25s cubic-bezier(.2,.7,.2,1);}"
    + ".pcb-launcher:hover{transform:translateY(-3px) scale(1.05);}"
    + ".pcb-launcher svg{width:26px;height:26px;fill:#0a0e23;}"
    + ".pcb-dot{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:50%;background:#7de3a3;border:2px solid #050816;}"
    + ".pcb-panel{position:fixed;bottom:96px;right:24px;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 140px);"
    + "background:#0a1030;border:1px solid rgba(255,255,255,.08);border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.55);"
    + "display:flex;flex-direction:column;overflow:hidden;z-index:9999;opacity:0;transform:translateY(16px) scale(.98);pointer-events:none;"
    + "transition:opacity .22s cubic-bezier(.2,.7,.2,1),transform .22s cubic-bezier(.2,.7,.2,1);"
    + "font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;}"
    + ".pcb-panel.pcb-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}"
    + ".pcb-header{padding:16px 18px;background:linear-gradient(135deg,#111a45,#0a1030);border-bottom:1px solid rgba(255,255,255,.08);"
    + "display:flex;align-items:center;gap:12px;}"
    + ".pcb-header .pcb-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f0c674,#ffdc9a);"
    + "display:flex;align-items:center;justify-content:center;font-size:18px;flex:none;}"
    + ".pcb-header .pcb-title{font-family:Fraunces,'Playfair Display',Georgia,serif;color:#e9ecff;font-size:1rem;font-weight:600;line-height:1.2;}"
    + ".pcb-header .pcb-subtitle{color:#a6adcf;font-size:.75rem;margin-top:2px;}"
    + ".pcb-close{margin-left:auto;background:none;border:none;color:#a6adcf;cursor:pointer;width:28px;height:28px;border-radius:8px;"
    + "display:flex;align-items:center;justify-content:center;flex:none;}"
    + ".pcb-close:hover{color:#e9ecff;background:rgba(255,255,255,.06);}"
    + ".pcb-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;}"
    + ".pcb-body::-webkit-scrollbar{width:6px;}"
    + ".pcb-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:99px;}"
    + ".pcb-row{display:flex;}"
    + ".pcb-row.pcb-user{justify-content:flex-end;}"
    + ".pcb-bubble{max-width:82%;padding:10px 14px;border-radius:14px;font-size:.88rem;line-height:1.5;white-space:pre-line;}"
    + ".pcb-row.pcb-bot .pcb-bubble{background:#111a45;color:#e9ecff;border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px;}"
    + ".pcb-row.pcb-user .pcb-bubble{background:linear-gradient(135deg,#f0c674,#ffdc9a);color:#0a0e23;border-bottom-right-radius:4px;font-weight:500;}"
    + ".pcb-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px;}"
    + ".pcb-chip{background:rgba(240,198,116,.14);color:#f0c674;border:1px solid rgba(240,198,116,.3);padding:7px 12px;border-radius:999px;"
    + "font-size:.8rem;cursor:pointer;transition:background .15s,transform .15s;}"
    + ".pcb-chip:hover{background:rgba(240,198,116,.25);transform:translateY(-1px);}"
    + ".pcb-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px;}"
    + ".pcb-btn{border:none;border-radius:999px;padding:9px 16px;font-size:.82rem;font-weight:600;cursor:pointer;transition:transform .15s;}"
    + ".pcb-btn:hover{transform:translateY(-1px);}"
    + ".pcb-btn-primary{background:linear-gradient(135deg,#f0c674,#ffdc9a);color:#0a0e23;}"
    + ".pcb-btn-outline{background:transparent;border:1px solid rgba(255,255,255,.14);color:#e9ecff;}"
    + ".pcb-form{display:flex;flex-direction:column;gap:8px;background:#111a45;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px;}"
    + ".pcb-form input,.pcb-form textarea{background:#0a1030;border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#e9ecff;"
    + "padding:9px 11px;font-size:.85rem;font-family:inherit;outline:none;}"
    + ".pcb-form input:focus,.pcb-form textarea:focus{border-color:#f0c674;}"
    + ".pcb-form textarea{resize:vertical;min-height:60px;}"
    + ".pcb-form label{font-size:.72rem;color:#a6adcf;margin-bottom:-3px;}"
    + ".pcb-footer{padding:12px 14px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:8px;flex:none;}"
    + ".pcb-input{flex:1;background:#111a45;border:1px solid rgba(255,255,255,.1);border-radius:999px;color:#e9ecff;"
    + "padding:10px 16px;font-size:.85rem;outline:none;font-family:inherit;}"
    + ".pcb-input:focus{border-color:#f0c674;}"
    + ".pcb-send{width:40px;height:40px;border-radius:50%;border:none;background:linear-gradient(135deg,#f0c674,#ffdc9a);"
    + "cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center;}"
    + ".pcb-send svg{width:17px;height:17px;fill:#0a0e23;}"
    + ".pcb-typing{display:flex;gap:4px;padding:12px 14px;background:#111a45;border-radius:14px;border:1px solid rgba(255,255,255,.08);width:fit-content;}"
    + ".pcb-typing span{width:6px;height:6px;border-radius:50%;background:#7a83a8;animation:pcb-blink 1.2s infinite ease-in-out;}"
    + ".pcb-typing span:nth-child(2){animation-delay:.2s;}.pcb-typing span:nth-child(3){animation-delay:.4s;}"
    + "@keyframes pcb-blink{0%,80%,100%{opacity:.3;}40%{opacity:1;}}"
    + "@media(max-width:420px){.pcb-panel{right:16px;bottom:88px;width:calc(100vw - 32px);}.pcb-launcher{right:16px;bottom:16px;}}"
    + "@media(prefers-reduced-motion:reduce){.pcb-panel,.pcb-launcher{transition:none;}}";

  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------------- DOM BUILD ---------------- */
  var launcher = document.createElement("button");
  launcher.className = "pcb-launcher";
  launcher.setAttribute("aria-label", "Open prayer chat");
  launcher.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.64 1.34 5 3.46 6.6-.1.9-.42 2.14-1.24 3.4a.5.5 0 0 0 .58.75c1.9-.55 3.35-1.4 4.3-2.08.9.24 1.87.37 2.9.37 5.52 0 10-3.94 10-8.8S17.52 2 12 2Z"/></svg><span class="pcb-dot"></span>';
  document.body.appendChild(launcher);

  var panel = document.createElement("div");
  panel.className = "pcb-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", CONFIG.botName);
  panel.innerHTML =
    '<div class="pcb-header">'
      + '<div class="pcb-avatar">🙏</div>'
      + '<div><div class="pcb-title">' + CONFIG.botName + '</div><div class="pcb-subtitle">' + CONFIG.botSubtitle + '</div></div>'
      + '<button class="pcb-close" aria-label="Close chat" type="button"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg></button>'
    + '</div>'
    + '<div class="pcb-body" id="pcb-body"></div>'
    + '<div class="pcb-footer">'
      + '<input class="pcb-input" id="pcb-input" type="text" placeholder="Type what\'s on your heart\u2026" autocomplete="off" />'
      + '<button class="pcb-send" id="pcb-send" type="button" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg></button>'
    + '</div>';
  document.body.appendChild(panel);

  var body = panel.querySelector("#pcb-body");
  var input = panel.querySelector("#pcb-input");
  var sendBtn = panel.querySelector("#pcb-send");
  var closeBtn = panel.querySelector(".pcb-close");

  /* ---------------- CHAT HELPERS ---------------- */
  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addRow(who, contentEl) {
    var row = document.createElement("div");
    row.className = "pcb-row pcb-" + who;
    row.appendChild(contentEl);
    body.appendChild(row);
    scrollDown();
    return row;
  }

  function bubble(text) {
    var b = document.createElement("div");
    b.className = "pcb-bubble";
    b.textContent = text;
    return b;
  }

  function addBotText(text, delay) {
    var typing = document.createElement("div");
    typing.className = "pcb-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    var row = addRow("bot", typing);
    return new Promise(function (resolve) {
      setTimeout(function () {
        row.removeChild(typing);
        row.appendChild(bubble(text));
        scrollDown();
        resolve();
      }, delay || 500);
    });
  }

  function addUserText(text) {
    addRow("user", bubble(text));
  }

  function addChips(options, onPick) {
    var wrap = document.createElement("div");
    wrap.className = "pcb-chips";
    options.forEach(function (opt) {
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "pcb-chip";
      chip.textContent = opt.label;
      chip.addEventListener("click", function () {
        wrap.remove();
        addUserText(opt.label);
        onPick(opt.key);
      });
      wrap.appendChild(chip);
    });
    var row = addRow("bot", wrap);
    scrollDown();
    return row;
  }

  function addActions(buttons) {
    var wrap = document.createElement("div");
    wrap.className = "pcb-actions";
    buttons.forEach(function (b) {
      var el = document.createElement("button");
      el.type = "button";
      el.className = "pcb-btn " + (b.primary ? "pcb-btn-primary" : "pcb-btn-outline");
      el.textContent = b.label;
      el.addEventListener("click", b.onClick);
      wrap.appendChild(el);
    });
    addRow("bot", wrap);
  }

  /* ---------------- CONVERSATION FLOW ---------------- */
  var started = false;

  function startChat() {
    if (started) return;
    started = true;
    addBotText(CONFIG.greeting, 350).then(function () {
      addChips(
        TOPIC_ORDER.map(function (k) { return { key: k, label: TOPICS[k].label }; }).concat([{ key: "_default", label: "Something else" }]),
        onTopicChosen
      );
    });
  }

  function onTopicChosen(key) {
    var topic = TOPICS[key] || TOPICS._default;
    addBotText("Thank you for sharing that with me. Here's a word for you today \uD83D\uDC96", 450).then(function () {
      addBotText(topic.verse, 550).then(function () {
        addBotText("Let's pray:\n" + topic.prayer, 700).then(function () {
          addActions([
            { label: "\uD83D\uDCE9 Submit a Prayer Request", primary: true, onClick: showRequestForm },
            { label: "Ask about something else", primary: false, onClick: function () {
                addChips(
                  TOPIC_ORDER.map(function (k) { return { key: k, label: TOPICS[k].label }; }).concat([{ key: "_default", label: "Something else" }]),
                  onTopicChosen
                );
              } }
          ]);
        });
      });
    });
  }

  function showRequestForm() {
    var wrap = document.createElement("div");
    wrap.className = "pcb-form";
    wrap.innerHTML =
      '<label>Your name</label><input type="text" id="pcb-f-name" />'
      + '<label>Prayer request</label><textarea id="pcb-f-msg" placeholder="Tell us how we can pray for you\u2026"></textarea>';
    var actions = document.createElement("div");
    actions.className = "pcb-actions";
    actions.style.marginTop = "4px";

    var sendWa = document.createElement("button");
    sendWa.type = "button";
    sendWa.className = "pcb-btn pcb-btn-primary";
    sendWa.textContent = "Send via WhatsApp";
    sendWa.addEventListener("click", function () {
      var name = wrap.querySelector("#pcb-f-name").value.trim() || "A visitor";
      var msg = wrap.querySelector("#pcb-f-msg").value.trim();
      if (!msg) { wrap.querySelector("#pcb-f-msg").focus(); return; }
      var text = "Prayer Request from " + name + ":\n" + msg;
      var url = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");
      afterSubmit();
    });

    var sendMail = document.createElement("button");
    sendMail.type = "button";
    sendMail.className = "pcb-btn pcb-btn-outline";
    sendMail.textContent = "Send via Email";
    sendMail.addEventListener("click", function () {
      var name = wrap.querySelector("#pcb-f-name").value.trim() || "A visitor";
      var msg = wrap.querySelector("#pcb-f-msg").value.trim();
      if (!msg) { wrap.querySelector("#pcb-f-msg").focus(); return; }
      var subject = "Prayer Request from " + name;
      var url = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
      window.location.href = url;
      afterSubmit();
    });

    actions.appendChild(sendWa);
    actions.appendChild(sendMail);
    wrap.appendChild(actions);
    addRow("bot", wrap);

    function afterSubmit() {
      wrap.remove();
      addBotText("Thank you \uD83D\uDE4F Your request has been prepared to send. Our team will be praying with you.", 400);
    }
  }

  function handleFreeText(text) {
    addUserText(text);
    var key = matchTopic(text);
    if (key) {
      onTopicChosen(key);
    } else {
      addBotText("Thank you for sharing. I want to make sure I understand \u2014 which of these feels closest?", 500).then(function () {
        addChips(
          TOPIC_ORDER.map(function (k) { return { key: k, label: TOPICS[k].label }; }).concat([{ key: "_default", label: "Something else" }]),
          onTopicChosen
        );
      });
    }
  }

  /* ---------------- EVENTS ---------------- */
  function openPanel() {
    panel.classList.add("pcb-open");
    startChat();
    setTimeout(function () { input.focus(); }, 200);
  }
  function closePanel() { panel.classList.remove("pcb-open"); }

  launcher.addEventListener("click", function () {
    panel.classList.contains("pcb-open") ? closePanel() : openPanel();
  });
  closeBtn.addEventListener("click", closePanel);

  function submitInput() {
    var val = input.value.trim();
    if (!val) return;
    input.value = "";
    handleFreeText(val);
  }
  sendBtn.addEventListener("click", submitInput);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); submitInput(); }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("pcb-open")) closePanel();
  });
})();
