
const url = "https://gist.githubusercontent.com/josejbocanegra/b1873c6b7e732144355bb1627b6895ed/raw/d91df4c8093c23c41dce6292d5c1ffce0f01a68b/newDatalog.json";
const tabla_eventos = "contenido-tabla-eventos";
const tabla_correlaciones = "contenido-tabla-correlaciones";

let datos = [];
let diccionario_eventos = [];
let diccionario_correlaciones = [];
//Se entiende cada elemento como TN,FN,FP,TP 

getData((value)=>{
  datos =value;
  //console.log("datos", datos);

  //En for creamos el diccionario eventos y llenamos la primera tabla
  for(let i = 0;i< datos.length; i++)
  {
    let eventos = anadirEventosDiccionario(datos[i]["events"]);
    crearHijoTabla(tabla_eventos,(i+1).toString(),eventos,datos[i]["squirrel"]);
  }

  //En este for llenamos el diccionario de eventos
  for(let i = 0;i< datos.length; i++)
  {
    let eventos = datos[i]["events"];
    llenarCorrelaciones(eventos, datos[i]["squirrel"]);
  }

  //En este for calculamos las correlaciones y las anadimos al respectivo diccionario, correlacion = llave - evento = valor
  for(let i of Object.keys(diccionario_eventos))
  {
    //console.log(i, diccionario_eventos[i.toString()]);
    let correlacion = calcularCorrelacion(diccionario_eventos[i]);
    if(!diccionario_correlaciones[correlacion]) {diccionario_correlaciones[correlacion] = [i];}
    else{
      diccionario_correlaciones[correlacion].push(i);
    }
  }

  //En este for llenamos la tabla de correlaciones usando el diccionario de correlaciones
  let id = 1;
  for(let i of Object.keys(diccionario_correlaciones).sort(function(a,b) { return a - b; }).reverse())
  {
    for(j of diccionario_correlaciones[i])
    {
      crearHijoTabla(tabla_correlaciones, id.toString(), j, i);
      id++;
    }
  }
});

function anadirEventosDiccionario(eventos)
{
  let rta = "";
  for (let i of eventos)
  {
    rta += i + ",";
    if(!diccionario_eventos[i])
    {
      diccionario_eventos[i]=[0,0,0,0];
      //console.log("Nuevo evento diccionario", i);
    }
  }
  return rta;
}

function getData (callback)
{
  fetch(url).then(res=>res.json()).then(res=>
  {
    callback(res);
  });
}

function crearHijoTabla(idTabla,id, col1, col2)
{
  const tr = document.createElement("tr");
  if(col2==true) {tr.classList.add("fondo-rojo");}

  let td =[];
  td[0] = document.createElement("td");
  td[1] = document.createElement("td");
  td[2] = document.createElement("td");

  td[0].classList.add("font-weight-bold");
  td[0].appendChild(document.createTextNode(id));
  td[1].appendChild(document.createTextNode(col1));
  td[2].appendChild(document.createTextNode(col2));

  for(let i of td)
  {
    tr.appendChild(i);
  }

  const tabla = document.getElementById(idTabla);
  tabla.appendChild(tr);
}

//Se entiende cada elemento como [TN,FN,FP,TP]
function calcularCorrelacion(array)
{
  let TN = array[0];
  let FN = array[1];
  let FP = array[2];
  let TP = array[3];
  let MCC = ((TP*TN)-(FP*FN))/(Math.sqrt((TP+FP)*(TP+FN)*(TN+FP)*(TN+FN)));
  return MCC.toString();
}

//Se entiende cada elemento como [TN,FN,FP,TP] 
function llenarCorrelaciones(evento, ardilla)
{
  //console.log("evento", evento);
  //console.log("ardilla",ardilla);
  let llaves = Object.keys(diccionario_eventos);
  for(let i of llaves)
  {
    if(ardilla)
    {
      //Se convierte en ardilla P
      if(evento.includes(i))
      {
        //Se convierte en ardilla y el evento occurrio TP
        diccionario_eventos[i][3]=diccionario_eventos[i][3]+1;
      }
      else
      {
        //Se convierte en ardilla pero el evento no ocurrio FP
        diccionario_eventos[i][2]++;
      }
    }
    else{
      //No se convierte en ardilla N
      if(evento.includes(i))
      {
        //No se convierte en ardilla y el evento ocurrio FN
        diccionario_eventos[i][1]++;
      }
      else
      {
        //No se convierte en ardilla y el evento no occurrio TN
        diccionario_eventos[i][0]++;
      }
    }
  }
}

