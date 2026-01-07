# Plano de Migração: Electron para Avalonia (C#)

## 1. Resumo do Projeto Atual

O projeto **VS Modpack Updater** é um aplicativo desktop desenvolvido para gerenciar e atualizar automaticamente modpacks para o jogo **Vintage Story**.

### Características Atuais (Electron/React)

* **Tech Stack:** Electron, Vite, React, TypeScript, TailwindCSS.
* **Funcionalidades Principais:**
  * Verificação de atualizações via manifesto remoto (Pastebin/GitHub Raw).
  * Download de pacotes `.zip` com barra de progresso.
  * Extração e instalação de mods no diretório do jogo.
  * Detecção se o jogo está em execução para evitar conflitos.
  * Interface UI moderna com ShadCN e temas customizados.
* **Lógica de Backend (Node.js):**
  * Gerenciamento de arquivos com `fs-extra`.
  * Requisições HTTP com `axios`.
  * Extração de ZIPs com `extract-zip`.
  * Comunicação IPC via canais (`check-update`, `start-update`).

---

## 2. Motivação para Migração

A migração para **Avalonia UI** (.NET 8/9 C#) visa:

1. **Performance Nativa:** Reduzir o consumo de memória (RAM) comparado ao Chromium/Electron.
2. **Tamanho do Executável:** Potencialmente menor, dependendo do modo de publicação (NativeAOT ou Trimming).
3. **Ecossistema .NET:** Facilidade de integração com APIs de sistema e lógica de manipulação de arquivos mais robusta (`System.IO`).
4. **Consistência:** Unificar a stack caso o desenvolvedor prefira C# para desenvolvimento desktop.

---

## 3. Pilha Tecnológica Sugerida (Target Stack)

* **Framework:** .NET 8 ou 9.
* **UI Framework:** Avalonia UI (XAML).
* **Arquitetura:** MVVM (Model-View-ViewModel).
* **Bibliotecas Recomendadas:**
  * **MVVM:** `CommunityToolkit.Mvvm` (Padrão de indústria, simples e poderoso).
  * **UI/Estilos:** `Semi.Avalonia` ou `FluentAvalonia` para componentes modernos e estética similar ao ShadCN/Tailwind.
  * **HTTP:** `System.Net.Http (HttpClient)`.
  * **Compressão:** `System.IO.Compression`.
  * **Processos:** `System.Diagnostics.Process` (Para checar se o jogo está rodando).
  * **Configuração:** `System.Text.Json` para persistência de configs.

---

## 4. Mapeamento de Funcionalidades e Arquitetura

| Funcionalidade | Electron (Atual) | Avalonia (.NET) |
| :--- | :--- | :--- |
| **Janela Principal** | `BrowserWindow` (main.js) | `Window` (MainWindow.axaml) |
| **Interface (UI)** | HTML/CSS (React + Tailwind) | XAML (Avalonia Controls + Styles) |
| **Estado da UI** | React State (`useState`) | ViewModels (`ObservableObject`) |
| **Comunicação** | IPC (Renderer <-> Main) | DataBinding / Services (Injeção de Dep.) |
| **Download** | `axios` (Stream) | `HttpClient` (Stream) |
| **Arquivos (Zip)** | `extract-zip` | `ZipFile.ExtractToDirectory` |
| **Detectar Jogo** | `tasklist` (exec) | `Process.GetProcessesByName("vintagestory")` |
| **Configurações** | JSON File (fs-extra) | JSON File (System.Text.Json) |

---

## 5. Plano de Execução da Migração

### Fase 1: Setup e Estrutura

1. Criar nova Solution Avalonia (`dotnet new avalonia.mvvm`).
2. Configurar injeção de dependências (opcional, mas recomendado).
3. Instalar pacotes NuGet (`CommunityToolkit.Mvvm`, `Semi.Avalonia` ou tema similar).
4. Copiar assets (ícones, imagens) da pasta `public` do Electron para `Assets` no Avalonia.

### Fase 2: Lógica de Backend (Services)

Criar classes de serviço para substituir o `electron/handlers/updater.js`:

* **`ConfigService.cs`**:
  * Ler/Salvar `config.json` em `%AppData%` ou local.
* **`GameProcessService.cs`**:
  * Monitorar se "VintageStory.exe" está rodando.
* **`UpdateService.cs`**:
  * Comparar versões (Local vs Remoto).
  * Baixar arquivo (com relatórios de progresso `IProgress<double>`).
  * Manipular arquivos (Backup/Limpeza e Extração).

### Fase 3: Interface do Usuário (UI)

* **MainWindow.axaml**:
  * Implementar layout "frameless" (estilo customizado de janela) para imitar o design atual.
  * Adicionar botões de controle de janela (Minimizar/Fechar).
* **Views/UserControls**:
  * Portar componentes do React para UserControls XAML.
  * Exemplo: Card de Status, Barra de Progresso, Botão de "Atualizar".
* **Theming**:
  * Aplicar estilos globais para cores, fontes e botões para igualar ao Tailwind.

### Fase 4: Integração de Funcionalidades

1. Conectar o `MainViewModel` aos serviços criados.
2. Vincular propriedades da ViewModel (Ex: `ProgressValue`, `StatusMessage`, `IsUpdateAvailable`) à View XAML.
3. Implementar comandos (`RelayCommand`) para os botões "Verificar Atualização" e "Instalar".

### Fase 5: Teste e Distribuição

1. Testar o fluxo completo de atualização em ambiente Windows.
2. Configurar publicação (`dotnet publish`) para gerar um executável único (SingleFile).
3. (Opcional) Criar instalador.

## 6. Exemplo de Código (UpdateService - C#)

```csharp
public async Task DownloadFileAsync(string url, string destination, IProgress<double> progress)
{
    using var client = new HttpClient();
    using var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
    
    var totalBytes = response.Content.Headers.ContentLength ?? -1L;
    var canReportProgress = totalBytes != -1 && progress != null;

    using var stream = await response.Content.ReadAsStreamAsync();
    using var fileStream = new FileStream(destination, FileMode.Create, FileAccess.Write, FileShare.None);
    
    var buffer = new byte[8192];
    var totalRead = 0L;
    int bytesRead;

    while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
    {
        await fileStream.WriteAsync(buffer, 0, bytesRead);
        totalRead += bytesRead;

        if (canReportProgress)
        {
            progress.Report((totalRead * 1d) / (totalBytes * 1d) * 100);
        }
    }
}
```

Este plano cobre todos os aspectos necessários para portar a aplicação mantendo a funcionalidade e melhorando a base técnica.
