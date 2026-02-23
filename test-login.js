const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:3001/auth/login', {
            ficha: '0563',
            contrasena: 'pasantia2024' // Suponiendo esta contraseña basándome en el contexto
        });
        console.log('Login exitoso:', response.data);
    } catch (error) {
        console.error('Error de login:', error.response ? error.response.status : error.message);
        if (error.response && error.response.data) {
            console.error('Data:', error.response.data);
        }
    }
}

testLogin();
