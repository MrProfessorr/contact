import {

  db,
  ref,
  push,
  set,
  update,
  remove,
  onValue,

  requireAdmin,
  setupLogout,
  safe,

  showAdminLoading,
  hideAdminLoading

} from "./admin.js";


requireAdmin();
setupLogout();

// ==========================================
// PAGE LOADING
// ==========================================

showAdminLoading();

const initialLoadDone = {
  footerStyle: false,
  sidebar: false,
  tabs: false
};

function finishInitialLoad(key) {

  if (initialLoadDone[key]) {
    return;
  }

  initialLoadDone[key] = true;

  if (
    Object.values(initialLoadDone)
      .every(Boolean)
  ) {

    hideAdminLoading();

  }

}
if (
  typeof initSharedUI ===
  "function"
) {

  initSharedUI();

}
else if (
  typeof initSharedDropdowns ===
  "function"
) {

  initSharedDropdowns();

}


/* =========================================================
   CLOUDINARY
========================================================= */

const CLOUDINARY_CLOUD =
  "dqctvbenv";

const CLOUDINARY_PRESET =
  "support_center";


async function uploadNavigationImage(
  file
) {

  if (!file) {
    return "";
  }


  const formData =
    new FormData();


  formData.append(
    "file",
    file
  );

  formData.append(
    "upload_preset",
    CLOUDINARY_PRESET
  );

  formData.append(
    "folder",
    "support-center/navigation"
  );


  const response =
    await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
      {
        method:
          "POST",

        body:
          formData
      }
    );


  if (!response.ok) {

    throw new Error(
      "Icon upload failed."
    );

  }


  const data =
    await response.json();


  return (
    data.secure_url ||
    ""
  );

}


/* =========================================================
   DOM
========================================================= */

const sidebarEnabled =
  document.getElementById(
    "sidebarEnabled"
  );

const sidebarIconFile =
  document.getElementById(
    "sidebarIconFile"
  );

const sidebarIconUploadBtn =
  document.getElementById(
    "sidebarIconUploadBtn"
  );

const sidebarIconEmoji =
  document.getElementById(
    "sidebarIconEmoji"
  );

const sidebarIconPreview =
  document.getElementById(
    "sidebarIconPreview"
  );

const sidebarIconPending =
  document.getElementById(
    "sidebarIconPending"
  );

const sidebarIconPendingImage =
  document.getElementById(
    "sidebarIconPendingImage"
  );

const sidebarIconPendingRemove =
  document.getElementById(
    "sidebarIconPendingRemove"
  );

/*
  FOOTER NAVIGATION BACKGROUND
*/

const footerNavBackgroundFile =
  document.getElementById(
    "footerNavBackgroundFile"
  );


const footerNavBackgroundUploadBtn =
  document.getElementById(
    "footerNavBackgroundUploadBtn"
  );

const footerNavBackgroundPreview =
  document.getElementById(
    "footerNavBackgroundPreview"
  );
const footerBackgroundPending =
  document.getElementById(
    "footerBackgroundPending"
  );

const footerBackgroundPendingImage =
  document.getElementById(
    "footerBackgroundPendingImage"
  );

const footerBackgroundPendingRemove =
  document.getElementById(
    "footerBackgroundPendingRemove"
  );
const editingTabId =
  document.getElementById(
    "editingTabId"
  );

const tabFormTitle =
  document.getElementById(
    "tabFormTitle"
  );

const tabName =
  document.getElementById(
    "tabName"
  );

const tabUrl =
  document.getElementById(
    "tabUrl"
  );

const tabIconFile =
  document.getElementById(
    "tabIconFile"
  );

const tabIconUploadBtn =
  document.getElementById(
    "tabIconUploadBtn"
  );

const tabIconEmoji =
  document.getElementById(
    "tabIconEmoji"
  );

const tabIconPreview =
  document.getElementById(
    "tabIconPreview"
  );
const footerTextImageFile =
  document.getElementById(
    "footerTextImageFile"
  );

const footerTextImageUploadBtn =
  document.getElementById(
    "footerTextImageUploadBtn"
  );

const footerTextImageRemoveBtn =
  document.getElementById(
    "footerTextImageRemoveBtn"
  );

const footerTextImagePreview =
  document.getElementById(
    "footerTextImagePreview"
  );
const tabSort =
  document.getElementById(
    "tabSort"
  );

const tabEnabled =
  document.getElementById(
    "tabEnabled"
  );

const tabSidebar =
  document.getElementById(
    "tabSidebar"
  );

const tabFooter =
  document.getElementById(
    "tabFooter"
  );
const saveAllSettingsBtn =
  document.getElementById(
    "saveAllSettingsBtn"
  );
const cancelEditTabBtn =
  document.getElementById(
    "cancelEditTabBtn"
  );

const tabsList =
  document.getElementById(
    "tabsList"
  );

const tabsSaveMessage =
  document.getElementById(
    "tabsSaveMessage"
  );


/* =========================================================
   STATE
========================================================= */

let tabs = [];

let sidebarIconUrl =
  "";

let pendingSidebarIconFile =
  null;

let pendingSidebarIconPreviewUrl =
  "";


let tabIconUrl =
  "";

let footerTextImageUrl =
  "";


let footerNavBackgroundUrl =
  "";

let pendingFooterBackgroundFile =
  null;

let pendingFooterBackgroundPreviewUrl =
  "";
/* =========================================================
   HELPERS
========================================================= */
function updateFooterNavBackgroundPreview() {

  if (!footerNavBackgroundPreview) {
    return;
  }


  /* ADA IMAGE */

  if (footerNavBackgroundUrl) {

    footerNavBackgroundPreview.innerHTML = `
      <img
        class="tabs-preview-image"
        src="${safe(footerNavBackgroundUrl)}"
        alt=""
      >
    `;

    return;
  }


  /* TIADA IMAGE */

  footerNavBackgroundPreview.textContent =
    "🖼️";

}

function showMessage(
  message,
  isError = false
) {

  tabsSaveMessage.textContent =
    message;

  tabsSaveMessage.style.color =
    isError
      ? "#ff7b88"
      : "#41e595";

}


function iconHtml(
  iconUrl,
  emoji,
  className = ""
) {

  if (iconUrl) {

    return `
      <img
        class="${className}"
        src="${safe(iconUrl)}"
        alt=""
      >
    `;

  }


  return `
    <span class="${className}">
      ${safe(
        emoji || "🔗"
      )}
    </span>
  `;

}


function updateSidebarPreview() {

  if (!sidebarIconPreview) {
    return;
  }


  /* ADA IMAGE */

  if (sidebarIconUrl) {

    sidebarIconPreview.innerHTML =
      iconHtml(
        sidebarIconUrl,
        "",
        "tabs-preview-image"
      );

    return;
  }


  /* TIADA IMAGE = GUNA EMOJI */

  sidebarIconPreview.textContent =
    sidebarIconEmoji.value.trim() ||
    "☰";

}
function updateTabPreview() {

  if (tabIconUrl) {

    tabIconPreview.innerHTML =
      iconHtml(
        tabIconUrl,
        "",
        "tabs-preview-image"
      );

    return;

  }


  tabIconPreview.textContent =
    tabIconEmoji.value.trim() ||
    "🔗";

}

function updateFooterTextImagePreview() {

  if (!footerTextImagePreview) {
    return;
  }

  if (footerTextImageUrl) {

    footerTextImagePreview.innerHTML = `
      <img
        src="${safe(footerTextImageUrl)}"
        alt=""
      >
    `;

    return;
  }

  footerTextImagePreview.textContent =
    "No Image";

}
/* =========================================================
   SIDEBAR ICON
========================================================= */

sidebarIconUploadBtn
  .addEventListener(
    "click",
    () => {

      sidebarIconFile.click();

    }
  );


sidebarIconFile
  .addEventListener(
    "change",
    () => {

      const file =
        sidebarIconFile.files?.[0];

      if (!file) {
        return;
      }


      /* REMOVE PENDING PREVIEW LAMA */

      if (
        pendingSidebarIconPreviewUrl
      ) {

        URL.revokeObjectURL(
          pendingSidebarIconPreviewUrl
        );

      }


      /* SIMPAN FILE SEBAGAI PENDING */

      pendingSidebarIconFile =
        file;

      pendingSidebarIconPreviewUrl =
        URL.createObjectURL(
          file
        );


      /* TAMPIL PENDING PREVIEW */

      sidebarIconPendingImage.src =
        pendingSidebarIconPreviewUrl;

      sidebarIconPending
        .classList
        .remove(
          "hidden"
        );

    }
  );

sidebarIconEmoji
  .addEventListener(
    "input",
    () => {

      if (
        sidebarIconEmoji
          .value
          .trim()
      ) {

        sidebarIconUrl =
          "";

        sidebarIconFile.value =
          "";

      }

      updateSidebarPreview();

    }
  );

/* =========================================================
   FOOTER NAVIGATION BACKGROUND
========================================================= */

footerNavBackgroundUploadBtn
  ?.addEventListener(
    "click",
    () => {

      footerNavBackgroundFile.click();

    }
  );


footerNavBackgroundFile
  ?.addEventListener(
    "change",
    () => {

      const file =
        footerNavBackgroundFile
          .files?.[0];

      if (!file) {
        return;
      }


      if (
        pendingFooterBackgroundPreviewUrl
      ) {

        URL.revokeObjectURL(
          pendingFooterBackgroundPreviewUrl
        );

      }


      pendingFooterBackgroundFile =
        file;

      pendingFooterBackgroundPreviewUrl =
        URL.createObjectURL(
          file
        );


      footerBackgroundPendingImage.src =
        pendingFooterBackgroundPreviewUrl;

      footerBackgroundPending
        .classList
        .remove(
          "hidden"
        );

    }
  );
sidebarIconPendingRemove
  ?.addEventListener(
    "click",
    () => {

      pendingSidebarIconFile =
        null;

      sidebarIconFile.value =
        "";


      if (
        pendingSidebarIconPreviewUrl
      ) {

        URL.revokeObjectURL(
          pendingSidebarIconPreviewUrl
        );

      }


      pendingSidebarIconPreviewUrl =
        "";

      sidebarIconPendingImage
        .removeAttribute(
          "src"
        );

      sidebarIconPending
        .classList
        .add(
          "hidden"
        );

    }
  );
footerBackgroundPendingRemove
  ?.addEventListener(
    "click",
    () => {

      pendingFooterBackgroundFile =
        null;

      footerNavBackgroundFile.value =
        "";


      if (
        pendingFooterBackgroundPreviewUrl
      ) {

        URL.revokeObjectURL(
          pendingFooterBackgroundPreviewUrl
        );

      }


      pendingFooterBackgroundPreviewUrl =
        "";

      footerBackgroundPendingImage
        .removeAttribute(
          "src"
        );

      footerBackgroundPending
        .classList
        .add(
          "hidden"
        );

    }
  );
/* =========================================================
   TAB ICON
========================================================= */

tabIconUploadBtn
  .addEventListener(
    "click",
    () => {

      tabIconFile.click();

    }
  );


tabIconFile
  .addEventListener(
    "change",
    async () => {

      const file =
        tabIconFile.files?.[0];


      if (!file) {
        return;
      }


      try {

        tabIconUploadBtn.disabled =
          true;

        tabIconUploadBtn.textContent =
          "Uploading...";


        tabIconUrl =
          await uploadNavigationImage(
            file
          );


        updateTabPreview();

      }
      catch (error) {

        console.error(error);

        showMessage(
          "Tab icon upload failed.",
          true
        );

      }
      finally {

        tabIconUploadBtn.disabled =
          false;

        tabIconUploadBtn.textContent =
          "Upload Icon";

      }

    }
  );


tabIconEmoji
  .addEventListener(
    "input",
    () => {

      if (
        tabIconEmoji
          .value
          .trim()
      ) {

        tabIconUrl =
          "";

      }


      updateTabPreview();

    }
  );

/* =========================================================
   FOOTER TEXT IMAGE
========================================================= */

footerTextImageUploadBtn
  .addEventListener(
    "click",
    () => {

      footerTextImageFile.click();

    }
  );


footerTextImageFile
  .addEventListener(
    "change",
    async () => {

      const file =
        footerTextImageFile.files?.[0];

      if (!file) {
        return;
      }

      try {

        footerTextImageUploadBtn.disabled =
          true;

        footerTextImageUploadBtn.textContent =
          "Uploading...";

        footerTextImageUrl =
          await uploadNavigationImage(
            file
          );

        updateFooterTextImagePreview();

      }
      catch (error) {

        console.error(error);

        showMessage(
          "Footer text image upload failed.",
          true
        );

      }
      finally {

        footerTextImageUploadBtn.disabled =
          false;

        footerTextImageUploadBtn.textContent =
          "Upload Text Image";

      }

    }
  );


footerTextImageRemoveBtn
  .addEventListener(
    "click",
    () => {

      footerTextImageUrl =
        "";

      footerTextImageFile.value =
        "";

      updateFooterTextImagePreview();

    }
  );
/* =========================================================
   RESET FORM
========================================================= */

function resetTabForm() {

  editingTabId.value =
    "";

  tabFormTitle.textContent =
    "Add Tab";

  tabName.value =
    "";

  tabUrl.value =
    "";

  tabIconEmoji.value =
    "";

  tabIconFile.value =
    "";

  tabIconUrl =
    "";
footerTextImageUrl =
  "";

footerTextImageFile.value =
  "";

updateFooterTextImagePreview();
  tabSort.value =
    tabs.length + 1;

  tabEnabled.checked =
    true;

  tabSidebar.checked =
    true;

  tabFooter.checked =
    true;

  cancelEditTabBtn
    .classList
    .add(
      "hidden"
    );

  updateTabPreview();

}
/* =========================================================
   SAVE ALL SETTINGS
========================================================= */

saveAllSettingsBtn
  .addEventListener(
    "click",
    async () => {

      const name =
        tabName.value.trim();

      const url =
        tabUrl.value.trim();

      const hasTabData =
        Boolean(
          name ||
          url ||
          editingTabId.value
        );


      /*
        Kalau user mula isi tab,
        Name + URL mesti lengkap.
      */

      if (
        hasTabData &&
        !name
      ) {

        showMessage(
          "Please enter tab name.",
          true
        );

        tabName.focus();

        return;
      }


      if (
        hasTabData &&
        !url
      ) {

        showMessage(
          "Please enter tab URL.",
          true
        );

        tabUrl.focus();

        return;
      }


      try {

        saveAllSettingsBtn.disabled =
          true;

        saveAllSettingsBtn.textContent =
          "Saving...";

/* =============================================
   UPLOAD PENDING IMAGES
============================================= */

if (pendingSidebarIconFile) {

  sidebarIconUrl =
    await uploadNavigationImage(
      pendingSidebarIconFile
    );

}


if (pendingFooterBackgroundFile) {

  footerNavBackgroundUrl =
    await uploadNavigationImage(
      pendingFooterBackgroundFile
    );

}
        /* =============================================
           1. SAVE SIDEBAR
        ============================================= */

        await set(
          ref(
            db,
            "navigation_settings/sidebar"
          ),
          {
            enabled:
              sidebarEnabled.checked,

            iconUrl:
              sidebarIconUrl,

            iconEmoji:
              sidebarIconEmoji
                .value
                .trim() ||
              "☰"
          }
        );


        /* =============================================
           2. SAVE FOOTER BACKGROUND
        ============================================= */

await set(
  ref(
    db,
    "navigation_settings/footerStyle"
  ),
  {
    backgroundImageUrl:
      footerNavBackgroundUrl,

    updatedAt:
      Date.now()
  }
);


        /* =============================================
           3. SAVE TAB
           HANYA JIKA FORM TAB DIGUNAKAN
        ============================================= */

        if (hasTabData) {

          const data = {

            name,

            url,

            iconUrl:
              tabIconUrl,

            iconEmoji:
              tabIconEmoji
                .value
                .trim(),

            footerTextImageUrl:
              footerTextImageUrl,

            enabled:
              tabEnabled.checked,

            sidebar:
              tabSidebar.checked,

            footer:
              tabFooter.checked,

            sort:
              Math.max(
                1,
                Number(
                  tabSort.value
                ) || 1
              ),

            updatedAt:
              Date.now()

          };


          const id =
            editingTabId.value;


          if (id) {

            await update(
              ref(
                db,
                `navigation_settings/tabs/${id}`
              ),
              data
            );

          }
          else {

            const newRef =
              push(
                ref(
                  db,
                  "navigation_settings/tabs"
                )
              );


            await set(
              newRef,
              {
                ...data,

                createdAt:
                  Date.now()
              }
            );

          }


          resetTabForm();

        }

/* =============================================
   APPLY SAVED IMAGE PREVIEWS
============================================= */

updateSidebarPreview();
updateFooterNavBackgroundPreview();


/* CLEAR SIDEBAR PENDING */

pendingSidebarIconFile =
  null;

sidebarIconFile.value =
  "";

if (
  pendingSidebarIconPreviewUrl
) {

  URL.revokeObjectURL(
    pendingSidebarIconPreviewUrl
  );

}

pendingSidebarIconPreviewUrl =
  "";

sidebarIconPendingImage
  .removeAttribute(
    "src"
  );

sidebarIconPending
  .classList
  .add(
    "hidden"
  );


/* CLEAR FOOTER BACKGROUND PENDING */

pendingFooterBackgroundFile =
  null;

footerNavBackgroundFile.value =
  "";

if (
  pendingFooterBackgroundPreviewUrl
) {

  URL.revokeObjectURL(
    pendingFooterBackgroundPreviewUrl
  );

}

pendingFooterBackgroundPreviewUrl =
  "";

footerBackgroundPendingImage
  .removeAttribute(
    "src"
  );

footerBackgroundPending
  .classList
  .add(
    "hidden"
  );
        showMessage(
          hasTabData
            ? "All settings and tab saved."
            : "All settings saved."
        );

      }
      catch (error) {

        console.error(
          "Save all settings error:",
          error
        );

        showMessage(
          "Failed to save settings.",
          true
        );

      }
      finally {

        saveAllSettingsBtn.disabled =
          false;

        saveAllSettingsBtn.textContent =
          "Save All Settings";

      }

    }
  );
/* =========================================================
   EDIT TAB
========================================================= */

function editTab(id) {

  const item =
    tabs.find(
      tab =>
        tab.id === id
    );


  if (!item) {
    return;
  }


  editingTabId.value =
    item.id;

  tabFormTitle.textContent =
    "Edit Tab";

  tabName.value =
    item.name || "";

  tabUrl.value =
    item.url || "";

  tabIconEmoji.value =
    item.iconEmoji || "";

  tabIconUrl =
    item.iconUrl || "";
  footerTextImageUrl =
  item.footerTextImageUrl || "";

updateFooterTextImagePreview();

  tabSort.value =
    Number(
      item.sort
    ) || 1;

  tabEnabled.checked =
    item.enabled !== false;

  tabSidebar.checked =
    item.sidebar === true;

  tabFooter.checked =
    item.footer === true;


  cancelEditTabBtn
    .classList
    .remove(
      "hidden"
    );


  updateTabPreview();


  window.scrollTo({
    top:
      0,

    behavior:
      "smooth"
  });

}


/* =========================================================
   DELETE TAB
========================================================= */

async function deleteTab(id) {

  const item =
    tabs.find(
      tab =>
        tab.id === id
    );


  if (!item) {
    return;
  }


  const confirmed =
    confirm(
      `Delete "${item.name}"?`
    );


  if (!confirmed) {
    return;
  }


  try {

    await remove(
      ref(
        db,
        `navigation_settings/tabs/${id}`
      )
    );


    if (
      editingTabId.value === id
    ) {

      resetTabForm();

    }


    showMessage(
      "Tab deleted."
    );

  }
  catch (error) {

    console.error(error);

    showMessage(
      "Failed to delete tab.",
      true
    );

  }

}


/* =========================================================
   QUICK ACTIVE / INACTIVE
========================================================= */

async function toggleTab(
  id,
  enabled
) {

  try {

    await update(
      ref(
        db,
        `navigation_settings/tabs/${id}`
      ),
      {
        enabled:
          !enabled,

        updatedAt:
          Date.now()
      }
    );

  }
  catch (error) {

    console.error(error);

    showMessage(
      "Failed to update tab status.",
      true
    );

  }

}


/* =========================================================
   RENDER LIST
========================================================= */

function renderTabs() {

  if (!tabs.length) {

    tabsList.innerHTML =
      `
        <div class="help-text">
          No navigation tabs yet.
        </div>
      `;

    return;

  }


  tabsList.innerHTML =
    tabs
      .map(
        item => {

          const locations = [];

          if (item.sidebar) {
            locations.push(
              "Sidebar"
            );
          }

          if (item.footer) {
            locations.push(
              "Footer"
            );
          }


          return `
            <article
              class="tabs-admin-item"
              data-id="${safe(item.id)}"
            >

              <div class="tabs-admin-item-main">

                <div class="tabs-admin-item-icon">

                  ${
                    iconHtml(
                      item.iconUrl,
                      item.iconEmoji
                    )
                  }

                </div>


                <div class="tabs-admin-item-info">

                  <strong>
                    ${safe(item.name)}
                  </strong>

                  <small>
                    ${
                      safe(
                        locations.join(
                          " • "
                        ) ||
                        "Hidden"
                      )
                    }
                    • Sort
                    ${safe(item.sort || 1)}
                  </small>

<a
  class="tabs-admin-item-url"
  href="${safe(item.url || "#")}"
  target="_blank"
  rel="noopener noreferrer"
  title="${safe(item.url || "")}"
>
  ${safe(item.url || "No URL")}
</a>

                </div>

              </div>


              <div class="tabs-admin-item-actions">

                <button
                  class="action-btn action-edit"
                  type="button"
                  data-action="edit"
                >
                  Edit
                </button>


<label
  class="tabs-text-switch"
  data-action="toggle"
>

  <input
    type="checkbox"
    ${
      item.enabled !== false
        ? "checked"
        : ""
    }
  >

  <span class="tabs-text-slider">

    <span class="tabs-text-label">
      ${
        item.enabled !== false
          ? "Active"
          : "Inactive"
      }
    </span>

  </span>

</label>


                <button
                  class="action-btn action-delete"
                  type="button"
                  data-action="delete"
                >
                  Delete
                </button>

              </div>

            </article>
          `;

        }
      )
      .join("");

}


/* =========================================================
   LIST ACTIONS
========================================================= */

tabsList
  .addEventListener(
    "click",
    event => {

const actionElement =
  event.target.closest(
    "[data-action]"
  );

if (!actionElement) {
  return;
}


const item =
  actionElement.closest(
    "[data-id]"
  );


      if (!item) {
        return;
      }


      const id =
        item.dataset.id;

      const tab =
        tabs.find(
          current =>
            current.id === id
        );


      if (!tab) {
        return;
      }


      switch (
        actionElement.dataset.action
      ) {

        case "edit":

          editTab(id);

          break;


        case "toggle":

          toggleTab(
            id,
            tab.enabled !== false
          );

          break;


        case "delete":

          deleteTab(id);

          break;

      }

    }
  );


cancelEditTabBtn
  .addEventListener(
    "click",
    resetTabForm
  );

/* =========================================================
   FIREBASE FOOTER NAVIGATION STYLE
========================================================= */

onValue(
  ref(
    db,
    "navigation_settings/footerStyle"
  ),

  snapshot => {

    const data =
      snapshot.val() || {};

    footerNavBackgroundUrl =
      data.backgroundImageUrl ||
      "";

    updateFooterNavBackgroundPreview();

    finishInitialLoad(
      "footerStyle"
    );

  },

  error => {

    console.error(
      "Footer navigation style error:",
      error
    );

    finishInitialLoad(
      "footerStyle"
    );

  }
);
/* =========================================================
   FIREBASE SIDEBAR
========================================================= */

onValue(
  ref(
    db,
    "navigation_settings/sidebar"
  ),

  snapshot => {

    const data =
      snapshot.val() || {};

    sidebarEnabled.checked =
      data.enabled !== false;

    sidebarIconUrl =
      data.iconUrl || "";

    sidebarIconEmoji.value =
      data.iconEmoji || "";

    updateSidebarPreview();

    // SIDEBAR SELESAI LOAD
    finishInitialLoad("sidebar");

  },

  error => {

    console.error(
      "Sidebar settings error:",
      error
    );

    // ERROR PUN DIKIRA SELESAI
finishInitialLoad("sidebar");
  }
);


/* =========================================================
   FIREBASE TABS
========================================================= */

onValue(
  ref(
    db,
    "navigation_settings/tabs"
  ),

  snapshot => {

    const data =
      snapshot.val() || {};


    tabs =
      Object.entries(
        data
      )
        .map(
          ([id, item]) => ({
            id,
            ...item
          })
        )
        .sort(
          (a, b) =>
            Number(a.sort || 999) -
            Number(b.sort || 999)
        );


    renderTabs();


    if (
      !editingTabId.value
    ) {

      tabSort.value =
        tabs.length + 1;

    }
finishInitialLoad("tabs");
  },

  error => {

    console.error(
      "Navigation tabs error:",
      error
    );


    tabsList.innerHTML =
      `
        <div class="help-text">
          Failed to load tabs.
        </div>
      `;
finishInitialLoad("tabs");
  }
);
