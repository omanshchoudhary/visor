async function localDashboard() {
  let totalRevenue = 0;
  let totalSignups = 0;
  let totalConversion = 0;

  const response = await fetch("data/data.json");
  const data = await response.json();
  console.log(data);
  data.dailyStats.forEach((stat) => {
    totalRevenue += stat.revenue;
    totalSignups += stat.signups;
    totalConversion += stat.conversionRate;
  });
  totalConversion /= data.dailyStats.length;
  console.log(totalConversion);

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
}

localDashboard();
