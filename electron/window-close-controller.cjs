function createWindowCloseController(window, dialog) {
  let hasUnsavedChanges = false;
  let closeConfirmed = false;

  window.on("close", (event) => {
    if (!hasUnsavedChanges || closeConfirmed) {
      return;
    }

    event.preventDefault();
    const response = dialog.showMessageBoxSync(window, {
      type: "warning",
      buttons: ["Cancel", "Discard and close"],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
      title: "Unsaved changes",
      message: "There are unsaved annotation changes.",
      detail: "Close Easy Labeling without saving them?"
    });
    if (response === 1) {
      closeConfirmed = true;
      window.close();
    }
  });

  return {
    setHasUnsavedChanges(value) {
      hasUnsavedChanges = Boolean(value);
    }
  };
}

module.exports = { createWindowCloseController };
