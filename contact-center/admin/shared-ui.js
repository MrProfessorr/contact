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


              const otherInput =
                dropdown
                  .querySelector(
                    ".shared-dropdown-input"
                  );


              otherInput
                ?.setAttribute(
                  "aria-expanded",
                  "false"
                );

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


      /* ARROW -> SEARCH */

      icon.innerHTML =
        searchIcon;


      /*
        Empty current label so this same
        input becomes the search field.
      */

      input.value =
        "";


      renderOptions(
        ""
      );


      requestAnimationFrame(
        () => {

          input.focus();

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


      /* SEARCH -> ARROW */

      icon.innerHTML =
        arrowIcon;


      /* RESTORE SELECTED LABEL */

      updateValue();

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
