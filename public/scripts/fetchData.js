document.addEventListener('DOMContentLoaded', function() {
    axios.get('/api/username')
        .then(response => {
            console.log('AXIOS: Nombre del usuario:', response.data.username);
        })
        .catch(error => {
            console.error('AXIOS: Error al obtener el nombre del usuario:', error);
        });
});
