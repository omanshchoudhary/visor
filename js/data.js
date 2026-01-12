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
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxTicksLimit: 8,
            maxRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            borderDash: [5, 5],
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
      cutout: "75%",
      plugins: {
        legend: {
          position: "right",
          labels: {
            usePointStyle: true,
            boxWidth: 8,
          },
        },
      },
    },
  });

  const tableBodyElement = document.getElementById("campaign-rows");
  data.topCampaigns.forEach((campaign) => {

    const statusClass =
      campaign.status === "Active" ? "status-active" : "status-ended";


    const rowHTML = `
        <tr>
            <td><span style="font-weight: 500;">${campaign.campaign}</span></td>
            <td>${campaign.source}</td>
            <td>${campaign.roi}</td>
            <td><span class="status-badge ${statusClass}">${campaign.status}</span></td>
        </tr>
    `;


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

async function loadSales() {
  const tableBody = document.getElementById('sales-rows');
  const chartCanvas = document.getElementById('salesChart');
  const result = await fetch('data/data.json')
  const data = await result.json();

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => downloadCSV(data));
  }
  const dates = data.dailyStats.map(d => d.date);
  const conversions = data.dailyStats.map(d => d.conversionRate);
  new Chart(chartCanvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Conversion Rate (%)',
        data: conversions,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 8, maxRotation: 0 } },
        y: { beginAtZero: true, grid: { borderDash: [5, 5] } }
      },
      plugins: { legend: { display: false } }
    }
  });

  data.dailyStats.forEach(stat => {
    const rowHTML = `
        <tr>
            <td style="color: #64748b;">${stat.date}</td>
            <td style="font-weight: 500;">
                ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stat.revenue)}
            </td>
            <td>${stat.signups.toLocaleString()}</td>
            <td>
                <span class="status-badge" style="background: ${stat.conversionRate > 3 ? '#dcfce7' : '#f1f5f9'}; color: ${stat.conversionRate > 3 ? '#166534' : '#64748b'};">
                    ${stat.conversionRate}%
                </span>
            </td>
        </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', rowHTML);
  });
}

loadSales()

function downloadCSV(data) {
  const headers = ['Date', 'Revenue', 'Sign-Ups', 'Conversion Rate']
  const csvRows = [];
  csvRows.push(headers.join(','));
  data.dailyStats.forEach(day => {
    const row = [
      day.date,
      day.revenue,
      day.signups,
      day.conversionRate + '%'
    ];
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'visor-sales-report.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

function initSettings() {
  const form = document.getElementById('settingsForm')
  if (!form) return;
  const savedName = localStorage.getItem('visor_name');
  const savedEmail = localStorage.getItem('visor_email');
  const savedBio = localStorage.getItem('visor_bio');

  if (savedName) document.getElementById('profileName').value = savedName;
  if (savedEmail) document.getElementById('profileEmail').value = savedEmail;
  if (savedBio) document.getElementById('profileBio').value = savedBio;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const bio = document.getElementById('profileBio').value;

    localStorage.setItem('visor_name', name);
    localStorage.setItem('visor_email', email);
    localStorage.setItem('visor_bio', bio);

    alert('Settings Saved Successfully!');
  });
}

initSettings();


function initGlobalSearch() {
  const searchInput = document.getElementById('searchInput')

  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
      const term = searchInput.value.toLowerCase().trim();
      if (term === 'users' || term === 'go users') window.location.href = 'users.html';
      if (term === 'sales' || term === 'go sales') window.location.href = 'sales.html';
      if (term === 'dashboard' || term === 'home') window.location.href = 'index.html';
      if (term === 'settings' || term === 'profile') window.location.href = 'settings.html';
    }
  })

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const path = window.location.pathname;

    // 1. Dashboard Logic (Filter Campaigns)
    if (path.includes('index.html') || path === '/') {
      const rows = document.querySelectorAll('#campaign-rows tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    }

    // 2. Sales Logic (Filter Transactions)
    if (path.includes('sales.html')) {
      const rows = document.querySelectorAll('#sales-rows tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    }
  });
}

initGlobalSearch();


