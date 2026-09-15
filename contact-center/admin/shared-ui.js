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

})();
