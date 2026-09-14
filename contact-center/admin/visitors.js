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
const clickToggle =
  document.getElementById(
    "visitorClickToggle"
  );

const clickPanel =
  document.getElementById(
    "visitorClickPanel"
  );

const clickCountLabel =
  document.getElementById(
    "visitorClickCountLabel"
  );
const searchInput =
  document.getElementById(
    "visitorSearch"
  );
const detailModal =
  document.getElementById(
    "visitorDetailModal"
  );

const detailBackdrop =
  document.getElementById(
    "visitorDetailBackdrop"
  );

const detailClose =
  document.getElementById(
    "visitorDetailClose"
  );

const detailTitle =
  document.getElementById(
    "visitorDetailTitle"
  );

const detailContent =
  document.getElementById(
    "visitorDetailContent"
  );
/* =========================================================
   CHART DOM
========================================================= */

const chartToggle =
  document.getElementById(
    "visitorChartToggle"
  );

const chartPanel =
  document.getElementById(
    "visitorChartPanel"
  );

const chartRangeLabel =
  document.getElementById(
    "visitorChartRangeLabel"
  );

const chartDateRange =
  document.getElementById(
    "visitorChartDateRange"
  );

const chartCanvas =
  document.getElementById(
    "visitorTrafficChart"
  );

const chartTotalVisitors =
  document.getElementById(
    "chartTotalVisitors"
  );

const chartTotalViews =
  document.getElementById(
    "chartTotalViews"
  );

const chartTotalClicks =
  document.getElementById(
    "chartTotalClicks"
  );

const chartPeakValue =
  document.getElementById(
    "chartPeakValue"
  );

const chartPeakDay =
  document.getElementById(
    "chartPeakDay"
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

let dailyAnalytics =
  {};

let visitorTrafficChart =
  null;

let selectedChartDays =
  7;
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
function formatJoinedDate(
  timestamp
) {

  const number =
    Number(timestamp);

  if (!number) {
    return "-";
  }

  const date =
    new Date(number);

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const year =
    date.getFullYear();

  const hour =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minute =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  const second =
    String(
      date.getSeconds()
    ).padStart(2, "0");


  return (
    `${day}-${month}-${year} ` +
    `${hour}:${minute}:${second}`
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
   VISITOR DETAIL
========================================================= */

function getVisitorClicks(
  visitorId
) {

  return Object
    .entries(
      clicks
    )

    .map(
      ([id, value]) => ({
        id,
        ...value
      })
    )

    .filter(
      item =>
        item.visitorId ===
        visitorId
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
      20
    );

}


function closeVisitorDetail() {

  if (!detailModal) {
    return;
  }

  detailModal.classList.add(
    "hidden"
  );

  document.body.classList.remove(
    "visitor-detail-open"
  );

}


function openVisitorDetail(
  visitorId
) {

  const visitor =
    visitors[
      visitorId
    ];

  if (!visitor) {
    return;
  }


  const online =
    visitorIsOnline(
      visitorId
    );

  const blocked =
    isBlocked(
      visitorId
    );

  const visitorClicks =
    getVisitorClicks(
      visitorId
    );


  detailTitle.textContent =
    visitorId;


  const activityHtml =
    visitorClicks.length

      ? visitorClicks
          .map(
            item => `
              <div class="visitor-detail-activity-item">

                <div class="visitor-detail-activity-icon">
                  ↗
                </div>

                <div class="visitor-detail-activity-main">

                  <strong>
                    ${safe(
                      item.contactName ||
                      item.contactType ||
                      "Link"
                    )}
                  </strong>

                  <span>
                    ${safe(
                      item.destination ||
                      ""
                    )}
                  </span>

                </div>

                <time>
                  ${safe(
                    formatTime(
                      item.timestamp
                    )
                  )}
                </time>

              </div>
            `
          )
          .join("")

      : `
          <div class="visitor-detail-no-activity">
            No link clicks from this visitor yet.
          </div>
        `;


  detailContent.innerHTML = `

    <div class="visitor-detail-status-row">

      <span
        class="
          visitor-status
          ${
            blocked

              ? "visitor-status-blocked"

              : online

                ? "visitor-status-online"

                : "visitor-status-offline"
          }
        "
      >

        ${
          blocked

            ? "BLOCKED"

            : online

              ? "● ONLINE"

              : "OFFLINE"
        }

      </span>


      <span class="visitor-detail-id">
        ${safe(visitorId)}
      </span>

    </div>


    <div class="visitor-detail-section">

      <h4>
        Visitor Information
      </h4>


      <div class="visitor-detail-grid">


        <div class="visitor-detail-field">

          <span>
            Source
          </span>

          <strong>
            ${safe(
              visitor.source ||
              "Direct"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Device
          </span>

          <strong>
            ${safe(
              visitor.device ||
              "-"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Browser
          </span>

          <strong>
            ${safe(
              visitor.browser ||
              "-"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Screen
          </span>

          <strong>
            ${safe(
              visitor.screen ||
              "-"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Language
          </span>

          <strong>
            ${safe(
              visitor.language ||
              "-"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Page Views
          </span>

          <strong>
            ${Number(
              visitor.pageViews ||
              0
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Current Page
          </span>

          <strong>
            ${safe(
              visitor.currentPage ||
              "/"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Page Title
          </span>

          <strong>
            ${safe(
              visitor.pageTitle ||
              "-"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            First Seen
          </span>

          <strong>
            ${safe(
              formatTime(
                visitor.firstSeen
              )
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Last Seen
          </span>

          <strong>
            ${safe(
              timeAgo(
                visitor.lastSeen
              )
            )}
          </strong>

          <small>
            ${safe(
              formatTime(
                visitor.lastSeen
              )
            )}
          </small>

        </div>

      </div>

    </div>


    <div class="visitor-detail-section">

      <h4>
        Traffic Information
      </h4>


      <div class="visitor-detail-grid">


        <div class="visitor-detail-field">

          <span>
            UTM Source
          </span>

          <strong>
            ${safe(
              visitor.source ||
              "Direct"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            UTM Medium
          </span>

          <strong>
            ${safe(
              visitor.medium ||
              "-"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field">

          <span>
            Campaign
          </span>

          <strong>
            ${safe(
              visitor.campaign ||
              "-"
            )}
          </strong>

        </div>


        <div class="visitor-detail-field visitor-detail-wide">

          <span>
            Referrer
          </span>

          <strong>
            ${safe(
              visitor.referrer ||
              "Direct / No referrer"
            )}
          </strong>

        </div>

      </div>

    </div>


    <div class="visitor-detail-section">

      <div class="visitor-detail-section-head">

        <h4>
          Recent Link Clicks
        </h4>

        <span>
          ${visitorClicks.length} clicks
        </span>

      </div>


      <div class="visitor-detail-activity">

        ${activityHtml}

      </div>

    </div>


    <div class="visitor-detail-footer">

      ${
        blocked

          ? `
              <button
                type="button"
                class="visitor-detail-action visitor-detail-unblock"
                data-unblock-id="${safe(visitorId)}"
              >
                UNBLOCK VISITOR
              </button>
            `

          : `
              <button
                type="button"
                class="visitor-detail-action visitor-detail-block"
                data-block-id="${safe(visitorId)}"
              >
                BLOCK VISITOR
              </button>
            `
      }

    </div>
  `;


  detailModal.classList.remove(
    "hidden"
  );

  document.body.classList.add(
    "visitor-detail-open"
  );

}
/* =========================================================
   VISITOR TRAFFIC CHART
========================================================= */

function getChartDateKey(
  date
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}


function getChartDateLabel(
  date
) {

  return date.toLocaleDateString(
    [],
    {
      day:
        "2-digit",

      month:
        "short"
    }
  );

}


function getChartRows(
  days
) {

  const rows =
    [];


  for (
    let index = days - 1;
    index >= 0;
    index--
  ) {

    const date =
      new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    date.setDate(
      date.getDate() -
      index
    );


    const key =
      getChartDateKey(
        date
      );


    const data =
      dailyAnalytics[
        key
      ] || {};


    rows.push(
      {
        key,

        date,

        label:
          getChartDateLabel(
            date
          ),

        visitors:
          Object.keys(
            data.visitors || {}
          ).length,

        pageViews:
          Number(
            data.pageViews || 0
          ),

        linkClicks:
          Number(
            data.linkClicks || 0
          )
      }
    );

  }


  return rows;

}


function renderVisitorTrafficChart() {

  if (
    !chartCanvas ||
    typeof window.Chart ===
      "undefined"
  ) {
    return;
  }


  const rows =
    getChartRows(
      selectedChartDays
    );


  const visitorData =
    rows.map(
      item =>
        item.visitors
    );

  const pageViewData =
    rows.map(
      item =>
        item.pageViews
    );

  const clickData =
    rows.map(
      item =>
        item.linkClicks
    );


  const totalVisitors =
    visitorData.reduce(
      (total, value) =>
        total + value,
      0
    );


  const totalViews =
    pageViewData.reduce(
      (total, value) =>
        total + value,
      0
    );


  const totalClicks =
    clickData.reduce(
      (total, value) =>
        total + value,
      0
    );


  let peak =
    rows[0] || null;


  rows.forEach(
    row => {

      if (
        !peak ||
        row.visitors >
          peak.visitors
      ) {

        peak =
          row;

      }

    }
  );


  chartTotalVisitors.textContent =
    totalVisitors;

  chartTotalViews.textContent =
    totalViews;

  chartTotalClicks.textContent =
    totalClicks;


  chartPeakValue.textContent =
    peak
      ? peak.visitors
      : 0;


  chartPeakDay.textContent =
    peak
      ? peak.label
      : "-";


  chartRangeLabel.textContent =
    `Last ${selectedChartDays} days`;


  if (
    rows.length
  ) {

    chartDateRange.textContent =
      `${rows[0].label} – ${
        rows[
          rows.length - 1
        ].label
      }`;

  }


  if (
    visitorTrafficChart
  ) {

    visitorTrafficChart.destroy();

  }


  visitorTrafficChart =
    new window.Chart(
      chartCanvas,
      {

        type:
          "line",

        data: {

          labels:
            rows.map(
              item =>
                item.label
            ),

          datasets: [

            {
              label:
                "Unique Visitors",

              data:
                visitorData,

              borderColor:
                "#4285ff",

              backgroundColor:
                "rgba(66,133,255,.12)",

              borderWidth:
                2,

              pointRadius:
                3,

              tension:
                .35,

              fill:
                true
            },

            {
              label:
                "Page Views",

              data:
                pageViewData,

              borderColor:
                "#26c979",

              backgroundColor:
                "rgba(38,201,121,.06)",

              borderWidth:
                2,

              pointRadius:
                3,

              tension:
                .35,

              fill:
                false
            },

            {
              label:
                "Link Clicks",

              data:
                clickData,

              borderColor:
                "#d69116",

              backgroundColor:
                "rgba(214,145,22,.06)",

              borderWidth:
                2,

              pointRadius:
                3,

              tension:
                .35,

              fill:
                false
            }

          ]

        },


        options: {

          responsive:
            true,

          maintainAspectRatio:
            false,

          interaction: {
            mode:
              "index",

            intersect:
              false
          },

          plugins: {

            legend: {

              position:
                "top",

              align:
                "end",

              labels: {
                color:
                  "#9ba7b8",

                usePointStyle:
                  true,

                boxWidth:
                  7,

                font: {
                  size:
                    9
                }
              }

            }

          },

          scales: {

            x: {

              grid: {
                display:
                  false
              },

              ticks: {
                color:
                  "#778396",

                font: {
                  size:
                    9
                }
              }

            },

            y: {

              beginAtZero:
                true,

              ticks: {
                precision:
                  0,

                color:
                  "#778396",

                font: {
                  size:
                    9
                }
              },

              grid: {
                color:
                  "rgba(255,255,255,.045)"
              }

            }

          }

        }

      }
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
          colspan="8"
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

  <span class="visitor-joined-date">
    ${safe(
      formatJoinedDate(
        visitor.firstSeen
      )
    )}
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

  <div class="visitor-action-group">

    <button
      type="button"
      class="visitor-action-btn visitor-view-btn"
      data-view-id="${safe(visitor.id)}"
    >
      VIEW
    </button>


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

  </div>

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

  if (!sourceList) {
    return;
  }


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


  const totalVisitors =
    list.reduce(
      (sum, [, total]) =>
        sum + total,
      0
    );


  if (
    !list.length ||
    !totalVisitors
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
        ([source, total]) => {

          const percentage =
            (
              total /
              totalVisitors
            ) * 100;


          const percentageText =
            percentage >= 10

              ? percentage.toFixed(0)

              : percentage.toFixed(1);


          return `
            <div class="visitor-chart-source-item">

              <div class="visitor-chart-source-name">

                <strong>
                  ${safe(source)}
                </strong>

                <span>
                  ${total}
                  visitor${total === 1 ? "" : "s"}
                </span>

              </div>


              <div class="visitor-chart-source-bar-row">

                <div class="visitor-chart-source-track">

                  <div
                    class="visitor-chart-source-fill"
                    style="width:${Math.min(100, percentage)}%"
                  ></div>

                </div>


                <strong class="visitor-chart-source-percent">
                  ${percentageText}%
                </strong>

              </div>

            </div>
          `;

        }
      )
      .join("");

}

/* =========================================================
   CLICKS
========================================================= */

function renderClicks() {

  if (!clickList) {
    return;
  }


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


  if (clickCountLabel) {

    clickCountLabel.textContent =
      `${list.length} click${
        list.length === 1
          ? ""
          : "s"
      }`;

  }


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


              <div class="visitor-click-time">

                <strong>
                  ${safe(
                    formatJoinedDate(
                      item.timestamp
                    )
                  )}
                </strong>

                <small>
                  ${safe(
                    timeAgo(
                      item.timestamp
                    )
                  )}
                </small>

              </div>

            </div>


            <div class="visitor-click-info">

              <span>
                ${safe(
                  item.visitorId ||
                  "-"
                )}
              </span>

              <span>
                ${safe(
                  item.source ||
                  "Direct"
                )}
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


    if (
      detailModal &&
      !detailModal.classList.contains(
        "hidden"
      )
    ) {

      const currentId =
        detailTitle
          ?.textContent
          ?.trim();

      if (
        currentId &&
        visitors[currentId]
      ) {

        openVisitorDetail(
          currentId
        );

      }

    }

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
   DAILY ANALYTICS FOR CHART
========================================================= */

onValue(

  ref(
    db,
    "analytics/daily"
  ),

  snapshot => {

    dailyAnalytics =
      snapshot.val() || {};

    renderVisitorTrafficChart();

  },

  error => {

    console.error(
      "Daily analytics chart error:",
      error
    );

  }

);

/* =========================================================
   CHART SHOW / HIDE
========================================================= */

if (
  chartToggle &&
  chartPanel
) {

  chartToggle.addEventListener(
    "click",
    () => {

      const opening =
        chartPanel.classList.contains(
          "hidden"
        );


      chartPanel.classList.toggle(
        "hidden"
      );


      chartToggle.classList.toggle(
        "open",
        opening
      );


      chartToggle.setAttribute(
        "aria-expanded",
        opening
          ? "true"
          : "false"
      );


      if (opening) {

        setTimeout(
          () => {

            renderVisitorTrafficChart();

          },
          50
        );

      }

    }
  );

}

/* =========================================================
   RECENT CLICKS SHOW / HIDE
========================================================= */

if (
  clickToggle &&
  clickPanel
) {

  clickToggle.addEventListener(
    "click",
    () => {

      const opening =
        clickPanel.classList.contains(
          "hidden"
        );


      clickPanel.classList.toggle(
        "hidden"
      );


      clickToggle.classList.toggle(
        "open",
        opening
      );


      clickToggle.setAttribute(
        "aria-expanded",
        opening
          ? "true"
          : "false"
      );

    }
  );

}
/* =========================================================
   CHART RANGE
========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-chart-days]"
      );

    if (!button) {
      return;
    }


    const days =
      Number(
        button.dataset.chartDays
      );


    if (
      ![7,14,30].includes(
        days
      )
    ) {
      return;
    }


    selectedChartDays =
      days;


    document
      .querySelectorAll(
        "[data-chart-days]"
      )
      .forEach(
        item => {

          item.classList.toggle(
            "active",
            item === button
          );

        }
      );


    renderVisitorTrafficChart();

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

    const viewButton =
      event.target.closest(
        "[data-view-id]"
      );

    const blockButton =
      event.target.closest(
        "[data-block-id]"
      );

    const unblockButton =
      event.target.closest(
        "[data-unblock-id]"
      );


    if (viewButton) {

      const id =
        viewButton.dataset.viewId;

      if (id) {

        openVisitorDetail(
          id
        );

      }

      return;

    }


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
/* =========================================================
   VISITOR DETAIL CLOSE
========================================================= */

if (detailClose) {

  detailClose.addEventListener(
    "click",
    closeVisitorDetail
  );

}


if (detailBackdrop) {

  detailBackdrop.addEventListener(
    "click",
    closeVisitorDetail
  );

}


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      detailModal &&
      !detailModal.classList.contains(
        "hidden"
      )
    ) {

      closeVisitorDetail();

    }

  }
);

/* REFRESH RELATIVE TIMES */

setInterval(
  renderVisitors,
  10000
);
