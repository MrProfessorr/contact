import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";


const firebaseConfig = {

  apiKey:
    "AIzaSyDl9m6icGPQ_vPh030_-vwBrYFL9sV1jZ8",

  authDomain:
    "support-pwa.firebaseapp.com",

  databaseURL:
    "https://support-pwa-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
    "support-pwa",

  storageBucket:
    "support-pwa.firebasestorage.app",

  messagingSenderId:
    "1036053746669",

  appId:
    "1:1036053746669:web:952df405b937cefe6d8de4"

};


const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


const contactList =
  document.getElementById("contactList");

const statusList =
  document.getElementById("statusList");

const noticeList =
  document.getElementById("noticeList");

const searchInput =
  document.getElementById("contactSearch");


let contacts = [];

let currentFilter = "all";

let searchText = "";


/* =========================
   SECURITY
========================= */

function safe(value = "") {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================
   LINK
========================= */

function buildLink(contact) {

  let type =
    String(contact.type || "")
      .toLowerCase();

  let value =
    String(contact.value || "")
      .trim();

  let custom =
    String(contact.link || "")
      .trim();


  if (custom) {

    if (
      custom.startsWith("http://") ||
      custom.startsWith("https://") ||
      custom.startsWith("tg://")
    ) {
      return custom;
    }

    return "https://" + custom;
  }


  if (type === "whatsapp") {

    const number =
      value.replace(/\D/g, "");

    return (
      "https://wa.me/" +
      number
    );
  }


  if (type === "telegram") {

    const username =
      value
        .replace("https://t.me/", "")
        .replace("http://t.me/", "")
        .replace("@", "")
        .trim();

    return (
      "https://t.me/" +
      username
    );
  }


  if (
    type === "website" ||
    type === "facebook" ||
    type === "instagram" ||
    type === "other"
  ) {

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    return (
      "https://" +
      value
    );
  }


  return "#";
}


/* =========================
   ICON
========================= */

function icon(type) {

  type =
    String(type || "")
      .toLowerCase();


  if (type === "whatsapp")
    return "💬";

  if (type === "telegram")
    return "✈️";

  if (type === "facebook")
    return "📘";

  if (type === "instagram")
    return "📷";

  if (type === "website")
    return "🌐";

  return "🔗";
}


/* =========================
   STATUS
========================= */

function statusText(status) {

  if (status === "active")
    return "● ACTIVE";

  if (status === "problem")
    return "● PROBLEM";

  return "● CLOSED";
}


function statusClass(status) {

  if (status === "active")
    return "status-active";

  if (status === "problem")
    return "status-problem";

  return "status-closed";
}


/* =========================
   CONTACT DISPLAY
========================= */

function renderContacts() {

  let filtered =
    contacts.filter(item => {

      const matchesFilter =
        currentFilter === "all" ||
        item.status === currentFilter;


      const haystack =
        (
          (item.name || "") +
          " " +
          (item.value || "") +
          " " +
          (item.type || "")
        ).toLowerCase();


      const matchesSearch =
        haystack.includes(
          searchText.toLowerCase()
        );


      return (
        matchesFilter &&
        matchesSearch
      );
    });


  /* RIGHT CONTACT LIST */

  contactList.innerHTML = "";


  if (!filtered.length) {

    contactList.innerHTML = `
      <div class="empty">
        No contact found.
      </div>
    `;

  } else {

    filtered.forEach(item => {

      let iconHTML =
        icon(item.type);


      if (item.imageUrl) {

        iconHTML = `
          <img
            src="${safe(item.imageUrl)}"
            alt=""
          >
        `;
      }


      const isClosed =
        item.status === "closed";


      contactList.insertAdjacentHTML(
        "beforeend",
        `

        <div class="contact-card">

          <div class="contact-icon">
            ${iconHTML}
          </div>

          <div class="contact-content">

            <h3>
              ${safe(item.name || "Contact")}
            </h3>

            <div class="contact-value">
              ${safe(item.value || "")}
            </div>

            <span
              class="status-badge ${statusClass(item.status)}"
            >
              ${statusText(item.status)}
            </span>

            ${
              item.description
              ?
              `
                <div class="contact-description">
                  ${safe(item.description)}
                </div>
              `
              :
              ""
            }

          </div>

          <a
            href="${safe(buildLink(item))}"
            target="_blank"
            rel="noopener noreferrer"
            class="contact-open ${isClosed ? "closed" : ""}"
          >
            ${
              isClosed
              ? "UNAVAILABLE"
              : "OPEN"
            }
          </a>

        </div>

        `
      );

    });

  }


  /* LEFT STATUS */

  statusList.innerHTML = "";


  if (!filtered.length) {

    statusList.innerHTML = `
      <div class="empty">
        No status found.
      </div>
    `;

    return;
  }


  filtered.forEach(item => {

    statusList.insertAdjacentHTML(
      "beforeend",
      `

      <div class="status-item">

        <div class="status-top">

          <div class="status-name">
            ${safe(item.name || "Contact")}
          </div>

          <span
            class="status-badge ${statusClass(item.status)}"
          >
            ${statusText(item.status)}
          </span>

        </div>

        <div class="status-value">
          ${safe(item.value || "")}
        </div>

      </div>

      `
    );

  });

}


/* FIREBASE CONTACTS */

onValue(
  ref(db, "contacts"),
  snapshot => {

    const data =
      snapshot.val() || {};


    contacts =
      Object.entries(data)
        .map(([id, value]) => ({
          id,
          ...value
        }))
        .sort(
          (a,b) =>
            Number(a.sortOrder || 999) -
            Number(b.sortOrder || 999)
        );


    renderContacts();

  }
);


/* SEARCH */

searchInput.addEventListener(
  "input",
  () => {

    searchText =
      searchInput.value.trim();

    renderContacts();
  }
);


/* FILTER */

document
  .querySelectorAll(".filter-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".filter-btn")
          .forEach(btn =>
            btn.classList.remove("active")
          );


        button.classList.add("active");


        currentFilter =
          button.dataset.filter;


        renderContacts();

      }
    );

  });


/* =========================
   NOTICES
========================= */

onValue(
  ref(db, "notices"),
  snapshot => {

    const data =
      snapshot.val() || {};


    let notices =
      Object.entries(data)
        .map(([id, value]) => ({
          id,
          ...value
        }))
        .filter(
          item =>
            item.active !== false
        )
        .sort((a,b) => {

          if (
            a.pinned &&
            !b.pinned
          ) {
            return -1;
          }

          if (
            !a.pinned &&
            b.pinned
          ) {
            return 1;
          }

          return (
            Number(b.createdAt || 0) -
            Number(a.createdAt || 0)
          );

        });


    noticeList.innerHTML = "";


    if (!notices.length) {

      noticeList.innerHTML = `
        <div class="empty">
          No announcement currently.
        </div>
      `;

      return;
    }


    notices.forEach(item => {

      let imageHTML = "";


      if (item.imageUrl) {

        imageHTML = `
          <img
            class="notice-img"
            src="${safe(item.imageUrl)}"
            alt="Notice"
          >
        `;

      }


      const timestamp =
        item.updatedAt ||
        item.createdAt;


      let dateText = "";


      if (timestamp) {

        dateText =
          new Date(timestamp)
            .toLocaleString();

      }


      noticeList.insertAdjacentHTML(
        "beforeend",
        `

        <article class="notice-card">

          ${imageHTML}

          <div class="notice-body">

            <div class="notice-meta">

              <span class="notice-tag">
                NOTICE
              </span>

              ${
                item.pinned
                ?
                `
                  <span class="pinned-tag">
                    📌 PINNED
                  </span>
                `
                :
                ""
              }

            </div>

            <h3>
              ${safe(item.title || "Notice")}
            </h3>

            <p>
              ${safe(item.message || "")}
            </p>

            ${
              dateText
              ?
              `
                <div class="notice-date">
                  Updated ${safe(dateText)}
                </div>
              `
              :
              ""
            }

          </div>

        </article>

        `
      );

    });

  }
);


/* =========================
   SETTINGS
========================= */

onValue(
  ref(db, "settings"),
  snapshot => {

    const settings =
      snapshot.val() || {};


    if (settings.siteName) {

      document
        .getElementById("siteName")
        .textContent =
        settings.siteName;

      document.title =
        settings.siteName;

    }


    if (settings.subtitle) {

      document
        .getElementById("siteSubtitle")
        .textContent =
        settings.subtitle;

    }


    if (settings.logoUrl) {

      document
        .getElementById("siteLogo")
        .src =
        settings.logoUrl;

    }


    if (settings.footerText) {

      document
        .getElementById("footerText")
        .textContent =
        settings.footerText;

    }


    if (settings.updatedAt) {

      document
        .getElementById("lastUpdated")
        .textContent =
        "Last settings update: " +
        new Date(
          settings.updatedAt
        ).toLocaleString();

    }

  }
);
