import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";


import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";



/* =========================================
   FIREBASE
========================================= */

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



/* =========================================
   DOM
========================================= */

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



/* =========================================
   STATE
========================================= */

let contacts = [];

let currentFilter =
  "all";

let searchText =
  "";



/* =========================================
   SAFE HTML
========================================= */

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



/* =========================================
   SAFE URL
========================================= */

function safeUrl(value = "") {

  const url =
    String(value || "")
      .trim();


  if (!url) {
    return "";
  }


  try {

    const parsed =
      new URL(url);


    if (
      parsed.protocol ===
        "http:" ||
      parsed.protocol ===
        "https:"
    ) {

      return parsed.href;
    }

  } catch (_) {
  }


  return "";
}



/* =========================================
   BUILD CONTACT LINK
========================================= */

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



  /* CUSTOM LINK */

  if (custom) {

    try {

      const withProtocol =
        /^https?:\/\//i.test(custom)
          ? custom
          : "https://" + custom;


      const parsed =
        new URL(withProtocol);


      if (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      ) {

        return parsed.href;
      }

    } catch (_) {
    }

  }



  /* WHATSAPP */

  if (
    type === "whatsapp"
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



  /* TELEGRAM */

  if (
    type === "telegram"
  ) {

    const username =
      value

        .replace(
          /^https?:\/\/t\.me\//i,
          ""
        )

        .replace(
          "@",
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



  /* NORMAL URL */

  if (
    type === "website" ||
    type === "facebook" ||
    type === "instagram" ||
    type === "other"
  ) {

    try {

      const withProtocol =
        /^https?:\/\//i.test(value)
          ? value
          : "https://" + value;


      const parsed =
        new URL(withProtocol);


      if (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      ) {

        return parsed.href;
      }

    } catch (_) {
    }

  }


  return "#";
}



/* =========================================
   CONTACT ICON
========================================= */

function getContactIcon(type) {

  type =
    String(type || "")
      .toLowerCase();


  switch (type) {

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



/* =========================================
   STATUS
========================================= */

function statusText(status) {

  switch (status) {

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

  switch (status) {

    case "active":
      return "status-active";

    case "problem":
      return "status-problem";

    default:
      return "status-closed";

  }

}



/* =========================================
   COUNTERS
========================================= */

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



/* =========================================
   FILTER CONTACTS
========================================= */

function getFilteredContacts() {

  return contacts.filter(
    item => {

      const filterMatch =
        currentFilter === "all" ||
        item.status ===
          currentFilter;


      const content =
        [
          item.name,
          item.value,
          item.type,
          item.description
        ]
          .join(" ")
          .toLowerCase();


      const searchMatch =
        content.includes(
          searchText
            .toLowerCase()
        );


      return (
        filterMatch &&
        searchMatch
      );

    }
  );

}



/* =========================================
   RENDER CONTACTS
========================================= */

function renderContacts() {

  const filtered =
    getFilteredContacts();


  /* RIGHT CONTACT LIST */

  contactList.innerHTML =
    "";


  if (
    !filtered.length
  ) {

    contactList.innerHTML =
      `
      <div class="empty">
        No contact found.
      </div>
      `;

  } else {

    filtered.forEach(
      item => {

        const link =
          buildLink(item);


        const isClosed =
          item.status ===
          "closed";


        let iconHTML =
          getContactIcon(
            item.type
          );


        const image =
          safeUrl(
            item.imageUrl
          );


        if (image) {

          iconHTML =
            `
            <img
              src="${safe(image)}"
              alt="${safe(item.name || "Contact")}"
              loading="lazy"
            >
            `;
        }


        contactList
          .insertAdjacentHTML(
            "beforeend",
            `

            <article
              class="contact-card"
            >

              <div
                class="contact-icon"
              >
                ${iconHTML}
              </div>


              <div
                class="contact-content"
              >

                <h3
                  title="${safe(item.name || "Contact")}"
                >
                  ${safe(item.name || "Contact")}
                </h3>


                <div
                  class="contact-value"
                >
                  ${safe(item.value || "")}
                </div>


                <span
                  class="status-badge ${statusClass(item.status)}"
                >
                  ${statusText(item.status)}
                </span>


                ${
                  item.description

                    ? `
                      <div
                        class="contact-description"
                      >
                        ${safe(item.description)}
                      </div>
                    `

                    : ""
                }

              </div>


              <a
                href="${safe(link)}"

                class="contact-open ${
                  isClosed
                    ? "closed"
                    : ""
                }"

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

                ${
                  isClosed
                    ? "UNAVAILABLE"

                    : (
                        item.type ===
                          "whatsapp"

                          ? "OPEN WHATSAPP"

                          : item.type ===
                              "telegram"

                            ? "OPEN TELEGRAM"

                            : "OPEN CONTACT"
                      )
                }

              </a>

            </article>

            `
          );

      }
    );

  }



  /* LEFT STATUS */

  statusList.innerHTML =
    "";


  if (
    !filtered.length
  ) {

    statusList.innerHTML =
      `
      <div class="empty">
        No contact status found.
      </div>
      `;

    return;
  }


  filtered.forEach(
    item => {

      statusList
        .insertAdjacentHTML(
          "beforeend",
          `

          <div
            class="status-item"
          >

            <div
              class="status-top"
            >

              <div
                class="status-name"

                title="${safe(item.name || "Contact")}"
              >
                ${safe(item.name || "Contact")}
              </div>


              <span
                class="status-badge ${statusClass(item.status)}"
              >
                ${statusText(item.status)}
              </span>

            </div>


            <div
              class="status-value"
            >
              ${safe(item.value || "")}
            </div>

          </div>

          `
        );

    }
  );

}



/* =========================================
   FIREBASE CONTACTS
========================================= */

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

  },

  error => {

    console.error(
      "Contacts error:",
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
        Unable to load contact status.
      </div>
      `;

  }
);



/* =========================================
   SEARCH
========================================= */

searchInput
  .addEventListener(
    "input",
    () => {

      searchText =
        searchInput
          .value
          .trim();


      if (searchText) {

        clearSearch
          .classList
          .add("show");

      } else {

        clearSearch
          .classList
          .remove("show");

      }


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
        .remove("show");

      searchInput.focus();

      renderContacts();

    }
  );



/* =========================================
   FILTER
========================================= */

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
                btn =>
                  btn
                    .classList
                    .remove(
                      "active"
                    )
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



/* =========================================
   NOTICE
========================================= */

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

      return;
    }


    notices.forEach(
      item => {

        const id =
          safe(item.id);


        const image =
          safeUrl(
            item.imageUrl
          );


        let imageHTML =
          "";


        if (image) {

          imageHTML =
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


              <span
                class="image-preview-badge"
              >
                ⛶ Preview
              </span>

            </div>

            `;

        }


        const timestamp =
          item.updatedAt ||
          item.createdAt;


        const dateText =
          timestamp

            ? new Date(
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
                )

            : "";


        const message =
          String(
            item.message || ""
          );


        const shouldCollapse =
          message.length > 180 ||
          message.split("\n").length > 4;


        noticeList
          .insertAdjacentHTML(
            "beforeend",
            `

            <article
              class="notice-card"
            >

              ${imageHTML}


              <div
                class="notice-body"
              >

                <div
                  class="notice-meta"
                >

                  <span
                    class="notice-tag"
                  >
                    NOTICE
                  </span>


                  ${
                    item.pinned

                      ? `
                        <span
                          class="pinned-tag"
                        >
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
                  id="message-${id}"

                  class="notice-message ${
                    shouldCollapse
                      ? "collapsed"
                      : ""
                  }"
                >
                  ${safe(message)}
                </div>


                ${
                  shouldCollapse

                    ? `
                      <button
                        type="button"

                        class="notice-expand visible"

                        data-expand-target="message-${id}"
                      >
                        Read more ↓
                      </button>
                    `

                    : ""
                }


                <div
                  class="notice-footer"
                >

                  <div
                    class="notice-date"
                  >
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

            `
          );

      }
    );


    setupNoticeExpand();

    setupImagePreview();

  },

  error => {

    console.error(
      "Notice error:",
      error
    );


    noticeList.innerHTML =
      `
      <div class="empty">
        Unable to load announcements.
      </div>
      `;

  }
);



/* =========================================
   NOTICE READ MORE
========================================= */

function setupNoticeExpand() {

  document
    .querySelectorAll(
      ".notice-expand"
    )

    .forEach(
      button => {

        button
          .addEventListener(
            "click",
            () => {

              const id =
                button.dataset
                  .expandTarget;


              const message =
                document
                  .getElementById(
                    id
                  );


              if (!message) {
                return;
              }


              const isCollapsed =
                message
                  .classList
                  .contains(
                    "collapsed"
                  );


              if (
                isCollapsed
              ) {

                message
                  .classList
                  .remove(
                    "collapsed"
                  );


                button.textContent =
                  "Show less ↑";

              } else {

                message
                  .classList
                  .add(
                    "collapsed"
                  );


                button.textContent =
                  "Read more ↓";

              }

            }
          );

      }
    );

}



/* =========================================
   IMAGE PREVIEW
========================================= */

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

              const image =
                element.dataset
                  .previewImage;


              if (!image) {
                return;
              }


              openPreview(
                image
              );

            }
          );

      }
    );

}



function openPreview(
  imageUrl
) {

  modalImage.src =
    imageUrl;


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


imageModal
  .querySelector(
    ".modal-backdrop"
  )

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
          "Escape" &&
        imageModal
          .classList
          .contains(
            "open"
          )
      ) {

        closePreview();

      }

    }
  );



/* =========================================
   SETTINGS
========================================= */

onValue(
  ref(
    db,
    "settings"
  ),

  snapshot => {

    const settings =
      snapshot.val() ||
      {};


    if (
      settings.siteName
    ) {

      document
        .getElementById(
          "siteName"
        )
        .textContent =
          settings.siteName;


      document.title =
        settings.siteName;

    }


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


    const logo =
      safeUrl(
        settings.logoUrl
      );


    if (logo) {

      document
        .getElementById(
          "siteLogo"
        )
        .src =
          logo;

    }


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


    if (
      settings.updatedAt
    ) {

      const update =
        new Date(
          settings.updatedAt
        );


      document
        .getElementById(
          "lastUpdated"
        )
        .textContent =
          "Last update: " +
          update.toLocaleString();

    }

  }
);
