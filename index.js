const puppeteer = require('puppeteer');

const wait_ = (s) => new Promise((re, err) => {
    console.log(s)
    setTimeout(() => { console.log("done"); re(); }, s);
});

async function getTurmaData(page) {
  const table = await page.$("#gview_gridTurma > div.ui-jqgrid-bdiv");
  let rows = await table.$$("tr[role='row']");

  const jsonData = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowData = {};
    const cells = await row.$$("td[role='gridcell']");

    rowData.id = await cells[1].evaluate(node => node.textContent);
    rowData.cod_atividade = await cells[2].evaluate(node => node.textContent);
    rowData.atividade = await cells[3].evaluate(node => node.textContent);
    rowData.cod_turma = await cells[4].evaluate(node => node.textContent);
    rowData.matriculas_vagas = await cells[5].evaluate(node => node.textContent);
    rowData.nr_matricula_especial = await cells[6].evaluate(node => node.textContent);
    rowData.nr_total_matricula = await cells[7].evaluate(node => node.textContent);
    rowData.nr_total_vagas = await cells[8].evaluate(node => node.textContent);

    jsonData.push(rowData);
  }

  const jsonString = JSON.stringify(jsonData);

  console.log(jsonData);
  return jsonData;
}

async function getAlunosData(page, turma_id) {
  const table = await page.$("#gridTurma");
  let rows = await table.$$("tr[role='row']");

  const jsonData = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowData = {};
    const cells = await row.$$("td[role='gridcell']");

    rowData.id = await cells[0].evaluate(node => node.textContent);
    rowData.matricula = await cells[1].evaluate(node => node.textContent);
    rowData.nome = await cells[2].evaluate(node => node.textContent);
    rowData.curso = await cells[3].evaluate(node => node.textContent);
    rowData.especial = await cells[4].evaluate(node => node.textContent);
    rowData.situação = await cells[5].evaluate(node => node.textContent);
    rowData.vacina = await cells[6].evaluate(node => node.textContent);
    rowData.turma_id = turma_id;
    jsonData.push(rowData);
  }

  const jsonString = JSON.stringify(jsonData);

  console.log(jsonData);
  return jsonData;

}
  
require('dotenv').config();


(async () => {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // fazendo login
    await wait_(1000)
    await page.goto('https://cobalto.ufpel.edu.br/dashboard/');
    await page.type('#txtEmail', process.env.USUARIO);
    await page.type('#txtSenha', process.env.SENHA);
    await wait_(1000)
    await page.click('#btnEntrar');
    await wait_(500)

        // 
        await page.goto('https://cobalto.ufpel.edu.br/academico/relatorios/relatorioAlunosTurma');
        // clica em 'responder'
        await wait_(2500)
        await page.type('#searchcurso_id', "400 ");
        await wait_(2500)
        // executa o clique de seta para baixo
        await page.keyboard.press('ArrowDown');
        // executa o clique de enter
        await page.keyboard.press('Enter');
        await wait_(2500)

        var disciplinas = [];

        var isDisabled = await page.evaluate(() => {
          return document.querySelector('#next_gridTurmaPager').classList.contains('ui-state-disabled');
        });
        
        // inicia um loop para percorrer todas as páginas
        while (true) {
            await wait_(2500)
            // verifica se #next_gridTurmaPager inclue a classe ui-state-disabled
            
            
            
              await wait_(2500)
              // adiciona os itens do getTurmaData ao final do array disciplinas
              let temp = await getTurmaData(page);
              temp.shift();
              disciplinas = disciplinas.concat(temp);

              
              await page.click('#next_gridTurmaPager');
              
              isDisabled = await page.evaluate(() => {
                return document.querySelector('#next_gridTurmaPager').classList.contains('ui-state-disabled');
              });
              console.log(isDisabled);
              if (isDisabled)  break;
            }
          
        
        console.log("fim do loop");
        console.log(disciplinas);

        const axios = require('axios');

        // Loop para enviar as disciplinas para o PHP
        for (let i = 0; i < disciplinas.length; i++) {
          const disciplina = disciplinas[i];

          // Configuração da requisição POST
          const config = {
            headers: {
              'Content-Type': 'application/json'
            }
          };

          // Dados a serem enviados na requisição POST
          const data = {
            cod_atividade: disciplina.cod_atividade,
            atividade: disciplina.atividade,
            cod_turma: disciplina.cod_turma,
            matriculas_vagas: disciplina.matriculas_vagas,
            nr_matricula_especial: disciplina.nr_matricula_especial,
            nr_total_matricula: disciplina.nr_total_matricula,
            nr_total_vagas: disciplina.nr_total_vagas,
            id: disciplina.id
          };

          // Envia a disciplina para o PHP
          axios.post('http://localhost/API/cobalto/disciplinas/criar.php', data, config)
            .then((response) => {
              console.log(response.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }
        // salva o array disciplinas em um arquivo JSON
        var fs = require('fs');
        fs.writeFile("disciplinas.json", JSON.stringify(disciplinas), function(err) {
          if (err) {
            console.log(err);
          }
        });

        var alunos = [];
        var relação_alunos_disciplinas = [];

        // loop para pegar os alunos de cada disciplina
        for (let i = 0; i < disciplinas.length; i++) {
          const turma = disciplinas[i];
            await page.goto(`https://cobalto.ufpel.edu.br/academico/relatorios/relatorioAlunosTurma/visualizarTurma/${turma.id}`);
            await wait_(250)
            // adiciona os itens do getAlunosData ao final do array alunos
             let temp = await getAlunosData(page, turma.id);
             temp.shift();
             alunos = alunos.concat(temp);

            
        }
        console.log("fim do loop");
        console.log(alunos);

        // Loop para enviar os alunos para o PHP
        // Loop para enviar os alunos para o PHP
        for (let i = 0; i < alunos.length; i++) {
          const aluno = alunos[i];

          // Configuração da requisição POST
          const config = {
            headers: {
              'Content-Type': 'application/json'
            }
          };

          // Dados a serem enviados na requisição POST
          const data = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            curso: aluno.curso,
            especial: aluno.especial,
            situação: aluno.situação,
            vacina: aluno.vacina,
            id: aluno.id
          };

          // Envia o aluno para o PHP
          axios.post('http://localhost/API/cobalto/alunos/criar.php', data, config)
            .then((response) => {
              console.log(response.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }

        // salva o array alunos em um arquivo JSON
        fs.writeFile("alunos.json", JSON.stringify(alunos), function(err) {
          if (err) {
            console.log(err);
          }
        });

        // Loop para enviar as matriculas para o PHP
        for (let i = 0; i < alunos.length; i++) {
          await wait_(500)

          const aluno = alunos[i];

          // Configuração da requisição POST
          const config = {
            headers: {
              'Content-Type': 'application/json'
            }
          };

          // Dados a serem enviados na requisição POST
          const data = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            turma_id: aluno.turma_id
          };

          // Envia a matricula para o PHP
          axios.post('http://localhost/API/cobalto/alunos/matricular.php', data, config)
            .then((response) => {
              console.log(response.data);
            })
            .catch((error) => {
              console.log(error);
            });
        }

        await wait_(250000)
    await browser.close();

})();
