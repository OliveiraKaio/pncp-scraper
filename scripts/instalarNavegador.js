const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Instalando navegador...');
    await puppeteer.launch(); // Isso força a instalação do Chromium se não estiver disponível
    console.log('Navegador instalado com sucesso!');
  } catch (error) {
    console.error('Erro ao instalar o navegador:', error);
    process.exit(1);
  }
})();
