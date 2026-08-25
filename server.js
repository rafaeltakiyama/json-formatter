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

// Função para remover linhas de Log de bibliotecas (OkHttpClient, Logcat, etc)
function cleanLogs(rawString) {
  return rawString
    // Remove linhas de log do Android/OkHttpClient (ex: 2026-08-25 11:56:08.259 ... I 631)
    .replace(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d+\s+[\d-]+\s+[^\s]+\s+[A-Z]\s+/g, '')
    // Remove quebras de linha acidentais causadas pela intercalação de logs
    .replace(/\r?\n|\r/g, '');
}

app.post('/api/process-json', (req, res) => {
  const { jsonString, action } = req.body;

  if (!jsonString || typeof jsonString !== 'string') {
    return res.status(400).json({ valid: false, error: 'String não fornecida.' });
  }

  let isValid = true;
  let parsedJson = null;
  let cleanedInput = cleanLogs(jsonString); // 1. Aplica a limpeza de logs

  // 2. Tenta fazer a análise de um JSON rigorosamente Válido
  try {
    parsedJson = JSON.parse(cleanedInput);
  } catch (strictError) {
    isValid = false;
    // 3. Se falhar, utiliza o dirty-json no texto higienizado
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
    // Caso de falha total de parsing
    result = cleanedInput;
  }

  return res.json({ valid: isValid, result });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});