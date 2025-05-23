// const express = require('express');
// const cors = require('cors');
// const fs = require('fs');
// const { google } = require('googleapis');
// const bodyParser = require('body-parser');

// const app = express();
// const port = 3000;

// // Habilitar CORS para permitir solicitudes desde Angular
// app.use(cors());
// app.use(bodyParser.json());

// // Cargar credenciales de Google
// const credentials = JSON.parse(fs.readFileSync('credentials.json'));
// const { client_secret, client_id, redirect_uris } = credentials.web;
// const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

// // Almacenar el token de acceso una vez que el usuario inicie sesión
// let accessToken = null;

// //  Ruta para obtener el link de autenticación con Google
// app.get('/auth-url', (req, res) => {
//     const authUrl = oAuth2Client.generateAuthUrl({
//         access_type: 'offline',
//         scope: ['https://www.googleapis.com/auth/calendar.events']
//     });
//     res.json({ url: authUrl });
// });

// //  Ruta para manejar el callback de Google y obtener el token
// app.get('/auth/google/callback', async (req, res) => {
//     const code = req.query.code;
//     try {
//         const { tokens } = await oAuth2Client.getToken(code);
//         oAuth2Client.setCredentials(tokens);
//         accessToken = tokens;
//         res.send('Autenticación exitosa, ahora puedes usar la API de Google Calendar.');
//     } catch (error) {
//         res.status(500).send('Error al autenticar con Google.');
//     }
// });

// //  Ruta para obtener eventos del calendario
// app.get('/events', async (req, res) => {
//     if (!accessToken) return res.status(401).json({ message: 'Usuario no autenticado' });

//     oAuth2Client.setCredentials(accessToken);
//     const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

//     try {
//         const response = await calendar.events.list({
//             calendarId: 'primary',
//             timeMin: new Date().toISOString(),
//             maxResults: 10,
//             singleEvents: true,
//             orderBy: 'startTime',
//         });

//         res.json(response.data.items);
//     } catch (error) {
//         res.status(500).json({ message: 'Error al obtener eventos', error });
//     }
// });

// //  Ruta para añadir un evento a Google Calendar
// app.post('/add-event', async (req, res) => {
//     if (!accessToken) return res.status(401).json({ message: 'Usuario no autenticado' });

//     oAuth2Client.setCredentials(accessToken);
//     const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

//     const event = {
//         summary: req.body.summary,
//         start: { dateTime: req.body.start, timeZone: 'America/New_York' },
//         end: { dateTime: req.body.end, timeZone: 'America/New_York' },
//     };

//     try {
//         const response = await calendar.events.insert({
//             calendarId: 'primary',
//             resource: event,
//         });

//         res.json(response.data);
//     } catch (error) {
//         res.status(500).json({ message: 'Error al añadir evento', error });
//     }
// });

// app.listen(port, () => {
//     console.log(`Servidor corriendo en http://localhost:${port}`);
// });
