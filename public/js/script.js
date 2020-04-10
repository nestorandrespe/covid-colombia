var heightScale = d3.scaleLinear()
.domain([2600,0])
.range([0,800]);

var xScale = d3.scaleLinear()
.domain([0,35])
.range([50,1900]);

Promise.all([
  d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv')
]).then(files => {
  const data = files[0];

  let dias = data.columns;
  dias = dias.slice(4, dias.length);

  let color = d3.scaleOrdinal()
  .range(d3.schemeCategory10);

  var svg = d3.select('#bg');
  var svg_nuevos = d3.select('#bg_2');
  var gGraf = svg.append('g').attr('class', 'gGraf');

  for(var i = 1; i < 2600; i+=200){
    svg.append("line")
      .attr('x1', d => {
        return 50;
      })
      .attr('x2', d => {
        return 1920;
      })
      .attr('y1', d => {
        return heightScale(i);
      })
      .attr('y2', d => {
        return heightScale(i);
      })
      .attr('stroke', '#dcdcdc')
  }

  for(var i = 1; i < 35; i++){
    svg.append("line")
      .attr('x1', d => {
        return xScale(i);
      })
      .attr('x2', d => {
        return xScale(i);
      })
      .attr('y1', d => {
        return 0;
      })
      .attr('y2', d => {
        return 800;
      })
      .attr('stroke', '#dcdcdc')
  }

  const newData = [];

  for(var i = 0; i < data.length; i++) {
    if(
    data[i]['Country/Region'] == 'Colombia'
    // data[i]['Country/Region'] == 'Peru' || 
    // data[i]['Country/Region'] == 'Argentina' || 
    // data[i]['Country/Region'] == 'Chile' || 
    // data[i]['Country/Region'] == 'Mexico' || 
    // data[i]['Country/Region'] == 'Korea, South' || 
    // data[i]['Country/Region'] == 'Egypt' || 
    // // data[i]['Country/Region'] == 'China' ||
    // data[i]['Country/Region'] == 'Iran' ||
    // data[i]['Country/Region'] == 'Italy' ||
    // data[i]['Country/Region'] == 'Brazil' ||
    // data[i]['Country/Region'] == 'Ecuador'
    ) newData.push(data[i])
  }

  for(var i = 0; i < newData.length; i++) {
    var index = 0;
    var dataTemp = [];


    // svg.append('text')
    // .text(newData[i]['Country/Region'])
    // .attr('x',i*150 + 200)
    // .attr('y', 900)
    // .attr('font-size', '28px')
    // .attr('font-weight', 'bold')
    // .attr('fill', d => {
    //   if(newData[i]['Country/Region']== 'Colombia') return 'rgb(237, 194, 42)';
    //   else return color(newData[i]['Country/Region'])
    // })
    // .attr('text-anchor', 'middle')

    for(var j = 0; j < dias.length; j++) {
      if(newData[i][dias[j]] > 0){
        var cambio = 0;
        var dif = 0;
        var r = 0;
        if(dataTemp.length > 0){
          cambio = ((newData[i][dias[j]] - newData[i][dias[j-1]]) / newData[i][dias[j-1]]);
          dif = ((newData[i][dias[j]] - newData[i][dias[j-1]]));
          var rTemp = 0;
          for(var x = 0; x < dataTemp.length; x++){
            rTemp += dataTemp[x].cambio;
          }

          rTemp += cambio;
          r = rTemp / (dataTemp.length + 1)
        }

        

        var obj = {
          num: newData[i][dias[j]],
          name: newData[i]['Country/Region'],
          cambio: cambio,
          dif: dif,
          r: r
        }
        if(index < dias.length) dataTemp.push(obj);
        else if(j < dias.length) dataTemp.push(obj);
        index++;
      }
    }

    dibujarAxis(svg, true);

    // Curva log
    escalaLogaritmica();
    dibujarCurva(svg, dataTemp, '#dcdcdc', 'num');
    dibujarPuntos(svg, 'circles_3', dataTemp, '#999', -20, 'num', false);

    // Curva nuevos casos por día
    escalaLineal();
    heightScale.domain([350,0]).range([0,300])
    dibujarAxis(svg_nuevos, false);
    heightScale.domain([350,0]).range([0,300])

    dibujarCurva(svg_nuevos, dataTemp, '#666', 'dif');
    dibujarPuntos(svg_nuevos, 'circles_2', dataTemp, '#999', 30, 'dif', true);

    var rect = svg_nuevos.selectAll('.rect')
    .data(dataTemp)
    .join('g')
    .attr('class', 'rect')
    .attr('transform', (d,i)=>{
      return 'translate('+xScale(i)+',0)'
    })

    rect.append('rect')
    .attr('fill', 'rgba(0,0,0,0.2)')
    .attr('x', -9)
    .attr('y', d=>{
      return heightScale(d.dif)
    })
    .attr('width', 18)
    .attr('height', d=>{
      return 300 - heightScale(d.dif)
    })

    // Curva acumulado
    heightScale.domain([2600,0]).range([0,800])
    dibujarCurva(svg, dataTemp, 'rgb(237, 194, 42)', 'num');
    dibujarPuntos(svg, 'circles', dataTemp, 'rgb(237, 194, 42)', -20, 'num', false);
  }
})

function dibujarCurva(svg, data, color, key) {
  svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", (d) => {
    if(d[0].name == 'Colombia') return color;
    else return color(d[0].name)
  })
  .attr("stroke-width", d => {
    if(d[0].name == 'Colombia') return 3;
    else return 1.5;
  })
  .attr("d", d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d,i) { return xScale(i) })
    .y(function(d) { return heightScale(d[key]) })
  )
}

function dibujarPuntos(svg, clase, data, color, pos, key, por) {
  var nodos = svg.selectAll('.'+clase)
    .data(data)
    .join('g')
    .attr('class', clase)
    .attr('transform', (d,i)=>{
      return 'translate('+xScale(i)+','+heightScale(d[key])+')'
    })

    nodos.append('circle')
    .attr('r', 8)
    .attr('fill', 'none')
    .attr('stroke', color)

    nodos.append('text')
    .text((d,i)=>{
      return d[key]
    })
    .attr('fill', color)
    .attr('fill', '#999')
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(0,'+pos+')')

    if(por){
      nodos.append('text')
      .text((d,i)=>{
        return ((d.cambio) * 100).toFixed(2) + '%'
      })
      .attr('fill', 'rgb(237, 194, 42)')
      .attr('fill', '#999')
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('transform', 'translate(0,-20)')
    }
}

function dibujarAxis(svg, log) {
  svg.append("g")
  .attr("transform", "translate(50,0)")
  .call(d3.axisLeft(heightScale));

  escalaLogaritmica()

  if(log){
    svg.append("g")
    .attr('class', 'logScale')
    .attr("transform", "translate(1900,0)")
    .call(d3.axisRight(heightScale));
  }
  escalaLineal()

  svg.append("g")
  .attr("transform", "translate(0,0)")
  .call(d3.axisBottom(xScale));
}

function escalaLogaritmica() {
  heightScale = d3.scaleSymlog()
    .constant(1)
    .domain([4000,0])
    .range([0,800]);
}

function escalaLineal() {
  heightScale = d3.scaleLinear()
    .domain([2600,0])
    .range([0,800]);
}