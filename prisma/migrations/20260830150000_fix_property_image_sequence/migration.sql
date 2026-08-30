-- Mantem a sequencia das fotografias alinhada aos registros existentes.
-- Isso evita conflito de chave primaria ao cadastrar novas imagens apos
-- importacoes que preservaram identificadores antigos.
SELECT setval(
  pg_get_serial_sequence('"PropertyImage"', 'id'),
  COALESCE(
    (SELECT MAX("id") FROM "PropertyImage"),
    1
  ),
  EXISTS(
    SELECT 1 FROM "PropertyImage"
  )
);
