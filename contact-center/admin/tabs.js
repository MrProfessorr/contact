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
  safe

} from "./admin.js";


requireAdmin();
setupLogout();


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

const saveSidebarBtn =
  document.getElementById(
    "saveSidebarBtn"
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

const saveTabBtn =
  document.getElementById(
    "saveTabBtn"
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

let tabIconUrl =
  "";
let footerTextImageUrl =
  "";

/* =========================================================
   HELPERS
========================================================= */

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

  if (sidebarIconUrl) {

    sidebarIconPreview.innerHTML =
      iconHtml(
        sidebarIconUrl,
        "",
        "tabs-preview-image"
      );

    return;

  }


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
    async () => {

      const file =
        sidebarIconFile.files?.[0];


      if (!file) {
        return;
      }


      try {

        sidebarIconUploadBtn.disabled =
          true;

        sidebarIconUploadBtn.textContent =
          "Uploading...";


        sidebarIconUrl =
          await uploadNavigationImage(
            file
          );


        updateSidebarPreview();

      }
      catch (error) {

        console.error(error);

        showMessage(
          "Sidebar icon upload failed.",
          true
        );

      }
      finally {

        sidebarIconUploadBtn.disabled =
          false;

        sidebarIconUploadBtn.textContent =
          "Upload Icon";

      }

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

      }

      updateSidebarPreview();

    }
  );


/* =========================================================
   SAVE SIDEBAR
========================================================= */

saveSidebarBtn
  .addEventListener(
    "click",
    async () => {

      try {

        saveSidebarBtn.disabled =
          true;


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


        showMessage(
          "Sidebar saved."
        );

      }
      catch (error) {

        console.error(error);

        showMessage(
          "Failed to save sidebar.",
          true
        );

      }
      finally {

        saveSidebarBtn.disabled =
          false;

      }

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
   SAVE TAB
========================================================= */

saveTabBtn
  .addEventListener(
    "click",
    async () => {

      const name =
        tabName.value.trim();

      const url =
        tabUrl.value.trim();


      if (!name) {

        showMessage(
          "Please enter tab name.",
          true
        );

        tabName.focus();

        return;

      }


      if (!url) {

        showMessage(
          "Please enter tab URL.",
          true
        );

        tabUrl.focus();

        return;

      }


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


      try {

        saveTabBtn.disabled =
          true;


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

          showMessage(
            "Tab updated."
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


          showMessage(
            "Tab added."
          );

        }


        resetTabForm();

      }
      catch (error) {

        console.error(error);

        showMessage(
          "Failed to save tab.",
          true
        );

      }
      finally {

        saveTabBtn.disabled =
          false;

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

                  <span
                    class="${
                      item.enabled !== false
                        ? "active-status"
                        : "closed-status"
                    } status"
                  >
                    ${
                      item.enabled !== false
                        ? "ACTIVE"
                        : "INACTIVE"
                    }
                  </span>

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


                <button
                  class="action-btn btn-dark"
                  type="button"
                  data-action="toggle"
                >
                  ${
                    item.enabled !== false
                      ? "Inactive"
                      : "Active"
                  }
                </button>


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

      const button =
        event.target.closest(
          "[data-action]"
        );


      if (!button) {
        return;
      }


      const item =
        button.closest(
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
        button.dataset.action
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

  },

  error => {

    console.error(
      "Sidebar settings error:",
      error
    );

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

  }
);
