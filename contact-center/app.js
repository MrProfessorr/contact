import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";



/* =========================================================
   FIREBASE
========================================================= */

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


const app =
  initializeApp(firebaseConfig);


const db =
  getDatabase(app);



/* =========================================================
   LOADING SETTINGS

   3000 = 3 seconds

   Kalau mahu:
   300ms  = 300
   2 sec  = 2000
   3 sec  = 3000
   5 sec  = 5000
========================================================= */

let loaderMinMs =
  1500;


const LOADER_MAX_MS =
  10000;

const loaderStartedAt =
  Date.now();

const firebaseReady = {
  contacts: false,
  notices: false
};

/* =========================================================
   DOM
========================================================= */

const pageLoader =
  document.getElementById(
    "pageLoader"
  );
const loaderImage =
  document.getElementById(
    "loaderImage"
  );


const loaderText =
  document.getElementById(
    "loaderText"
  );
const contactList =
  document.getElementById(
    "contactList"
  );


const statusList =
  document.getElementById(
    "statusList"
  );
const statusSearchInput =
  document.getElementById(
    "statusSearch"
  );


const clearStatusSearch =
  document.getElementById(
    "clearStatusSearch"
  );

const noticeList =
  document.getElementById(
    "noticeList"
  );
const noticeCenterBtn =
  document.getElementById(
    "noticeCenterBtn"
  );

const noticeUnreadBadge =
  document.getElementById(
    "noticeUnreadBadge"
  );

const noticeCenterModal =
  document.getElementById(
    "noticeCenterModal"
  );

const noticeCenterBackdrop =
  document.getElementById(
    "noticeCenterBackdrop"
  );

const noticeCenterClose =
  document.getElementById(
    "noticeCenterClose"
  );

const searchInput =
  document.getElementById(
    "contactSearch"
  );


const clearSearch =
  document.getElementById(
    "clearSearch"
  );


const imageModal =
  document.getElementById(
    "imageModal"
  );


const modalImage =
  document.getElementById(
    "modalImage"
  );
/* =========================================================
   IMAGE ZOOM STATE
========================================================= */

let imageZoom =
  1;

let imageTranslateX =
  0;

let imageTranslateY =
  0;

let imageDragging =
  false;

let imageDragStartX =
  0;

let imageDragStartY =
  0;

const closeImageModal =
  document.getElementById(
    "closeImageModal"
  );


const modalBackdrop =
  document.getElementById(
    "modalBackdrop"
  );

function updateModalImageTransform() {

  if (!modalImage) {
    return;
  }

  modalImage.style.transform =
    `translate3d(
      ${imageTranslateX}px,
      ${imageTranslateY}px,
      0
    )
    scale(${imageZoom})`;


  modalImage.classList.toggle(
    "zoomed",
    imageZoom > 1
  );

}
/* =========================================================
   STATE
========================================================= */

let contacts = [];

let currentFilter =
  "all";

/* SEARCH CONTACT OUR TEAM */

let searchText =
  "";

/* SEARCH CONTACT STATUS */

let statusSearchText =
  "";

let currentNoticeReadKeys =
  [];

/* =========================================================
   PAGE LOADER
========================================================= */

function markReady(section) {

  firebaseReady[section] =
    true;


const allReady =
  firebaseReady.contacts &&
  firebaseReady.notices;


  if (allReady) {

    finishLoader();

  }

}



function finishLoader() {

  if (
    pageLoader.classList.contains(
      "hide"
    )
  ) {
    return;
  }


  const elapsed =
    Date.now() -
    loaderStartedAt;


const remaining =
  Math.max(
    0,
    loaderMinMs - elapsed
  );


  setTimeout(
    hideLoader,
    remaining
  );

}



function hideLoader() {

  pageLoader
    .classList
    .add(
      "hide"
    );


  document.body
    .classList
    .remove(
      "page-loading"
    );


  setTimeout(
    () => {

      pageLoader.style.display =
        "none";

    },
    650
  );

}



/*
  Safety:
  kalau internet/Firebase terlalu lambat,
  loader tidak terkunci selamanya.
*/

setTimeout(
  hideLoader,
  LOADER_MAX_MS
);

/* =========================================================
   LOADING SETTINGS FROM FIREBASE
========================================================= */
function hexToRgba(
  hex,
  opacity
) {

  let value =
    String(hex)
      .replace("#", "");

  if (value.length === 3) {

    value =
      value
        .split("")
        .map(c => c + c)
        .join("");

  }

  const number =
    parseInt(value, 16);

  const r =
    (number >> 16) & 255;

  const g =
    (number >> 8) & 255;

  const b =
    number & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
function applyLoadingSettings(data = {}) {

  if (!pageLoader) {
    return;
  }


  /*
    ENABLE / DISABLE
  */

  if (data.enabled === false) {

    pageLoader.classList.add(
      "hide"
    );

    document.body.classList.remove(
      "page-loading"
    );

    return;
  }


  /*
    IMAGE / GIF
  */

  if (
    loaderImage &&
    data.imageUrl
  ) {

    loaderImage.src =
      data.imageUrl;
  }


  /*
    TEXT
  */

  if (loaderText) {

    loaderText.textContent =
      data.text ||
      "LOADING...";


    loaderText.style.color =
      data.textColor ||
      "#ffffff";


    loaderText.style.fontSize =
      `${
        Number(data.textSize) || 13
      }px`;
  }


  /*
    IMAGE SIZE
  */

  if (loaderImage) {

    const imageSize =
      Number(data.imageSize) || 120;


    loaderImage.style.width =
      `${imageSize}px`;


    loaderImage.style.height =
      `${imageSize}px`;
  }


  /*
    BACKGROUND
  */

const backgroundColor =
  data.backgroundColor ||
  "#0a0a0a";


const backgroundOpacity =
  Math.min(
    100,
    Math.max(
      0,
      Number(
        data.backgroundOpacity ?? 50
      )
    )
  ) / 100;


pageLoader.style.background =
  hexToRgba(
    backgroundColor,
    backgroundOpacity
  );


  /*
    MINIMUM LOADING TIME
  */

  const duration =
    Number(
      data.minimumDuration
    );


  if (
    Number.isFinite(duration) &&
    duration >= 0
  ) {

    loaderMinMs =
      Math.min(
        duration,
        LOADER_MAX_MS
      );
  }

}
onValue(
  ref(
    db,
    "loading_settings"
  ),

  snapshot => {

    const data =
      snapshot.val() || {};

    applyLoadingSettings(
      data
    );

  },

  error => {

    console.error(
      "Loading settings error:",
      error
    );

  }
);
/* =========================================================
   SAFE TEXT
========================================================= */

function safe(value = "") {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}

/* =========================================================
   COPY CONTACT VALUE
========================================================= */

function copyButtonHtml(value = "") {

  return `
    <button
      class="copy-contact-btn"
      type="button"
      data-copy-value="${safe(value)}"
      aria-label="Copy contact number"
      title="Copy"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm0-2h9V4H9zm-4 6q-.825 0-1.412-.587T3 20V7q0-.425.288-.712T4 6t.713.288T5 7v13h10q.425 0 .713.288T16 21t-.288.713T15 22zm4-6V4z"
          fill="currentColor"
        />
      </svg>
    </button>
  `;
}

/* =========================================================
   SAFE URL
========================================================= */

function safeUrl(value = "") {

  const valueString =
    String(
      value || ""
    )
      .trim();


  if (!valueString) {
    return "";
  }


  try {

    const url =
      new URL(
        valueString
      );


    if (
      url.protocol === "http:" ||
      url.protocol === "https:"
    ) {

      return url.href;

    }

  } catch (error) {

    return "";

  }


  return "";

}



/* =========================================================
   CONTACT LINK
========================================================= */

function buildLink(contact) {

  const type =
    String(
      contact.type || ""
    )
      .toLowerCase()
      .trim();


  const value =
    String(
      contact.value || ""
    )
      .trim();


  const custom =
    String(
      contact.link || ""
    )
      .trim();



  /*
    CUSTOM LINK
  */

  if (custom) {

    try {

      const finalCustom =
        /^https?:\/\//i.test(custom)

          ? custom

          : "https://" +
            custom;


      return new URL(
        finalCustom
      ).href;

    } catch (error) {

      console.warn(
        "Invalid custom link:",
        custom
      );

    }

  }



  /*
    WHATSAPP
  */

  if (
    type ===
    "whatsapp"
  ) {

    const number =
      value.replace(
        /\D/g,
        ""
      );


    if (!number) {
      return "#";
    }


    return (
      "https://wa.me/" +
      number
    );

  }



  /*
    TELEGRAM
  */

  if (
    type ===
    "telegram"
  ) {

    const username =
      value

        .replace(
          /^https?:\/\/t\.me\//i,
          ""
        )

        .replace(
          /^@/,
          ""
        )

        .trim();


    if (!username) {
      return "#";
    }


    return (
      "https://t.me/" +
      encodeURIComponent(
        username
      )
    );

  }



  /*
    OTHER WEBSITE
  */

  if (
    type === "website" ||
    type === "facebook" ||
    type === "instagram" ||
    type === "other"
  ) {

    try {

      const finalUrl =
        /^https?:\/\//i.test(value)

          ? value

          : "https://" +
            value;


      return new URL(
        finalUrl
      ).href;

    } catch (error) {

      return "#";

    }

  }


  return "#";

}



/* =========================================================
   CONTACT ICON
========================================================= */

function getContactIcon(type) {

  type =
    String(
      type || ""
    )
      .toLowerCase();


  switch(type) {

    case "whatsapp":

      return "💬";


    case "telegram":

      return "✈️";


    case "facebook":

      return "f";


    case "instagram":

      return "◎";


    case "website":

      return "🌐";


    default:

      return "↗";

  }

}



/* =========================================================
   STATUS
========================================================= */

function statusText(status) {

  switch(status) {

    case "active":

      return "● ACTIVE";


    case "problem":

      return "● PROBLEM";


    case "closed":

      return "● CLOSED";


    default:

      return "● UNKNOWN";

  }

}



function statusClass(status) {

  switch(status) {

    case "active":

      return "status-active";


    case "problem":

      return "status-problem";


    default:

      return "status-closed";

  }

}



/* =========================================================
   COUNTERS
========================================================= */

function updateCounters() {

  document
    .getElementById(
      "countAll"
    )
    .textContent =
      contacts.length;


  document
    .getElementById(
      "countActive"
    )
    .textContent =
      contacts.filter(
        item =>
          item.status ===
          "active"
      ).length;


  document
    .getElementById(
      "countProblem"
    )
    .textContent =
      contacts.filter(
        item =>
          item.status ===
          "problem"
      ).length;


  document
    .getElementById(
      "countClosed"
    )
    .textContent =
      contacts.filter(
        item =>
          item.status ===
          "closed"
      ).length;

}



/* =========================================================
   FILTER
========================================================= */

function getFilteredContacts() {

  return contacts.filter(
    item => {

      /* STATUS FILTER */

      const matchesFilter =

        currentFilter ===
        "all"

        ||

        item.status ===
        currentFilter;


      /* STATUS SEARCH */

      const haystack =
        [
          item.name,
          item.value,
          item.type,
          item.description,
          item.status
        ]

          .join(" ")

          .toLowerCase();


      const matchesSearch =
        haystack.includes(
          statusSearchText
            .toLowerCase()
        );


      return (
        matchesFilter &&
        matchesSearch
      );

    }
  );
}
/* =========================================================
   ACTIVE CONTACTS FOR CONTACT OUR TEAM
========================================================= */

function getActiveContactResults() {

  return contacts.filter(
    item => {

      /*
        Contact Our Team
        hanya ACTIVE.
      */

      if (
        item.status !==
        "active"
      ) {

        return false;

      }


      const haystack =
        [
          item.name,
          item.value,
          item.type,
          item.description
        ]

          .join(" ")

          .toLowerCase();


      return haystack.includes(
        searchText.toLowerCase()
      );

    }
  );
}
/* =========================================================
   RENDER CONTACTS
========================================================= */

function renderContacts() {

  /* LEFT - ikut filter + search status */
  const filtered =
    getFilteredContacts();


  /* RIGHT - ACTIVE sahaja */
  const activeContacts =
    getActiveContactResults();


  contactList.innerHTML =
    "";


  statusList.innerHTML =
    "";



  /*
    NO RESULTS
  */

/* RIGHT EMPTY */

if (!activeContacts.length) {

  contactList.innerHTML =
    `
      <div class="empty">
        No active contact found.
      </div>
    `;

}


/* LEFT EMPTY */

if (!filtered.length) {

  statusList.innerHTML =
    `
      <div class="empty">
        No contact status found.
      </div>
    `;

}



  /*
    CONTACT CARDS
  */

  activeContacts.forEach(
    item => {

      const link =
        buildLink(item);


      const isClosed =
        item.status ===
        "closed";


      const image =
        safeUrl(
          item.imageUrl
        );


      let iconHtml =
        getContactIcon(
          item.type
        );


      if (image) {

        iconHtml =
          `
          <img
            src="${safe(image)}"
            alt="${safe(item.name || "Contact")}"
            loading="lazy"
          >
          `;

      }



      let buttonText =
        "OPEN CONTACT";


      if (
        item.type ===
        "whatsapp"
      ) {

        buttonText =
          "OPEN WHATSAPP";

      }


      if (
        item.type ===
        "telegram"
      ) {

        buttonText =
          "OPEN TELEGRAM";

      }


      if (
        isClosed
      ) {

        buttonText =
          "UNAVAILABLE";

      }



      contactList
        .insertAdjacentHTML(
          "beforeend",
          `

          <article class="contact-card">

            <div class="contact-icon">

              ${iconHtml}

            </div>


            <div class="contact-content">

              <h3
                title="${safe(item.name || "Contact")}"
              >
                ${safe(item.name || "Contact")}
              </h3>


              <div class="contact-value-row">

  <div class="contact-value">
    ${safe(item.value || "")}
  </div>

  ${copyButtonHtml(item.value || "")}

</div>


              <span
                class="
                  status-badge
                  ${statusClass(item.status)}
                "
              >
                ${statusText(item.status)}
              </span>


              ${
                item.description

                  ? `
                    <div class="contact-description">

                      ${safe(item.description)}

                    </div>
                  `

                  : ""
              }

            </div>


            <a
              href="${safe(link)}"

              class="
                contact-open
                ${isClosed ? "closed" : ""}
              "

              ${
                !isClosed &&
                link !== "#"

                  ? `
                    target="_blank"
                    rel="noopener noreferrer"
                  `

                  : ""
              }
            >

              ${buttonText}

            </a>

          </article>

          `
        );

    }
  );
/* =========================================================
   LEFT STATUS LIST
   SEMUA STATUS IKUT FILTER + SEARCH
========================================================= */

filtered.forEach(
  item => {

    statusList
      .insertAdjacentHTML(
        "beforeend",
        `

        <div class="status-item">

          <div class="status-top">

            <div
              class="status-name"
              title="${safe(item.name || "Contact")}"
            >
              ${safe(item.name || "Contact")}
            </div>


            <span
              class="
                status-badge
                ${statusClass(item.status)}
              "
            >
              ${statusText(item.status)}
            </span>

          </div>


<div class="status-value-row">

  <div class="status-value">
    ${safe(item.value || "")}
  </div>

  ${copyButtonHtml(item.value || "")}

</div>

        </div>

        `
      );

  }
);
}

/* =========================================================
   COPY CONTACT
========================================================= */

document.addEventListener(
  "click",
  async event => {

    const button =
      event.target.closest(
        ".copy-contact-btn"
      );

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const value =
      button.dataset.copyValue || "";

    if (!value) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        value
      );

      button.classList.add(
        "copied"
      );

      button.innerHTML = `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
            fill="currentColor"
          />
        </svg>
      `;

      setTimeout(
        () => {
          button.classList.remove(
            "copied"
          );

          button.innerHTML = `
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M9 18q-.825 0-1.412-.587T7 16V4q0-.825.588-1.412T9 2h9q.825 0 1.413.588T20 4v12q0 .825-.587 1.413T18 18zm0-2h9V4H9zm-4 6q-.825 0-1.412-.587T3 20V7q0-.425.288-.712T4 6t.713.288T5 7v13h10q.425 0 .713.288T16 21t-.288.713T15 22zm4-6V4z"
                fill="currentColor"
              />
            </svg>
          `;
        },
        1200
      );

    } catch (error) {

      console.error(
        "Copy failed:",
        error
      );

    }

  }
);

/* =========================================================
   FIREBASE CONTACTS
========================================================= */

onValue(

  ref(
    db,
    "contacts"
  ),


  snapshot => {

    const data =
      snapshot.val() ||
      {};


    contacts =
      Object
        .entries(data)

        .map(
          ([id, value]) => ({
            id,
            ...value
          })
        )

        .sort(
          (a, b) =>

            Number(
              a.sortOrder ||
              999
            )

            -

            Number(
              b.sortOrder ||
              999
            )
        );


    updateCounters();

    renderContacts();


    markReady(
      "contacts"
    );

  },


  error => {

    console.error(
      "Contacts:",
      error
    );


    contactList.innerHTML =
      `
      <div class="empty">
        Unable to load contacts.
      </div>
      `;


    statusList.innerHTML =
      `
      <div class="empty">
        Unable to load status.
      </div>
      `;


    markReady(
      "contacts"
    );

  }

);



/* =========================================================
   SEARCH
========================================================= */

searchInput
  .addEventListener(
    "input",
    () => {

      searchText =
        searchInput
          .value
          .trim();


      clearSearch
        .classList
        .toggle(
          "show",
          Boolean(searchText)
        );


      renderContacts();

    }
  );



clearSearch
  .addEventListener(
    "click",
    () => {

      searchInput.value =
        "";

      searchText =
        "";


      clearSearch
        .classList
        .remove(
          "show"
        );


      renderContacts();


      searchInput.focus();

    }
  );



/* =========================================================
   STATUS FILTER
========================================================= */

document
  .querySelectorAll(
    ".filter-btn"
  )

  .forEach(
    button => {

      button
        .addEventListener(
          "click",
          () => {

            document
              .querySelectorAll(
                ".filter-btn"
              )

              .forEach(
                item => {

                  item
                    .classList
                    .remove(
                      "active"
                    );

                }
              );


            button
              .classList
              .add(
                "active"
              );


            currentFilter =
              button.dataset
                .filter;


            renderContacts();

          }
        );

    }
  );

/* =========================================================
   NOTICE UNREAD SYSTEM
========================================================= */

const NOTICE_READ_STORAGE_KEY =
  "support_notice_read_keys";


function getStoredNoticeReadKeys() {

  try {

    const value =
      JSON.parse(
        localStorage.getItem(
          NOTICE_READ_STORAGE_KEY
        ) || "[]"
      );

    return Array.isArray(value)
      ? value
      : [];

  } catch {

    return [];

  }
}


function saveNoticeReadKeys(keys) {

  try {

    const trimmed =
      [...new Set(keys)]
        .slice(-200);

    localStorage.setItem(
      NOTICE_READ_STORAGE_KEY,
      JSON.stringify(trimmed)
    );

  } catch (error) {

    console.warn(
      "Unable to save notice read status:",
      error
    );

  }
}


function getNoticeReadKey(notice) {

  const id =
    String(
      notice?.id || ""
    );

  const version =
    Number(
      notice?.updatedAt ||
      notice?.createdAt ||
      0
    );

  return (
    id +
    ":" +
    version
  );
}


function updateNoticeUnreadBadge(notices) {

  if (!noticeUnreadBadge) {
    return;
  }

  const readKeys =
    getStoredNoticeReadKeys();

  currentNoticeReadKeys =
    notices.map(
      getNoticeReadKey
    );

  const unreadCount =
    currentNoticeReadKeys
      .filter(
        key =>
          !readKeys.includes(key)
      )
      .length;

  if (unreadCount > 0) {

    noticeUnreadBadge.textContent =
      unreadCount > 99
        ? "99+"
        : String(unreadCount);

    noticeUnreadBadge
      .classList
      .remove("hidden");

  } else {

    noticeUnreadBadge.textContent =
      "0";

    noticeUnreadBadge
      .classList
      .add("hidden");

  }
}


function markCurrentNoticesRead() {

  if (
    !currentNoticeReadKeys.length
  ) {
    return;
  }

  const oldKeys =
    getStoredNoticeReadKeys();

  saveNoticeReadKeys(
    [
      ...oldKeys,
      ...currentNoticeReadKeys
    ]
  );

  if (noticeUnreadBadge) {

    noticeUnreadBadge.textContent =
      "0";

    noticeUnreadBadge
      .classList
      .add("hidden");

  }
}

/* =========================================================
   FIREBASE NOTICES
========================================================= */

/* =========================================================
   FIREBASE NOTICES - FIXED
========================================================= */

onValue(
  ref(db, "notices"),

  snapshot => {

    try {

      const rawData =
        snapshot.val();


      console.log(
        "NOTICE DATA:",
        rawData
      );


      /*
        Kalau database notices kosong
      */

      if (!rawData) {

        noticeList.innerHTML = `
          <div class="empty">
            No announcements at the moment.
          </div>
        `;
currentNoticeReadKeys =
  [];

if (noticeUnreadBadge) {

  noticeUnreadBadge.textContent =
    "0";

  noticeUnreadBadge
    .classList
    .add("hidden");

}
        markReady("notices");

        return;
      }


      /*
        CONVERT FIREBASE OBJECT TO ARRAY
      */

      let notices =
        Object.entries(rawData)
          .map(([id, data]) => {

            return {
              id,
              ...(data || {})
            };

          });


      /*
        NORMALIZE ACTIVE VALUE

        Support:
        true
        false
        "true"
        "false"
        undefined
      */

      notices =
        notices.filter(
          item => {

            const value =
              item.active;


            if (
              value === false ||
              value === "false" ||
              value === 0 ||
              value === "0"
            ) {

              return false;

            }


            return true;

          }
        );


      /*
        PINNED FIRST
        NEWEST SECOND
      */

      notices.sort(
        (a, b) => {

          const aPinned =
            a.pinned === true ||
            a.pinned === "true";


          const bPinned =
            b.pinned === true ||
            b.pinned === "true";


          if (
            aPinned &&
            !bPinned
          ) {

            return -1;

          }


          if (
            !aPinned &&
            bPinned
          ) {

            return 1;

          }


          const aTime =
            Number(
              a.updatedAt ||
              a.createdAt ||
              0
            );


          const bTime =
            Number(
              b.updatedAt ||
              b.createdAt ||
              0
            );


          return (
            bTime -
            aTime
          );

        }
      );

updateNoticeUnreadBadge(
  notices
);
      /*
        CLEAR LOADING
      */

      noticeList.innerHTML =
        "";


      /*
        Kalau semua notice HIDDEN
      */

      if (!notices.length) {

        noticeList.innerHTML = `
          <div class="empty">
            No active announcements.
          </div>
        `;
currentNoticeReadKeys =
  [];

if (noticeUnreadBadge) {

  noticeUnreadBadge.textContent =
    "0";

  noticeUnreadBadge
    .classList
    .add("hidden");

}
        markReady("notices");

        return;
      }



      /*
        RENDER EACH NOTICE
      */

      notices.forEach(
        item => {

          try {

            /*
              ID
            */

            const noticeId =
              String(item.id)
                .replace(
                  /[^a-zA-Z0-9_-]/g,
                  ""
                );


            /*
              TITLE
            */

            const title =
              String(
                item.title ||
                "Notice"
              )
                .trim();


            /*
              MESSAGE

              Support juga kalau suatu masa
              field admin dinamakan caption/text.
            */

            const message =
              String(
                item.message ??
                item.caption ??
                item.text ??
                ""
              )

                .replace(
                  /\r\n/g,
                  "\n"
                )

                .replace(
                  /\n{3,}/g,
                  "\n\n"
                )

                .trim();



            /*
              IMAGE

              Support beberapa nama field
            */

            const rawImage =
              item.imageUrl ||
              item.image ||
              item.imageURL ||
              item.photoUrl ||
              "";


            const image =
              safeUrl(
                rawImage
              );



            /*
              PIN
            */

            const pinned =
              item.pinned === true ||
              item.pinned === "true";



            /*
              IMAGE HTML
            */

            let imageHtml =
              "";


            if (image) {

              imageHtml = `

                <div
                  class="notice-image-wrap"
                  data-preview-image="${safe(image)}"
                >

                  <img
                    class="notice-img"
                    src="${safe(image)}"
                    alt="${safe(title)}"
                    loading="lazy"
                    onerror="
                      this.closest('.notice-image-wrap').style.display='none'
                    "
                  >

                  <div class="preview-button">
                    ⛶ Preview
                  </div>

                </div>

              `;

            }



            /*
              DATE
            */

            const timestamp =
              Number(
                item.updatedAt ||
                item.createdAt ||
                0
              );


            let dateText =
              "";


            if (
              timestamp > 0
            ) {

              try {

                dateText =
                  new Date(
                    timestamp
                  )
                    .toLocaleString(
                      undefined,
                      {
                        dateStyle:
                          "medium",

                        timeStyle:
                          "short"
                      }
                    );

              } catch {

                dateText =
                  new Date(
                    timestamp
                  )
                    .toLocaleString();

              }

            }



            /*
              CARD
            */

            const html = `

              <article class="notice-card">

                ${imageHtml}


                <div class="notice-body">


                  <div class="notice-meta">

                    <span class="notice-tag">
                      NOTICE
                    </span>


                    ${
                      pinned

                        ? `
                          <span class="pinned-tag">
                            📌 PINNED
                          </span>
                        `

                        : ""
                    }

                  </div>



                  <h3>
                    ${safe(title)}
                  </h3>



                  ${
                    message

                      ? `

                        <div
                          id="notice-message-${noticeId}"
                          class="notice-message"
                        >
                          ${safe(message)}
                        </div>


                        <button
                          class="notice-expand"
                          type="button"
                          data-target="notice-message-${noticeId}"
                        >
                          Expand ↓
                        </button>

                      `

                      : `

                        <div class="notice-message">
                          No caption.
                        </div>

                      `
                  }



                  <div class="notice-footer">

                    <div class="notice-date">

                      ${
                        dateText

                          ? "Updated " +
                            safe(dateText)

                          : ""
                      }

                    </div>

                  </div>


                </div>

              </article>

            `;


            noticeList
              .insertAdjacentHTML(
                "beforeend",
                html
              );


          } catch (itemError) {

            console.error(
              "NOTICE ITEM ERROR:",
              item.id,
              itemError
            );

          }

        }
      );



      /*
        SETUP AFTER HTML EXISTS
      */

      setupNoticeButtons();

      setupImagePreview();


      markReady(
        "notices"
      );


    } catch (error) {

      console.error(
        "NOTICE RENDER ERROR:",
        error
      );


      noticeList.innerHTML = `

        <div class="empty">

          Failed to display announcements.

        </div>

      `;


      markReady(
        "notices"
      );

    }

  },


  error => {

    console.error(
      "FIREBASE NOTICE ERROR:",
      error
    );


    noticeList.innerHTML = `

      <div class="empty">

        Unable to load announcements.

      </div>

    `;


    markReady(
      "notices"
    );

  }

);


/* =========================================================
   READ MORE / SHOW LESS
========================================================= */

function setupNoticeButtons() {

  const COLLAPSED_HEIGHT_DESKTOP =
    112;


  const COLLAPSED_HEIGHT_MOBILE =
    100;


  const getCollapsedHeight =
    () => {

      return window.innerWidth <= 760
        ? COLLAPSED_HEIGHT_MOBILE
        : COLLAPSED_HEIGHT_DESKTOP;

    };


  document
    .querySelectorAll(
      ".notice-expand"
    )

    .forEach(
      button => {

        const targetId =
          button.dataset.target;


        const target =
          document.getElementById(
            targetId
          );


        if (!target) {
          return;
        }


        /*
          Mula-mula biarkan caption terbuka supaya
          browser boleh ukur tinggi sebenar.
        */

        target.classList.remove(
          "collapsed",
          "expanded"
        );


        button.classList.remove(
          "show"
        );


        /*
          Tunggu browser selesai render.
        */

        requestAnimationFrame(
          () => {

            requestAnimationFrame(
              () => {

                const collapsedHeight =
                  getCollapsedHeight();


                const actualHeight =
                  target.scrollHeight;


                /*
                  Hanya collapse bila text benar-benar
                  lebih tinggi daripada kawasan preview.
                */

                if (
                  actualHeight >
                  collapsedHeight + 4
                ) {

                  target
                    .classList
                    .add(
                      "collapsed"
                    );


                  button
                    .classList
                    .add(
                      "show"
                    );


                  button.textContent =
                    "Expand ↓";

                } else {

                  /*
                    Caption pendek:
                    tunjuk semuanya dan button tak perlu.
                  */

                  target
                    .classList
                    .remove(
                      "collapsed"
                    );


                  button
                    .classList
                    .remove(
                      "show"
                    );

                }

              }
            );

          }
        );



        /*
          EXPAND / COLLAPSE
        */

        button.addEventListener(
          "click",
          () => {

            const isCollapsed =
              target
                .classList
                .contains(
                  "collapsed"
                );


            if (isCollapsed) {

              /*
                OPEN FULL CAPTION
              */

              target
                .classList
                .remove(
                  "collapsed"
                );


              target
                .classList
                .add(
                  "expanded"
                );


              button.textContent =
                "Collapse ↑";

            } else {

              /*
                COLLAPSE BACK
              */

              target
                .classList
                .remove(
                  "expanded"
                );


              target
                .classList
                .add(
                  "collapsed"
                );


              button.textContent =
                "Expand ↓";

            }

          }
        );

      }
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function setupImagePreview() {

  document
    .querySelectorAll(
      "[data-preview-image]"
    )

    .forEach(
      element => {

        element
          .addEventListener(
            "click",
            () => {

              const url =
                element.dataset
                  .previewImage;


              if (!url) {
                return;
              }


              openPreview(
                url
              );

            }
          );

      }
    );

}



function openPreview(url) {

  /* RESET ZOOM SETIAP KALI BUKA GAMBAR */

  imageZoom =
    1;

  imageTranslateX =
    0;

  imageTranslateY =
    0;

  imageDragging =
    false;


  modalImage.src =
    url;


  updateModalImageTransform();


  imageModal
    .classList
    .add(
      "open"
    );


  imageModal
    .setAttribute(
      "aria-hidden",
      "false"
    );


  document.body
    .classList
    .add(
      "modal-open"
    );

}


function closePreview() {

  imageModal
    .classList
    .remove(
      "open"
    );


  imageModal
    .setAttribute(
      "aria-hidden",
      "true"
    );


  document.body
    .classList
    .remove(
      "modal-open"
    );

imageZoom =
  1;

imageTranslateX =
  0;

imageTranslateY =
  0;

imageDragging =
  false;

updateModalImageTransform();
  setTimeout(
    () => {

      modalImage.src =
        "";

    },
    150
  );

}

/* =========================================================
   IMAGE WHEEL ZOOM
========================================================= */

if (modalImage) {

  modalImage.addEventListener(
    "wheel",
    event => {

      event.preventDefault();

      const zoomStep =
        0.18;


      /* SCROLL UP = ZOOM IN */

      if (
        event.deltaY < 0
      ) {

        imageZoom +=
          zoomStep;

      }


      /* SCROLL DOWN = ZOOM OUT */

      else {

        imageZoom -=
          zoomStep;

      }


      /* LIMIT 1x - 5x */

      imageZoom =
        Math.max(
          1,
          Math.min(
            imageZoom,
            5
          )
        );


      /* RESET POSITION AT 1x */

      if (
        imageZoom === 1
      ) {

        imageTranslateX =
          0;

        imageTranslateY =
          0;

      }


      updateModalImageTransform();

    },
    {
      passive: false
    }
  );

}
/* =========================================================
   IMAGE DRAG / PAN
========================================================= */

if (modalImage) {

  modalImage.addEventListener(
    "mousedown",
    event => {

      if (
        imageZoom <= 1
      ) {
        return;
      }


      imageDragging =
        true;


      imageDragStartX =
        event.clientX -
        imageTranslateX;


      imageDragStartY =
        event.clientY -
        imageTranslateY;


      modalImage
        .classList
        .add(
          "dragging"
        );


      event.preventDefault();

    }
  );


  window.addEventListener(
    "mousemove",
    event => {

      if (
        !imageDragging
      ) {
        return;
      }


      imageTranslateX =
        event.clientX -
        imageDragStartX;


      imageTranslateY =
        event.clientY -
        imageDragStartY;


      updateModalImageTransform();

    }
  );


  window.addEventListener(
    "mouseup",
    () => {

      imageDragging =
        false;


      modalImage
        .classList
        .remove(
          "dragging"
        );

    }
  );

}

/* =========================================================
   DOUBLE CLICK RESET
========================================================= */

if (modalImage) {

  modalImage.addEventListener(
    "dblclick",
    () => {

      imageZoom =
        1;

      imageTranslateX =
        0;

      imageTranslateY =
        0;


      updateModalImageTransform();

    }
  );

}

closeImageModal
  .addEventListener(
    "click",
    closePreview
  );


modalBackdrop
  .addEventListener(
    "click",
    closePreview
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    /* IMAGE PREVIEW */

    if (
      imageModal &&
      imageModal
        .classList
        .contains("open")
    ) {

      closePreview();

    }


    /* NOTICE MODAL */

    if (
      noticeCenterModal &&
      noticeCenterModal
        .classList
        .contains("open")
    ) {

      closeNoticeCenter();

    }

  }
);
/* =========================================================
   NOTICE CENTER MODAL
========================================================= */

function openNoticeCenter() {

  if (!noticeCenterModal) {
    return;
  }

  noticeCenterModal
    .classList
    .add("open");

  noticeCenterModal
    .setAttribute(
      "aria-hidden",
      "false"
    );

  document.body
    .classList
    .add(
      "notice-modal-open"
    );

  markCurrentNoticesRead();
}


function closeNoticeCenter() {

  if (!noticeCenterModal) {
    return;
  }

  noticeCenterModal
    .classList
    .remove("open");

  noticeCenterModal
    .setAttribute(
      "aria-hidden",
      "true"
    );

  document.body
    .classList
    .remove(
      "notice-modal-open"
    );
}


if (noticeCenterBtn) {

  noticeCenterBtn
    .addEventListener(
      "click",
      openNoticeCenter
    );

}


if (noticeCenterClose) {

  noticeCenterClose
    .addEventListener(
      "click",
      closeNoticeCenter
    );

}


if (noticeCenterBackdrop) {

  noticeCenterBackdrop
    .addEventListener(
      "click",
      closeNoticeCenter
    );

}
/* =========================================================
   FLOATING PROMO IMAGE
========================================================= */

const floatingPromoPosition =
  document.getElementById(
    "floatingPromoPosition"
  );

const floatingPromoMotion =
  document.getElementById(
    "floatingPromoMotion"
  );

const floatingPromoImage =
  document.getElementById(
    "floatingPromoImage"
  );

const floatingPromoLink =
  document.getElementById(
    "floatingPromoLink"
  );

const floatingPromoClose =
  document.getElementById(
    "floatingPromoClose"
  );


let floatingCurrentSettings =
  null;


/* =========================================================
   ALLOWED VALUES
========================================================= */

const FLOATING_POSITIONS = [
  "left-top",
  "left-center",
  "left-bottom",

  "right-top",
  "right-center",
  "right-bottom",

  "center-top",
  "center-bottom"
];


const FLOATING_ANIMATIONS = [
  "none",
  "left-right",
  "right-left",
  "top-bottom",
  "bottom-top",
  "soft"
];


/* =========================================================
   BOOLEAN HELPER

   Support:
   true
   false
   "true"
   "false"
   1
   0
========================================================= */

function floatingBoolean(
  value,
  defaultValue = true
) {

  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }


  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {
    return false;
  }


  return defaultValue;
}


/* =========================================================
   HIDE FLOATING
========================================================= */

function hideFloatingPromo() {

  if (!floatingPromoPosition) {
    return;
  }


  floatingPromoPosition
    .classList
    .remove(
      "floating-show"
    );


  floatingPromoPosition
    .classList
    .add(
      "floating-hidden"
    );


  floatingPromoPosition
    .setAttribute(
      "aria-hidden",
      "true"
    );
}


/* =========================================================
   CLEAR POSITION + ANIMATION CLASSES
========================================================= */

function clearFloatingClasses() {

  if (
    !floatingPromoPosition ||
    !floatingPromoMotion
  ) {
    return;
  }


  FLOATING_POSITIONS.forEach(
    position => {

      floatingPromoPosition
        .classList
        .remove(
          `floating-pos-${position}`
        );

    }
  );


  FLOATING_ANIMATIONS.forEach(
    animation => {

      floatingPromoMotion
        .classList
        .remove(
          `floating-anim-${animation}`
        );

    }
  );
}


/* =========================================================
   CHECK CUSTOMER CLOSED
========================================================= */

function floatingWasClosed(
  settings
) {

  const mode =
    String(
      settings?.close_mode ||
      "session"
    )
      .toLowerCase()
      .trim();


  /* SESSION */

  if (mode === "session") {

    return (
      sessionStorage.getItem(
        "floating_promo_closed"
      ) === "1"
    );

  }


  /* 24 HOURS */

  if (mode === "24h") {

    const closedUntil =
      Number(
        localStorage.getItem(
          "floating_promo_closed_until"
        ) || 0
      );


    return (
      Date.now() <
      closedUntil
    );

  }


  /*
    REFRESH

    Tidak simpan apa-apa.
    Refresh = muncul semula.
  */

  return false;
}


/* =========================================================
   DEVICE CHECK
========================================================= */

function floatingAllowedOnDevice(
  settings
) {

  const isMobile =
    window.innerWidth <= 760;


  const showMobile =
    floatingBoolean(
      settings.show_mobile,
      true
    );


  const showDesktop =
    floatingBoolean(
      settings.show_desktop,
      true
    );


  if (
    isMobile &&
    !showMobile
  ) {
    return false;
  }


  if (
    !isMobile &&
    !showDesktop
  ) {
    return false;
  }


  return true;
}


/* =========================================================
   RENDER FLOATING PROMO
========================================================= */

function renderFloatingPromo(
  settings
) {

  floatingCurrentSettings =
    settings || {};


  if (
    !floatingPromoPosition ||
    !floatingPromoMotion ||
    !floatingPromoImage ||
    !floatingPromoLink ||
    !floatingPromoClose
  ) {

    console.warn(
      "Floating promo HTML not found."
    );

    return;
  }


  clearFloatingClasses();


  /* =====================================================
     ENABLE / DISABLE
  ===================================================== */

  const enabled =
    floatingBoolean(
      settings?.enabled,
      false
    );


  if (!enabled) {

    hideFloatingPromo();

    return;
  }


  /* =====================================================
     IMAGE URL
  ===================================================== */

  const imageUrl =
    safeUrl(
      settings?.image_url ||
      settings?.imageUrl ||
      ""
    );


  if (!imageUrl) {

    hideFloatingPromo();

    return;
  }


  /* =====================================================
     DEVICE
  ===================================================== */

  if (
    !floatingAllowedOnDevice(
      settings
    )
  ) {

    hideFloatingPromo();

    return;
  }


  /* =====================================================
     CUSTOMER ALREADY CLOSED
  ===================================================== */

  if (
    floatingWasClosed(
      settings
    )
  ) {

    hideFloatingPromo();

    return;
  }


  /* =====================================================
     IMAGE
  ===================================================== */

  floatingPromoImage.src =
    imageUrl;


  floatingPromoImage.onerror =
    () => {

      console.warn(
        "Floating image failed to load."
      );

      hideFloatingPromo();

    };


  /* =====================================================
     CLICK URL
  ===================================================== */

  const clickUrl =
    safeUrl(
      settings?.click_url ||
      settings?.clickUrl ||
      ""
    );


  if (clickUrl) {

    floatingPromoLink.href =
      clickUrl;


    floatingPromoLink
      .classList
      .remove(
        "disabled"
      );

  } else {

    floatingPromoLink.href =
      "#";


    floatingPromoLink
      .classList
      .add(
        "disabled"
      );

  }


  /* =====================================================
     WIDTH DESKTOP
  ===================================================== */

  let width =
    Number(
      settings?.width ??
      140
    );


  if (
    !Number.isFinite(width)
  ) {
    width = 140;
  }


  width =
    Math.max(
      50,
      Math.min(
        width,
        500
      )
    );


  floatingPromoPosition
    .style
    .setProperty(
      "--floating-width",
      `${width}px`
    );


  /* =====================================================
     WIDTH MOBILE
  ===================================================== */

  let mobileWidth =
    Number(
      settings?.mobile_width ??
      95
    );


  if (
    !Number.isFinite(
      mobileWidth
    )
  ) {
    mobileWidth = 95;
  }


  mobileWidth =
    Math.max(
      45,
      Math.min(
        mobileWidth,
        300
      )
    );


  floatingPromoPosition
    .style
    .setProperty(
      "--floating-mobile-width",
      `${mobileWidth}px`
    );


  /* =====================================================
     SPEED
  ===================================================== */

  let speed =
    Number(
      settings?.speed ??
      6
    );


  if (
    !Number.isFinite(speed)
  ) {
    speed = 6;
  }


  speed =
    Math.max(
      1,
      Math.min(
        speed,
        30
      )
    );


  floatingPromoPosition
    .style
    .setProperty(
      "--floating-speed",
      `${speed}s`
    );


  /* =====================================================
     MOVEMENT DISTANCE
  ===================================================== */

  let distance =
    Number(
      settings?.distance ??
      18
    );


  if (
    !Number.isFinite(
      distance
    )
  ) {
    distance = 18;
  }


  distance =
    Math.max(
      0,
      Math.min(
        distance,
        150
      )
    );


  floatingPromoPosition
    .style
    .setProperty(
      "--floating-distance",
      `${distance}px`
    );


  /* =====================================================
     OPACITY

     Firebase boleh simpan:
     1
     0.8
     80
     100
  ===================================================== */

  let opacity =
    Number(
      settings?.opacity ??
      1
    );


  if (
    !Number.isFinite(
      opacity
    )
  ) {
    opacity = 1;
  }


  /*
    Kalau admin simpan 80,
    convert kepada 0.8.
  */

  if (opacity > 1) {

    opacity =
      opacity / 100;

  }


  opacity =
    Math.max(
      0.1,
      Math.min(
        opacity,
        1
      )
    );


  floatingPromoPosition
    .style
    .setProperty(
      "--floating-opacity",
      opacity
    );


  /* =====================================================
     POSITION
  ===================================================== */

  let position =
    String(
      settings?.position ||
      "right-center"
    )
      .toLowerCase()
      .trim();


  if (
    !FLOATING_POSITIONS
      .includes(
        position
      )
  ) {

    position =
      "right-center";

  }


  floatingPromoPosition
    .classList
    .add(
      `floating-pos-${position}`
    );


  /* =====================================================
     ANIMATION
  ===================================================== */

  let animation =
    String(
      settings?.animation ||
      "soft"
    )
      .toLowerCase()
      .trim();


  if (
    !FLOATING_ANIMATIONS
      .includes(
        animation
      )
  ) {

    animation =
      "soft";

  }


  floatingPromoMotion
    .classList
    .add(
      `floating-anim-${animation}`
    );


  /* =====================================================
     CLOSE BUTTON
  ===================================================== */

  const showClose =
    floatingBoolean(
      settings?.show_close,
      true
    );


  floatingPromoClose
    .classList
    .toggle(
      "hide",
      !showClose
    );


  /* =====================================================
     SHOW FLOATING
  ===================================================== */

  floatingPromoPosition
    .classList
    .remove(
      "floating-hidden"
    );


  floatingPromoPosition
    .classList
    .add(
      "floating-show"
    );


  floatingPromoPosition
    .setAttribute(
      "aria-hidden",
      "false"
    );
}


/* =========================================================
   CLOSE BUTTON
========================================================= */

if (floatingPromoClose) {

  floatingPromoClose
    .addEventListener(
      "click",
      event => {

        event.preventDefault();

        event.stopPropagation();


        const settings =
          floatingCurrentSettings ||
          {};


        const mode =
          String(
            settings.close_mode ||
            "session"
          )
            .toLowerCase()
            .trim();


        /* SESSION */

        if (
          mode === "session"
        ) {

          sessionStorage
            .setItem(
              "floating_promo_closed",
              "1"
            );

        }


        /* 24 HOURS */

        if (
          mode === "24h"
        ) {

          const oneDay =
            24 *
            60 *
            60 *
            1000;


          localStorage
            .setItem(
              "floating_promo_closed_until",
              String(
                Date.now() +
                oneDay
              )
            );

        }


        /*
          REFRESH:
          tidak save storage.
        */


        hideFloatingPromo();

      }
    );

}


/* =========================================================
   DISABLE EMPTY LINK
========================================================= */

if (floatingPromoLink) {

  floatingPromoLink
    .addEventListener(
      "click",
      event => {

        if (
          floatingPromoLink
            .classList
            .contains(
              "disabled"
            )
        ) {

          event.preventDefault();

        }

      }
    );

}


/* =========================================================
   FIREBASE FLOATING IMAGE
========================================================= */

onValue(

  ref(
    db,
    "floating_image"
  ),


  snapshot => {

    try {

      const settings =
        snapshot.val();


      renderFloatingPromo(
        settings
      );


    } catch (error) {

      console.error(
        "Floating promo render error:",
        error
      );


      hideFloatingPromo();

    }

  },


  error => {

    console.error(
      "Floating promo Firebase error:",
      error
    );


    hideFloatingPromo();

  }

);


/* =========================================================
   RESPONSIVE UPDATE
========================================================= */

let floatingResizeTimer =
  null;


window.addEventListener(
  "resize",
  () => {

    clearTimeout(
      floatingResizeTimer
    );


    floatingResizeTimer =
      setTimeout(
        () => {

          if (
            floatingCurrentSettings
          ) {

            renderFloatingPromo(
              floatingCurrentSettings
            );

          }

        },
        120
      );

  }
);
/* =========================================================
   CUSTOMER MARQUEE
========================================================= */

const marqueeTopMount =
  document.getElementById(
    "marqueeTopMount"
  );


const marqueeBottomMount =
  document.getElementById(
    "marqueeBottomMount"
  );


let siteMarquee =
  null;


let siteMarqueeTrack =
  null;


let marqueeTextOne =
  null;


let marqueeTextTwo =
  null;



/* =========================================================
   CREATE ELEMENT
========================================================= */

function createSiteMarquee() {

  if (siteMarquee) {
    return;
  }


  siteMarquee =
    document.createElement(
      "div"
    );


  siteMarquee.className =
    "site-marquee marquee-hidden";


  siteMarqueeTrack =
    document.createElement(
      "div"
    );


  siteMarqueeTrack.className =
    "site-marquee-track";


  marqueeTextOne =
    document.createElement(
      "span"
    );


  marqueeTextOne.className =
    "site-marquee-text";


  marqueeTextTwo =
    document.createElement(
      "span"
    );


  marqueeTextTwo.className =
    "site-marquee-text";


  siteMarqueeTrack.appendChild(
    marqueeTextOne
  );


  siteMarqueeTrack.appendChild(
    marqueeTextTwo
  );


  siteMarquee.appendChild(
    siteMarqueeTrack
  );

}



/* =========================================================
   BOOLEAN HELPER
========================================================= */

function marqueeBoolean(
  value,
  fallback = true
) {

  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {

    return true;

  }


  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {

    return false;

  }


  return fallback;
}



/* =========================================================
   SAFE COLOR
========================================================= */

function marqueeColor(
  value,
  fallback
) {

  const color =
    String(
      value || ""
    ).trim();


  /*
    Admin type=color akan simpan
    format #RRGGBB.
  */

  if (
    /^#[0-9a-f]{6}$/i.test(
      color
    )
  ) {

    return color;

  }


  return fallback;
}



/* =========================================================
   RENDER MARQUEE
========================================================= */

function renderSiteMarquee(
  settings
) {

  createSiteMarquee();


  if (
    !siteMarquee ||
    !siteMarqueeTrack ||
    !marqueeTextOne ||
    !marqueeTextTwo
  ) {

    return;

  }


  /* =====================================================
     ENABLE
  ===================================================== */

  const enabled =
    marqueeBoolean(
      settings?.enabled,
      false
    );


  /* =====================================================
     TEXT
  ===================================================== */

  const text =
    String(
      settings?.text ||
      ""
    )
      .replace(
        /\s+/g,
        " "
      )
      .trim();


  if (
    !enabled ||
    !text
  ) {

    siteMarquee
      .classList
      .add(
        "marquee-hidden"
      );


    return;

  }


  /*
    Duplicate text supaya movement
    nampak continuous.
  */

  marqueeTextOne.textContent =
    text;


  marqueeTextTwo.textContent =
    text;



  /* =====================================================
     POSITION
  ===================================================== */

  const position =
    String(
      settings?.position ||
      "top"
    )
      .toLowerCase()
      .trim();


  if (
    position === "bottom"
  ) {

    if (
      marqueeBottomMount &&
      siteMarquee.parentElement !==
        marqueeBottomMount
    ) {

      marqueeBottomMount
        .appendChild(
          siteMarquee
        );

    }

  } else {

    if (
      marqueeTopMount &&
      siteMarquee.parentElement !==
        marqueeTopMount
    ) {

      marqueeTopMount
        .appendChild(
          siteMarquee
        );

    }

  }



  /* =====================================================
     DIRECTION
  ===================================================== */

  siteMarquee
    .classList
    .remove(
      "marquee-direction-rtl",
      "marquee-direction-ltr"
    );


  const direction =
    String(
      settings?.direction ||
      "right-to-left"
    )
      .toLowerCase()
      .trim();


  if (
    direction ===
    "left-to-right"
  ) {

    siteMarquee
      .classList
      .add(
        "marquee-direction-ltr"
      );

  } else {

    siteMarquee
      .classList
      .add(
        "marquee-direction-rtl"
      );

  }



  /* =====================================================
     SPEED
  ===================================================== */

  let speed =
    Number(
      settings?.speed ??
      15
    );


  if (
    !Number.isFinite(
      speed
    )
  ) {

    speed = 15;

  }


  speed =
    Math.max(
      3,
      Math.min(
        speed,
        60
      )
    );


  siteMarquee.style
    .setProperty(
      "--marquee-speed",
      `${speed}s`
    );



  /* =====================================================
     FONT SIZE
  ===================================================== */

  let fontSize =
    Number(
      settings?.font_size ??
      13
    );


  if (
    !Number.isFinite(
      fontSize
    )
  ) {

    fontSize = 13;

  }


  fontSize =
    Math.max(
      8,
      Math.min(
        fontSize,
        40
      )
    );


  siteMarquee.style
    .setProperty(
      "--marquee-font-size",
      `${fontSize}px`
    );



  /* =====================================================
     COLORS
  ===================================================== */

  const textColor =
    marqueeColor(
      settings?.text_color,
      "#f8dd76"
    );


  const lineColor =
    marqueeColor(
      settings?.line_color,
      "#f8dd76"
    );


  const backgroundColor =
    marqueeColor(
      settings?.background_color,
      "#181818"
    );


  siteMarquee.style
    .setProperty(
      "--marquee-text-color",
      textColor
    );


  siteMarquee.style
    .setProperty(
      "--marquee-line-color",
      lineColor
    );


  siteMarquee.style
    .setProperty(
      "--marquee-bg-color",
      backgroundColor
    );



  /* =====================================================
     PAUSE HOVER
  ===================================================== */

  const pauseHover =
    marqueeBoolean(
      settings?.pause_hover,
      true
    );


  siteMarquee
    .classList
    .toggle(
      "marquee-pause-hover",
      pauseHover
    );



  /* =====================================================
     RESTART ANIMATION

     Penting apabila admin ubah direction/speed.
  ===================================================== */

  siteMarqueeTrack.style.animation =
    "none";


  /*
    Force reflow
  */

  void siteMarqueeTrack.offsetWidth;


  siteMarqueeTrack.style.animation =
    "";



  /* =====================================================
     SHOW
  ===================================================== */

  siteMarquee
    .classList
    .remove(
      "marquee-hidden"
    );

}



/* =========================================================
   FIREBASE MARQUEE
========================================================= */

onValue(

  ref(
    db,
    "marquee"
  ),


  snapshot => {

    try {

      const settings =
        snapshot.val();


      renderSiteMarquee(
        settings
      );


    } catch (error) {

      console.error(
        "Marquee render error:",
        error
      );


      if (siteMarquee) {

        siteMarquee
          .classList
          .add(
            "marquee-hidden"
          );

      }

    }

  },


  error => {

    console.error(
      "Marquee Firebase error:",
      error
    );


    if (siteMarquee) {

      siteMarquee
        .classList
        .add(
          "marquee-hidden"
        );

    }

  }

);
