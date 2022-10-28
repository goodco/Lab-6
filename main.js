import AreaChart from './area-chart.js'
import StackedAreaChart from './stacked-area-chart.js'

d3.csv("unemployment.csv", d3.autoType).then(data =>{
    // Get total employment count per date
    data.map(d => {
        d.total = d3.sum(data.columns.filter(d => d !== 'date'), c => d[c])
    })
    const stackedAreaChart = StackedAreaChart(".area-chart")
    stackedAreaChart.update(data)

    const areaChart = AreaChart(".area-chart")
    areaChart.update(data)

    // Brushing based on area chart
    areaChart.on("brushed", (range) =>{

        stackedAreaChart.filterByDate(range); // coordinating with stackedAreaChart
    })

    // Zooming based on stacked chart
    stackedAreaChart.on("zoomed", timeRange=>{
        areaChart.setBrush(timeRange);
    })
})