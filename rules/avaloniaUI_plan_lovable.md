# Especificação de Front-End: VS Modpack Updater (Avalonia UI)

Este documento define os requisitos visuais e de interação para que a IA (Lovable.AI) gere uma interface moderna em **Avalonia UI (.NET)**, conectando-se ao Back-End existente.

## 1. Contexto Técnico

* **Framework:** Avalonia UI 11+ (.NET 8/9).
* **Padrão:** MVVM (Model-View-ViewModel).
* **Estilo:** Dark Mode Moderno (Recomendado: *Semi.Avalonia* ou *Fluent Theme*).
* **Arquivo Alvo:** `Views/MainWindow.axaml`.

---

## 2. Contrato de DataBinding (ViewModel)

A interface **DEVE** se conectar às seguintes propriedades e comandos já implementados no `MainWindowViewModel`.

### Propriedades (Estado)

| Propriedade | Tipo | Descrição | Uso na UI |
| :--- | :--- | :--- | :--- |
| `CurrentVersion` | `string` | Versão instalada localmente (ex: "1.0.0") | Labels de informação |
| `RemoteVersion` | `string` | Versão no servidor (ex: "1.2.0") | Labels de informação |
| `GamePath` | `string` | Caminho da pasta do jogo | Exibir em texto truncado |
| `News` | `string` | Notas da atualização (Changelog) | Exibir em `TextBlock` dentro de `ScrollViewer` |
| `StatusMessage` | `string` | Mensagem de status (ex: "Baixando...") | Exibir acima da barra de progresso |
| `ProgressValue` | `double` | Progresso atual (0 a 100) | Bind na `ProgressBar` |
| `IsBusy` | `bool` | Se o app está processando algo | Usar p/ desabilitar botões ou mostrar Spinner |
| `IsUpdateAvailable` | `bool` | Se há update pronto para instalar | Habilitar botão "Atualizar Agora" |

### Comandos (Ações)

| Comando | Descrição |
| :--- | :--- |
| `CheckForUpdatesCommand` | Verifica se há novas versões. |
| `StartUpdateCommand` | Inicia o download e instalação. |

---

## 3. Requisitos de Layout (UX)

A interface deve ser dividida em **3 áreas principais** (Grid ou DockPanel):

### A. Header (Topo)

* **Título:** "VS Modpack Updater".
* **Subtítulo:** "Gerenciador de Mods para Vintage Story".
* **Ícone:** Exibir logotipo do app.

### B. Área Central (Conteúdo)

Dividida em duas colunas ou painéis:

1. **Painel de Estado (Esquerda):**
    * Card com comparação visual: `Versão Atual` vs `Nova Versão`.
    * Exibição do `Caminho do Jogo`.
    * Botão secundário: "Verificar Novamente" (`CheckForUpdatesCommand`).
2. **Painel de Novidades (Direita):**
    * Caixa de texto com rolagem (ScrollViewer) para as notas da atualização (`News`).
    * Fundo levemente mais claro que o base para destaque.

### C. Footer (Ações e Feedback)

* **Barra de Progresso:** Deve ocupar toda a largura ou destaque central. Exibir apenas quando necessário ou sempre visível (0%).
* **Label de Status:** Texto centralizado informando o que está acontecendo (`StatusMessage`).
* **Botão de Ação Principal (CTA):** Botão grande "ATUALIZAR AGORA" (`StartUpdateCommand`).
  * Deve chamar atenção (cor de destaque/verde).
  * Só deve estar clicável se `IsUpdateAvailable` for `true`.

---

## 4. Diretrizes de Design (Vibe)

* **Tema:** Escuro (Dark), minimalista, "Tech/Gamer" mas limpo.
* **Cores:**
  * Fundo: `#1a1a1a` ou `#2d2d2d`.
  * Acento (Primary): Roxo ou Azul Neon.
  * Sucesso (Update Ready): Verde.
* **Feedback Visual:**
  * Usar transições suaves se possível.
  * Mostrar ícone de "Loading" quando `IsBusy` for true.
