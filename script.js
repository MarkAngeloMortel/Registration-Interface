// script.js - runs on every page.
// Part 1: light/dark theme toggle (all pages).
// Part 2: registration form logic (only on register.html).

/* ================= Part 1: Theme toggle ================= */
(function () {
  var root = document.documentElement;
  var btn = document.getElementById("themeBtn");
  if (!btn) return;

  function setTheme(theme, save) {
    root.setAttribute("data-theme", theme);
    btn.setAttribute("aria-pressed", String(theme === "dark"));
    document.getElementById("themeIco").textContent = theme === "dark" ? "\u263e" : "\u2600";
    document.getElementById("themeLbl").textContent = theme === "dark" ? "Dark" : "Light";
    if (save) { try { localStorage.setItem("sr-theme", theme); } catch (e) {} }
  }

  setTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light", false);
  btn.addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });
})();

/* ================= Part 2: Registration form ================= */
(function () {
  var form = document.getElementById("regForm");
  if (!form) return; // not the Register page

  var $ = function (id) { return document.getElementById(id); };
  var ids = ["fullName", "studentId", "email", "course", "yearLevel"];
  var labels = { fullName: "Full name", studentId: "Student ID", email: "Email address", course: "Course", yearLevel: "Year level" };
  var touched = {}; // fields the user has already visited

  // Each rule returns an error message, or "" if the value is fine.
  var rules = {
    fullName: function (v) { return !v ? "Enter your full name." : v.length < 2 ? "Your name needs at least 2 characters." : ""; },
    studentId: function (v) { return !v ? "Enter your student ID." : !/^[A-Za-z0-9-]{5,15}$/.test(v) ? "Use 5\u201315 letters, numbers or dashes, like 2026-00123." : ""; },
    email: function (v) { return !v ? "Enter your email address." : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Enter an email like juan@example.com." : ""; },
    course: function (v) { return v ? "" : "Select your course."; },
    yearLevel: function (v) { return v ? "" : "Select your year level."; }
  };

  // Common email typos -> suggested fix
  var typos = { "gmail.con": "gmail.com", "gmial.com": "gmail.com", "gmail.co": "gmail.com", "yahoo.con": "yahoo.com", "yaho.com": "yahoo.com", "hotmail.con": "hotmail.com" };

  function val(id) { return $(id).value.trim(); }
  function fieldBox(id) { return document.querySelector('[data-f="' + id + '"]'); }

  // Validate one field. "show" decides whether the error is displayed. Returns the message.
  function check(id, show) {
    var m = rules[id](val(id));
    var box = fieldBox(id), input = $(id);
    box.classList.toggle("invalid", !!m && show);
    box.classList.toggle("valid", !m && val(id) !== "");
    $(id + "-m").textContent = show ? m : "";
    if (m && show) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return m;
  }

  // Update the live summary panel and the progress bar
  function progress() {
    var done = 0;
    ids.forEach(function (id) {
      var v = val(id);
      if (v && !rules[id](v)) done++;
      var out = document.querySelector('[data-o="' + id + '"]');
      out.textContent = v || (id === "course" || id === "yearLevel" ? "Not selected yet" : "Not entered yet");
      out.classList.toggle("empty", !v);
    });
    $("progText").textContent = done === 5 ? "All 5 fields complete \u2014 ready to submit" : done + " of 5 fields complete";
    $("progBar").style.width = done * 20 + "%";
  }

  // "Did you mean gmail.com?" helper
  function suggest() {
    var v = val("email"), domain = v.split("@")[1], box = $("emailSug");
    if (domain && typos[domain.toLowerCase()]) {
      var fix = v.split("@")[0] + "@" + typos[domain.toLowerCase()];
      box.innerHTML = 'Did you mean <button type="button"></button>?';
      box.querySelector("button").textContent = fix; // textContent is safe against injected HTML
      box.hidden = false;
      box.querySelector("button").onclick = function () {
        $("email").value = fix; box.hidden = true; check("email", true); progress(); $("email").focus();
      };
    } else box.hidden = true;
  }

  // Check fields when the user leaves them, and re-check live once an error is showing
  ids.forEach(function (id) {
    var el = $(id);
    el.addEventListener("blur", function () {
      touched[id] = true;
      if (id === "studentId") el.value = el.value.trim().toUpperCase();
      check(id, true);
      if (id === "email") suggest();
      progress();
    });
    el.addEventListener("input", function () {
      if (touched[id] || fieldBox(id).classList.contains("invalid")) check(id, true);
      progress();
    });
    el.addEventListener("change", function () { touched[id] = true; check(id, true); progress(); });
  });

  // Error summary at the top of the form, with links to each problem field
  function showSummary(errs) {
    var box = $("errSummary"), list = $("errList");
    list.innerHTML = "";
    if (!errs.length) { box.hidden = true; return; }
    $("errTitle").textContent = errs.length === 1 ? "1 field needs your attention" : errs.length + " fields need your attention";
    errs.forEach(function (e) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = "#" + e.id; a.textContent = labels[e.id] + ": " + e.m;
      a.onclick = function (ev) { ev.preventDefault(); $(e.id).focus(); };
      li.appendChild(a); list.appendChild(li);
    });
    box.hidden = false;
    box.focus();
  }

  // Submit
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // stop the page from reloading
    var errs = [];
    ids.forEach(function (id) { touched[id] = true; var m = check(id, true); if (m) errs.push({ id: id, m: m }); });
    showSummary(errs);
    if (errs.length) return;

    var ref = "REG-" + new Date().getFullYear() + "-" + String(Math.floor(1000 + Math.random() * 9000)); // dummy reference
    $("sName").textContent = val("fullName");
    $("sRef").textContent = "Reference: " + ref;
    $("sId").textContent = val("studentId");
    $("sEmail").textContent = val("email");
    $("sCourse").textContent = $("course").value;
    $("sYear").textContent = $("yearLevel").value;

    $("formLayout").hidden = true;
    $("success").hidden = false;
    $("success").focus(); // screen readers and keyboard users land on the message
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Reset every field, error and the summary panel
  function wipe() {
    form.reset(); touched = {};
    ids.forEach(function (id) { check(id, false); fieldBox(id).classList.remove("valid"); });
    $("emailSug").hidden = true;
    showSummary([]);
    progress();
  }

  // Clear: no "are you sure?" popup. It clears right away and offers Undo instead.
  var toastTimer;
  function toast(message, undo) {
    var old = $("toast"); if (old) old.remove();
    clearTimeout(toastTimer);
    var t = document.createElement("div");
    t.className = "toast"; t.id = "toast"; t.setAttribute("role", "status");
    t.innerHTML = "<span></span><button type=\"button\">Undo</button>";
    t.firstChild.textContent = message;
    t.querySelector("button").onclick = function () { undo(); t.remove(); };
    document.body.appendChild(t);
    toastTimer = setTimeout(function () { t.remove(); }, 8000);
    t.querySelector("button").focus();
  }

  $("clearBtn").addEventListener("click", function () {
    if (!ids.some(function (id) { return val(id); })) return; // nothing to clear
    var saved = ids.map(function (id) { return $(id).value; });
    wipe();
    $("fullName").focus();
    toast("Form cleared.", function () {
      ids.forEach(function (id, i) { $(id).value = saved[i]; });
      ids.forEach(function (id) { if (val(id)) check(id, true); });
      progress();
      $("fullName").focus();
    });
  });

  // Sample data link (for quick testing and evaluation)
  $("sample").addEventListener("click", function () {
    var s = { fullName: "Juan Dela Cruz", studentId: "2026-00123", email: "juan@example.com", course: "BS Information Technology", yearLevel: "2nd Year" };
    ids.forEach(function (id) { $(id).value = s[id]; touched[id] = true; check(id, true); });
    progress();
  });

  // Confirmation area buttons
  function backToForm() { $("success").hidden = true; $("formLayout").hidden = false; $("fullName").focus(); }
  $("againBtn").addEventListener("click", function () { wipe(); backToForm(); });
  $("editBtn").addEventListener("click", backToForm); // keeps what the student typed
  $("printBtn").addEventListener("click", function () { window.print(); });
  $("copyBtn").addEventListener("click", function () {
    var b = this, ref = $("sRef").textContent.replace("Reference: ", "");
    try {
      navigator.clipboard.writeText(ref).then(function () {
        b.textContent = "Copied \u2713";
        setTimeout(function () { b.textContent = "Copy reference"; }, 2000);
      });
    } catch (e) {}
  });

  progress();
})();
