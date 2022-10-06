let frm = document.getElementById("frmPrestamo");

frm.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("simular").click();
  }
});

const IVA = 0.21;
let monto,
  plazo,
  totalPagos,
  tasaAnual,
  fechaInicio,
  fechaPago,
  tasaMensual,
  mensualidad,
  intereses,
  impuestos,
  capital,
  deuda,
  primerInteres,
  primerImpuesto,
  primerCapital,
  primeraDeuda,
  primeraFechaPago,
  acumIntereses,
  acumImpuestos,
  acumCapital;

const dinero = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

let establecerDatos = function () {
  (primerInteres = 0),
    (primerImpuesto = 0),
    (primerCapital = 0),
    (primeraDeuda = 0),
    (primeraFechaPago = true);
  (acumIntereses = 0), (acumImpuestos = 0), (acumCapital = 0);

  nombre = document.getElementById("nombre").value;
  monto = document.getElementById("monto").value;
  periodo = document.getElementById("periodo").value;
  plazo = document.getElementById("plazo").value;
  tasaAnual = document.getElementById("interes").value;
  fechaInicio = new Date(document.getElementById("fecha").value);
  fechaInicio.setDate(fechaInicio.getDate() + 1); // FECHA ACTUAL

  let plazoMensual = document.getElementById("mensual").checked;
  let plazoAnual = document.getElementById("anual").checked;

  if (!nombre) {
    alert("Debés ingresar un nombre");
  }

  if (!plazoMensual) {
    this.plazo = plazo;
  } else if (!plazoAnual) {
    this.plazo = plazo * 12;
  } else {
    alert("Debés seleccionar un tipo de plazo");
  }

  switch (periodo) {
    case "semanal":
      let fechaFin = new Date(fechaInicio);
      fechaFin.setMonth(fechaFin.getMonth() + parseInt(plazo));
      let tiempo = fechaFin.getTime() - fechaInicio.getTime();
      let dias = Math.floor(tiempo / (1000 * 60 * 60 * 24));
      totalPagos = Math.ceil(dias / 7);
      break;
    case "quincenal":
      totalPagos = plazo * 2;
      break;
    case "mensual":
      totalPagos = plazo;
      break;
    default:
      alert("Debés seleccionar un período de pago");
      break;
  }
};

function calcularTasaMensual() {
  tasaMensual = tasaAnual / 100 / 12;
  return tasaMensual;
}

function tasaMensualconIVA() {
  return calcularTasaMensual() + calcularTasaMensual() * IVA;
}

function PagoMensual() {
  let denominador = Math.pow(1 + tasaMensualconIVA(), totalPagos) - 1;
  mensualidad =
    (tasaMensualconIVA() + tasaMensualconIVA() / denominador) * monto;
  return mensualidad;
}

function calcularTotalPrestamo() {
  let totalPrestamo = 0;
  for (let i = 0; i < totalPagos; i++) {
    totalPrestamo += mensualidad;
  }
  return totalPrestamo;
}

function obtenerPagoMensual() {
  return Math.round(PagoMensual(), 2);
}

function obtenerTotalPrestamo() {
  return Math.round(calcularTotalPrestamo(), 2);
}

function Intereses() {
  if (primerInteres === 0) {
    intereses = tasaMensual * monto;
    primerInteres = intereses;
  } else {
    intereses = tasaMensual * deuda;
  }
  return intereses;
}

function Impuestos() {
  if (primerImpuesto === 0) {
    impuestos = primerInteres * IVA;
    primerImpuesto = impuestos;
  } else {
    impuestos = Intereses() * IVA;
  }
  return impuestos;
}

function Capital() {
  if (primerCapital === 0) {
    capital = mensualidad - primerInteres - primerImpuesto;
    primerCapital = capital;
  } else {
    capital = mensualidad - Intereses() - Impuestos();
  }
  return capital;
}

function DeudaAcumulada() {
  if (primeraDeuda === 0) {
    deuda = monto - primerCapital;
    primeraDeuda = deuda;
  } else {
    deuda -= Capital();
  }
  return deuda;
}

Swal.fire({
  title:
    'Bienvenid@s. Esta es una herramienta gratuita ofrecida por "Bajo - Servicios Financieros"',
  confirmButtonColor: "#e3735e",
  confirmButtonText: "Continuar",
});

function simular() {
  establecerDatos();
  PagoMensual();
  calcularTotalPrestamo();

  if (monto === "" || plazo === "" || tasaAnual === "" || fechaInicio === "") {
    return Swal.fire("Debés completar todos los campos");
  }

  let columnas = [
    "Cuota",
    "Fecha",
    "Valor cuota",
    "Intereses",
    "Impuestos",
    "Capital",
    "Deuda acumulada",
  ];

  let amortizaciones = document.getElementById("amortizaciones");
  let tabla = document.createElement("table");
  let headerTabla = document.createElement("thead");
  let bodyTabla = document.createElement("tbody");
  let footerTabla = document.createElement("tfoot");
  let fila = document.createElement("tr");

  // HEADER TABLA
  for (let j = 0; j < columnas.length; j++) {
    let celda = document.createElement("td");
    let texto = columnas[j];
    let textoCelda = document.createTextNode(texto);
    celda.appendChild(textoCelda);
    fila.appendChild(celda);
  }
  headerTabla.appendChild(fila);

  // BODY TABLA
  for (let i = 0; i < totalPagos; i++) {
    let intereses = Intereses(),
      impuestos = Impuestos(),
      capital = Capital(),
      deuda = DeudaAcumulada();
    acumIntereses += intereses;
    acumImpuestos += impuestos;
    acumCapital += capital;

    let fila = document.createElement("tr");
    for (let j = 0; j < columnas.length; j++) {
      let celda = document.createElement("td");
      let texto;

      switch (columnas[j]) {
        case "Cuota":
          texto = i + 1;
          break;
        case "Fecha":
          if (primeraFechaPago === true) {
            fechaPago = new Date(fechaInicio);
            primeraFechaPago = false;
          } else {
            if (periodo === "semanal") {
              fechaPago.setDate(fechaPago.getDate() + 7);
            } else if (periodo === "quincenal") {
              fechaPago.setDate(fechaPago.getDate() + 15);
            } else if (periodo === "mensual") {
              fechaPago.setMonth(fechaPago.getMonth() + 1);
            }
          }
          texto = fechaPago.toLocaleDateString();
          break;
        case "Valor cuota":
          texto = dinero.format(mensualidad);
          break;
        case "Intereses":
          texto = dinero.format(intereses);
          break;
        case "Impuestos":
          texto = dinero.format(impuestos);
          break;
        case "Capital":
          texto = dinero.format(capital);
          break;
        case "Deuda acumulada":
          texto = dinero.format(Math.abs(deuda));
          break;
        default:
          texto = null;
          break;
      }
      let textoCelda = document.createTextNode(texto);
      celda.appendChild(textoCelda);
      fila.appendChild(celda);
    }
    bodyTabla.appendChild(fila);
  }

  // FOOTER TABLA
  for (let j = 0; j < columnas.length; j++) {
    let celda = document.createElement("td");
    let texto;
    switch (columnas[j]) {
      case "Cuota":
        texto = totalPagos;
        break;
      case "Intereses":
        texto = dinero.format(acumIntereses);
        break;
      case "Impuestos":
        texto = dinero.format(acumImpuestos);
        break;
      case "Capital":
        texto = dinero.format(acumCapital);
        break;
      default:
        texto = "";
        break;
    }
    let textoCelda = document.createTextNode(texto);
    celda.appendChild(textoCelda);
    footerTabla.appendChild(celda);
  }

  tabla.appendChild(headerTabla);
  tabla.appendChild(bodyTabla);
  tabla.appendChild(footerTabla);
  amortizaciones.appendChild(tabla);
}
