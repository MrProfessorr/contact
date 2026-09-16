/* =========================================================
   SHARED UI
   Reusable for all admin pages
========================================================= */

(function () {

  "use strict";


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
     SHARED CUSTOM DROPDOWN
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
      select.dataset.sharedDropdown === "true"
    ) {
      return select._sharedDropdown || null;
    }


    const config = {
      placeholder:
        options.placeholder ||
        select.dataset.placeholder ||
        "Select option",

      searchable:
        options.searchable === true,

      searchPlaceholder:
        options.searchPlaceholder ||
        "Search...",

      emptyText:
        options.emptyText ||
        "No data"
    };


    /* WRAPPER */

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "shared-dropdown";


    /* TRIGGER */

    const trigger =
      document.createElement("button");

    trigger.type = "button";

    trigger.className =
      "shared-dropdown-trigger";

    trigger.setAttribute(
      "aria-haspopup",
      "listbox"
    );

    trigger.setAttribute(
      "aria-expanded",
      "false"
    );


    trigger.innerHTML = `
      <span
        class="shared-dropdown-value"
      ></span>

      <svg
        class="shared-dropdown-arrow"
        viewBox="0 0 12 12"
        aria-hidden="true"
      >
        <path
          d="M2.2 4.2 6 8l3.8-3.8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `;


    /* PANEL */

    const panel =
      document.createElement("div");

    panel.className =
      "shared-dropdown-panel";


    /* SEARCH */

    let searchInput = null;


    if (
      config.searchable
    ) {

      const searchWrap =
        document.createElement("div");

      searchWrap.className =
        "shared-dropdown-search-wrap";


      searchInput =
        document.createElement("input");

      searchInput.type = "text";

      searchInput.className =
        "shared-dropdown-search";

      searchInput.placeholder =
        config.searchPlaceholder;

      searchInput.autocomplete =
        "off";


      searchWrap.appendChild(
        searchInput
      );


      panel.appendChild(
        searchWrap
      );

    }


    /* OPTIONS AREA */

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


    /* INSERT */

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


    const valueElement =
      trigger.querySelector(
        ".shared-dropdown-value"
      );


    /* =====================================================
       UPDATE TRIGGER TEXT
    ===================================================== */

    function updateValue() {

      const selectedOption =
        select.options[
          select.selectedIndex
        ];


      const hasValue =
        selectedOption &&
        selectedOption.value !== "";


      valueElement.textContent =
        hasValue
          ? selectedOption.textContent
          : config.placeholder;


      valueElement.classList.toggle(
        "placeholder",
        !hasValue
      );

    }


    /* =====================================================
       RENDER OPTIONS
    ===================================================== */

    function renderOptions(
      search = ""
    ) {

      optionList.innerHTML = "";


      const keyword =
        String(search)
          .trim()
          .toLowerCase();


      let count = 0;


      Array.from(
        select.options
      ).forEach(
        option => {

          /*
            Empty option acts as placeholder.
            Do not show it inside dropdown.
          */

          if (
            option.value === ""
          ) {
            return;
          }


          const text =
            option.textContent || "";


          if (
            keyword &&
            !text
              .toLowerCase()
              .includes(keyword)
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


          item.setAttribute(
            "role",
            "option"
          );


          item.dataset.value =
            option.value;


          item.textContent =
            text;


          if (
            option.disabled
          ) {

            item.disabled = true;

          }


          if (
            option.value ===
            select.value
          ) {

            item.classList.add(
              "active"
            );

            item.setAttribute(
              "aria-selected",
              "true"
            );

          } else {

            item.setAttribute(
              "aria-selected",
              "false"
            );

          }


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


              /*
                IMPORTANT:
                Trigger native change event.
                Existing tab scripts can listen normally.
              */

              select.dispatchEvent(
                new Event(
                  "change",
                  {
                    bubbles:true
                  }
                )
              );


              updateValue();

              renderOptions();

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

      /*
        Close other shared dropdowns first
      */

      document
        .querySelectorAll(
          ".shared-dropdown.open"
        )
        .forEach(
          dropdown => {

            if (
              dropdown !== wrapper
            ) {

              dropdown
                .classList
                .remove("open");


              const otherTrigger =
                dropdown.querySelector(
                  ".shared-dropdown-trigger"
                );


              otherTrigger?.setAttribute(
                "aria-expanded",
                "false"
              );

            }

          }
        );


      wrapper.classList.add(
        "open"
      );


      trigger.setAttribute(
        "aria-expanded",
        "true"
      );


      renderOptions();


      if (
        searchInput
      ) {

        searchInput.value = "";


        requestAnimationFrame(
          () => {

            searchInput.focus();

          }
        );

      }

    }


    /* =====================================================
       CLOSE
    ===================================================== */

    function close() {

      wrapper.classList.remove(
        "open"
      );


      trigger.setAttribute(
        "aria-expanded",
        "false"
      );


      if (
        searchInput
      ) {

        searchInput.value = "";

      }

    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    function toggle() {

      if (
        wrapper.classList.contains(
          "open"
        )
      ) {

        close();

      } else {

        open();

      }

    }


    /* =====================================================
       TRIGGER CLICK
    ===================================================== */

    trigger.addEventListener(
      "click",
      event => {

        event.stopPropagation();

        toggle();

      }
    );


    /* =====================================================
       SEARCH
    ===================================================== */

    searchInput?.addEventListener(
      "input",
      () => {

        renderOptions(
          searchInput.value
        );

      }
    );


    searchInput?.addEventListener(
      "click",
      event => {

        event.stopPropagation();

      }
    );


    /* =====================================================
       NATIVE SELECT CHANGE
       Useful when tab script changes value itself
    ===================================================== */

    select.addEventListener(
      "change",
      () => {

        updateValue();

        renderOptions(
          searchInput?.value || ""
        );

      }
    );


    /* =====================================================
       DISABLED STATE
    ===================================================== */

    function updateDisabled() {

      const disabled =
        select.disabled;


      trigger.disabled =
        disabled;


      wrapper.classList.toggle(
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
       API
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
          String(value);


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
              searchable:
                select.dataset.searchable ===
                "true",

              placeholder:
                select.dataset.placeholder ||
                "Select option",

              searchPlaceholder:
                select.dataset.searchPlaceholder ||
                "Search..."
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
    () => {

      document
        .querySelectorAll(
          ".shared-dropdown.open"
        )
        .forEach(
          dropdown => {

            dropdown
              .classList
              .remove("open");


            dropdown
              .querySelector(
                ".shared-dropdown-trigger"
              )
              ?.setAttribute(
                "aria-expanded",
                "false"
              );

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

            dropdown
              .classList
              .remove("open");


            dropdown
              .querySelector(
                ".shared-dropdown-trigger"
              )
              ?.setAttribute(
                "aria-expanded",
                "false"
              );

          }
        );

    }
  );
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
})();
