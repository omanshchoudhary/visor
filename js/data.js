async function fetchData() {
    const response = await fetch('data/data.json')
    const data = await response.json()
    console.log(data)    
}

fetchData()