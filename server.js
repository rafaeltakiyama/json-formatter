const express = require('express');
const path = require('path');
const djson = require('dirty-json');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/process-json', (req, res) => {
  const { jsonString, action } = req.body;

  if (!jsonString || typeof jsonString !== 'string') {
    return res.status(400).json({ valid: false, error: 'String JSON não fornecida.' });
  }

  let isValid = true;
  let parsedJson = null;
  let result = '';

  try {
    parsedJson = JSON.parse(jsonString);
  } catch (strictError) {
    isValid = false;
    try {
      parsedJson = djson.parse(jsonString);
    } catch (fallbackError) {
      parsedJson = null;
    }
  }

  if (parsedJson !== null) {
    result = action === 'minify' 
      ? JSON.stringify(parsedJson) 
      : JSON.stringify(parsedJson, null, 1); // 1 espaço para máxima densidade vertical
  } else {
    result = jsonString;
  }

  return res.json({ valid: isValid, result });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});