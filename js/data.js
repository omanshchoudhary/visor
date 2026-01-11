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
}

localDashboard()