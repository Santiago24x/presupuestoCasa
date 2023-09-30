document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.querySelector("form");
  const tabla = document.querySelector("#myData");
  const url = "http://127.0.0.1:5010/presupuesto";
  let isEditing = false; //para saber si se esta editando o no


  async function mostrarDatos() {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    console.log(datos);
    tabla.innerHTML = "";

    let totalIngresos = 0;
    let totalEgresos = 0;

    datos.forEach((item) => {
      tabla.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.valor}</td>
                <td>${item.caja}</td>
                <td>${item.descripcion}
                <td><button class="editar btn btn-info" data-id="${item.id}" >Editar</button></td>
                <td><button class="eliminar btn btn-danger" data-id="${item.id}" >Eliminar</button></td>
            </tr>
            `;

      if (item.caja === "Ingreso") {
        totalIngresos += parseFloat(item.valor);
      } else {
        totalEgresos += parseFloat(item.valor);
      }
    });

    const totalRestante = totalIngresos - totalEgresos;

    document.getElementById("totalIngresos").textContent =
      totalIngresos.toLocaleString("en-CO", {
        style: "currency",
        currency: "COP",
      });
    document.getElementById("totalEgresos").textContent =
      totalEgresos.toLocaleString("en-CO", {
        style: "currency",
        currency: "COP",
      });
    document.getElementById("totalRestante").textContent =
      totalRestante.toLocaleString("en-CO", {
        style: "currency",
        currency: "COP",
      });
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    const formData = new FormData(formulario);
    const data = {
      valor: formData.get("valor"),
      caja: formData.get("caja"),
      descripcion: formData.get("descripcion"),
    };
  
    const submitButton = formulario.querySelector("input[type='submit']");
    const id = submitButton.getAttribute("data-id");
  
    if (isEditing) {
      submitButton.value = "Ingresar";
      isEditing = false;
    }
  
    if (id) {
      const respuesta = await fetch(`${url}/${id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data),
      });
  
      if (respuesta.ok) {
        console.log("Registro actualizado");

  
      }
    } else {
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data),
      });
  
      if (respuesta.ok) {
        console.log("Registro creado");
        

      } 
    }
  }
  
  function manejarClickTabla(e) {
    const objetivo = e.target;

    if (objetivo.classList.contains("editar")) {
      const id = objetivo.getAttribute("data-id");

      fetch(`${url}/${id}`)
        .then((respuesta) => respuesta.json())
        .then((data) => {
          formulario.valor.value = data.valor;
          formulario.caja.value = data.caja;

          const submitButton = formulario.querySelector("input[type='submit']");
          submitButton.value = "Actualizar";
          submitButton.setAttribute("data-id", id);

          isEditing = true;
        })
        .catch((error) => console.error(error));
    }

    if (objetivo.classList.contains("eliminar")) {
      const id = objetivo.getAttribute("data-id");

      fetch(`${url}/${id}`, {
        method: "DELETE",
      })
        .then((respuesta) => {
          if (respuesta.ok) {
            console.log("Registro eliminado.");
          
          }
        })
        .catch((error) => console.error(error));
    }
  }

  function buscarPorId() {
    const idABuscar = document.getElementById("buscarPorId").value;

    fetch(`${url}/${idABuscar}`)
      .then((respuesta) => respuesta.json())
      .then((data) => {
        tabla.innerHTML = ""; // Limpiar la tabla

        tabla.innerHTML += `
                    <tr>
                        <td>${data.id}</td>
                        <td>${data.valor}</td>
                        <td>${data.caja}</td>
                        <td>${data.descripcion}
                        <td><button class="editar btn btn-info" data-id="${data.id}" >Editar</button></td>
                        <td><button class="eliminar btn btn-danger" data-id="${data.id}" >Eliminar</button></td>
                    </tr>
                    `;

        formulario.valor.value = data.valor;
        formulario.caja.value = data.caja;
      })
      .catch((error) => console.error(error));
  }

  const btnRecargar = document.getElementById("btnRecargar");
  btnRecargar.addEventListener("click", () => {
      location.reload();
  });

  const btnBuscar = document.getElementById("btnBuscar");

  formulario.addEventListener("submit", manejarEnvio);
  tabla.addEventListener("click", manejarClickTabla);
  btnBuscar.addEventListener("click", buscarPorId);

  mostrarDatos();
});
