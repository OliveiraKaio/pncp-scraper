const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');

const modoTeste = true;

async function coletarTodosEditais() {
  const dataHoje = dayjs().format('YYYY-MM-DD');
  const pastaDestino = path.join(__dirname, '..', 'dados', dataHoje);

  await fs.ensureDir(pastaDestino);
  const resultados = [];
  let pagina = 1;
  const maxPaginas = modoTeste ? 3 : 9999;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
  });

  while (pagina <= maxPaginas) {
    const url = `https://pncp.gov.br/app/editais?pagina=${pagina}`;
    console.log(`Coletando página ${pagina}...`);

    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000
      });

      // Verifica status HTTP
      if (!response || !response.ok()) {
        throw new Error(`Status HTTP inválido: ${response?.status()}`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const editais = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('a.br-item'));
        return cards.map(card => {
          const texto = card.innerText;
          const titulo = texto.match(/Edital nº\s+(.+?)\n/)?.[1]?.trim();
          const idPNCP = texto.match(/Id contratação PNCP:\s*(.+?)\n/)?.[1]?.trim();
          const modalidade = texto.match(/Modalidade da Contratação:\s*(.+?)\n/)?.[1]?.trim();
          const ultimaAtualizacao = texto.match(/Última Atualização:\s*(\d{2}\/\d{2}\/\d{4})/)?.[1];
          const orgao = texto.match(/Órgão:\s*(.+?)\n/)?.[1]?.trim();
          const local = texto.match(/Local:\s*(.+?)\n/)?.[1]?.trim();
          const objeto = texto.match(/Objeto:\s*(.+)/)?.[1]?.trim();
          const href = card.getAttribute('href');

          return {
            titulo,
            idPNCP,
            modalidade,
            ultimaAtualizacao,
            orgao,
            local,
            objeto,
            linkDetalhe: 'https://pncp.gov.br' + href
          };
        });
      });

      if (!editais || editais.length === 0) {
        console.log('Nenhum edital encontrado nesta página.');
        break;
      } else {
        resultados.push(...editais);
      }

      pagina++;
    } catch (err) {
      console.error(`Erro na página ${pagina}:`, err.message);
      break;
    }
  }

  await browser.close();

  const caminhoFinal = path.join(pastaDestino, 'editais_lista.json');
  await fs.writeJson(caminhoFinal, resultados, { spaces: 2 });
  console.log(`Coleta finalizada. Total de editais: ${resultados.length}`);
  console.log(`Salvo em: ${caminhoFinal}`);
}

coletarTodosEditais();
