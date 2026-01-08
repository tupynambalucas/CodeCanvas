# Workspace de Temas do CodeCanvas

Este workspace é dedicado à criação e gerenciamento dos temas para a extensão CodeCanvas. Ele utiliza um sistema de templates e um script de build para automatizar a geração de arquivos de tema e sua integração com o VS Code.

## 🏗️ Estrutura do Workspace

O workspace está localizado na pasta `themes/` e possui a seguinte organização:

-   **`themes/package.json`**: Gerencia as dependências e os scripts de build (`build`, `dev`) específicos para o workspace de temas.
-   **`themes/build.mjs`**: O motor de compilação. Este script processa os arquivos de tema, os mescla com templates base e atualiza o `package.json` principal da extensão com as novas contribuições de tema.
-   **`themes/src/templates/`**: Contém os arquivos JSON base (`dark-template.json`, `light-template.json`). Eles definem a estrutura e as cores padrão para cada tipo de tema, servindo como a "fonte da verdade" para a aparência geral.
-   **`themes/src/defaults/`**: Onde os temas customizados são definidos. A estrutura de pastas (ex: `anime/bleach/`) é usada para categorizar os temas, e cada tema é um arquivo `...-theme.json` que especifica suas customizações.

## 🎨 Fluxo de Desenvolvimento

O desenvolvimento de um novo tema é feito criando um arquivo de definição JSON que sobrescreve um template base. O script de build cuida da mesclagem e do registro do tema.

**1. Criar o Arquivo de Definição do Tema**

Crie um arquivo `<nome-do-tema>-theme.json` dentro da estrutura de pastas de `themes/src/defaults/`. A nomenclatura e a localização são importantes para o script de build.

*Exemplo de caminho:* `themes/src/defaults/anime/bleach/themes/yoruichi_dark.purple-theme.json`

**2. Configurar as Cores e Propriedades**

Dentro do seu arquivo JSON, defina as propriedades do tema. Você deve especificar um `template` base (`dark` ou `light`) e então sobrescrever `colors`, `tokenColors`, e adicionar a configuração de plano de fundo `backgroundConfig`.

*Exemplo (`yoruichi_dark.purple-theme.json`):*

```json
{
  "template": "dark",
  "colors": {
    "editor.background": "#0f0f0f",
    "activityBar.background": "#ff00ff",
    "panel.background": "#290133"
  },
  "tokenColors": [],
  "backgroundConfig": {
    "editor": {
      "images": [
        "https://res.cloudinary.com/deqmqcdww/image/upload/v1767592000/karmets_biohtu.png"
      ],
      "style": {
        "opacity": 0.2
      }
    }
  }
}
```

O script de build irá mesclar essas configurações com o `dark-template.json` para gerar o arquivo de tema completo.

## 🔨 Scripts Disponíveis

No **diretório raiz do projeto**, você pode gerenciar os temas através dos seguintes scripts do `package.json`:

-   `npm run themes:build`: Compila todos os temas definidos em `themes/src/defaults`. Ele gera os arquivos de tema finais na pasta `src/themes/` e atualiza automaticamente as contribuições de temas no `package.json` principal.
-   `npm run themes:dev`: Inicia o script de build em modo de observação (`watch`), recompilando os temas automaticamente sempre que um arquivo `...-theme.json` é modificado.

## ❓ Perguntas Frequentes

**P: Por que existe um passo de "build" para os temas?**

**R:** O script de build (`themes:build.mjs`) automatiza duas tarefas cruciais:
1.  **Mesclagem de Templates:** Ele combina um tema customizado (ex: `yoruichi_dark.purple-theme.json`) com um template base (`dark-template.json`). Isso evita a repetição de centenas de cores padrão em cada novo tema, tornando a criação muito mais simples e rápida.
2.  **Registro Automático:** Ele analisa a estrutura de pastas e os nomes dos arquivos para gerar IDs únicos e, em seguida, atualiza a seção `contributes.themes` no `package.json` da raiz do projeto. Isso garante que o VS Code reconheça todos os temas gerados sem a necessidade de registro manual.

**P: O que acontece se eu editar os arquivos em `(root)/src/themes/`?**

**R:** **Não edite os arquivos nessa pasta.** Eles são gerados automaticamente pelo script de build. Qualquer alteração manual será perdida na próxima vez que o script `themes:build` for executado (o que acontece, por exemplo, ao compilar a extensão). Sempre edite os arquivos de origem dentro do workspace `themes/src/defaults/`.

**P: Como adicionar um novo tema?**

**R:** Siga estes passos:
1.  Crie a estrutura de pastas para seu tema, se necessário, dentro de `themes/src/defaults/` (ex: `themes/src/defaults/games/cyberpunk/`).
2.  Dentro da pasta `themes` do seu novo tema, crie um arquivo de definição, como `my-new-theme-theme.json`.
3.  Configure seu tema, especificando o `template` e as customizações de `colors`, `tokenColors` e `backgroundConfig`.
4.  Rode `npm run themes:build` na raiz do projeto.
5.  O script irá gerar o arquivo final em `src/themes/` e registrá-lo no `package.json` principal, pronto para ser usado.
