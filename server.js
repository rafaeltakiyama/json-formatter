const express = require('express');
const path = require('path');
const djson = require('dirty-json');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));

// 1. Função de limpeza de logs do Android/OkHttpClient
function cleanLogs(rawString) {
  return rawString
    .replace(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+\s+[\d-]+\s+[^\s]+\s+[A-Z]\s+/g, '')
    .replace(/\r?\n|\r/g, '');
}

// 2. Rota explicita para servir o index.html tanto com barra quanto sem barra no final
app.get(['/json-formatter', '/json-formatter/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. Servir os arquivos estáticos (CSS, JS, etc)
app.use('/json-formatter', express.static(path.join(__dirname, 'public')));

// 4. Rota da API
app.post('/json-formatter/api/process-json', (req, res) => {
  const { jsonString, action } = req.body;

  if (!jsonString || typeof jsonString !== 'string') {
    return res.status(400).json({ valid: false, error: 'String não fornecida.' });
  }

  let isValid = true;
  let parsedJson = null;
  let cleanedInput = cleanLogs(jsonString);

  try {
    parsedJson = JSON.parse(cleanedInput);
  } catch (strictError) {
    isValid = false;
    try {
      parsedJson = djson.parse(cleanedInput);
    } catch (fallbackError) {
      parsedJson = null;
    }
  }

  let result = '';

  if (parsedJson !== null) {
    result = action === 'minify' 
      ? JSON.stringify(parsedJson) 
      : JSON.stringify(parsedJson, null, 1);
  } else {
    result = cleanedInput;
  }

  return res.json({ valid: isValid, result });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});