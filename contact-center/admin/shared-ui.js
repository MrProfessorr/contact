/* =========================================================
   SHARED UI
   Reusable for all admin pages
========================================================= */

(function () {

  "use strict";
/* =======================================================
   ADMIN WORKSPACE FRAME MODE
======================================================= */

const ADMIN_IS_WORKSPACE_FRAME =
  new URLSearchParams(
    window.location.search
  ).get("workspace") === "1";


if (ADMIN_IS_WORKSPACE_FRAME) {

  document.documentElement.classList.add(
    "admin-workspace-frame-page"
  );

}

  /* =======================================================
     ESCAPE TEXT
  ======================================================= */

  function escapeSharedText(
    value
  ) {

    return String(
      value ?? ""
    )
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


  /* =======================================================
     SIZE CLASS
  ======================================================= */

  function getSharedSizeClass(
    size
  ) {

    return (
      size === "small" ||
      size === "large"
    )
      ? size
      : "";

  }


  /* =======================================================
     EMPTY STATE
  ======================================================= */

function createEmptyState(
  text = "No data",
  size = "",
  align = ""
) {

    const safeText =
      escapeSharedText(
        text
      );


    const sizeClass =
      getSharedSizeClass(
        size
      );

const alignClass =
  align === "center"
    ? "shared-center"
    : align === "left"
      ? "shared-left"
      : "";
    return `
      <div
        class="shared-empty ${sizeClass} ${alignClass}"
      >

        <div
          class="shared-empty-image"
        >

          <svg
            width="64"
            height="41"
            viewBox="0 0 64 41"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >

            <title>
              No data
            </title>


            <g
              transform="translate(0 1)"
              fill="none"
              fill-rule="evenodd"
            >

              <ellipse
                fill="#272727"
                cx="32"
                cy="33"
                rx="32"
                ry="7"
              />


              <g
                fill-rule="nonzero"
                stroke="#3e3e3e"
              >

                <path
                  d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
                />


                <path
                  d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                  fill="#1d1d1d"
                />

              </g>

            </g>

          </svg>

        </div>


        <div
          class="shared-empty-text"
        >
          ${safeText}
        </div>

      </div>
    `;

  }


  /* =======================================================
     LOADING STATE
  ======================================================= */

  function createLoadingState(
    text = "Loading...",
    size = ""
  ) {

    const safeText =
      escapeSharedText(
        text
      );


    const sizeClass =
      getSharedSizeClass(
        size
      );


    return `
      <div
        class="shared-loading ${sizeClass}"
        role="status"
        aria-live="polite"
      >

<div
  class="shared-loading-dots"
  aria-hidden="true"
>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>


${
  safeText
    ? `
        <div
          class="shared-loading-text"
        >
          ${safeText}
        </div>
      `
    : ""
}

      </div>
    `;

  }


  /* =======================================================
     SET EMPTY DIRECTLY
  ======================================================= */

function showEmptyState(
  target,
  text = "No data",
  size = "",
  align = ""
) {

    const element =
      typeof target === "string"
        ? document.querySelector(
            target
          )
        : target;


    if (
      !element
    ) {
      return;
    }


element.innerHTML =
  createEmptyState(
    text,
    size,
    align
  );

  }


  /* =======================================================
     SET LOADING DIRECTLY
  ======================================================= */

  function showLoadingState(
    target,
    text = "Loading...",
    size = ""
  ) {

    const element =
      typeof target === "string"
        ? document.querySelector(
            target
          )
        : target;


    if (
      !element
    ) {
      return;
    }


    element.innerHTML =
      createLoadingState(
        text,
        size
      );

  }


  /* =======================================================
     CLEAR CONTENT
  ======================================================= */

  function clearSharedState(
    target
  ) {

    const element =
      typeof target === "string"
        ? document.querySelector(
            target
          )
        : target;


    if (
      !element
    ) {
      return;
    }


    element.innerHTML = "";

  }


  /* =======================================================
     SHARED SEARCHABLE DROPDOWN
  ======================================================= */

  function createSharedDropdown(
    target,
    options = {}
  ) {

    const select =
      typeof target === "string"
        ? document.querySelector(target)
        : target;


    if (
      !select ||
      select.tagName !== "SELECT"
    ) {
      return null;
    }


    /* PREVENT DOUBLE INIT */

    if (
      select.dataset.sharedDropdown ===
      "true"
    ) {

      return (
        select._sharedDropdown ||
        null
      );

    }


    const config = {

      placeholder:
        options.placeholder ||
        select.dataset.placeholder ||
        "Select option",

      emptyText:
        options.emptyText ||
        "No data"

    };


    /* =====================================================
       ICONS
    ===================================================== */

    const arrowIcon = `
      <svg
        viewBox="0 0 1024 1024"
        aria-hidden="true"
      >
        <path
          d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"
          fill="currentColor"
        />
      </svg>
    `;


    const searchIcon = `
      <svg
        viewBox="0 0 1024 1024"
        aria-hidden="true"
      >
        <path
          d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"
          fill="currentColor"
        />
      </svg>
    `;

const clearIcon = `
  <svg
    viewBox="0 0 1024 1024"
    aria-hidden="true"
  >
    <path
      d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z"
      fill="currentColor"
    />
  </svg>
`;
    /* =====================================================
       WRAPPER
    ===================================================== */

    const wrapper =
      document.createElement("div");


    wrapper.className =
      "shared-dropdown";


    /* =====================================================
       TRIGGER
    ===================================================== */

    const trigger =
      document.createElement("div");


    trigger.className =
      "shared-dropdown-trigger";


    /* INPUT */

    const input =
      document.createElement("input");


    input.type =
      "text";


    input.className =
      "shared-dropdown-input";


    input.placeholder =
      config.placeholder;


    input.autocomplete =
      "off";


    input.spellcheck =
      false;


    input.setAttribute(
      "aria-haspopup",
      "listbox"
    );


    input.setAttribute(
      "aria-expanded",
      "false"
    );


    /* ICON */

    const icon =
      document.createElement("span");


    icon.className =
      "shared-dropdown-icon";


    icon.innerHTML =
      arrowIcon;
     
let isHovering =
  false;

    trigger.appendChild(
      input
    );


    trigger.appendChild(
      icon
    );


    /* =====================================================
       PANEL
    ===================================================== */

    const panel =
      document.createElement("div");


    panel.className =
      "shared-dropdown-panel";


    const optionList =
      document.createElement("div");


    optionList.className =
      "shared-dropdown-options";


    optionList.setAttribute(
      "role",
      "listbox"
    );


    panel.appendChild(
      optionList
    );


    /* =====================================================
       INSERT
    ===================================================== */

    select.parentNode.insertBefore(
      wrapper,
      select
    );


    wrapper.appendChild(
      select
    );


    wrapper.appendChild(
      trigger
    );


    wrapper.appendChild(
      panel
    );


    select.classList.add(
      "shared-dropdown-native"
    );


    select.dataset.sharedDropdown =
      "true";

/* =====================================================
   UPDATE RIGHT ICON
===================================================== */

function updateIcon() {

  const isOpen =
    wrapper.classList.contains(
      "open"
    );


  const hasSearchText =
    input.value.trim() !== "";


  const hasSelectedValue =
    select.value !== "";


  /*
    OPEN + USER TYPING
    = ALWAYS CLEAR
  */

  if (
    isOpen &&
    hasSearchText
  ) {

    icon.innerHTML =
      clearIcon;

    icon.dataset.icon =
      "clear";

    return;

  }


  /*
    OPEN + SELECTED VALUE + HOVER INPUT
    = CLEAR
  */

  if (
    isOpen &&
    hasSelectedValue &&
    isHovering
  ) {

    icon.innerHTML =
      clearIcon;

    icon.dataset.icon =
      "clear";

    return;

  }


  /*
    OPEN + NOT HOVERING
    = SEARCH
  */

  if (
    isOpen
  ) {

    icon.innerHTML =
      searchIcon;

    icon.dataset.icon =
      "search";

    return;

  }


  /*
    CLOSED + VALUE + HOVER
    = CLEAR
  */

  if (
    !isOpen &&
    hasSelectedValue &&
    isHovering
  ) {

    icon.innerHTML =
      clearIcon;

    icon.dataset.icon =
      "clear";

    return;

  }


  /*
    DEFAULT CLOSED
    = ARROW
  */

  icon.innerHTML =
    arrowIcon;

  icon.dataset.icon =
    "arrow";

}
    /* =====================================================
       UPDATE DISPLAY VALUE
    ===================================================== */

    function updateValue() {

      const selectedOption =
        select.options[
          select.selectedIndex
        ];


      const hasValue =
        selectedOption &&
        selectedOption.value !== "";


      input.value =
        hasValue
          ? (
              selectedOption
                .textContent ||
              ""
            ).trim()
          : "";

    }


    /* =====================================================
       RENDER OPTIONS
    ===================================================== */

    function renderOptions(
      search = ""
    ) {

      optionList.innerHTML =
        "";


      const keyword =
        String(
          search
        )
          .trim()
          .toLowerCase();


      let count = 0;


      Array
        .from(
          select.options
        )
        .forEach(
          option => {

            if (
              option.value === ""
            ) {
              return;
            }


            const text =
              (
                option.textContent ||
                ""
              ).trim();


            if (
              keyword &&
              !text
                .toLowerCase()
                .includes(
                  keyword
                )
            ) {
              return;
            }


            const item =
              document.createElement(
                "button"
              );


            item.type =
              "button";


            item.className =
              "shared-dropdown-option";


            item.textContent =
              text;


            item.setAttribute(
              "role",
              "option"
            );


            item.setAttribute(
              "aria-selected",
              option.value ===
              select.value
                ? "true"
                : "false"
            );


            if (
              option.value ===
              select.value
            ) {

              item.classList.add(
                "active"
              );

            }


            if (
              option.disabled
            ) {

              item.disabled =
                true;

            }


            item.addEventListener(
              "mousedown",
              event => {

                /*
                  Prevent input blur before
                  option selection.
                */

                event.preventDefault();

              }
            );


            item.addEventListener(
              "click",
              event => {

                event.stopPropagation();


                if (
                  option.disabled
                ) {
                  return;
                }


                select.value =
                  option.value;


                select.dispatchEvent(
                  new Event(
                    "change",
                    {
                      bubbles:true
                    }
                  )
                );


                close();

              }
            );


            optionList.appendChild(
              item
            );


            count++;

          }
        );


      if (
        count === 0
      ) {

        const empty =
          document.createElement(
            "div"
          );


        empty.className =
          "shared-dropdown-empty";


        empty.textContent =
          config.emptyText;


        optionList.appendChild(
          empty
        );

      }

    }


    /* =====================================================
       OPEN
    ===================================================== */

    function open() {

      if (
        select.disabled
      ) {
        return;
      }


document
  .querySelectorAll(
    "select[data-shared-dropdown]"
  )
  .forEach(
    otherSelect => {

      if (
        otherSelect !== select &&
        otherSelect._sharedDropdown
      ) {

        otherSelect
          ._sharedDropdown
          .close();

      }

    }
  );


wrapper.classList.add(
  "open"
);


input.setAttribute(
  "aria-expanded",
  "true"
);


/*
  Get current selected option.
*/

const selectedOption =
  select.options[
    select.selectedIndex
  ];


const selectedText =
  selectedOption &&
  selectedOption.value !== ""
    ? (
        selectedOption.textContent ||
        ""
      ).trim()
    : "";


/*
  Selected value becomes temporary
  placeholder while searching.
*/

input.placeholder =
  selectedText ||
  config.placeholder;


/*
  Actual input becomes empty.
  This allows real blinking caret.
*/

input.value =
  "";


renderOptions(
  ""
);


updateIcon();


requestAnimationFrame(
  () => {

    input.focus();

    input.setSelectionRange(
      0,
      0
    );

  }
);

    }


    /* =====================================================
       CLOSE
    ===================================================== */

    function close() {

      wrapper.classList.remove(
        "open"
      );


      input.setAttribute(
        "aria-expanded",
        "false"
      );

/*
  Restore normal placeholder.
*/

input.placeholder =
  config.placeholder;


/*
  Restore actual selected option.
  Example:
  Facebook returns if user cancels.
*/

updateValue();


updateIcon();

    }


    /* =====================================================
       INPUT CLICK
    ===================================================== */

    input.addEventListener(
      "click",
      event => {

        event.stopPropagation();


        if (
          !wrapper
            .classList
            .contains("open")
        ) {

          open();

        }

      }
    );


    /* =====================================================
       INPUT FOCUS
    ===================================================== */

    input.addEventListener(
      "focus",
      () => {

        if (
          !wrapper
            .classList
            .contains("open")
        ) {

          open();

        }

      }
    );


    /* =====================================================
       SEARCH AS USER TYPES
    ===================================================== */

input.addEventListener(
  "input",
  () => {

    if (
      !wrapper
        .classList
        .contains("open")
    ) {

      open();

    }


    renderOptions(
      input.value
    );


    updateIcon();

  }
);
trigger.addEventListener(
  "mouseenter",
  () => {

    isHovering =
      true;

    updateIcon();

  }
);


trigger.addEventListener(
  "mouseleave",
  () => {

    isHovering =
      false;

    updateIcon();

  }
);


/*
  Input already contains selected text.
  Do not automatically open dropdown
  just because hover state changed.
*/

input.addEventListener(
  "mousemove",
  () => {

    if (
      !wrapper.classList.contains("open") &&
      select.value !== ""
    ) {

      isHovering =
        true;

      updateIcon();

    }

  }
);

    /* =====================================================
       ICON CLICK
    ===================================================== */

icon.addEventListener(
  "mousedown",
  event => {

    event.preventDefault();

    event.stopPropagation();


    const iconType =
      icon.dataset.icon;


    /* ==============================
       CLEAR
    ============================== */

    if (
      iconType === "clear"
    ) {

      /*
        If dropdown is open,
        clear only search text.
      */

if (
  wrapper
    .classList
    .contains("open")
) {

  /*
    Clear selected dropdown value.
  */

  select.value =
    "";


  select.dispatchEvent(
    new Event(
      "change",
      {
        bubbles:true
      }
    )
  );


  /*
    Clear search text.
  */

  input.value =
    "";


  /*
    Restore normal placeholder.
  */

  input.placeholder =
    config.placeholder;


  renderOptions(
    ""
  );


  updateIcon();


  input.focus();


  input.setSelectionRange(
    0,
    0
  );


  return;
}


      /*
        Dropdown closed:
        clear selected value.
      */

      select.value =
        "";


      select.dispatchEvent(
        new Event(
          "change",
          {
            bubbles:true
          }
        )
      );


      input.value =
        "";


      updateIcon();


      return;

    }


    /* ==============================
       SEARCH ICON
    ============================== */

    if (
      iconType === "search"
    ) {

      input.focus();

      return;

    }


    /* ==============================
       ARROW
    ============================== */

    if (
      wrapper
        .classList
        .contains("open")
    ) {

      close();

    } else {

      open();

    }

  }
);


    /* =====================================================
       SELECT CHANGE
    ===================================================== */

select.addEventListener(
  "change",
  () => {

    updateValue();

    renderOptions();

    updateIcon();

  }
);

    /* =====================================================
       DISABLED
    ===================================================== */

    function updateDisabled() {

      const disabled =
        select.disabled;


      input.disabled =
        disabled;


      wrapper
        .classList
        .toggle(
          "disabled",
          disabled
        );


      if (
        disabled
      ) {

        close();

      }

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    const api = {

      open,

      close,

      refresh() {

        updateValue();

        updateDisabled();

        renderOptions();

      },


      setValue(
        value,
        dispatchChange = true
      ) {

        select.value =
          String(
            value
          );


        updateValue();

        renderOptions();


        if (
          dispatchChange
        ) {

          select.dispatchEvent(
            new Event(
              "change",
              {
                bubbles:true
              }
            )
          );

        }

      },


      getValue() {

        return select.value;

      }

    };


    select._sharedDropdown =
      api;


updateValue();

updateDisabled();

renderOptions();

updateIcon();


    return api;

  }
  /* =======================================================
     INIT ALL SHARED DROPDOWNS
  ======================================================= */

function initSharedDropdowns(
  root = document
) {

  root
    .querySelectorAll(
      "select[data-shared-dropdown]"
    )
    .forEach(
      select => {

        createSharedDropdown(
          select,
          {
            placeholder:
              select.dataset.placeholder ||
              "Select option"
          }
        );

      }
    );

}


    /* =======================================================
     CLOSE WHEN CLICK OUTSIDE
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      document
        .querySelectorAll(
          ".shared-dropdown.open"
        )
        .forEach(
          dropdown => {

            if (
              dropdown.contains(
                event.target
              )
            ) {
              return;
            }


            const select =
              dropdown.querySelector(
                "select[data-shared-dropdown]"
              );


            select
              ?._sharedDropdown
              ?.close();

          }
        );

    }
  );


  /* =======================================================
     CLOSE WITH ESC
  ======================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Escape"
      ) {
        return;
      }


      document
        .querySelectorAll(
          ".shared-dropdown.open"
        )
        .forEach(
          dropdown => {

            const select =
              dropdown.querySelector(
                "select[data-shared-dropdown]"
              );


            select
              ?._sharedDropdown
              ?.close();

          }
        );

    }
  );

/* =======================================================
   ADMIN WORKSPACE NAVIGATION
======================================================= */

function navigateToTab(
  tab
) {

  if (!tab?.file) {
    return;
  }

sessionStorage.removeItem(
  "adminWorkspaceClosedTab"
);
  addAdminWorkspaceTab(
    tab
  );


  localStorage.setItem(
    ADMIN_WORKSPACE_ACTIVE_KEY,
    tab.file
  );


  sessionStorage.setItem(
    "adminShowContentLoading",
    "1"
  );


  window.location.href =
    `./${tab.file}`;

}
/* =======================================================
   ADMIN WORKSPACE TABS
======================================================= */

const ADMIN_WORKSPACE_KEY =
  "adminWorkspaceTabs";


const ADMIN_WORKSPACE_ACTIVE_KEY =
  "adminWorkspaceActiveTab";


const ADMIN_DEFAULT_TAB = {
  file:"visitors.html",
  name:"Dashboard"
};


const ADMIN_TAB_REFRESH_ICON = `
  <svg
    viewBox="0 0 1024 1024"
    aria-hidden="true"
  >
    <path
      d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 00-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 01655.9 829c-42.3 17.9-87.4 27-133.8 27-46.5 0-91.5-9.1-133.8-27A341.5 341.5 0 01279 755.2a342.16 342.16 0 01-73.7-109.4c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4 31.6-31.6 68.4-56.4 109.3-73.8 42.3-17.9 87.4-27 133.8-27 46.5 0 91.5 9.1 133.8 27a341.5 341.5 0 01109.3 73.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 003 14.1l175.6 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c-.1-6.6-7.8-10.3-13-6.2z"
      fill="currentColor"
    />
  </svg>
`;
   
const ADMIN_TAB_MORE_ICON = `
  <svg
    viewBox="0 0 1024 1024"
    aria-hidden="true"
  >
    <path
      d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z"
      fill="currentColor"
    />
  </svg>
`;

const ADMIN_TAB_CLOSE_ICON = `
  <svg
    viewBox="0 0 1024 1024"
    aria-hidden="true"
  >
    <path
      d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"
      fill="currentColor"
    />
  </svg>
`;


function getAdminWorkspaceTabs() {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(
          ADMIN_WORKSPACE_KEY
        ) || "[]"
      );


    return Array.isArray(data)
      ? data
      : [];

  }
  catch {

    return [];

  }

}


function saveAdminWorkspaceTabs(
  tabs
) {

  localStorage.setItem(
    ADMIN_WORKSPACE_KEY,
    JSON.stringify(tabs)
  );

}


function addAdminWorkspaceTab(
  tab
) {

  const tabs =
    getAdminWorkspaceTabs();


  const exists =
    tabs.some(
      item =>
        item.file === tab.file
    );


  if (!exists) {

    tabs.push({
      file:tab.file,
      name:tab.name
    });

  }


  saveAdminWorkspaceTabs(
    tabs
  );


  localStorage.setItem(
    ADMIN_WORKSPACE_ACTIVE_KEY,
    tab.file
  );

}


function initAdminWorkspaceTabs(
  menuItems
) {

 if (ADMIN_IS_WORKSPACE_FRAME) {
    return;
  }
   
  const adminNav =
    document.querySelector(
      ".admin-nav"
    );


  if (
    !adminNav ||
    document.getElementById(
      "adminWorkspaceTabs"
    )
  ) {
    return;
  }


  const currentPage =
    window.location.pathname
      .split("/")
      .pop() ||
    "visitors.html";


let tabs =
  getAdminWorkspaceTabs();


const currentItem =
  menuItems.find(
    item =>
      item.file ===
      currentPage
  );


/*
  FIRST TIME ONLY:
  CREATE DEFAULT VISITORS TAB
*/

if (tabs.length === 0) {

  tabs = [
    {
      ...ADMIN_DEFAULT_TAB
    }
  ];

}


/*
  MAKE SURE CURRENT PAGE EXISTS
  INSIDE WORKSPACE

  TAPI JANGAN RESTORE TAB
  YANG BARU SAHAJA DITUTUP
*/

const recentlyClosedTab =
  sessionStorage.getItem(
    "adminWorkspaceClosedTab"
  );


if (
  currentItem &&
  currentPage !== recentlyClosedTab &&
  !tabs.some(
    item =>
      item.file ===
      currentPage
  )
) {

  tabs.push({
    file:currentItem.file,
    name:currentItem.name
  });

}


saveAdminWorkspaceTabs(
  tabs
);


if (currentItem) {

  localStorage.setItem(
    ADMIN_WORKSPACE_ACTIVE_KEY,
    currentPage
  );

}


  const bar =
    document.createElement(
      "div"
    );


  bar.id =
    "adminWorkspaceTabs";

  bar.className =
    "admin-workspace-tabs";

const searchWrap =
  document.createElement(
    "div"
  );

searchWrap.className =
  "admin-workspace-search";


/* =========================================
   CLOSED SEARCH BUTTON
========================================= */

const searchButton =
  document.createElement(
    "button"
  );

searchButton.type =
  "button";

searchButton.className =
  "admin-workspace-search-btn";

searchButton.title =
  "Search module";

searchButton.setAttribute(
  "aria-label",
  "Search module"
);


const SEARCH_ICON = `
  <svg
    viewBox="0 0 1024 1024"
    aria-hidden="true"
  >
    <path
      d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"
      fill="currentColor"
    />
  </svg>
`;

searchButton.innerHTML =
  SEARCH_ICON;


/* =========================================
   SHARED DROPDOWN SELECT
========================================= */

const searchSelect =
  document.createElement(
    "select"
  );

searchSelect.setAttribute(
  "data-shared-dropdown",
  ""
);

searchSelect.dataset.placeholder =
  "Search module";


/* =========================================
   ADD MODULE OPTIONS
========================================= */

menuItems.forEach(
  item => {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      item.file;

    option.textContent =
      item.name;

    searchSelect.appendChild(
      option
    );

  }
);


/* =========================================
   CURRENT ACTIVE MODULE
========================================= */

if (currentItem) {

  searchSelect.value =
    currentItem.file;

}


/* =========================================
   INSERT SEARCH
========================================= */

searchWrap.appendChild(
  searchButton
);

searchWrap.appendChild(
  searchSelect
);


const list =
  document.createElement(
    "div"
  );

list.className =
  "admin-workspace-tabs-list";

/* =========================================
   TAB MORE / OVERFLOW
========================================= */

const moreWrap =
  document.createElement(
    "div"
  );

moreWrap.className =
  "admin-workspace-more";


const moreButton =
  document.createElement(
    "button"
  );

moreButton.type =
  "button";

moreButton.className =
  "admin-workspace-more-btn";

moreButton.setAttribute(
  "aria-label",
  "More tabs"
);

moreButton.innerHTML =
  ADMIN_TAB_MORE_ICON;


const morePanel =
  document.createElement(
    "div"
  );

morePanel.className =
  "shared-dropdown-panel admin-workspace-more-panel";


const moreList =
  document.createElement(
    "div"
  );

moreList.className =
  "admin-workspace-more-list";


morePanel.appendChild(
  moreList
);

moreWrap.appendChild(
  moreButton
);

moreWrap.appendChild(
  morePanel
);
   
bar.appendChild(
  searchWrap
);

bar.appendChild(
  list
);

bar.appendChild(
  moreWrap
);


adminNav.insertAdjacentElement(
  "afterend",
  bar
);

/* =========================================
   UPDATE TAB OVERFLOW MENU
========================================= */

function updateMoreTabs() {

  const tabElements =
    Array.from(
      list.querySelectorAll(
        ".admin-workspace-tab"
      )
    );


  const listRect =
    list.getBoundingClientRect();


  const hiddenTabs =
    tabElements.filter(
      element => {

        const rect =
          element.getBoundingClientRect();

        return (
          rect.left <
            listRect.left - 1 ||
          rect.right >
            listRect.right + 1
        );

      }
    );


  moreList.innerHTML = "";


  if (
    list.scrollWidth <=
    list.clientWidth + 1
  ) {

    moreWrap.classList.remove(
      "show"
    );

    moreWrap.classList.remove(
      "open"
    );

    return;
  }


  moreWrap.classList.add(
    "show"
  );


  hiddenTabs.forEach(
    element => {

      const file =
        element.dataset.file;

      const tab =
        tabs.find(
          item =>
            item.file === file
        );


      if (!tab) {
        return;
      }


      const item =
        document.createElement(
          "div"
        );

      item.className =
        "admin-workspace-more-item";


      if (
        tab.file === currentPage
      ) {

        item.classList.add(
          "active"
        );

      }


      const name =
        document.createElement(
          "button"
        );

      name.type =
        "button";

      name.className =
        "admin-workspace-more-name";

      name.textContent =
        tab.name;


      const actions =
        document.createElement(
          "span"
        );

      actions.className =
        "admin-workspace-more-actions";


      const refresh =
        document.createElement(
          "button"
        );

      refresh.type =
        "button";

      refresh.className =
        "admin-workspace-more-refresh";

      refresh.innerHTML =
        ADMIN_TAB_REFRESH_ICON;

      refresh.title =
        "Refresh";


      const close =
        document.createElement(
          "button"
        );

      close.type =
        "button";

      close.className =
        "admin-workspace-more-close";

      close.innerHTML =
        ADMIN_TAB_CLOSE_ICON;

      close.title =
        "Close";


      name.addEventListener(
        "click",
        () => {

          navigateToTab(
            tab
          );

        }
      );


refresh.addEventListener(
  "click",
  event => {

    event.stopPropagation();


    localStorage.setItem(
      ADMIN_WORKSPACE_ACTIVE_KEY,
      tab.file
    );


    sessionStorage.setItem(
      "adminShowContentLoading",
      "1"
    );


    if (
      tab.file !==
      window.location.pathname
        .split("/")
        .pop()
    ) {

      window.location.href =
        `./${tab.file}`;

      return;
    }


    window.location.reload();

  }
);


      close.addEventListener(
        "click",
        event => {

          event.stopPropagation();
           
         sessionStorage.setItem(
  "adminWorkspaceClosedTab",
  tab.file
);
          const currentTabs =
            getAdminWorkspaceTabs();

          const index =
            currentTabs.findIndex(
              current =>
                current.file ===
                tab.file
            );


          if (index === -1) {
            return;
          }

const activeFile =
  localStorage.getItem(
    ADMIN_WORKSPACE_ACTIVE_KEY
  );


const wasActive =
  tab.file ===
  activeFile;


          currentTabs.splice(
            index,
            1
          );


          saveAdminWorkspaceTabs(
            currentTabs
          );


          if (!wasActive) {

            tabs =
              currentTabs;

            renderTabs();

            return;

          }


          if (
            currentTabs.length === 0
          ) {

            tabs = [];

            renderTabs();

            showNoData();

            return;

          }


          const nextTab =
            currentTabs[
              Math.min(
                index,
                currentTabs.length - 1
              )
            ];


          navigateToTab(
            nextTab
          );

        }
      );


      actions.appendChild(
        refresh
      );

      actions.appendChild(
        close
      );


      item.appendChild(
        name
      );

      item.appendChild(
        actions
      );


      moreList.appendChild(
        item
      );

    }
  );

}
moreWrap.addEventListener(
  "mouseenter",
  () => {

    updateMoreTabs();

    moreWrap.classList.add(
      "open"
    );

  }
);


moreWrap.addEventListener(
  "mouseleave",
  () => {

    moreWrap.classList.remove(
      "open"
    );

  }
);


moreButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    updateMoreTabs();

    moreWrap.classList.toggle(
      "open"
    );

  }
);
/* =========================================
   INITIALIZE EXISTING SHARED DROPDOWN
========================================= */

const searchDropdown =
  createSharedDropdown(
    searchSelect,
    {
      placeholder:
        "Search module",

      emptyText:
        "No data"
    }
  );


/* =========================================
   OPEN SEARCH
========================================= */

searchButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    searchWrap.classList.add(
      "open"
    );

    searchDropdown?.open();

  }
);


/* =========================================
   SELECT MODULE
========================================= */

searchSelect.addEventListener(
  "change",
  () => {

    const file =
      searchSelect.value;


    if (!file) {
      return;
    }


    const item =
      menuItems.find(
        menu =>
          menu.file === file
      );


    if (!item) {
      return;
    }


navigateToTab(
  item
);

  }
);


/* =========================================
   CLOSE COMPACT SEARCH
========================================= */

document.addEventListener(
  "click",
  event => {

    if (
      searchWrap.contains(
        event.target
      )
    ) {
      return;
    }

    searchWrap.classList.add(
      "closing"
    );

    searchWrap.classList.remove(
      "open"
    );

    requestAnimationFrame(() => {

      requestAnimationFrame(() => {

        searchWrap.classList.remove(
          "closing"
        );

      });

    });

  }
);

/*
  MOUSE WHEEL
  VERTICAL WHEEL -> HORIZONTAL TAB SCROLL
*/

list.addEventListener(
  "wheel",
  event => {

    const canScroll =
      list.scrollWidth >
      list.clientWidth;


    if (!canScroll) {
      return;
    }


    const delta =
      Math.abs(event.deltaY) >
      Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;


    if (delta === 0) {
      return;
    }


    event.preventDefault();


    const speed = 1.8;


    list.scrollLeft +=
      delta * speed;

  },
  {
    passive:false
  }
);
list.addEventListener(
  "scroll",
  () => {

    requestAnimationFrame(
      updateMoreTabs
    );

  },
  {
    passive:true
  }
);


window.addEventListener(
  "resize",
  () => {

    requestAnimationFrame(
      updateMoreTabs
    );

  }
);

  function showNoData() {

    document
      .querySelectorAll(
        "body > *"
      )
      .forEach(
        element => {

          if (
            element ===
              document.querySelector(
                ".admin-nav"
              ) ||
            element === bar ||
            element.id ===
              "adminSidebar" ||
            element.id ===
              "adminSidebarBackdrop"
          ) {
            return;
          }


          element.style.display =
            "none";

        }
      );


    const empty =
      document.createElement(
        "div"
      );


    empty.className =
      "admin-workspace-empty";

    empty.id =
      "adminWorkspaceEmpty";


    empty.innerHTML =
      createEmptyState(
        "No data",
        "large",
        "center"
      );


    document.body.appendChild(
      empty
    );

  }


  function renderTabs() {

    tabs =
      getAdminWorkspaceTabs();


    list.innerHTML =
      "";


    tabs.forEach(
      tab => {

        const element =
          document.createElement(
            "div"
          );


        element.className =
          "admin-workspace-tab";


        element.dataset.file =
          tab.file;


const activeFile =
  localStorage.getItem(
    ADMIN_WORKSPACE_ACTIVE_KEY
  );


if (
  tab.file ===
  activeFile
) {

  element.classList.add(
    "active"
  );

}


        const name =
          document.createElement(
            "span"
          );


        name.className =
          "admin-workspace-tab-name";

        name.textContent =
          tab.name;


        const actions =
          document.createElement(
            "span"
          );


        actions.className =
          "admin-workspace-tab-actions";


        const refresh =
          document.createElement(
            "button"
          );


        refresh.type =
          "button";

        refresh.className =
          "admin-workspace-tab-refresh";

        refresh.title =
          "Refresh";

        refresh.innerHTML =
          ADMIN_TAB_REFRESH_ICON;


        const close =
          document.createElement(
            "button"
          );


        close.type =
          "button";

        close.className =
          "admin-workspace-tab-close";

        close.title =
          "Close";

        close.innerHTML =
          ADMIN_TAB_CLOSE_ICON;


        refresh.addEventListener(
          "pointerdown",
          event =>
            event.stopPropagation()
        );


        close.addEventListener(
          "pointerdown",
          event =>
            event.stopPropagation()
        );

refresh.addEventListener(
  "click",
  event => {

    event.stopPropagation();


    localStorage.setItem(
      ADMIN_WORKSPACE_ACTIVE_KEY,
      tab.file
    );


    sessionStorage.setItem(
      "adminShowContentLoading",
      "1"
    );


    window.location.reload();

  }
);


        close.addEventListener(
          "click",
          event => {

            event.stopPropagation();


            const currentTabs =
              getAdminWorkspaceTabs();


            const index =
              currentTabs.findIndex(
                item =>
                  item.file ===
                  tab.file
              );


            if (
              index === -1
            ) {
              return;
            }


const activeFile =
  localStorage.getItem(
    ADMIN_WORKSPACE_ACTIVE_KEY
  );


const wasActive =
  tab.file ===
  activeFile;


            currentTabs.splice(
              index,
              1
            );


            saveAdminWorkspaceTabs(
              currentTabs
            );


            if (!wasActive) {

              tabs =
                currentTabs;

              renderTabs();

              return;

            }


            if (
              currentTabs.length === 0
            ) {

              tabs = [];

              renderTabs();

              showNoData();

              return;

            }


            const nextTab =
              currentTabs[
                Math.min(
                  index,
                  currentTabs.length - 1
                )
              ];


localStorage.setItem(
  ADMIN_WORKSPACE_ACTIVE_KEY,
  nextTab.file
);


window.location.href =
  `./${nextTab.file}`;

          }
        );


        element.addEventListener(
          "click",
          event => {

            if (
              element.classList.contains(
                "dragging"
              )
            ) {
              return;
            }


            if (
              tab.file !==
              currentPage
            ) {

              navigateToTab(
                tab
              );

            }

          }
        );


        actions.appendChild(
          refresh
        );

        actions.appendChild(
          close
        );


        element.appendChild(
          name
        );

        element.appendChild(
          actions
        );


        list.appendChild(
          element
        );

      }
    );


initTabDrag();

requestAnimationFrame(
  updateMoreTabs
);
requestAnimationFrame(
  () => {

    const activeTab =
      list.querySelector(
        ".admin-workspace-tab.active"
      );


    activeTab?.scrollIntoView({
      behavior:"smooth",
      block:"nearest",
      inline:"nearest"
    });

  }
);

}


  function initTabDrag() {

    const tabElements =
      Array.from(
        list.querySelectorAll(
          ".admin-workspace-tab"
        )
      );


    tabElements.forEach(
      tabElement => {

        tabElement.addEventListener(
          "pointerdown",
          event => {

            if (
              event.button !== 0 ||
              event.target.closest(
                ".admin-workspace-tab-refresh, .admin-workspace-tab-close"
              )
            ) {
              return;
            }


            event.preventDefault();


            const startX =
              event.clientX;


            const startRect =
              tabElement
                .getBoundingClientRect();


            let dragging =
              false;


            let currentX =
              startX;


            tabElement.setPointerCapture(
              event.pointerId
            );


            function move(
              moveEvent
            ) {

              currentX =
                moveEvent.clientX;


              const deltaX =
                currentX -
                startX;


              if (
                !dragging &&
                Math.abs(deltaX) <
                  4
              ) {
                return;
              }


              if (!dragging) {

                dragging =
                  true;

                tabElement
                  .classList
                  .add(
                    "dragging"
                  );

                list.classList.add(
                  "is-dragging"
                );

              }


              tabElement.style.transform =
                `translate3d(${deltaX}px,0,0)`;


              const draggedCenter =
                startRect.left +
                deltaX +
                startRect.width / 2;


              const siblings =
                Array.from(
                  list.querySelectorAll(
                    ".admin-workspace-tab:not(.dragging)"
                  )
                );


              siblings.forEach(
                sibling => {

                  const rect =
                    sibling
                      .getBoundingClientRect();


                  const center =
                    rect.left +
                    rect.width / 2;


                  sibling.style.transform =
                    "translate3d(0,0,0)";


                  if (
                    startRect.left <
                      rect.left &&
                    draggedCenter >
                      center
                  ) {

                    sibling.style.transform =
                      `translate3d(-${startRect.width}px,0,0)`;

                  }


                  if (
                    startRect.left >
                      rect.left &&
                    draggedCenter <
                      center
                  ) {

                    sibling.style.transform =
                      `translate3d(${startRect.width}px,0,0)`;

                  }

                }
              );

          }


            function end() {

              tabElement.removeEventListener(
                "pointermove",
                move
              );


              tabElement.removeEventListener(
                "pointerup",
                end
              );


              tabElement.removeEventListener(
                "pointercancel",
                end
              );


              if (!dragging) {

                tabElement.style.transform =
                  "";

                return;

              }


              const draggedRect =
                tabElement
                  .getBoundingClientRect();


              const draggedCenter =
                draggedRect.left +
                draggedRect.width / 2;


              const currentTabs =
                getAdminWorkspaceTabs();


              const oldIndex =
                currentTabs.findIndex(
                  item =>
                    item.file ===
                    tabElement.dataset.file
                );


              let newIndex =
                0;


              Array
                .from(
                  list.querySelectorAll(
                    ".admin-workspace-tab:not(.dragging)"
                  )
                )
                .forEach(
                  sibling => {

                    const rect =
                      sibling
                        .getBoundingClientRect();


                    if (
                      draggedCenter >
                      rect.left +
                      rect.width / 2
                    ) {

                      newIndex++;

                    }

                  }
                );


              if (
                oldIndex !== -1
              ) {

                const [
                  movedTab
                ] =
                  currentTabs.splice(
                    oldIndex,
                    1
                  );


                currentTabs.splice(
                  newIndex,
                  0,
                  movedTab
                );


                saveAdminWorkspaceTabs(
                  currentTabs
                );

              }


              tabElement.classList.remove(
                "dragging"
              );


              list.classList.remove(
                "is-dragging"
              );


              Array
                .from(
                  list.children
                )
                .forEach(
                  child => {

                    child.style.transform =
                      "";

                }
              );


              renderTabs();

            }


            tabElement.addEventListener(
              "pointermove",
              move
            );


            tabElement.addEventListener(
              "pointerup",
              end
            );


            tabElement.addEventListener(
              "pointercancel",
              end
            );

          }
        );

      }
    );

  }


  renderTabs();

}
function initAdminSidebar() {

 if (ADMIN_IS_WORKSPACE_FRAME) {
    return;
  }

  const adminNav =
    document.querySelector(
      ".admin-nav"
    );

  const adminNavInner =
    document.querySelector(
      ".admin-nav-inner"
    );


  if (
    !adminNav ||
    !adminNavInner
  ) {
    return;
  }


  if (
    document.getElementById(
      "adminSidebar"
    )
  ) {
    return;
  }


  /* =====================================================
     ADMIN NAV HEIGHT
  ===================================================== */

  function updateAdminNavHeight() {

    document.documentElement
      .style
      .setProperty(
        "--admin-nav-height",
        `${adminNav.offsetHeight}px`
      );

  }


  updateAdminNavHeight();


  window.addEventListener(
    "resize",
    updateAdminNavHeight
  );


  /* =====================================================
     CURRENT PAGE
  ===================================================== */

  const currentPage =
    window.location.pathname
      .split("/")
      .pop() ||
    "index.html";
/* =====================================================
   ADMIN USER BUTTON
===================================================== */
const adminTime =
  document.createElement(
    "div"
  );

adminTime.className =
  "admin-header-time";


const adminTimeCity =
  document.createElement(
    "div"
  );

adminTimeCity.className =
  "admin-header-time-city";

adminTimeCity.textContent =
  "Kuala Lumpur";


const adminTimeValue =
  document.createElement(
    "div"
  );

adminTimeValue.className =
  "admin-header-time-value";


adminTime.appendChild(
  adminTimeCity
);

adminTime.appendChild(
  adminTimeValue
);


/* UPDATE KUALA LUMPUR TIME */

function updateAdminTime() {

  const now =
    new Date();


  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Kuala_Lumpur",

        hour:
          "2-digit",

        minute:
          "2-digit",

        hour12:
          false,

        month:
          "short",

        day:
          "2-digit"
      }
    )
    .formatToParts(
      now
    );


  const getPart =
    type =>
      parts.find(
        part =>
          part.type === type
      )?.value || "";


adminTimeValue.innerHTML = `
  <span class="admin-header-clock">
    ${getPart("hour")}:${getPart("minute")}
  </span>

  <span class="admin-header-date">
    ${getPart("month")} ${getPart("day")}
  </span>
`;

}


updateAdminTime();

setInterval(
  updateAdminTime,
  1000
);
   
const userWrapper =
  document.createElement(
    "div"
  );

userWrapper.className =
  "admin-user-wrapper";


const userButton =
  document.createElement(
    "button"
  );

userButton.type =
  "button";

userButton.id =
  "adminUserBtn";

userButton.className =
  "admin-user-btn";

userButton.setAttribute(
  "aria-label",
  "Admin account"
);

userButton.setAttribute(
  "aria-expanded",
  "false"
);


userButton.innerHTML = `
  <svg
    viewBox="0 0 18 18"
    aria-hidden="true"
  >
 <path d="M13.689 11.132c1.155 1.222 1.953 2.879 2.183 4.748a1.007 1.007 0 0 1-1 1.12H3.007a1.005 1.005 0 0 1-1-1.12c.23-1.87 1.028-3.526 2.183-4.748c.247.228.505.442.782.633c-1.038 1.069-1.765 2.55-1.972 4.237L14.872 16c-.204-1.686-.93-3.166-1.966-4.235a7 7 0 0 0 .783-.633M8.939 1c1.9 0 3 2 4.38 2.633a2.48 2.48 0 0 1-1.88.867c-.298 0-.579-.06-.844-.157A3.73 3.73 0 0 1 7.69 5.75c-1.395 0-3.75.25-3.245-1.903C5.94 3 6.952 1 8.94 1"></path><path d="M8.94 2c2.205 0 4 1.794 4 4s-1.795 4-4 4c-2.207 0-4-1.794-4-4s1.793-4 4-4m0 9A5 5 0 1 0 8.937.999A5 5 0 0 0 8.94 11" fill="currentColor"></path></g></svg>

  <span
    id="adminUsername"
    class="admin-user-name"
  ></span>
`;


const userDropdown =
  document.createElement(
    "div"
  );

userDropdown.className =
  "admin-user-dropdown";

userDropdown.innerHTML = `

  <!-- HEADER BACKGROUND COLOR -->
  <button
    type="button"
    id="adminHeaderColorBtn"
    class="admin-user-logout admin-header-color-btn"
  >
    <span
      id="adminHeaderColorSwatch"
      class="admin-header-color-swatch"
    ></span>

    <span
      id="adminHeaderColorText"
      class="admin-header-color-text"
    >
      Header Background Color (#001528)
    </span>

    <span></span>
  </button>

  <input
    type="color"
    id="adminHeaderColorInput"
    class="admin-header-color-input"
    value="#001528"
    aria-label="Header Background Color"
  >

  <!-- RESET 2ND PASSWORD - PALING ATAS -->
  <button
    type="button"
    id="adminChangeSecondPasswordBtn"
    class="admin-user-logout"
  >
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path
        d="M866.9 169.9L527.1 54.1C523 52.7 517.5 52 512 52s-11 .7-15.1 2.1L157.1 169.9c-8.3 2.8-15.1 12.4-15.1 21.2v482.4c0 8.8 5.7 20.4 12.6 25.9L499.3 968c3.5 2.7 8 4.1 12.6 4.1s9.2-1.4 12.6-4.1l344.7-268.6c6.9-5.4 12.6-17 12.6-25.9V191.1c.2-8.8-6.6-18.3-14.9-21.2zM810 654.3L512 886.5 214 654.3V226.7l298-101.6 298 101.6v427.6zm-405.8-201c-3-4.1-7.8-6.6-13-6.6H336c-6.5 0-10.3 7.4-6.5 12.7l126.4 174a16.1 16.1 0 0026 0l212.6-292.7c3.8-5.3 0-12.7-6.5-12.7h-55.2c-5.1 0-10 2.5-13 6.6L468.9 542.4l-64.7-89.1z"
        fill="currentColor"
      />
    </svg>

    <span>
      Reset 2nd Password
    </span>
  </button>


  <!-- RESET PASSWORD - TENGAH -->
  <button
    type="button"
    id="adminChangePasswordBtn"
    class="admin-user-logout"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48l1.3-.75l-.85-1.48H7v-1.5H5.3l.85-1.47L4.85 7L4 8.47L3.15 7l-1.3.75l.85 1.47H1v1.5h1.7l-.85 1.48zm6.7-.75l1.3.75l.85-1.48l.85 1.48l1.3-.75l-.85-1.48H15v-1.5h-1.7l.85-1.47l-1.3-.75L12 8.47L11.15 7l-1.3.75l.85 1.47H9v1.5h1.7zM23 9.22h-1.7l.85-1.47l-1.3-.75L20 8.47L19.15 7l-1.3.75l.85 1.47H17v1.5h1.7l-.85 1.48l1.3.75l.85-1.48l.85 1.48l1.3-.75l-.85-1.48H23z"
        fill="currentColor"
      />
    </svg>

    <span>
      Reset Password
    </span>
  </button>


  <!-- LOGOUT - PALING BAWAH -->
  <button
    type="button"
    id="adminUserLogoutBtn"
    class="admin-user-logout"
  >
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M3 21V3h9v2H5v14h7v2zm13-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z"
        fill="currentColor"
      />
    </svg>

    <span>
      Logout
    </span>
  </button>

`;
/* =======================================================
   ADMIN HEADER BACKGROUND COLOR
======================================================= */

const ADMIN_HEADER_COLOR_KEY =
  "adminHeaderBackgroundColor";

const ADMIN_HEADER_DEFAULT_COLOR =
  "#001528";


const adminHeaderColorBtn =
  userDropdown.querySelector(
    "#adminHeaderColorBtn"
  );

const adminHeaderColorInput =
  userDropdown.querySelector(
    "#adminHeaderColorInput"
  );

const adminHeaderColorSwatch =
  userDropdown.querySelector(
    "#adminHeaderColorSwatch"
  );

const adminHeaderColorText =
  userDropdown.querySelector(
    "#adminHeaderColorText"
  );


function normalizeAdminHeaderColor(
  color
) {

  const value =
    String(color || "")
      .trim()
      .toUpperCase();

  return /^#[0-9A-F]{6}$/.test(value)
    ? value
    : ADMIN_HEADER_DEFAULT_COLOR;

}


function applyAdminHeaderColor(
  color
) {

  const finalColor =
    normalizeAdminHeaderColor(
      color
    );


  adminNav.style.setProperty(
    "background-color",
    finalColor,
    "important"
  );


  if (adminHeaderColorSwatch) {

    adminHeaderColorSwatch
      .style
      .backgroundColor =
        finalColor;

  }


  if (adminHeaderColorText) {

    adminHeaderColorText
      .textContent =
        `Header Background Color (${finalColor})`;

  }


  if (adminHeaderColorInput) {

    adminHeaderColorInput.value =
      finalColor.toLowerCase();

  }

}


/* LOAD SAVED COLOR */

const savedAdminHeaderColor =
  localStorage.getItem(
    ADMIN_HEADER_COLOR_KEY
  ) ||
  ADMIN_HEADER_DEFAULT_COLOR;


applyAdminHeaderColor(
  savedAdminHeaderColor
);


/* OPEN COLOR PICKER */

adminHeaderColorBtn
  ?.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      adminHeaderColorInput
        ?.click();

    }
  );


/* LIVE PREVIEW */

adminHeaderColorInput
  ?.addEventListener(
    "input",
    () => {

      const color =
        normalizeAdminHeaderColor(
          adminHeaderColorInput.value
        );

      applyAdminHeaderColor(
        color
      );

      localStorage.setItem(
        ADMIN_HEADER_COLOR_KEY,
        color
      );

    }
  );


/* FINAL SAVE */

adminHeaderColorInput
  ?.addEventListener(
    "change",
    () => {

      const color =
        normalizeAdminHeaderColor(
          adminHeaderColorInput.value
        );

      applyAdminHeaderColor(
        color
      );

      localStorage.setItem(
        ADMIN_HEADER_COLOR_KEY,
        color
      );

    }
  );

userWrapper.appendChild(
  userButton
);

userWrapper.appendChild(
  userDropdown
);

/* =======================================================
   ADMIN PASSWORD MODAL
======================================================= */

const adminPasswordModal =
  document.createElement(
    "div"
  );

adminPasswordModal.className =
  "admin-password-modal";

adminPasswordModal.innerHTML = `

  <div
    class="admin-password-modal-backdrop"
  ></div>

  <div
    class="admin-password-dialog"
    role="dialog"
    aria-modal="true"
  >

    <div
      class="admin-password-header"
    >

      <div>
        <h3
          id="adminPasswordModalTitle"
        >
          Change Password
        </h3>

        <p
          id="adminPasswordModalSubtitle"
        >
          Update your account password.
        </p>
      </div>


      <button
        type="button"
        id="adminPasswordModalClose"
        class="admin-password-close"
        aria-label="Close"
      >
        <svg
          viewBox="0 0 1024 1024"
          aria-hidden="true"
        >
          <path
            d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A8 8 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"
            fill="currentColor"
          />
        </svg>
      </button>

    </div>


    <form
      id="adminPasswordForm"
      class="admin-password-form"
    >

      <div
        class="admin-password-field"
      >
        <label
          id="adminCurrentPasswordLabel"
          for="adminCurrentPassword"
        >
         <span class="label-required"> 
         Current Password 
         </span>
        </label>

<input
  id="adminCurrentPassword"
  class="shared-input"
  placeholder="Enter current password"
  type="text"
  autocomplete="off"
  required
>
      </div>


<div
  class="admin-password-field"
>
  <label
    id="adminNewPasswordLabel"
    for="adminNewPassword"
  >
  <span class="label-required"> 
    New Password
   </span>
  </label>

  <div
    class="admin-password-input-wrap"
  >

    <span
      class="admin-password-input-icon"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1024 1024"
        width="14"
        height="14"
      >
        <path
          d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 10-56 0z"
          fill="currentColor"
        />
      </svg>
    </span>

    <input
      id="adminNewPassword"
      class="shared-input admin-password-icon-input"
      type="password"
      placeholder="Enter new password"
      autocomplete="new-password"
      required
    >
<button
  type="button"
  class="admin-password-eye"
  data-password-toggle="adminNewPassword"
  aria-label="Show password"
></button>

  </div>
</div>

<div
  class="admin-password-field"
>
  <label
    for="adminConfirmPassword"
  >
  <span class="label-required"> 
    Confirm New Password
   </span>
  </label>

  <div
    class="admin-password-input-wrap"
  >

    <span
      class="admin-password-input-icon"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1024 1024"
        width="14"
        height="14"
      >
        <path
          d="M832 464h-68V240c0-70.7-57.3-128-128-128H388c-70.7 0-128 57.3-128 128v224h-68c-17.7 0-32 14.3-32 32v384c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V496c0-17.7-14.3-32-32-32zM332 240c0-30.9 25.1-56 56-56h248c30.9 0 56 25.1 56 56v224H332V240zm460 600H232V536h560v304zM484 701v53c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-53a48.01 48.01 0 10-56 0z"
          fill="currentColor"
        />
      </svg>
    </span>

    <input
      id="adminConfirmPassword"
      class="shared-input admin-password-icon-input"
      type="password"
      placeholder="Confirm new password"
      autocomplete="new-password"
      required
    >
<button
  type="button"
  class="admin-password-eye"
  data-password-toggle="adminConfirmPassword"
  aria-label="Show password"
></button>
  </div>
</div>


      <div
        id="adminPasswordError"
        class="admin-password-error"
      ></div>


      <div
        class="admin-password-actions"
      >

        <button
          type="button"
          id="adminPasswordCancel"
          class="admin-password-cancel"
        >
          Cancel
        </button>

        <button
          type="submit"
          id="adminPasswordSave"
          class="admin-password-save"
        >
          Change Password
        </button>

      </div>

    </form>

  </div>
`;

document.body.appendChild(
  adminPasswordModal
);
/* =======================================================
   PASSWORD SHOW / HIDE
======================================================= */

const ADMIN_PASSWORD_EYE_ICON = `
  <svg
    viewBox="64 64 896 896"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <path
      d="M81.8 537.8a60.3 60.3 0 010-51.5C176.6 286.5 319.8 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c-192.1 0-335.4-100.5-430.2-300.2z"
      fill="#e6f4ff"
    />
    <path
      d="M512 258c-161.3 0-279.4 81.8-362.7 254C232.6 684.2 350.7 766 512 766c161.4 0 279.5-81.8 362.7-254C791.4 339.8 673.3 258 512 258zm-4 430c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176z"
      fill="#e6f4ff"
    />
    <path
      d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258s279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766z"
      fill="#1677ff"
    />
    <path
      d="M508 336c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z"
      fill="#1677ff"
    />
  </svg>
`;


const ADMIN_PASSWORD_EYE_OFF_ICON = `
  <svg
    viewBox="64 64 896 896"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <path
      d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z"
      fill="currentColor"
    />
  </svg>
`;


adminPasswordModal
  .querySelectorAll(
    ".admin-password-eye"
  )
  .forEach(button => {

    const input =
      adminPasswordModal.querySelector(
        `#${button.dataset.passwordToggle}`
      );

    if (!input) {
      return;
    }


    function updatePasswordEye() {

      const isVisible =
        input.type === "text";

button.innerHTML =
  isVisible
    ? ADMIN_PASSWORD_EYE_ICON
    : ADMIN_PASSWORD_EYE_OFF_ICON;

      button.setAttribute(
        "aria-label",
        isVisible
          ? "Hide password"
          : "Show password"
      );

    }


    button.addEventListener(
      "click",
      () => {

        input.type =
          input.type === "password"
            ? "text"
            : "password";

        updatePasswordEye();

        input.focus();

      }
    );


    updatePasswordEye();

  });
/* OPEN / CLOSE USER DROPDOWN */

function closeAdminUserDropdown() {

  userWrapper.classList.remove(
    "open"
  );

  userButton.setAttribute(
    "aria-expanded",
    "false"
  );

}
const adminChangePasswordBtn =
  userDropdown.querySelector(
    "#adminChangePasswordBtn"
  );

const adminChangeSecondPasswordBtn =
  userDropdown.querySelector(
    "#adminChangeSecondPasswordBtn"
  );

const adminPasswordModalClose =
  adminPasswordModal.querySelector(
    "#adminPasswordModalClose"
  );

const adminPasswordCancel =
  adminPasswordModal.querySelector(
    "#adminPasswordCancel"
  );

const adminPasswordBackdrop =
  adminPasswordModal.querySelector(
    ".admin-password-modal-backdrop"
  );

const adminPasswordForm =
  adminPasswordModal.querySelector(
    "#adminPasswordForm"
  );

let adminPasswordMode =
  "password";


function openAdminPasswordModal(
  mode
) {

  adminPasswordMode =
    mode;

  const title =
    adminPasswordModal.querySelector(
      "#adminPasswordModalTitle"
    );

  const subtitle =
    adminPasswordModal.querySelector(
      "#adminPasswordModalSubtitle"
    );

  const currentLabel =
    adminPasswordModal.querySelector(
      "#adminCurrentPasswordLabel"
    );

  const newLabel =
    adminPasswordModal.querySelector(
      "#adminNewPasswordLabel"
    );

  const saveButton =
    adminPasswordModal.querySelector(
      "#adminPasswordSave"
    );


  adminPasswordForm.reset();


  if (
    mode === "second"
  ) {

    title.textContent =
      "Change 2nd Password";

    subtitle.textContent =
      "Update your 6-digit second password.";

currentLabel.innerHTML = `
  <span class="label-required">
    Current 2nd Password
  </span>
`;

newLabel.innerHTML = `
  <span class="label-required">
    New 2nd Password
  </span>
`;

    saveButton.textContent =
      "Change 2nd Password";

  } else {

    title.textContent =
      "Change Password";

    subtitle.textContent =
      "Update your account password.";

currentLabel.innerHTML = `
  <span class="label-required">
    Current Password
  </span>
`;

newLabel.innerHTML = `
  <span class="label-required">
    New Password
  </span>
`;

    saveButton.textContent =
      "Change Password";

  }


  adminPasswordModal.classList.add(
    "show"
  );

  closeAdminUserDropdown();


  requestAnimationFrame(
    () => {

      adminPasswordModal
        .querySelector(
          "#adminCurrentPassword"
        )
        ?.focus();

    }
  );

}


function closeAdminPasswordModal() {

  adminPasswordModal.classList.remove(
    "show"
  );

  adminPasswordForm.reset();

}
/* =======================================================
   CHANGE PASSWORD / 2ND PASSWORD SUBMIT
======================================================= */

function showAdminPasswordError(
  errorBox,
  message
) {

  if (errorBox) {

    errorBox.classList.remove(
      "success"
    );

    errorBox.textContent =
      message;

  }


  window.showToast(
    message,
    "error",
    5000
  );

}


adminPasswordForm
  ?.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const currentPassword =
        adminPasswordModal
          .querySelector(
            "#adminCurrentPassword"
          )
          ?.value
          .trim() || "";


      const newPassword =
        adminPasswordModal
          .querySelector(
            "#adminNewPassword"
          )
          ?.value
          .trim() || "";


      const confirmPassword =
        adminPasswordModal
          .querySelector(
            "#adminConfirmPassword"
          )
          ?.value
          .trim() || "";


      const errorBox =
        adminPasswordModal
          .querySelector(
            "#adminPasswordError"
          );


      const saveButton =
        adminPasswordModal
          .querySelector(
            "#adminPasswordSave"
          );


      /* RESET MESSAGE */

      if (errorBox) {

        errorBox.textContent =
          "";

        errorBox.classList.remove(
          "success"
        );

      }


      /* =========================
         EMPTY VALIDATION
      ========================= */

if (
  !currentPassword ||
  !newPassword ||
  !confirmPassword
) {

  showAdminPasswordError(
    errorBox,
    "Please complete all fields."
  );

  return;

}


      /* =========================
         CONFIRM VALIDATION
      ========================= */

if (
  newPassword !==
  confirmPassword
) {

  showAdminPasswordError(
    errorBox,
    "New password and confirm password do not match."
  );

  return;

}


/* ==================================================
   NORMAL FIREBASE PASSWORD
================================================== */

if (
  adminPasswordMode ===
  "password"
) {

  if (
    newPassword.length < 6
  ) {

    showAdminPasswordError(
      errorBox,
      "New password must be at least 6 characters."
    );

    return;

  }


  try {

    if (saveButton) {

      saveButton.disabled =
        true;

      saveButton.textContent =
        "Changing...";

    }


    if (
      typeof window
        .changeAdminPassword !==
      "function"
    ) {

      throw new Error(
        "CHANGE_PASSWORD_NOT_READY"
      );

    }


    await window
      .changeAdminPassword(
        currentPassword,
        newPassword
      );


    window.showToast(
      "Password changed successfully.",
      "success"
    );


    adminPasswordForm.reset();


    setTimeout(
      () => {

        closeAdminPasswordModal();

      },
      1000
    );

  }
  catch (error) {

    console.error(
      "Change password error:",
      error
    );


    let message =
      "Unable to change password.";


    if (
      error.code ===
        "auth/invalid-credential" ||
      error.code ===
        "auth/wrong-password"
    ) {

      message =
        "Current password is incorrect.";

    }
    else if (
      error.code ===
      "auth/weak-password"
    ) {

      message =
        "New password is too weak.";

    }
    else if (
      error.code ===
      "auth/too-many-requests"
    ) {

      message =
        "Too many attempts. Please try again later.";

    }
    else if (
      error.message ===
      "CHANGE_PASSWORD_NOT_READY"
    ) {

      message =
        "Password service is not ready.";

    }


    showAdminPasswordError(
      errorBox,
      message
    );

  }
  finally {

    if (saveButton) {

      saveButton.disabled =
        false;

      saveButton.textContent =
        "Change Password";

    }

  }


  return;

}


      /* ==================================================
         2ND PASSWORD
      ================================================== */

      if (
        adminPasswordMode ===
        "second"
      ) {

        /* CURRENT CODE = 6 DIGIT */

if (
  !/^\d{6}$/.test(
    currentPassword
  )
) {

  showAdminPasswordError(
    errorBox,
    "Current 2nd Password must be exactly 6 digits."
  );

  return;

}


        /* NEW CODE = 6 DIGIT */

if (
  !/^\d{6}$/.test(
    newPassword
  )
) {

  showAdminPasswordError(
    errorBox,
    "New 2nd Password must be exactly 6 digits."
  );

  return;

}


        try {

          if (saveButton) {

            saveButton.disabled =
              true;

            saveButton.textContent =
              "Changing...";

          }


          if (
            typeof window
              .changeAdminSecondPassword !==
            "function"
          ) {

            throw new Error(
              "CHANGE_SECOND_PASSWORD_NOT_READY"
            );

          }


await window
  .changeAdminSecondPassword(
    currentPassword,
    newPassword
  );


window.showToast(
  "2nd Password changed successfully.",
  "success"
);

          adminPasswordForm.reset();


          setTimeout(
            () => {

              closeAdminPasswordModal();

            },
            300
          );

        }
catch (error) {

  console.error(
    "Change 2nd Password error:",
    error
  );


  let message =
    "Unable to change 2nd Password.";


  if (
    error.message ===
    "SECOND_CODE_WRONG"
  ) {

    message =
      "Current 2nd Password is incorrect.";

  }
  else if (
    error.message ===
    "SECOND_CODE_FORMAT"
  ) {

    message =
      "2nd Password must be exactly 6 digits.";

  }
  else if (
    error.message ===
    "SECOND_AUTH_NOT_FOUND"
  ) {

    message =
      "2nd Password account was not found.";

  }
  else if (
    error.message ===
    "SECOND_AUTH_DISABLED"
  ) {

    message =
      "2nd Password is currently disabled.";

  }
  else if (
    error.message ===
    "SECOND_CODE_NOT_SET"
  ) {

    message =
      "2nd Password has not been set.";

  }
  else if (
    error.message ===
    "CHANGE_SECOND_PASSWORD_NOT_READY"
  ) {

    message =
      "2nd Password service is not ready.";

  }
  else if (
    error.code ===
      "PERMISSION_DENIED" ||
    error.code ===
      "permission_denied"
  ) {

    message =
      "Database permission denied.";

  }


  showAdminPasswordError(
    errorBox,
    message
  );

}
        finally {

          if (saveButton) {

            saveButton.disabled =
              false;

            saveButton.textContent =
              "Change 2nd Password";

          }

        }

      }

    }
  );

adminChangePasswordBtn
  ?.addEventListener(
    "click",
    () => {

      openAdminPasswordModal(
        "password"
      );

    }
  );


adminChangeSecondPasswordBtn
  ?.addEventListener(
    "click",
    () => {

      openAdminPasswordModal(
        "second"
      );

    }
  );


adminPasswordModalClose
  ?.addEventListener(
    "click",
    closeAdminPasswordModal
  );


adminPasswordCancel
  ?.addEventListener(
    "click",
    closeAdminPasswordModal
  );


adminPasswordBackdrop
  ?.addEventListener(
    "click",
    closeAdminPasswordModal
  );


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      adminPasswordModal
        .classList
        .contains("show")
    ) {

      closeAdminPasswordModal();

    }

  }
);
function openAdminUserDropdown() {

  userWrapper.classList.add(
    "open"
  );

  userButton.setAttribute(
    "aria-expanded",
    "true"
  );

}
userWrapper.addEventListener(
  "mouseenter",
  () => {

    openAdminUserDropdown();

  }
);


userWrapper.addEventListener(
  "mouseleave",
  () => {

    closeAdminUserDropdown();

  }
);
userButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    const isOpen =
      userWrapper.classList.toggle(
        "open"
      );

    userButton.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  }
);


document.addEventListener(
  "click",
  event => {

    if (
      !userWrapper.contains(
        event.target
      )
    ) {

      closeAdminUserDropdown();

    }

  }
);
/* =====================================================
   REFRESH BUTTON
===================================================== */

const refreshButton =
  document.createElement(
    "button"
  );

refreshButton.type =
  "button";

refreshButton.id =
  "adminRefreshBtn";

refreshButton.className =
  "admin-refresh-btn";

refreshButton.setAttribute(
  "aria-label",
  "Refresh page"
);

refreshButton.setAttribute(
  "title",
  "Refresh"
);

refreshButton.innerHTML = `
  <svg
    viewBox="0 0 1024 1024"
    aria-hidden="true"
  >
    <path
      d="M909.1 209.3l-56.4 44.1C775.8 155.1 656.2 92 521.9 92 290 92 102.3 279.5 102 511.5 101.7 743.7 289.8 932 521.9 932c181.3 0 335.8-115 394.6-276.1 1.5-4.2-.7-8.9-4.9-10.3l-56.7-19.5a8 8 0 00-10.1 4.8c-1.8 5-3.8 10-5.9 14.9-17.3 41-42.1 77.8-73.7 109.4A344.77 344.77 0 01655.9 829c-42.3 17.9-87.4 27-133.8 27-46.5 0-91.5-9.1-133.8-27A341.5 341.5 0 01279 755.2a342.16 342.16 0 01-73.7-109.4c-17.9-42.4-27-87.4-27-133.9s9.1-91.5 27-133.9c17.3-41 42.1-77.8 73.7-109.4 31.6-31.6 68.4-56.4 109.3-73.8 42.3-17.9 87.4-27 133.8-27 46.5 0 91.5 9.1 133.8 27a341.5 341.5 0 01109.3 73.8c9.9 9.9 19.2 20.4 27.8 31.4l-60.2 47a8 8 0 003 14.1l175.6 43c5 1.2 9.9-2.6 9.9-7.7l.8-180.9c-.1-6.6-7.8-10.3-13-6.2z"
      fill="currentColor"
    />
  </svg>
`;

refreshButton.addEventListener(
  "click",
  () => {

    sessionStorage.setItem(
      "adminShowContentLoading",
      "1"
    );

    window.location.reload();

  }
);
  /* =====================================================
     MENU BUTTON
  ===================================================== */

  const menuButton =
    document.createElement(
      "button"
    );


  menuButton.type =
    "button";


  menuButton.id =
    "adminMenuBtn";


  menuButton.className =
    "admin-menu-btn";


  menuButton.setAttribute(
    "aria-label",
    "Open admin menu"
  );


  menuButton.setAttribute(
    "aria-expanded",
    "false"
  );


  /*
    SVG MENU ICON BRO
  */

  menuButton.innerHTML = `
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path
        d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM142.4 642.1L298.7 519a8.84 8.84 0 000-13.9L142.4 381.9c-5.8-4.6-14.4-.5-14.4 6.9v246.3a8.9 8.9 0 0014.4 7z"
        fill="currentColor"
      />
    </svg>
  `;


const adminNavActions =
  document.createElement(
    "div"
  );

adminNavActions.className =
  "admin-nav-actions";


adminNavActions.appendChild(
  adminTime
);

adminNavActions.appendChild(
  userWrapper
);

adminNavActions.appendChild(
  refreshButton
);

adminNavActions.appendChild(
  menuButton
);

adminNavInner.appendChild(
  adminNavActions
);


  /* =====================================================
     BACKDROP
  ===================================================== */

  const backdrop =
    document.createElement(
      "div"
    );


  backdrop.id =
    "adminSidebarBackdrop";


  backdrop.className =
    "admin-sidebar-backdrop";


  /* =====================================================
     SIDEBAR
  ===================================================== */

  const sidebar =
    document.createElement(
      "aside"
    );


  sidebar.id =
    "adminSidebar";


  sidebar.className =
    "admin-sidebar";


  /* =====================================================
     MENU ITEMS
  ===================================================== */

  const menuItems = [
    {
      file: "visitors.html",
      name: "Dashboard"
    },
     
    {
      file: "tabs.html",
      name: "Tabs Settings"
    },

    {
      file: "contacts.html",
      name: "Contacts Manage"
    },

    {
      file: "notices.html",
      name: "Notices Message"
    },

    {
      file: "marquee.html",
      name: "Marquee Text"
    },

    {
      file: "floating.html",
      name: "Floating Image"
    },

    {
      file: "loading.html",
      name: "Loading Config"
    },

    {
      file: "skin.html",
      name: "Skin Config"
    },

    {
      file: "welcome.html",
      name: "Welcome Popup"
    }

  ];

initAdminWorkspaceTabs(
  menuItems
);
  const linksHtml =
    menuItems
      .map(
        item => {

          const active =
            currentPage ===
            item.file;


return `
  <a
    href="./${item.file}"
    data-admin-tab-file="${item.file}"
    data-admin-tab-name="${item.name}"
    class="admin-sidebar-link${
      active
        ? " active"
        : ""
    }"
  >
    ${item.name}
  </a>
`;

        }
      )
      .join("");


  sidebar.innerHTML = `

    <div class="admin-sidebar-menu">

      ${linksHtml}


      <a
        href="../index.html"
        target="_blank"
        class="admin-sidebar-link"
      >
        Customer
      </a>


      <button
        id="logoutBtn"
        type="button"
        class="admin-sidebar-link admin-sidebar-logout"
      >
        Logout
      </button>

    </div>

  `;

sidebar
  .querySelectorAll(
    "[data-admin-tab-file]"
  )
  .forEach(
    link => {

link.addEventListener(
  "click",
  event => {

    event.preventDefault();


    const item = {
      file:
        link.dataset
          .adminTabFile,

      name:
        link.dataset
          .adminTabName
    };


navigateToTab(
  item
);


closeAdminSidebar();

  }
);

    }
  );
  document.body.appendChild(
    backdrop
  );


  document.body.appendChild(
    sidebar
  );


  /* =====================================================
     OPEN
  ===================================================== */

  function openAdminSidebar() {

    sidebar.classList.add(
      "open"
    );


    backdrop.classList.add(
      "show"
    );


    menuButton.classList.add(
      "active"
    );


    menuButton.setAttribute(
      "aria-expanded",
      "true"
    );

  }


  /* =====================================================
     CLOSE
  ===================================================== */

  function closeAdminSidebar() {

    sidebar.classList.remove(
      "open"
    );


    backdrop.classList.remove(
      "show"
    );


    menuButton.classList.remove(
      "active"
    );


    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

  }


  /* =====================================================
     MENU CLICK
  ===================================================== */

  menuButton.addEventListener(
    "click",
    event => {

      event.stopPropagation();


      if (
        sidebar.classList.contains(
          "open"
        )
      ) {

        closeAdminSidebar();

      }
      else {

        openAdminSidebar();

      }

    }
  );


  /* =====================================================
     BACKDROP CLICK
  ===================================================== */

  backdrop.addEventListener(
    "click",
    closeAdminSidebar
  );


  /* =====================================================
     ESC CLOSE
  ===================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeAdminSidebar();

      }

    }
  );

}


/*
  shared-ui.js bro sudah dipanggil
  di bawah HTML, jadi boleh init terus.
*/

initAdminSidebar();
  /* =======================================================
     GLOBAL
     Available to every page
  ======================================================= */

  window.createEmptyState =
    createEmptyState;


  window.createLoadingState =
    createLoadingState;


  window.showEmptyState =
    showEmptyState;


  window.showLoadingState =
    showLoadingState;


  window.clearSharedState =
    clearSharedState;

     window.createSharedDropdown =
    createSharedDropdown;


  window.initSharedDropdowns =
    initSharedDropdowns;

   /* =========================================================
   GLOBAL CUSTOM TOAST
========================================================= */

function getToastContainer() {

  let container =
    document.getElementById(
      "globalToastContainer"
    );


  if (!container) {

    container =
      document.createElement(
        "div"
      );


    container.id =
      "globalToastContainer";


    document.body.appendChild(
      container
    );

  }


  return container;

}


/* =========================================================
   TOAST ICONS
========================================================= */

const toastIcons = {

  success: `
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z"
      />
    </svg>
  `,

  error: `
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm127 576.8L576.8 703 512 638.2 447.2 703 385 640.8l64.8-64.8-64.8-64.8 62.2-62.2 64.8 64.8 64.8-64.8 62.2 62.2-64.8 64.8 64.8 64.8z"
      />
    </svg>
  `,

  warning: `
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-40 240h80v288h-80V304zm40 432a48 48 0 110-96 48 48 0 010 96z"
      />
    </svg>
  `,

  info: `
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm40 672h-80V448h80v288zm-40-368a48 48 0 110-96 48 48 0 010 96z"
      />
    </svg>
  `

};


/* =========================================================
   REMOVE TOAST
========================================================= */

function removeToast(
  toast
) {

  if (
    !toast ||
    toast.dataset.removing ===
      "true"
  ) {

    return;

  }


  toast.dataset.removing =
    "true";


  toast.classList.remove(
    "show"
  );


  toast.classList.add(
    "hide"
  );


  setTimeout(
    () => {

      toast.remove();

    },
    300
  );

}


/* =========================================================
   SHOW TOAST
========================================================= */

function showToast(
  message,
  type = "success",
  duration = 3500
) {

  const allowedTypes = [
    "success",
    "error",
    "warning",
    "info"
  ];


  if (
    !allowedTypes.includes(
      type
    )
  ) {

    type =
      "success";

  }


  const container =
    getToastContainer();


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    `custom-toast ${type}`;


  /* ICON */

  const icon =
    document.createElement(
      "span"
    );


  icon.className =
    "custom-toast-icon";


  icon.innerHTML =
    toastIcons[type];


  /* MESSAGE */

  const messageElement =
    document.createElement(
      "div"
    );


  messageElement.className =
    "custom-toast-message";


  /*
    textContent digunakan supaya
    message tidak inject HTML.
  */

  messageElement.textContent =
    String(message ?? "");


  /* CLOSE */

  const closeButton =
    document.createElement(
      "button"
    );


  closeButton.type =
    "button";


  closeButton.className =
    "custom-toast-close";


  closeButton.setAttribute(
    "aria-label",
    "Close notification"
  );


  closeButton.innerHTML = `
    <svg
      viewBox="0 0 1024 1024"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"
      />
    </svg>
  `;


  closeButton.addEventListener(
    "click",
    () => {

      removeToast(
        toast
      );

    }
  );


  toast.appendChild(
    icon
  );


  toast.appendChild(
    messageElement
  );


  toast.appendChild(
    closeButton
  );


  container.appendChild(
    toast
  );


  /*
    Trigger enter animation.
  */

  requestAnimationFrame(
    () => {

      requestAnimationFrame(
        () => {

          toast.classList.add(
            "show"
          );

        }
      );

    }
  );


  /*
    AUTO CLOSE
  */

  if (
    duration > 0
  ) {

    setTimeout(
      () => {

        removeToast(
          toast
        );

      },
      duration
    );

  }


  return toast;

}


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.showToast =
  showToast;
})();
