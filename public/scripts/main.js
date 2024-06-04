document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/username')
        .then(response => response.json())
        .then(data => {
            console.log('API Nombre del usuario:', data.username);
        })
        .catch(error => {
            console.error('API Error al obtener el nombre del usuario:', error);
        });
});
