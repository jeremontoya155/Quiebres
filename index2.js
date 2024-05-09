// Datos de ejemplo (pueden ser obtenidos de una API o base de datos)
const data = [
    { name: "John", age: 30, city: "New York", date: "1980-05-15" },
    { name: "Alice", age: 25, city: "Los Angeles", date: "1990-03-20" },
    { name: "Bob", age: 35, city: "Chicago", date: "1975-08-10" }
  ];
  
  // Función para llenar la tabla con datos
  function populateTable(data) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = ""; // Limpiar cuerpo de tabla antes de agregar nuevos datos
    
    data.forEach(item => {
      const row = tableBody.insertRow();
      row.insertCell(0).textContent = item.name;
      row.insertCell(1).textContent = item.age;
      row.insertCell(2).textContent = item.city;
      row.insertCell(3).textContent = item.date;
    });
  }
  
  // Función para filtrar los datos
  function filterData() {
    const filters = Array.from(document.getElementsByClassName("filterInput"));
    const filterValues = filters.map(input => ({
      column: parseInt(input.dataset.column),
      value: input.value.trim().toLowerCase()
    }));
  
    const filteredData = data.filter(item => {
      return filterValues.every(filter => {
        const columnValue = item[Object.keys(item)[filter.column]];
        if (filter.value === "") return true; // Si el filtro está vacío, retorna true para mostrar todos los datos
        if (filter.column === 1) { // Filtro de edad
          const age = parseInt(columnValue);
          const [minAge, maxAge] = filter.value.split('-').map(val => parseInt(val.trim()));
          return !isNaN(age) && age >= minAge;
        } else if (filter.column === 3 || filter.column === 4) { // Filtro de fecha (desde y hasta)
          const date = new Date(columnValue);
          const filterDate = new Date(filter.value);
          return !isNaN(date.getTime()) && date.getTime() === filterDate.getTime();
        } else {
          return columnValue.toString().toLowerCase().includes(filter.value);
        }
      });
    });
  
    populateTable(filteredData);
  }
  
  // Llenar la tabla con datos al cargar la página
  populateTable(data);
  
  // Agregar eventos de cambio a los campos de filtro
  const filterInputs = document.getElementsByClassName("filterInput");
  for (let i = 0; i < filterInputs.length; i++) {
    filterInputs[i].addEventListener("input", filterData);
  }
  
  