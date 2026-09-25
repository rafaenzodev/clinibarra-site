(function () {
  "use strict";

  var whatsappMessage = "Olá! Gostaria de agendar uma consulta na Clinibarra.";
  var whatsappUrl = "https://wa.me/5574998038054?text=" + encodeURIComponent(whatsappMessage);
  var appointmentLinks = document.querySelectorAll('a[href*="wa.me/5574998038054"]');

  appointmentLinks.forEach(function (link) {
    link.href = whatsappUrl;
  });

  var menuToggle = document.querySelector(".menu-toggle");
  var siteNav = document.querySelector("#site-nav");

  function closeMenu() {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
    siteNav.classList.remove("is-open");
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", function () {
      var isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
      siteNav.classList.toggle("is-open", !isOpen);
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (siteNav.classList.contains("is-open") &&
          !siteNav.contains(event.target) &&
          !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  function setCurrentYear() {
    var yearNode = document.querySelector("#current-year");
    if (yearNode) yearNode.textContent = String(new Date().getFullYear());
  }

  function getClinicTime() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bahia",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());
    var values = {};
    parts.forEach(function (part) {
      if (part.type !== "literal") values[part.type] = part.value;
    });
    var weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      day: weekdays[values.weekday],
      minutes: Number(values.hour) * 60 + Number(values.minute),
      weekday: values.weekday
    };
  }

  function updateOpenStatus() {
    var status = document.querySelector("#open-status");
    if (!status) return;

    var current = getClinicTime();
    var row = document.querySelector('.hours-row[data-day="' + current.day + '"]');
    document.querySelectorAll(".hours-row").forEach(function (hoursRow) {
      hoursRow.classList.toggle("is-today", hoursRow === row);
    });

    var openNow = false;
    if (current.day >= 1 && current.day <= 5) {
      openNow = current.minutes >= 8 * 60 && current.minutes < 18 * 60;
    } else if (current.day === 6) {
      openNow = current.minutes >= 9 * 60 && current.minutes < 12 * 60;
    }

    var copy = status.querySelector(".status-copy");
    status.classList.toggle("is-open", openNow);
    status.classList.toggle("is-closed", !openNow);
    copy.textContent = openNow ? "Aberta agora" : "Fechada agora";
  }

  setCurrentYear();
  updateOpenStatus();
  window.setInterval(updateOpenStatus, 60000);

  var revealElements = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (element) {
      element.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -25px 0px" });

    revealElements.forEach(function (element) {
      observer.observe(element);
    });
  }
})();

