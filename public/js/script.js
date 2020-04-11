var heightScale = d3.scaleLinear()
.domain([2600,0])
.range([0,800]);

var xScale = d3.scaleLinear()
.domain([0,35])
.range([50,1900]);

var colorScale = d3.scaleOrdinal()
  .range(d3.schemeCategory10);

var heightMax = 2000;
var heightMaxLog = 2000;
var dias;
var dias_col = 0;

Promise.all([
  d3.csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv'),
  d3.json('./archivo.json'),
  d3.csv('./totales_tests.csv')
]).then(files => {
  const data = files[0];

  dias = data.columns;
  dias = dias.slice(4, dias.length);

  var svg = d3.select('#bg');
  var svg_nuevos = d3.select('#bg_2');
  var svg_paises_acumulado = d3.select('#bg_3');
  var svg_totales_tests = d3.select('#bg_4');

  var gGraf = svg.append('g').attr('class', 'gGraf');

  

  const newData = [];
  const countryData = [];

  for(var i = 0; i < data.length; i++) {
    if(
    data[i]['Country/Region'] == 'Colombia'
    ) {
      newData.push(data[i])
      countryData.push(data[i])
    }
    else if(
      data[i]['Country/Region'] == 'Peru' || 
      data[i]['Country/Region'] == 'Argentina' || 
      data[i]['Country/Region'] == 'Chile' || 
      data[i]['Country/Region'] == 'Mexico' || 
      data[i]['Country/Region'] == 'Italy' ||
      data[i]['Country/Region'] == 'Brazil' ||
      data[i]['Country/Region'] == 'Ecuador'
    ) countryData.push(data[i])
  }

  for(var i = 0; i < newData.length; i++) {
    var dataTemp = organizaData(newData[i]);

    dias_col = dataTemp.length;

    xScale.domain([0,dias_col])
    heightMax = parseInt(dataTemp[dias_col - 1].num) + 600;
    heightMaxLog = parseInt(dataTemp[dias_col - 1].num) + 3000;

    heightScale.domain([heightMax,0]).range([0,800])
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
       

    var data_regre = dataTemp.slice(dataTemp.length - 7, dataTemp.length)

    var x_mean = 0;
    var y_mean = 0;

    for(var m = 0; m < data_regre.length; m++){
      x_mean += m;
      y_mean += data_regre[m].dif;
    }

    x_mean = x_mean / data_regre.length
    y_mean = y_mean / data_regre.length

    var sqrt_sub = 0;
    var sum_sub = 0;

    for(var m = 0; m < data_regre.length; m++){
      var x_sub = m -  x_mean
      var y_sub = data_regre[m].dif -  y_mean
      sqrt_sub += x_sub * x_sub
      sum_sub += x_sub * y_sub
    }

    var pendiente = sum_sub / sqrt_sub
    var off = y_mean - (pendiente * x_mean)
    console.log(pendiente,off)

    var x1 = dataTemp.length - 7;
    var x2 = dataTemp.length - 1;
    var y1 = 106;
    var y2 = 6 * pendiente + off;

    console.log(y1,y2)

    svg_nuevos.append('line')
    .attr('stroke', 'red')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', 4)
    .attr('x1', xScale(x1))
    .attr('x2', xScale(x2))
    .attr('y1', heightScale(y1))
    .attr('y2', heightScale(y2))

    dibujarBarras(svg_nuevos, dataTemp, 'rect_1','rgba(237, 194, 42, 0.3)','dif')
    dibujarCurva(svg_nuevos, dataTemp, '#666', 'dif');
    dibujarPuntos(svg_nuevos, 'circles_2', dataTemp, '#999', 30, 'dif', true);

    console.log(dataTemp);

    heightScale.domain([3500,0]).range([0,300])
    dibujarAxis(svg_totales_tests, false);
    heightScale.domain([3500,0]).range([0,300])
    for(var m = 0; m < files[2].length; m++){
      var total = parseInt(files[2][m].total);
      files[2][m].name = 'Colombia'
      if(m > 0){
        var anterior = parseInt(files[2][m - 1].total);
        if(anterior > 0){
          files[2][m].dif = total - anterior
          files[2][m].por = (dataTemp[m].dif / (total - anterior)) * 100
        }
        else {
          files[2][m].dif = 0
          files[2][m].por = 0
        }
      } else {
        files[2][m].dif = 0
        files[2][m].por = 0
      }
    }
    dibujarBarras(svg_totales_tests, files[2], 'rect_1','rgba(237, 194, 42, 0.2)','dif')
    dibujarBarras(svg_totales_tests, dataTemp, 'rect_1','rgba(237, 194, 42, 0.4)','dif')

    heightScale.domain([20,0]).range([0,300])
    dibujarCurva(svg_totales_tests, files[2], '#666', 'por')
    dibujarPuntosPorcentaje(svg_totales_tests, 'por_totales_test', files[2], '#666', -20, 'por')

    // Curva acumulado
    heightScale.domain([heightMax,0]).range([0,800])
    dibujarCurva(svg, dataTemp, 'rgb(237, 194, 42)', 'num');
    dibujarPuntos(svg, 'circles', dataTemp, 'rgb(237, 194, 42)', -20, 'num', false);
  }

  heightScale.range([0,500])
  dibujarAxis(svg_paises_acumulado, false);
  
  for(var i = 0; i < countryData.length; i++) {
    var dataTemp = organizaData(countryData[i]);

    heightScale.domain([heightMax,0]).range([0,500])
    dibujarCurva(svg_paises_acumulado, dataTemp, 'rgb(237, 194, 42)', 'num');
    dibujarDot(svg_paises_acumulado,'dots_'+i, dataTemp, 'num');

    $item = $('<div class="item"></div>');
    $icon = $('<div class="icon"></div>');
    $name = $('<div class="txt"></div>');

    $name.html(dataTemp[0].name);
    if(dataTemp[0].name != 'Colombia') $icon.css({'background-color': colorScale(dataTemp[0].name)})
    $item.append($icon).append($name);

    $('#leyenda_paises').append($item)
  }
})

function dibujarBarras(svg, data, clase,color, key) {
  var rect = svg.selectAll('.' + clase)
    .data(data)
    .join('g')
    .attr('class', clase)
    .attr('transform', (d,i)=>{
      return 'translate('+xScale(i)+',0)'
    })

    rect.append('rect')
    .attr('fill', color)
    .attr('x', -9)
    .attr('y', d=>{
      return heightScale(d[key])
    })
    .attr('width', 18)
    .attr('height', d=>{
      return 300 - heightScale(d[key])
    })
}

function dibujarCurva(svg, data, color, key) {
  svg.append("path")
  .datum(data)
  .attr("fill", "none")
  .attr("stroke", (d) => {
    if(d[0].name == 'Colombia') return color;
    else return colorScale(d[0].name)
  })
  .attr("stroke-width", d => {
    if(d[0].name == 'Colombia') return 3;
    else return 1;
  })
  .attr("d", d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d,i) { return xScale(i) })
    .y(function(d) { return heightScale(d[key]) })
  )
}

function dibujarDot(svg, clase, data, key){
  var nodos = svg.selectAll('.'+clase)
    .data(data)
    .join('g')
    .attr('class', clase)
    .attr('transform', (d,i)=>{
      return 'translate('+xScale(i)+','+heightScale(d[key])+')'
    })

    nodos.append('circle')
    .attr('r', 2)
    .attr("fill", (d) => {
      if(d.name == 'Colombia') return 'rgb(237, 194, 42)';
      else return colorScale(d.name)
    })
    .attr('stroke', 'none')
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

function dibujarPuntosPorcentaje(svg, clase, data, color, pos, key) {
  var nodos = svg.selectAll('.'+clase)
    .data(data)
    .join('g')
    .attr('class', clase)
    .attr('transform', (d,i)=>{
      return 'translate('+xScale(i)+','+heightScale(d[key])+')'
    })

    nodos.append('circle')
    .attr('r', d => {
      if(d[key] > 0) return 8
      else return 0
    })
    .attr('fill', 'none')
    .attr('stroke', color)

    nodos.append('text')
    .text((d,i)=>{
      if(d[key] > 0) return (d[key]).toFixed(2) + '%'
      else return ''
    })
    .attr('fill', color)
    .attr('font-size', 12)
    .attr('text-anchor', 'middle')
    .attr('transform', 'translate(0,'+pos+')')
    
}

function dibujarAxis(svg, log) {
  for(var i = 1; i < heightScale.domain()[0]; i+=200){
    svg.append("line")
      .attr('x1', d => {
        return 50;
      })
      .attr('x2', d => {
        return xScale.range()[1];
      })
      .attr('y1', d => {
        return heightScale(i);
      })
      .attr('y2', d => {
        return heightScale(i);
      })
      .attr('stroke', '#dcdcdc')
  }

  for(var i = 1; i < dias_col; i++){
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
        return heightScale.range()[1];
      })
      .attr('stroke', '#dcdcdc')
  }

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
    .domain([heightMaxLog,0])
    .range([0,800]);
}

function escalaLineal() {
  heightScale = d3.scaleLinear()
    .domain([heightMax,0])
    .range([0,800]);
}

function organizaData(newData) {
  var dataTemp = [];
  var index = 0;

  for(var j = 0; j < dias.length; j++) {
    if(newData[dias[j]] > 0){
      var cambio = 0;
      var dif = 0;
      var r = 0;
      if(dataTemp.length > 0){
        cambio = ((newData[dias[j]] - newData[dias[j-1]]) / newData[dias[j-1]]);
        dif = ((newData[dias[j]] - newData[dias[j-1]]));
        var rTemp = 0;
        for(var x = 0; x < dataTemp.length; x++){
          rTemp += dataTemp[x].cambio;
        }

        rTemp += cambio;
        r = rTemp / (dataTemp.length + 1)
      }

      var obj = {
        num: newData[dias[j]],
        name: newData['Country/Region'],
        cambio: cambio,
        dif: dif,
        r: r
      }
      if(index < dias.length) dataTemp.push(obj);
      else if(j < dias.length) dataTemp.push(obj);
      index++;
    }
  }

  return dataTemp;
}