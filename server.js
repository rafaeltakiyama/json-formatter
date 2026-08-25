const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// ROTA RAIZ EXPLÍCITA (Garante que o index.html seja entregue)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota da API
app.post('/api/process-json', (req, res) => {
  const { jsonString, action } = req.body;

  if (!jsonString || typeof jsonString !== 'string') {
    return res.status(400).json({ valid: false, error: 'String JSON não fornecida.' });
  }

  try {
    const parsedJson = JSON.parse(jsonString);
    const result = action === 'minify' 
      ? JSON.stringify(parsedJson) 
      : JSON.stringify(parsedJson, null, 2);

    return res.json({ valid: true, result });
  } catch (error) {
    return res.status(400).json({ valid: false, error: `JSON Inválido: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});