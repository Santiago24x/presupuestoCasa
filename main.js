document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.querySelector("form");
    const tabla = document.querySelector("#myData");
    const url = "https://650b8803dfd73d1fab0a0b24.mockapi.io/presupuesto";
    let isEditing = false;

    // Renderiza los datos en la tabla
    async function showData(){
        const res = await fetch(url);
        const data = await res.json();   

        tabla.innerHTML= "";
        data.forEach((item) => {
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
        });
    }

    // Maneja el envío del formulario
    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(formulario);
        const data = {
            valor: formData.get("valor"),
            caja: formData.get("caja"),
        };

        const submitButton = formulario.querySelector("input[type='submit']");
        const id = submitButton.getAttribute("data-id");

        if (isEditing) { 
            submitButton.value = "Calcular";
            isEditing = false;
        }
        if(id){
            // Actualizar registro existente
            const res = await fetch(`${url}/${id}`,{
                method : "PUT",
                headers:{"Content-type":"application/json"},
                body: JSON.stringify(data)
            });
            if(res.ok){
                console.log("Registro actualizado");
                formulario.reset();
                showData();
            }
        } else{
            // Crear nuevo registro
            const res = await fetch(url,{
                method:"POST",
                headers:{"Content-type":"application/json"},
                body :JSON.stringify(data)
            });
            if(res.ok){
                console.log("Registro creado");
                formulario.reset();
                showData();
            }
        }
    }

    // Maneja los eventos de edición y eliminación
    function handleTableClick(e) {
        const target = e.target;

        if (target.classList.contains("editar")) {
            const id = target.getAttribute("data-id");

            fetch(`${url}/${id}`)
                .then(res => res.json())
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

        if (target.classList.contains("eliminar")) {
            const id = target.getAttribute("data-id");

            fetch(`${url}/${id}`, {
                method: "DELETE",
            })
            .then(response => {
                if (response.ok) {
                    console.log("Registro eliminado.");
                    showData();
                }
            })
            .catch(error => console.error(error));
        }
    }

    // Asignar eventos a los elementos
    formulario.addEventListener("submit", handleSubmit);
    tabla.addEventListener("click", handleTableClick);

    // Renderizar los datos iniciales
    showData();
});
