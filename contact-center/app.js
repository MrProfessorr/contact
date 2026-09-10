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

const LOADER_MIN_MS =
  3000;


const LOADER_MAX_MS =
  10000;


const loaderStartedAt =
  Date.now();


const firebaseReady = {

  contacts: false,
  notices: false,
  settings: false

};



/* =========================================================
   DOM
========================================================= */

const pageLoader =
  document.getElementById(
    "pageLoader"
  );


const loaderTitle =
  document.getElementById(
    "loaderTitle"
  );


const contactList =
  document.getElementById(
    "contactList"
  );


const statusList =
  document.getElementById(
    "statusList"
  );


const noticeList =
  document.getElementById(
    "noticeList"
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


const closeImageModal =
  document.getElementById(
    "closeImageModal"
  );


const modalBackdrop =
  document.getElementById(
    "modalBackdrop"
  );



/* =========================================================
   STATE
========================================================= */

let contacts = [];

let currentFilter =
  "all";

let searchText =
  "";



/* =========================================================
   PAGE LOADER
========================================================= */

function markReady(section) {

  firebaseReady[section] =
    true;


  const allReady =
    firebaseReady.contacts &&
    firebaseReady.notices &&
    firebaseReady.settings;


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
      LOADER_MIN_MS - elapsed
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

      const matchesFilter =

        currentFilter ===
        "all"

        ||

        item.status ===
        currentFilter;


      const haystack =
        [

          item.name,
          item.value,
          item.type,
          item.description

        ]

        .join(" ")

        .toLowerCase();


      const matchesSearch =
        haystack.includes(
          searchText.toLowerCase()
        );


      return (
        matchesFilter &&
        matchesSearch
      );

    }
  );

}



/* =========================================================
   RENDER CONTACTS
========================================================= */

function renderContacts() {

  const filtered =
    getFilteredContacts();


  contactList.innerHTML =
    "";


  statusList.innerHTML =
    "";



  /*
    NO RESULTS
  */

  if (
    !filtered.length
  ) {

    contactList.innerHTML =
      `
      <div class="empty">
        No contact found.
      </div>
      `;


    statusList.innerHTML =
      `
      <div class="empty">
        No contact status found.
      </div>
      `;


    return;

  }



  /*
    CONTACT CARDS
  */

  filtered.forEach(
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


              <div class="contact-value">

                ${safe(item.value || "")}

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



      /*
        SIDEBAR ITEM
      */

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


            <div class="status-value">

              ${safe(item.value || "")}

            </div>

          </div>

          `
        );

    }
  );

}



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
   FIREBASE NOTICES
========================================================= */

onValue(

  ref(
    db,
    "notices"
  ),


  snapshot => {

    const data =
      snapshot.val() ||
      {};


    const notices =
      Object
        .entries(data)

        .map(
          ([id, value]) => ({
            id,
            ...value
          })
        )

        .filter(
          item =>
            item.active !==
            false
        )

        .sort(
          (a, b) => {

            /*
              PINNED FIRST
            */

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


            /*
              NEWEST FIRST
            */

            return (

              Number(
                b.updatedAt ||
                b.createdAt ||
                0
              )

              -

              Number(
                a.updatedAt ||
                a.createdAt ||
                0
              )

            );

          }
        );


    noticeList.innerHTML =
      "";



    if (
      !notices.length
    ) {

      noticeList.innerHTML =
        `
        <div class="empty">
          No announcements at the moment.
        </div>
        `;


      markReady(
        "notices"
      );


      return;

    }



    notices.forEach(
      item => {

        const noticeId =
          safe(
            item.id
          );


        const image =
          safeUrl(
            item.imageUrl
          );


/*
  CLEAN NOTICE MESSAGE

  - kekalkan ENTER customer/admin
  - buang blank line terlalu banyak
  - trim space di awal dan akhir
*/

const message =
  String(
    item.message || ""
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



        let imageHtml =
          "";


        if (
          image
        ) {

          imageHtml =
            `

            <div
              class="notice-image-wrap"

              data-preview-image="${safe(image)}"
            >

              <img
                class="notice-img"

                src="${safe(image)}"

                alt="${safe(item.title || "Notice")}"

                loading="lazy"
              >


              <div class="preview-button">

                ⛶ Preview

              </div>

            </div>

            `;

        }



        const timestamp =

          item.updatedAt ||

          item.createdAt;



        let dateText =
          "";


        if (
          timestamp
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

          } catch (error) {

            dateText =
              new Date(
                timestamp
              )
                .toLocaleString();

          }

        }



        noticeList
          .insertAdjacentHTML(
            "beforeend",
            `

            <article class="notice-card">

              ${imageHtml}


              <div class="notice-body">


                <div class="notice-meta">


                  <span class="notice-tag">

                    NOTICE

                  </span>


                  ${
                    item.pinned

                      ? `
                        <span class="pinned-tag">

                          📌 PINNED

                        </span>
                      `

                      : ""
                  }


                </div>



                <h3>

                  ${safe(item.title || "Notice")}

                </h3>



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



                <div class="notice-footer">

                  <div class="notice-date">

                    ${
                      dateText

                        ? "Updated " +
                          safe(
                            dateText
                          )

                        : ""
                    }

                  </div>

                </div>

              </div>

            </article>

            `
          );

      }
    );


    setupNoticeButtons();

    setupImagePreview();


    markReady(
      "notices"
    );

  },


  error => {

    console.error(
      "Notices:",
      error
    );


    noticeList.innerHTML =
      `
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

  modalImage.src =
    url;


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


  setTimeout(
    () => {

      modalImage.src =
        "";

    },
    150
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


document
  .addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closePreview();

      }

    }
  );



/* =========================================================
   SETTINGS
========================================================= */

onValue(

  ref(
    db,
    "settings"
  ),


  snapshot => {

    const settings =
      snapshot.val() ||
      {};



    /*
      SITE NAME
    */

    if (
      settings.siteName
    ) {

      document
        .getElementById(
          "siteName"
        )
        .textContent =
          settings.siteName;


      loaderTitle
        .textContent =
          settings.siteName;


      document.title =
        settings.siteName;

    }



    /*
      SUBTITLE
    */

    if (
      settings.subtitle
    ) {

      document
        .getElementById(
          "siteSubtitle"
        )
        .textContent =
          settings.subtitle;

    }



    /*
      LOGO
    */

    const logo =
      safeUrl(
        settings.logoUrl
      );


    if (
      logo
    ) {

      document
        .getElementById(
          "siteLogo"
        )
        .src =
          logo;

    }



    /*
      FOOTER
    */

    if (
      settings.footerText
    ) {

      document
        .getElementById(
          "footerText"
        )
        .textContent =
          settings.footerText;

    }



    /*
      LAST UPDATE
    */

    if (
      settings.updatedAt
    ) {

      document
        .getElementById(
          "lastUpdated"
        )
        .textContent =

          "Last update: " +

          new Date(
            settings.updatedAt
          )
            .toLocaleString();

    }



    markReady(
      "settings"
    );

  },


  error => {

    console.error(
      "Settings:",
      error
    );


    markReady(
      "settings"
    );

  }

);
