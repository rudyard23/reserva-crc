const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
console.log("Ruta absoluta de reserva.db:", path.resolve('./reserva.db'));

const app = express();
const db = new sqlite3.Database('./reserva.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el login
app.post('/login', (req, res) => {
  const clave = req.body.clave;

  db.get("SELECT * FROM alumnos WHERE clave_acceso = ?", [clave], (err, alumno) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error en el servidor.");
    }
    if (!alumno) {
      return res.status(401).send("Clave no válida.");
    }
    res.redirect(`/asientos.html?alumno_id=${alumno.id}`);
  });
});

// Ruta para obtener asientos y datos del alumno
app.get('/asientos', (req, res) => {
  const alumnoId = req.query.alumno_id;

  db.all("SELECT * FROM asientos", [], (err, asientos) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error en el servidor.");
    }

    db.get("SELECT * FROM alumnos WHERE id = ?", [alumnoId], (err2, alumno) => {
      if (err2) {
        console.error(err2);
        return res.status(500).send("Error en el servidor.");
      }

      res.json({ alumno, asientos });
    });
  });
});

// Ruta para reservar asientos
app.post('/reservar', express.json(), (req, res) => {
  const { alumno_id, asientos } = req.body;

  db.get("SELECT * FROM alumnos WHERE id = ?", [alumno_id], (err, alumno) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error en el servidor.");
    }
    if (!alumno) {
      return res.status(401).send("Alumno no encontrado.");
    }

    const disponibles = alumno.tope_lugares - alumno.lugares_usados;
    if (asientos.length > disponibles) {
      return res.status(400).send("Excediste tu límite de lugares.");
    }

    db.serialize(() => {
      const stmt = db.prepare("INSERT INTO reservas (id_alumno, id_asiento, id_funcion, fecha_reserva) VALUES (?, ?, 1, datetime('now'))");

      asientos.forEach(idAsiento => {
        stmt.run(alumno_id, idAsiento);
        db.run("UPDATE asientos SET estado = 'reservado' WHERE id = ?", [idAsiento]);
      });

      stmt.finalize();

      db.run("UPDATE alumnos SET lugares_usados = lugares_usados + ? WHERE id = ?", [asientos.length, alumno_id], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Error al actualizar alumno.");
        }
        res.send("¡Reservado correctamente!");
      });
    });
  });
});
// Ruta de vista para el administrador con clave
app.get('/admin', (req, res) => {
// Ruta para exportar las reservas como CSV
app.get('/exportar-csv', (req, res) => {
  const claveAdmin = req.query.clave;
  const buscar = req.query.buscar?.toLowerCase();

  if (claveAdmin !== 'crcadmin2024') {
    return res.status(401).send('Acceso denegado');
  }

  let query = `
    SELECT a.nombre AS alumno, a.clave_acceso, r.id_asiento, r.fecha_reserva
    FROM reservas r
    JOIN alumnos a ON r.id_alumno = a.id
  `;

  let params = [];

  if (buscar) {
    query += `
      WHERE LOWER(a.nombre) LIKE ? OR LOWER(a.clave_acceso) LIKE ?
    `;
    params.push(`%${buscar}%`, `%${buscar}%`);
  }

  query += ` ORDER BY r.fecha_reserva DESC`;

  db.all(query, params, (err, filas) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al generar CSV.");
    }

    let csv = 'Alumno,Clave de acceso,Asiento,Fecha de reserva\n';
    filas.forEach(f => {
      csv += `"${f.alumno}","${f.clave_acceso}","${f.id_asiento}","${f.fecha_reserva}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="reservas_crc.csv"');
    res.send(csv);
  });
});

  
const claveAdmin = req.query.clave;

  if (claveAdmin !== 'crcadmin2024') {
    return res.status(401).send('<h2>Acceso denegado. Clave incorrecta.</h2>');
  }

  const buscar = req.query.buscar?.toLowerCase();
let query = `
  SELECT a.nombre AS alumno, a.clave_acceso, COUNT(r.id_asiento) AS cantidad_asientos, 
         GROUP_CONCAT(r.id_asiento, ', ') AS asientos_reservados, 
         MAX(r.fecha_reserva) as ultima_reserva
  FROM reservas r
  JOIN alumnos a ON r.id_alumno = a.id
`;

let params = [];

if (buscar) {
  query += `
    WHERE LOWER(a.nombre) LIKE ? OR LOWER(a.clave_acceso) LIKE ?
  `;
  params.push(`%${buscar}%`, `%${buscar}%`);
}

query += `
  GROUP BY r.id_alumno
  ORDER BY ultima_reserva DESC
`;


  db.all(query, params, (err, filas) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error al obtener datos de reservas.");
    }

        let html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reservas del Teatro CRC</title>
        <style>
          body { font-family: Arial; padding: 20px; background: #f2f2f2; }
          table { border-collapse: collapse; width: 100%; background: white; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #3f51b5; color: white; }
          tr:hover { background-color: #f1f1f1; }
          h1 { color: #3f51b5; }

          #imprimir-btn {
  	#exportar-btn {
   	 display: inline-block;
   	 background-color: #2196f3;
   	 color: white;
   	padding: 10px 20px;
    	margin-left: 10px;
    	text-decoration: none;
   	 border-radius: 5px;
    	font-size: 16px;
  }

 	 #exportar-btn:hover {
  	  background-color: #1976d2;
  }

  @media print {
    #exportar-btn {
      display: none;
    }
  }

            background-color: #4caf50;
            color: white;
            border: none;
            padding: 10px 20px;
            margin-bottom: 20px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 5px;
          }

          @media print {
            #imprimir-btn {
              display: none;
            }
            body {
              background: white;
            }
          }
        </style>
      </head>
      <body>
        <h1>Reservas del Teatro CRC</h1>
	<form method="GET" action="/admin" style="margin-bottom: 20px;">
  <input type="hidden" name="clave" value="crcadmin2024">
  <input type="text" name="buscar" placeholder="Buscar por alumno o clave" style="padding: 8px; width: 250px;">
  <button type="submit" style="padding: 8px 12px;">🔍 Buscar</button>
</form>

<button id="imprimir-btn" onclick="window.print()">🖨️ Imprimir</button>
<a id="exportar-btn" href="#" onclick="exportarCSV()">📥 Exportar a Excel</a>

<script>
  function exportarCSV() {
    const params = new URLSearchParams(window.location.search);
    const buscar = params.get("buscar") || "";
    window.location.href = \`/exportar-csv?clave=crcadmin2024&buscar=\${encodeURIComponent(buscar)}\`;
  }
</script>



        <table>
          <tr>
            <th>Alumno</th>
            <th>Clave de acceso</th>
            <th>Cantidad de asientos</th>
            <th>Asientos</th>
            <th>Última reserva</th>
          </tr>
    `;

    filas.forEach(fila => {
      html += `
        <tr>
          <td>${fila.alumno}</td>
          <td>${fila.clave_acceso}</td>
          <td>${fila.cantidad_asientos}</td>
          <td>${fila.asientos_reservados}</td>
          <td>${fila.ultima_reserva}</td>
        </tr>
      `;
    });

    html += `
        </table>
      </body>
      </html>
    `;

    res.send(html);

  });
});
app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));