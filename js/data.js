async function localDashboard() {
    let totalRevenue=0
    let totalSignups=0
    let totalConversion=0;

    const response = await fetch('data/data.json')
    const data = await response.json()
    console.log(data) 
    data.dailyStats.forEach(stat => {
        totalRevenue+=stat.revenue;
        totalSignups+=stat.signups
        totalConversion += stat.conversionRate
    }); 
    totalConversion/=data.dailyStats.length 
    console.log(totalConversion) 

    const revenueElement = document.getElementById('total-revenue')
    revenueElement.innerHTML = `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRevenue)}`

    const signupsElement = document.getElementById('total-signups')
    signupsElement.innerHTML=`${totalSignups.toLocaleString()}`

    const conversionRateElement = document.getElementById('conversion-rate')
    conversionRateElement.innerHTML = `${totalConversion.toFixed(1)} %`


    const revenueLabels = data.dailyStats.map(stat=>stat.date)
    const revenueData = data.dailyStats.map(stat=>stat.revenue);

    const productNames =  data.productBreakdown.map(product=> product.name)
    const productValues =  data.productBreakdown.map(product=> product.value)
    const productColors = data.productBreakdown.map(product=> product.color)

    const revenueCtx = document.getElementById('revenueChart').getContext('2d');

    new Chart(revenueCtx,{
        type:'line',
        data:{
            labels:revenueLabels,
            datasets : [{
                label:"Revenue",
                data:revenueData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill:true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    })


    const productCtx = document.getElementById('productChart').getContext('2d');

    new Chart(productCtx,{
        type:'doughnut',
        data: {
            labels: productNames,
            datasets:[{
                data:productValues,
                backgroundColor: productColors, 
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    })
}

localDashboard()