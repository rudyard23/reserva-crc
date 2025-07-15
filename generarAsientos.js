const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./reserva.db');

function letraFila(index) {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (index < 26) return letras[index];
  return letras[Math.floor(index / 26) - 1] + letras[index % 26];
}

db.serialize(() => {
  db.run("DELETE FROM asientos", err => {
    if (err) {
      console.error("Error al borrar asientos anteriores:", err);
      return;
    }

    const filas = 40;
    const columnas = 25;
    let contador = 0;

    for (let f = 0; f < filas; f++) {
      const fila = letraFila(f);
      for (let c = 1; c <= columnas; c++) {
        db.run(
          "INSERT INTO asientos (fila, columna, estado) VALUES (?, ?, 'libre')",
          [fila, c],
          (err) => {
            if (err) console.error("Error insertando asiento:", err);
          }
        );
        contador++;
      }
    }

    console.log(`✅ Se generaron ${contador} asientos.`);
  });
});
