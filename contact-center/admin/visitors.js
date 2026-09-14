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
const paginationInfo =
  document.getElementById(
    "visitorPaginationInfo"
  );

const pagePrevBtn =
  document.getElementById(
    "visitorPagePrev"
  );

const pageNextBtn =
  document.getElementById(
    "visitorPageNext"
  );

const pageNumbers =
  document.getElementById(
    "visitorPageNumbers"
  );

const pageSizeControl =
  document.getElementById(
    "visitorPageSizeControl"
  );

const pageSizeInput =
  document.getElementById(
    "visitorPageSizeInput"
  );

const pageSizeToggle =
  document.getElementById(
    "visitorPageSizeToggle"
  );

const pageSizeMenu =
  document.getElementById(
    "visitorPageSizeMenu"
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
const dateRangeInput =
  document.getElementById(
    "visitorDateRange"
  );

const datePresetToggle =
  document.getElementById(
    "visitorDatePresetToggle"
  );

const datePresetPanel =
  document.getElementById(
    "visitorDatePresetPanel"
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
let visitorCurrentPage =
  1;

let visitorPageSize =
  10;

let visitorFilteredTotal =
  0;

let dailyAnalytics =
  {};

let visitorTrafficChart =
  null;

let selectedStartDate =
  null;

let selectedEndDate =
  null;

let selectedRangeLabel =
  "All Time";

let visitorDatePicker =
  null;
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

function startOfDay(value) {

  const date =
    new Date(value);

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;

}


function endOfDay(value) {

  const date =
    new Date(value);

  date.setHours(
    23,
    59,
    59,
    999
  );

  return date;

}


function addDays(
  value,
  amount
) {

  const date =
    new Date(value);

  date.setDate(
    date.getDate() +
    amount
  );

  return date;

}


function getMonday(value) {

  const date =
    startOfDay(
      value
    );

  const day =
    date.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  date.setDate(
    date.getDate() +
    diff
  );

  return date;

}


function dateToKey(value) {

  const date =
    new Date(value);

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;

}
function formatRangeInputDate(
  value
) {

  return dateToKey(
    value
  );

}


function setRangeInputValue(
  startDate,
  endDate
) {

  if (
    !dateRangeInput ||
    !startDate ||
    !endDate
  ) {
    return;
  }


  dateRangeInput.value =
    `${formatRangeInputDate(startDate)}  →  ${formatRangeInputDate(endDate)}`;

}


function restoreRangeInputValue() {

  if (
    !selectedStartDate ||
    !selectedEndDate
  ) {

    if (dateRangeInput) {
      dateRangeInput.value =
        "";
    }

    return;

  }


  setRangeInputValue(
    selectedStartDate,
    selectedEndDate
  );

}


function parseRangeInputValue(
  value
) {

  const text =
    String(
      value || ""
    )
      .trim();


  const match =
    text.match(
      /^(\d{4}-\d{2}-\d{2})\s*(?:→|->|to)\s*(\d{4}-\d{2}-\d{2})$/i
    );


  if (!match) {
    return null;
  }


  const start =
    new Date(
      `${match[1]}T00:00:00`
    );

  const end =
    new Date(
      `${match[2]}T00:00:00`
    );


  if (
    Number.isNaN(
      start.getTime()
    ) ||
    Number.isNaN(
      end.getTime()
    )
  ) {
    return null;
  }


  return {
    start,
    end
  };

}

function getDateKeysBetween(
  startDate,
  endDate
) {

  if (
    !startDate ||
    !endDate
  ) {
    return [];
  }


  const keys =
    [];

  const cursor =
    startOfDay(
      startDate
    );

  const end =
    startOfDay(
      endDate
    );


  while (
    cursor <= end
  ) {

    keys.push(
      dateToKey(
        cursor
      )
    );

    cursor.setDate(
      cursor.getDate() +
      1
    );

  }


  return keys;

}


function timestampInSelectedRange(
  timestamp
) {

  if (
    !selectedStartDate ||
    !selectedEndDate
  ) {
    return true;
  }


  const value =
    Number(
      timestamp
    );


  return (
    value >=
      selectedStartDate.getTime()
    &&
    value <=
      selectedEndDate.getTime()
  );

}


function getSelectedVisitorIds() {

  if (
    !selectedStartDate ||
    !selectedEndDate
  ) {

    return new Set(
      Object.keys(
        visitors
      )
    );

  }


  const ids =
    new Set();


  getDateKeysBetween(
    selectedStartDate,
    selectedEndDate
  )
    .forEach(
      key => {

        const day =
          dailyAnalytics[
            key
          ] || {};

        Object
          .keys(
            day.visitors ||
            {}
          )
          .forEach(
            id => {

              ids.add(
                id
              );

            }
          );

      }
    );


  return ids;

}
function applySelectedRange(
  startDate,
  endDate,
  label = "Custom Range"
) {

  if (
    !startDate ||
    !endDate
  ) {

    selectedStartDate =
      null;

    selectedEndDate =
      null;

    selectedRangeLabel =
      "All Time";

  } else {

    selectedStartDate =
      startOfDay(
        startDate
      );

    selectedEndDate =
      endOfDay(
        endDate
      );

    selectedRangeLabel =
      label;

  }
if (
  selectedStartDate &&
  selectedEndDate
) {

  setRangeInputValue(
    selectedStartDate,
    selectedEndDate
  );

}
visitorCurrentPage =
  1;
  renderStats();

  renderVisitors();

  renderSources();

  renderClicks();

  renderVisitorTrafficChart();

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

              ? "● Online"

              : "Offline"
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

function getSelectedChartRows() {

  let startDate =
    selectedStartDate;

  let endDate =
    selectedEndDate;


  if (
    !startDate ||
    !endDate
  ) {

    endDate =
      endOfDay(
        new Date()
      );

    startDate =
      startOfDay(
        addDays(
          new Date(),
          -6
        )
      );

  }


  return getDateKeysBetween(
    startDate,
    endDate
  )
    .map(
      key => {

        const data =
          dailyAnalytics[
            key
          ] || {};

        const date =
          new Date(
            `${key}T00:00:00`
          );


        return {

          key,

          date,

          label:
            getChartDateLabel(
              date
            ),

          visitors:
            Object.keys(
              data.visitors ||
              {}
            ).length,

          pageViews:
            Number(
              data.pageViews ||
              0
            ),

          linkClicks:
            Number(
              data.linkClicks ||
              0
            )

        };

      }
    );

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
  getSelectedChartRows();


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
  selectedRangeLabel;


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

  const selectedIds =
    getSelectedVisitorIds();


  const online =
    Array
      .from(
        selectedIds
      )
      .filter(
        id =>
          visitorIsOnline(
            id
          )
      );


  let totalPageViews =
    0;

  let totalClicks =
    0;


  if (
    selectedStartDate &&
    selectedEndDate
  ) {

    getDateKeysBetween(
      selectedStartDate,
      selectedEndDate
    )
      .forEach(
        key => {

          const day =
            dailyAnalytics[
              key
            ] || {};

          totalPageViews +=
            Number(
              day.pageViews ||
              0
            );

          totalClicks +=
            Number(
              day.linkClicks ||
              0
            );

        }
      );

  } else {

    Object
      .values(
        dailyAnalytics
      )
      .forEach(
        day => {

          totalPageViews +=
            Number(
              day?.pageViews ||
              0
            );

          totalClicks +=
            Number(
              day?.linkClicks ||
              0
            );

        }
      );

  }


  onlineCount.textContent =
    online.length;

  todayCount.textContent =
    selectedIds.size;

  pageViews.textContent =
    totalPageViews;

  clicksCount.textContent =
    totalClicks;

}


/* =========================================================
   VISITOR TABLE
========================================================= */

function getTotalVisitorPages() {

  return Math.max(
    1,
    Math.ceil(
      visitorFilteredTotal /
      visitorPageSize
    )
  );

}


function getPaginationPages(
  currentPage,
  totalPages
) {

  if (
    totalPages <=
    7
  ) {

    return Array.from(
      {
        length:
          totalPages
      },
      (_, index) =>
        index + 1
    );

  }


  const pages =
    [1];


  let start =
    Math.max(
      2,
      currentPage - 2
    );

  let end =
    Math.min(
      totalPages - 1,
      currentPage + 2
    );


  if (
    currentPage <=
    4
  ) {

    start =
      2;

    end =
      5;

  }


  if (
    currentPage >=
    totalPages - 3
  ) {

    start =
      totalPages - 4;

    end =
      totalPages - 1;

  }


  if (
    start >
    2
  ) {

    pages.push(
      "..."
    );

  }


  for (
    let page = start;
    page <= end;
    page++
  ) {

    pages.push(
      page
    );

  }


  if (
    end <
    totalPages - 1
  ) {

    pages.push(
      "..."
    );

  }


  pages.push(
    totalPages
  );


  return pages;

}


function renderVisitorPagination() {

  const totalPages =
    getTotalVisitorPages();


  if (
    visitorCurrentPage >
    totalPages
  ) {

    visitorCurrentPage =
      totalPages;

  }


  const total =
    visitorFilteredTotal;


  const start =
    total
      ? (
          (
            visitorCurrentPage -
            1
          )
          *
          visitorPageSize
        ) + 1
      : 0;


  const end =
    Math.min(
      visitorCurrentPage *
      visitorPageSize,
      total
    );


  if (
    paginationInfo
  ) {

    paginationInfo.textContent =
      `${start}-${end} of ${total} items`;

  }


if (
  pageSizeInput &&
  pageSizeInput.readOnly
) {

  pageSizeInput.value =
    `${visitorPageSize} / page`;

}


  if (
    pagePrevBtn
  ) {

    pagePrevBtn.disabled =
      visitorCurrentPage <=
      1;

  }


  if (
    pageNextBtn
  ) {

    pageNextBtn.disabled =
      visitorCurrentPage >=
      totalPages;

  }


  if (
    !pageNumbers
  ) {
    return;
  }


  const pages =
    getPaginationPages(
      visitorCurrentPage,
      totalPages
    );


  pageNumbers.innerHTML =
    pages
      .map(
        page => {

          if (
            page ===
            "..."
          ) {

            return `
              <span class="visitor-page-dots">
                ...
              </span>
            `;

          }


          return `
            <button
              type="button"
              class="visitor-page-number ${
                page ===
                visitorCurrentPage
                  ? "active"
                  : ""
              }"
              data-visitor-page="${page}"
            >
              ${page}
            </button>
          `;

        }
      )
      .join("");

}
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
const selectedIds =
  getSelectedVisitorIds();

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


const matchesDate =
  selectedIds.has(
    visitor.id
  );

const matchesSearch =
  haystack.includes(
    searchText
      .toLowerCase()
  );


return (
  matchesDate &&
  matchesSearch
);

      }
    );

visitorFilteredTotal =
  filtered.length;


const totalPages =
  getTotalVisitorPages();


if (
  visitorCurrentPage >
  totalPages
) {

  visitorCurrentPage =
    totalPages;

}


const startIndex =
  (
    visitorCurrentPage -
    1
  )
  *
  visitorPageSize;


const endIndex =
  startIndex +
  visitorPageSize;


const paginated =
  filtered.slice(
    startIndex,
    endIndex
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

  visitorFilteredTotal =
    0;
  renderVisitorPagination();


  return;

}


  tableBody.innerHTML =
    paginated
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
                          ● Online
                        </span>
                      `

                    : `
                        <span class="visitor-status visitor-status-offline">
                          Offline
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
      View
    </button>


    ${
      blocked

      ? `
          <button
            type="button"
            class="visitor-action-btn visitor-unblock-btn"
            data-unblock-id="${safe(visitor.id)}"
          >
            Unblock
          </button>
        `

      : `
          <button
            type="button"
            class="visitor-action-btn visitor-block-btn"
            data-block-id="${safe(visitor.id)}"
          >
            Block
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
  renderVisitorPagination();
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


const selectedIds =
  getSelectedVisitorIds();


Array
  .from(
    selectedIds
  )
  .map(
    id =>
      visitors[
        id
      ]
  )
  .filter(
    Boolean
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
.filter(
  item =>
    timestampInSelectedRange(
      item.timestamp
    )
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
      <tr>

        <td
          colspan="5"
          class="visitor-empty"
        >
          No clicks yet.
        </td>

      </tr>
    `;

    return;

  }


  clickList.innerHTML =
    list
      .map(
        item => `

          <tr>

            <td>

              <strong class="visitor-click-type">
                ${safe(
                  item.contactName ||
                  item.contactType ||
                  "Link"
                )}
              </strong>

            </td>


            <td>

              <span class="visitor-click-id">
                ${safe(
                  item.visitorId ||
                  "-"
                )}
              </span>

            </td>


            <td>

              <span class="visitor-click-source">
                ${safe(
                  item.source ||
                  "Direct"
                )}
              </span>

            </td>


            <td>

              <span class="visitor-click-date">
                ${safe(
                  formatJoinedDate(
                    item.timestamp
                  )
                )}
              </span>

            </td>


            <td>

              <span class="visitor-click-ago">
                ${safe(
                  timeAgo(
                    item.timestamp
                  )
                )}
              </span>

            </td>

          </tr>

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

renderStats();

renderVisitors();

renderSources();

renderClicks();

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
   GLOBAL DATE RANGE FILTER
========================================================= */

function setDatePreset(
  preset
) {

  const now =
    new Date();

  let start =
    null;

  let end =
    null;

  let label =
    "Custom Range";


  if (
    preset ===
    "today"
  ) {

    start =
      now;

    end =
      now;

    label =
      "Today";

  }


  else if (
    preset ===
    "yesterday"
  ) {

    start =
      addDays(
        now,
        -1
      );

    end =
      start;

    label =
      "Yesterday";

  }


  else if (
    preset ===
    "this-week"
  ) {

    start =
      getMonday(
        now
      );

    end =
      now;

    label =
      "This Week";

  }


  else if (
    preset ===
    "last-week"
  ) {

    const thisMonday =
      getMonday(
        now
      );

    start =
      addDays(
        thisMonday,
        -7
      );

    end =
      addDays(
        thisMonday,
        -1
      );

    label =
      "Last Week";

  }


  else if (
    preset ===
    "this-month"
  ) {

    start =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

    end =
      now;

    label =
      "This Month";

  }


  else if (
    preset ===
    "last-month"
  ) {

    start =
      new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

    end =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      );

    label =
      "Last Month";

  }


  else if (
    preset ===
    "last-7"
  ) {

    start =
      addDays(
        now,
        -6
      );

    end =
      now;

    label =
      "Last 7 days";

  }


  else if (
    preset ===
    "last-15"
  ) {

    start =
      addDays(
        now,
        -14
      );

    end =
      now;

    label =
      "Last 15 days";

  }


  else if (
    preset ===
    "last-30"
  ) {

    start =
      addDays(
        now,
        -29
      );

    end =
      now;

    label =
      "Last 30 days";

  }


  else if (
    preset ===
    "last-60"
  ) {

    start =
      addDays(
        now,
        -59
      );

    end =
      now;

    label =
      "Last 60 days";

  }


  else if (
    preset ===
    "all"
  ) {

    visitorDatePicker
      ?.clear();


    if (
      dateRangeInput
    ) {

      dateRangeInput.value =
        "";

    }


    applySelectedRange(
      null,
      null,
      "All Time"
    );


    return;

  }


  /*
   * UPDATE FLATPICKR
   */

  if (
    visitorDatePicker &&
    start &&
    end
  ) {

    visitorDatePicker.setDate(
      [
        start,
        end
      ],
      false
    );

  }


  /*
   * FORCE INPUT SHOW:
   * 2026-09-14 → 2026-09-14
   */

  if (
    start &&
    end
  ) {

    setRangeInputValue(
      start,
      end
    );

  }


  /*
   * APPLY FILTER TO ALL DATA
   */

  applySelectedRange(
    start,
    end,
    label
  );

}


if (
  dateRangeInput &&
  typeof window.flatpickr !==
    "undefined"
) {

  visitorDatePicker =
    window.flatpickr(
      dateRangeInput,
      {

        mode:
          "range",

        dateFormat:
          "Y-m-d",

        allowInput:
          true,

        showMonths:
          2,

        monthSelectorType:
          "static",

        disableMobile:
          true,

        clickOpens:
          true,

        locale: {
          rangeSeparator:
            "  →  "
        },


        onChange:
          selectedDates => {

            if (
              selectedDates.length ===
              2
            ) {

              const start =
                selectedDates[0];

              const end =
                selectedDates[1];


              applySelectedRange(
                start,
                end,
                "Custom Range"
              );


              setRangeInputValue(
                start,
                end
              );

            }

          },


        onClose:
          () => {

            const parsed =
              parseRangeInputValue(
                dateRangeInput.value
              );


            if (parsed) {

              let start =
                parsed.start;

              let end =
                parsed.end;


              if (
                start >
                end
              ) {

                [
                  start,
                  end
                ] = [
                  end,
                  start
                ];

              }


              visitorDatePicker.setDate(
                [
                  start,
                  end
                ],
                false
              );


              applySelectedRange(
                start,
                end,
                "Custom Range"
              );


              setRangeInputValue(
                start,
                end
              );


              return;

            }


            restoreRangeInputValue();

          }

      }
    );

}

let dateRangeInputTimer =
  null;


dateRangeInput?.addEventListener(
  "input",
  () => {

    clearTimeout(
      dateRangeInputTimer
    );


    dateRangeInputTimer =
      setTimeout(
        () => {

          const parsed =
            parseRangeInputValue(
              dateRangeInput.value
            );


          if (!parsed) {
            return;
          }


          let start =
            parsed.start;

          let end =
            parsed.end;


          if (
            start >
            end
          ) {

            [
              start,
              end
            ] = [
              end,
              start
            ];

          }


          visitorDatePicker?.setDate(
            [
              start,
              end
            ],
            false
          );


          applySelectedRange(
            start,
            end,
            "Custom Range"
          );


          setRangeInputValue(
            start,
            end
          );

        },
        350
      );

  }
);
dateRangeInput?.addEventListener(
  "blur",
  () => {

    setTimeout(
      () => {

        const parsed =
          parseRangeInputValue(
            dateRangeInput.value
          );


        if (!parsed) {

          restoreRangeInputValue();

        }

      },
      100
    );

  }
);
if (
  datePresetToggle &&
  datePresetPanel
) {

  datePresetToggle.addEventListener(
    "click",
    event => {

      event.stopPropagation();


      const opening =
        datePresetPanel
          .classList
          .contains(
            "hidden"
          );


      datePresetPanel
        .classList
        .toggle(
          "hidden"
        );


      datePresetToggle
        .classList
        .toggle(
          "open",
          opening
        );


      datePresetToggle
        .setAttribute(
          "aria-expanded",
          opening
            ? "true"
            : "false"
        );

    }
  );

}


document.addEventListener(
  "click",
  event => {

    const preset =
      event.target.closest(
        "[data-range-preset]"
      );


    if (preset) {

      setDatePreset(
        preset.dataset.rangePreset
      );

      datePresetPanel
        ?.classList
        .add(
          "hidden"
        );

      datePresetToggle
        ?.classList
        .remove(
          "open"
        );

      return;

    }


    if (
      !event.target.closest(
        ".visitor-date-filter"
      )
    ) {

      datePresetPanel
        ?.classList
        .add(
          "hidden"
        );

      datePresetToggle
        ?.classList
        .remove(
          "open"
        );

    }

  }
);

setDatePreset(
  "today"
);
/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
  "input",
  () => {

    searchText =
      searchInput.value || "";


    visitorCurrentPage =
      1;


    renderVisitors();

  }
);
/* =========================================================
   VISITOR PAGINATION
========================================================= */

pagePrevBtn?.addEventListener(
  "click",
  () => {

    if (
      visitorCurrentPage <=
      1
    ) {
      return;
    }


    visitorCurrentPage -=
      1;


    renderVisitors();

  }
);


pageNextBtn?.addEventListener(
  "click",
  () => {

    const totalPages =
      getTotalVisitorPages();


    if (
      visitorCurrentPage >=
      totalPages
    ) {
      return;
    }


    visitorCurrentPage +=
      1;


    renderVisitors();

  }
);


pageNumbers?.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-visitor-page]"
      );


    if (!button) {
      return;
    }


    visitorCurrentPage =
      Number(
        button.dataset.visitorPage
      ) || 1;


    renderVisitors();

  }
);

/* =========================================================
   PAGE SIZE EDITABLE COMBOBOX
========================================================= */

function closePageSizeMenu() {

  pageSizeMenu
    ?.classList
    .add(
      "hidden"
    );


  pageSizeToggle
    ?.classList
    .remove(
      "open"
    );


  pageSizeToggle
    ?.setAttribute(
      "aria-expanded",
      "false"
    );


  if (
    pageSizeInput
  ) {

    pageSizeInput.readOnly =
      true;


    pageSizeInput.value =
      `${visitorPageSize} / page`;

  }

}


/* OPEN */

function openPageSizeMenu() {

  pageSizeMenu
    ?.classList
    .remove(
      "hidden"
    );


  pageSizeToggle
    ?.classList
    .add(
      "open"
    );


  pageSizeToggle
    ?.setAttribute(
      "aria-expanded",
      "true"
    );


  if (
    pageSizeInput
  ) {

    pageSizeInput.readOnly =
      false;


    pageSizeInput.value =
      String(
        visitorPageSize
      );


    setTimeout(
      () => {

        pageSizeInput.focus();

        pageSizeInput.select();

      },
      0
    );

  }

}


/* CLICK MAIN CONTROL */

pageSizeControl?.addEventListener(
  "click",
  event => {

    event.stopPropagation();


    const isOpen =
      !pageSizeMenu
        ?.classList
        .contains(
          "hidden"
        );


    if (
      event.target ===
      pageSizeInput &&
      isOpen
    ) {

      return;

    }


    if (
      isOpen
    ) {

      closePageSizeMenu();

    } else {

      openPageSizeMenu();

    }

  }
);


/* PRESET BUTTONS */

pageSizeMenu?.addEventListener(
  "click",
  event => {

    event.stopPropagation();


    const button =
      event.target.closest(
        "[data-page-size]"
      );


    if (!button) {
      return;
    }


    const size =
      Number(
        button.dataset.pageSize
      );


    if (
      !Number.isFinite(size) ||
      size < 1
    ) {
      return;
    }


    visitorPageSize =
      size;


    visitorCurrentPage =
      1;


    renderVisitors();

    closePageSizeMenu();

  }
);


/* TYPE CUSTOM VALUE */

pageSizeInput?.addEventListener(
  "input",
  () => {

    /*
     * Buang semua selain nombor
     */

    const cleaned =
      pageSizeInput.value
        .replace(
          /\D/g,
          ""
        );


    pageSizeInput.value =
      cleaned;

  }
);


/* ENTER = APPLY */

pageSizeInput?.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Enter"
    ) {

      event.preventDefault();

      event.stopPropagation();


      const size =
        Number(
          pageSizeInput.value
        );


      if (
        !Number.isFinite(size) ||
        size < 1
      ) {

        pageSizeInput.value =
          String(
            visitorPageSize
          );

        return;

      }


      visitorPageSize =
        Math.min(
          10000,
          Math.floor(size)
        );


      visitorCurrentPage =
        1;


      renderVisitors();

      closePageSizeMenu();

    }


    if (
      event.key ===
      "Escape"
    ) {

      event.preventDefault();

      closePageSizeMenu();

    }

  }
);


/* CLICK OUTSIDE = APPLY IF VALID, THEN CLOSE */

document.addEventListener(
  "click",
  event => {

    if (
      event.target.closest(
        ".visitor-page-size"
      )
    ) {
      return;
    }


    if (
      pageSizeInput &&
      pageSizeInput.readOnly ===
        false
    ) {

      const size =
        Number(
          pageSizeInput.value
        );


      if (
        Number.isFinite(size) &&
        size >= 1
      ) {

        visitorPageSize =
          Math.min(
            10000,
            Math.floor(size)
          );


        visitorCurrentPage =
          1;


        renderVisitors();

      }

    }


    closePageSizeMenu();

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
