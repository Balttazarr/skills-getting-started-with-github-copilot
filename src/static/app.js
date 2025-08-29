document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const res = await fetch("/activities");
      return await res.json();
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      return {};
    }
  }

  function renderActivities(activities) {
    activitiesList.innerHTML = "";

    Object.entries(activities).forEach(([name, info]) => {
      const card = document.createElement("div");
      card.className = "activity-card";

      card.innerHTML = `
        <h4>${name}</h4>
        <p>${info.description}</p>
        <p><strong>Schedule:</strong> ${info.schedule}</p>
        <p><strong>Availability:</strong> ${info.max_participants - info.participants.length} spots left</p>
        <div class="participants-section">
          <h5>Participants:</h5>
          ${
            info.participants.length > 0
              ? `<ul class="participants-list">${info.participants
                  .map((email) => `<li>${email}</li>`)
                  .join("")}</ul>`
              : `<span class="info">No participants yet.</span>`
          }
        </div>
      `;

      activitiesList.appendChild(card);
    });
  }

  function renderActivityOptions(activities) {
    activitySelect.innerHTML = `<option value="">-- Select an activity --</option>`;
    Object.keys(activities).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      activitySelect.appendChild(option);
    });
  }

  async function refreshActivities() {
    const activities = await fetchActivities();
    renderActivities(activities);
    renderActivityOptions(activities);
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const activity = document.getElementById("activity").value;
    messageDiv.className = "message hidden";
    messageDiv.textContent = "";

    if (!email || !activity) return;

    try {
      const res = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(
          email
        )}`,
        {
          method: "POST",
        }
      );
      const data = await res.json();
      if (res.ok) {
        messageDiv.className = "message success";
        messageDiv.textContent = data.message;
        await refreshActivities();
      } else {
        messageDiv.className = "message error";
        messageDiv.textContent = data.detail || "Error signing up.";
      }
    } catch {
      messageDiv.className = "message error";
      messageDiv.textContent = "Network error.";
    }
    messageDiv.classList.remove("hidden");
  });

  // Initialize app
  refreshActivities();
});
