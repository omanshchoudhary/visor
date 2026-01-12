const users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", lastActive: "2025-10-24" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Inactive", lastActive: "2025-09-12" },
  { id: 3, name: "Charlie Davis", email: "charlie@tech.co", role: "Viewer", status: "Active", lastActive: "2025-11-01" },
  { id: 4, name: "Diana Prince", email: "diana@wonder.net", role: "Admin", status: "Active", lastActive: "2025-12-03" },
  { id: 5, name: "Evan Wright", email: "evan@write.io", role: "Editor", status: "Active", lastActive: "2025-11-15" },
  { id: 6, name: "Fiona Green", email: "fiona@nature.org", role: "Viewer", status: "Inactive", lastActive: "2025-08-20" }
];

async function localDashboard() {
  let totalRevenue = 0;
  let totalSignups = 0;
  let totalConversion = 0;

  const response = await fetch("data/data.json");
  const data = await response.json();

  data.dailyStats.forEach((stat) => {
    totalRevenue += stat.revenue;
    totalSignups += stat.signups;
    totalConversion += stat.conversionRate;
  });
  totalConversion /= data.dailyStats.length;

  const revenueElement = document.getElementById("total-revenue");
  revenueElement.innerHTML = `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalRevenue)}`;

  const signupsElement = document.getElementById("total-signups");
  signupsElement.innerHTML = `${totalSignups.toLocaleString()}`;

  const conversionRateElement = document.getElementById("conversion-rate");
  conversionRateElement.innerHTML = `${totalConversion.toFixed(1)} %`;

  const revenueLabels = data.dailyStats.map((stat) => stat.date);
  const revenueData = data.dailyStats.map((stat) => stat.revenue);

  const productNames = data.productBreakdown.map((product) => product.name);
  const productValues = data.productBreakdown.map((product) => product.value);
  const productColors = data.productBreakdown.map((product) => product.color);

  const revenueCtx = document.getElementById("revenueChart").getContext("2d");

  new Chart(revenueCtx, {
    type: "line",
    data: {
      labels: revenueLabels,
      datasets: [
        {
          label: "Revenue",
          data: revenueData,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hides the box that says "Revenue" (we already know it's revenue)
        },
      },
      scales: {
        x: {
          grid: {
            display: false, // Removes vertical grid lines for a cleaner look
          },
          ticks: {
            maxTicksLimit: 8, // Only show ~8 dates maximum, not all 90
            maxRotation: 0, // Keep dates flat, don't rotate them
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [5, 5], // Makes horizontal lines dashed (looks modern)
          },
        },
      },
    },
  });

  const productCtx = document.getElementById("productChart").getContext("2d");

  new Chart(productCtx, {
    type: "doughnut",
    data: {
      labels: productNames,
      datasets: [
        {
          data: productValues,
          backgroundColor: productColors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "75%", // Makes the doughnut ring thinner (more whitespace in middle)
      plugins: {
        legend: {
          position: "right", // Moves labels to the side
          labels: {
            usePointStyle: true, // Uses circles instead of rectangles for the legend icons
            boxWidth: 8,
          },
        },
      },
    },
  });

  const tableBodyElement = document.getElementById("campaign-rows");
  data.topCampaigns.forEach((campaign) => {
    // Determine color based on status text
    const statusClass =
      campaign.status === "Active" ? "status-active" : "status-ended";

    // Create the HTML row
    const rowHTML = `
        <tr>
            <td><span style="font-weight: 500;">${campaign.campaign}</span></td>
            <td>${campaign.source}</td>
            <td>${campaign.roi}</td>
            <td><span class="status-badge ${statusClass}">${campaign.status}</span></td>
        </tr>
    `;

    // Add to the table
    tableBodyElement.insertAdjacentHTML("beforeend", rowHTML);
  });
}
if (document.getElementById('revenueChart')) {
  localDashboard();
}


function renderUsers(usersToRender) {
  const tableBodyElement = document.getElementById('user-rows')
  if (!tableBodyElement) return;
  tableBodyElement.innerHTML = '';
  usersToRender.forEach(user => {
    const statusColor = user.status === 'Active' ? 'status-active' : 'status-ended'
    const rowHTML = `
      <tr>
          <td style="font-weight: 500;">${user.name}</td>
          <td style="color: #64748b;">${user.email}</td>
          <td>${user.role}</td>
          <td><span class="status-badge ${statusColor}">${user.status}</span></td>
          <td style="color: #64748b;">${user.lastActive}</td>
      </tr>
      `;
    tableBodyElement.insertAdjacentHTML('beforeend', rowHTML);
  })
}
if (document.getElementById('user-rows')) {
  renderUsers(users);
  const searchInputElement = document.getElementById('searchInput')
  const statusFilterElement = document.getElementById('statusFilter');

  if (searchInputElement && statusFilterElement) {

    function filterData() {
      const query = searchInput.value.toLowerCase();
      const status = statusFilter.value;

      const filtered = users.filter(user => {
        // Check matches
        const matchesSearch = user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
        const matchesStatus = status === 'All' || user.status === status;

        return matchesSearch && matchesStatus;
      });
      renderUsers(filtered);
    }
  }
  searchInput.addEventListener('input', filterData);
  statusFilter.addEventListener('change', filterData);
}
