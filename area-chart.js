export default function AreaChart(container){

    // initialization
    const listeners = { brushed: null }
    const dispatch = d3.dispatch("brushed", "brushend")

    const margin = {top: 30, right: 20, bottom: 30, left: 60}
    const width = 1000 - margin.left - margin.right
    const height = 500 - margin.top - margin.bottom

    const svg = d3.select(container).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            

    const xScale = d3.scaleTime()
        .rangeRound([0, width])

    const yScale = d3.scaleLinear()
        .rangeRound([height, 0])

    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.format(",.2r"))
        

    const yGroup = svg.append("g") 
            .attr("class","y-axis")

    const xGroup = svg.append("g")
            .attr("class","x-axis")
            .attr("transform",`translate(0, ${height})`)
            

    const yLabel = svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", 0)
            .attr("y", 0 - margin.top)
            .attr("dy", "1em")
            .style("text-anchor", "start")
            .text("Total Unemployed")

    // Create svg path
    const areaDiv = svg.append("path")
        .attr("class","area")

    // Default brush extent
    const defaultSelection = null 

    // Brush has selection
    function brushed({selection}) {
        if (selection) {listeners["brushed"](selection.map(xScale.invert))}
    }

    // Empty brush selection
    function brushend({selection}) {
        if (!selection) {listeners["brushed"](defaultSelection)}
    }

    // Create brush
    const brush = d3.brushX()
        .extent([[0, 0],[width, height]])
        .on("brush",brushed)
        .on("end", brushend)
        
    // Add brush to svg
    svg.append("g").attr('class', 'brush').call(brush)

    // Alter brush from zooming
    function setBrush(timeRange) {
        const timePix = timeRange.map(xScale)
        svg.select('.brush')
            .call(brush.move, timePix)
    }

    function update(data){ 

        // update scales, encodings, axes (use the total count)
        xScale.domain(d3.extent(data.map(d => d.date))).nice(d3.timeWeek)
        yScale.domain([0, d3.max(data.map(d => d.total))])

        
        xGroup
            .call(xAxis)

        yGroup
            .call(yAxis)

        // Area generator
        const area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(d => xScale(d.date))
            .y0(yScale(0))
            .y1(d => yScale(d.total))

        areaDiv
            .datum(data)
            .attr("fill","navy")
            .attr("d",area)
    }

    function on(event, listener) {
        listeners[event] = listener;
    }

    return {
        update, 
        on,
        setBrush
    }
}