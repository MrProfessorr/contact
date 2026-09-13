import {

  db,
  ref,
  onValue,
  set,
  remove,
  requireAdmin,
  setupLogout

} from "./admin.js";


await requireAdmin();

setupLogout();


/* =========================================================
   DOM
========================================================= */

const onlineCount =
  document.getElementById(
    "visitorOnlineCount"
  );

const todayCount =
  document.getElementById(
    "visitorTodayCount"
  );

const pageViews =
  document.getElementById(
    "visitorPageViews"
  );

const clicksCount =
  document.getElementById(
    "visitorClicksCount"
  );

const tableBody =
  document.getElementById(
    "visitorTableBody"
  );

const sourceList =
  document.getElementById(
    "visitorSourceList"
  );

const clickList =
  document.getElementById(
    "visitorClickList"
  );

const searchInput =
  document.getElementById(
    "visitorSearch"
  );


/* =========================================================
   STATE
========================================================= */

let visitors =
  {};

let presence =
  {};

let clicks =
  {};

let blockedVisitors =
  {};

let searchText =
  "";


/* =========================================================
   HELPERS
========================================================= */

function safe(
  value = ""
) {

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


function getDateKey() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function formatTime(
  timestamp
) {

  const number =
    Number(timestamp);

  if (!number) {
    return "-";
  }

  const date =
    new Date(number);

  return date.toLocaleString(
    [],
    {
      year:
        "numeric",

      month:
        "short",

      day:
        "2-digit",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit"
    }
  );

}


function timeAgo(
  timestamp
) {

  const time =
    Number(timestamp);

  if (!time) {
    return "-";
  }

  const seconds =
    Math.max(
      0,
      Math.floor(
        (Date.now() - time) /
        1000
      )
    );

  if (
    seconds < 10
  ) {
    return "Now";
  }

  if (
    seconds < 60
  ) {
    return `${seconds}s ago`;
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (
    minutes < 60
  ) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (
    hours < 24
  ) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  return `${days}d ago`;

}


function visitorIsOnline(
  visitorId
) {

  const sessions =
    presence[
      visitorId
    ] || {};

  return Object
    .values(
      sessions
    )
    .some(
      session =>
        session &&
        session.online === true
    );

}


function isBlocked(
  visitorId
) {

  return (
    blockedVisitors[
      visitorId
    ]?.blocked === true
  );

}


/* =========================================================
   STATS
========================================================= */

function renderStats() {

  const allVisitors =
    Object.values(
      visitors
    );

  const online =
    Object
      .keys(
        visitors
      )
      .filter(
        id =>
          visitorIsOnline(
            id
          )
      );

  onlineCount.textContent =
    online.length;

}


/* =========================================================
   VISITOR TABLE
========================================================= */

function renderVisitors() {

  const list =
    Object
      .entries(
        visitors
      )

      .map(
        ([id, value]) => ({
          id,
          ...value
        })
      )

      .sort(
        (a, b) =>
          Number(
            b.lastSeen || 0
          )
          -
          Number(
            a.lastSeen || 0
          )
      );


  const filtered =
    list.filter(
      visitor => {

        const haystack =
          [
            visitor.id,
            visitor.source,
            visitor.device,
            visitor.browser,
            visitor.currentPage,
            visitor.campaign
          ]

            .join(" ")

            .toLowerCase();


        return haystack.includes(
          searchText
            .toLowerCase()
        );

      }
    );


  if (
    !filtered.length
  ) {

    tableBody.innerHTML = `
      <tr>
        <td
          colspan="7"
          class="visitor-empty"
        >
          No visitor found.
        </td>
      </tr>
    `;

    return;

  }


  tableBody.innerHTML =
    filtered
      .map(
        visitor => {

          const online =
            visitorIsOnline(
              visitor.id
            );

          const blocked =
            isBlocked(
              visitor.id
            );


          return `
            <tr>

              <td>

                <strong class="visitor-id">
                  ${safe(visitor.id)}
                </strong>

                <small>
                  ${safe(visitor.browser || "-")}
                </small>

              </td>


              <td>

                <span class="visitor-source-badge">
                  ${safe(visitor.source || "Direct")}
                </span>

              </td>


              <td>

                <strong>
                  ${safe(visitor.device || "-")}
                </strong>

                <small>
                  ${safe(visitor.screen || "")}
                </small>

              </td>


              <td>

                <span
                  class="visitor-page-name"
                  title="${safe(visitor.currentPage || "/")}"
                >
                  ${safe(visitor.currentPage || "/")}
                </span>

              </td>


              <td>

                <span title="${safe(formatTime(visitor.lastSeen))}">
                  ${safe(timeAgo(visitor.lastSeen))}
                </span>

              </td>


              <td>

                ${
                  blocked

                  ? `
                      <span class="visitor-status visitor-status-blocked">
                        BLOCKED
                      </span>
                    `

                  : online

                    ? `
                        <span class="visitor-status visitor-status-online">
                          ● ONLINE
                        </span>
                      `

                    : `
                        <span class="visitor-status visitor-status-offline">
                          OFFLINE
                        </span>
                      `
                }

              </td>


              <td>

                ${
                  blocked

                  ? `
                      <button
                        type="button"
                        class="visitor-action-btn visitor-unblock-btn"
                        data-unblock-id="${safe(visitor.id)}"
                      >
                        UNBLOCK
                      </button>
                    `

                  : `
                      <button
                        type="button"
                        class="visitor-action-btn visitor-block-btn"
                        data-block-id="${safe(visitor.id)}"
                      >
                        BLOCK
                      </button>
                    `
                }

              </td>

            </tr>
          `;

        }
      )
      .join("");

}


/* =========================================================
   TRAFFIC SOURCES
========================================================= */

function renderSources() {

  const sourceTotals =
    {};

  Object
    .values(
      visitors
    )
    .forEach(
      visitor => {

        const source =
          visitor.source ||
          "Direct";

        sourceTotals[
          source
        ] =
          (
            sourceTotals[
              source
            ] || 0
          ) + 1;

      }
    );


  const list =
    Object
      .entries(
        sourceTotals
      )

      .sort(
        (a, b) =>
          b[1] - a[1]
      );


  if (
    !list.length
  ) {

    sourceList.innerHTML = `
      <div class="visitor-empty">
        No traffic yet.
      </div>
    `;

    return;

  }


  sourceList.innerHTML =
    list
      .map(
        ([source, total]) => `
          <div class="visitor-source-row">

            <span>
              ${safe(source)}
            </span>

            <strong>
              ${total}
            </strong>

          </div>
        `
      )
      .join("");

}


/* =========================================================
   CLICKS
========================================================= */

function renderClicks() {

  const list =
    Object
      .entries(
        clicks
      )

      .map(
        ([id, value]) => ({
          id,
          ...value
        })
      )

      .sort(
        (a, b) =>
          Number(
            b.timestamp || 0
          )
          -
          Number(
            a.timestamp || 0
          )
      )

      .slice(
        0,
        30
      );


  if (
    !list.length
  ) {

    clickList.innerHTML = `
      <div class="visitor-empty">
        No clicks yet.
      </div>
    `;

    return;

  }


  clickList.innerHTML =
    list
      .map(
        item => `
          <div class="visitor-click-item">

            <div class="visitor-click-top">

              <strong>
                ${safe(
                  item.contactName ||
                  item.contactType ||
                  "Link"
                )}
              </strong>

              <span>
                ${safe(
                  timeAgo(
                    item.timestamp
                  )
                )}
              </span>

            </div>


            <div class="visitor-click-info">

              <span>
                ${safe(item.visitorId || "-")}
              </span>

              <span>
                ${safe(item.source || "Direct")}
              </span>

            </div>

          </div>
        `
      )
      .join("");

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

  renderStats();

  renderVisitors();

  renderSources();

  renderClicks();

}


/* =========================================================
   FIREBASE LISTENERS
========================================================= */

onValue(

  ref(
    db,
    "analytics/visitors"
  ),

  snapshot => {

    visitors =
      snapshot.val() || {};

    renderAll();

  }

);


onValue(

  ref(
    db,
    "analytics/presence"
  ),

  snapshot => {

    presence =
      snapshot.val() || {};

    renderAll();

  }

);


onValue(

  ref(
    db,
    "analytics/clicks"
  ),

  snapshot => {

    clicks =
      snapshot.val() || {};

    renderClicks();

  }

);


onValue(

  ref(
    db,
    "blocked_visitors"
  ),

  snapshot => {

    blockedVisitors =
      snapshot.val() || {};

    renderVisitors();

  }

);


/* =========================================================
   TODAY STATS
========================================================= */

onValue(

  ref(
    db,
    `analytics/daily/${getDateKey()}`
  ),

  snapshot => {

    const data =
      snapshot.val() || {};

    const uniqueVisitors =
      Object.keys(
        data.visitors || {}
      ).length;

    todayCount.textContent =
      uniqueVisitors;

    pageViews.textContent =
      Number(
        data.pageViews || 0
      );

    clicksCount.textContent =
      Number(
        data.linkClicks || 0
      );

  }

);


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
  "input",
  () => {

    searchText =
      searchInput.value || "";

    renderVisitors();

  }
);


/* =========================================================
   BLOCK / UNBLOCK
========================================================= */

document.addEventListener(
  "click",
  async event => {

    const blockButton =
      event.target.closest(
        "[data-block-id]"
      );

    const unblockButton =
      event.target.closest(
        "[data-unblock-id]"
      );


    if (blockButton) {

      const id =
        blockButton.dataset.blockId;

      if (!id) {
        return;
      }

      const confirmed =
        confirm(
          `Block visitor ${id}?`
        );

      if (!confirmed) {
        return;
      }


      try {

        await set(

          ref(
            db,
            `blocked_visitors/${id}`
          ),

          {
            blocked:
              true,

            reason:
              "Blocked by admin",

            blockedAt:
              Date.now()
          }

        );

      } catch (error) {

        console.error(
          "Block visitor error:",
          error
        );

        alert(
          "Failed to block visitor."
        );

      }

      return;

    }


    if (unblockButton) {

      const id =
        unblockButton
          .dataset
          .unblockId;

      if (!id) {
        return;
      }


      try {

        await remove(

          ref(
            db,
            `blocked_visitors/${id}`
          )

        );

      } catch (error) {

        console.error(
          "Unblock visitor error:",
          error
        );

        alert(
          "Failed to unblock visitor."
        );

      }

    }

  }
);


/* REFRESH RELATIVE TIMES */

setInterval(
  renderVisitors,
  10000
);
