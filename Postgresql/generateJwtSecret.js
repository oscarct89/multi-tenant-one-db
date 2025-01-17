const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Generar un secreto seguro
const secret = crypto.randomBytes(64).toString('hex');

// Ruta al archivo .env
const envPath = path.join(__dirname, '.env');

// Leer el archivo .env actual, si existe
let envContent = '';
if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
}

// Reemplazar o agregar JWT_SECRET
const newEnvContent = envContent.replace(/JWT_SECRET=.*/g, '').trim() + `\nJWT_SECRET=${secret}\n`;

// Escribir el archivo .env actualizado
fs.writeFileSync(envPath, newEnvContent, 'utf8');

console.log('JWT_SECRET has been written to .env:', secret);
