# Instruções de Instalação e Configuração

Este guia fornece instruções sobre como instalar e configurar o script em Node.js que utiliza Puppeteer para automatizar a extração de dados do cobalto. Certifique-se de seguir as etapas a seguir para garantir que o script funcione corretamente.

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes pré-requisitos instalados no seu sistema:

1. Node.js: Certifique-se de ter o Node.js instalado no seu computador. Você pode baixá-lo em [nodejs.org](https://nodejs.org/).

2. NPM (Node Package Manager): O NPM é geralmente instalado automaticamente com o Node.js.

## Passos de Instalação e Configuração

Siga as etapas a seguir para instalar e configurar o script:

1. Clone ou baixe o repositório que contém o script para o seu computador.

2. Abra um terminal ou prompt de comando e navegue até o diretório onde o script está localizado.

3. Execute o seguinte comando para instalar as dependências necessárias listadas no arquivo `package.json`:

```bash
npm install
```

4. Crie um arquivo chamado `.env` no mesmo diretório do script para armazenar suas credenciais. O arquivo `.env` deve ter o seguinte formato:

```plaintext
USUARIO=seu-usuario
SENHA=sua-senha
```

Substitua `seu-usuario` e `sua-senha` pelos seus dados de login no cobalto.

5. Execute o script com o seguinte comando:

```bash
node index.js
```

6. O script automatizará o processo de extração de dados do site. Certifique-se de que o site esteja acessível e funcionando corretamente durante a execução do script.

Após seguir essas etapas, o script deverá funcionar e extrair dados do site, enviando-os para a API conforme configurado.
