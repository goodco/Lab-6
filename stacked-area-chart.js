export default function StackedAreaChart(container){

	// initialization
    let selected = null, defaultTitle="Total Unemployed", xDomain, data
    const listeners = { zoomed: null }

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
    
    const gScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10)

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

    function zoomed({ transform }) {
        const copy = xScale.copy().domain(d3.extent(data, d => d.date))
        const rescaled = transform.rescaleX(copy)
        xDomain = rescaled.domain()
        update(data)
        listeners["zoomed"](xDomain) 
      }

    const zoom = d3.zoom()
        .extent([[0, 0], [width, height]])
        .translateExtent([[0, -Infinity], [width, Infinity]])
        .scaleExtent([1, 4])
        .on("zoom", zoomed)

    svg.call(zoom)
    svg.on("dblclick.zoom", null)
    
    svg.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height); 

    function on(event, listener) {
        listeners[event] = listener;
    }

    function filterByDate(range){
        xDomain = range  
        update(data)
    }

    // update function
	function update(_data){ 
        data = _data

        const keys = selected ? [selected] : data.columns.filter(d => d !== 'date')

        const stack = d3.stack()
            .keys(keys) 

        const stackedData = stack(data)

       
        xScale.domain(xDomain ? xDomain : d3.extent(data.map(d => d.date)))
            // .nice(d3.timeWeek)
            .clamp(true) 

        yScale.domain([0, d3.max(stackedData, d => d3.max(d, d => d[1]))])

        gScale
.domain(keys)

        xGroup
            .call(xAxis)

        yGroup
            .call(yAxis)

        // Area generator
		const areaGenerator = d3.area()
            .curve(d3.curveMonotoneX)
            .x(d => xScale(d.data.date)) 
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))

        const vis = svg.selectAll(".stack-area")
            .data(stackedData, d => d.key)
        

        const stacks = vis.join(
                enter => enter.append("path")
                        .attr("class","stack-area")
                        .attr("d", areaGenerator)
                        .attr("fill", d => gScale
                (d.key))
                        .attr("opacity",0.75),
                update => update.attr("d", areaGenerator),
                exit => exit.remove()
            )
            
        stacks.on("click", (event, d) => {
            if (selected === d.key) {
                defaultTitle = "Total Unemployed"
                selected = null
            } else {
                defaultTitle = d.key
                selected = d.key
            }
            update(data) // simply update the chart again
            })

        let change_label = function(event, d) {
            yLabel.text(d.key)
            d3.select(this).style("opacity",1)
            }

        let revert_label = function() {
            yLabel.text(defaultTitle)
            d3.select(this).style("opacity",0.75)
            }

        stacks
            .on("mouseover", change_label)
            .on("mouseleave", revert_label)
	}

	return {
		update,
        filterByDate,
        on
	}
}