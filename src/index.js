let locations = JSON.parse(localStorage.getItem("locations")) || [];

// Function to render saved locations in the table
function renderLocations() {
  const tableBody = document
    .getElementById("locations-table")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // Clear previous entries

  locations.forEach((location, index) => {
    const row = tableBody.insertRow();
    const sourceCell = row.insertCell(0);
    const destCell = row.insertCell(1);
    const actionCell = row.insertCell(2);

    sourceCell.innerText = location.source;
    destCell.innerText = location.destination;
    actionCell.innerHTML = `<button onclick="removeLocation(${index})">Remove</button>`;
  });
}

// Function to remove a location from the list
function removeLocation(index) {
  locations.splice(index, 1);
  localStorage.setItem("locations", JSON.stringify(locations));
  renderLocations();
}

// Select source and destination folder
document.getElementById("browse-source").addEventListener("click", async () => {
  const sourcePath = await window.electronAPI.selectFolder();
  document.getElementById("source-path").value = sourcePath;
});

document
  .getElementById("browse-destination")
  .addEventListener("click", async () => {
    const destPath = await window.electronAPI.selectFolder();
    document.getElementById("dest-path").value = destPath;
  });

// Add location to local storage and update table
document.getElementById("add-location").addEventListener("click", () => {
  const source = document.getElementById("source-path").value;
  const destination = document.getElementById("dest-path").value;

  if (source && destination) {
    locations.push({ source, destination });
    localStorage.setItem("locations", JSON.stringify(locations));
    renderLocations();
  }
});

// Start backup process for all locations
document.getElementById("start-backup").addEventListener("click", () => {
  const progressTableBody = document
    .getElementById("progress-table")
    .getElementsByTagName("tbody")[0];
  progressTableBody.innerHTML = ""; // Clear previous progress entries

  // Start backup for each location
  locations.forEach((location, index) => {
    // Insert a new row for progress tracking
    const progressRow = progressTableBody.insertRow();
    const sourceCell = progressRow.insertCell(0);
    const destCell = progressRow.insertCell(1);
    const progressCell = progressRow.insertCell(2);

    sourceCell.innerText = location.source;
    destCell.innerText = location.destination;
    progressCell.innerText = "Starting...";

    // Start the backup operation and update the progress cell
    window.electronAPI.startBackup(location.source, location.destination);

    // Listen for progress updates for each location
    window.electronAPI.onProgress((progress) => {
      progressCell.innerText = `${progress}%`;
    });

    // Handle backup completion
    window.electronAPI.onBackupComplete(() => {
      progressCell.innerText = "Completed";
    });

    // Handle errors during backup
    window.electronAPI.onBackupError((error) => {
      progressCell.innerText = `Error: ${error}`;
    });
  });
});

renderLocations();
