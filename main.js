document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector("form");
    const tabla = document.querySelector("#myData");
    const url = "https://650b8803dfd73d1fab0a0b24.mockapi.io/presupuesto";
    let isEditing = false; //Luego se usara y se sabra su fin
    

    // Esta función muestra los datos en la tabla
    async function mostrarDatos(){
        
        const respuesta = await fetch(url);
        // console.log(respuesta);
        const datos = await respuesta.json();   
        console.log(datos);
        tabla.innerHTML= "";

        // Variables para los totales
        let totalIngresos = 0;
        let totalEgresos = 0;

        datos.forEach((item) => {
            tabla.innerHTML +=
            `
            <tr>
                <td>${item.id}</td>
                <td>${item.valor}</td>
                <td>${item.caja}</td>
                <td><button class="editar btn btn-info" data-id="${item.id}" >Editar</button></td>
                <td><button class="eliminar btn btn-danger" data-id="${item.id}" >Eliminar</button></td>
            </tr>
            `;

            // Calcular totales
            if (item.caja === 'Ingreso') {
                totalIngresos += parseFloat(item.valor);
            } else {
                totalEgresos += parseFloat(item.valor);
            }
        });

        // Calcular total restante
        const totalRestante = totalIngresos - totalEgresos;

        // Actualizar los elementos en el DOM
        document.getElementById('totalIngresos').textContent = totalIngresos.toLocaleString('en-CO', { style: 'currency', currency: 'COP' });
        document.getElementById('totalEgresos').textContent = totalEgresos.toLocaleString('en-CO', { style: 'currency', currency: 'COP' });
        document.getElementById('totalRestante').textContent = totalRestante.toLocaleString('en-CO', { style: 'currency', currency: 'COP' });
    }

    // Función para manejar el envío del formulario
    async function manejarEnvio(e) {
        e.preventDefault();  // Prevenir el recargado de la página
        const formData = new FormData(formulario); 
        const data = {
            valor: formData.get("valor"),
            caja: formData.get("caja"),
        };

        console.log(data);



        const submitButton = formulario.querySelector("input[type='submit']");
        const id = submitButton.getAttribute("data-id");


        

        if (isEditing) { 
            submitButton.value = "Calcular";
            isEditing = false;
        }

        if(id){
            // Actualizar registro existente
            const respuesta = await fetch(`${url}/${id}`,{
                method : "PUT",
                headers:{"Content-type":"application/json"},
                body: JSON.stringify(data)
                
            });

            if(respuesta.ok){
                console.log("Registro actualizado");
                formulario.reset();
                mostrarDatos();

            }
        } else{
            // Crear nuevo registro
            const respuesta = await fetch(url,{
                method:"POST",
                headers:{"Content-type":"application/json"},
                body :JSON.stringify(data)
            });
            if(respuesta.ok){
                console.log("Registro creado");
                formulario.reset();
                mostrarDatos();
            }
        }
    }

    // Función para manejar los eventos de edición y eliminación
    function manejarClickTabla(e) {
        const objetivo = e.target;

        if (objetivo.classList.contains("editar")) {
            const id = objetivo.getAttribute("data-id");

            fetch(`${url}/${id}`)
                .then(respuesta => respuesta.json())
                .then(data => {
                    formulario.valor.value = data.valor;
                    formulario.caja.value = data.caja;

                    const submitButton = formulario.querySelector("input[type='submit']");
                    submitButton.value = "Actualizar";
                    submitButton.setAttribute("data-id", id);

                    isEditing = true; 
                })
                .catch(error => console.error(error));
        }

        if (objetivo.classList.contains("eliminar")) {
            const id = objetivo.getAttribute("data-id");

            fetch(`${url}/${id}`, {
                method: "DELETE",
            })
            .then(respuesta => {
                if (respuesta.ok) {
                    console.log("Registro eliminado.");
                    mostrarDatos();
                }
            })
            .catch(error => console.error(error));
        }
    }

    function buscarPorId() {
        const idABuscar = document.getElementById("buscarPorId").value;
        

        fetch(`${url}/${idABuscar}`)
            .then(respuesta => respuesta.json())
            .then(data => {
                formulario.valor.value = data.valor;
                formulario.caja.value = data.caja;
            })
            .catch(error => console.error(error));
    }

    const btnBuscar = document.getElementById("btnBuscar");

    // Asignar eventos a los elementos del formulario y la tabla
    formulario.addEventListener("submit", manejarEnvio);
    tabla.addEventListener("click", manejarClickTabla);
    btnBuscar.addEventListener("click", buscarPorId);
    

    // Mostrar los datos iniciales
    mostrarDatos();
});
