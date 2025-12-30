# Manual do VS TarValon Updater

O sistema está 100% configurado para funcionar com GitHub Releases.

## 📦 Como Gerar o Instalador (Build Final)

1.  Abra o terminal na pasta do projeto.
2.  Execute o comando:
    ```powershell
    npm run build
    ```
3.  Aguarde 1 a 2 minutos.
4.  Abra a pasta `dist-build`.
    -   Enviar para os jogadores: `TarValon Modpack Updater Setup 1.0.0.exe`

## 🔄 Como Lançar uma Atualização (Futuro)

Quando você quiser atualizar os mods para todos os jogadores:

1.  Zipe os novos mods em um arquivo chamado `mods.zip` (Tamanho máximo: 2GB).
2.  Vá no GitHub -> Releases -> **Create a new release** (ex: `v1.0.2`).
3.  Faça upload do novo `mods.zip`.
4.  Edite o arquivo `manifest.json` no seu Git (pode ser pelo site mesmo):
    -   Mude `"version": "1.0.2"`
    -   Mude `"downloadUrl": ".../releases/download/v1.0.2/mods.zip"`
    -   Mude `"news": "Novos mods adicionados!"`
5.  Pronto! Quem abrir o App vai ver o botão **ATUALIZAR**.

## ⚙️ Teste Local (Desenvolvimento)
Para testar alterações no código (visual, cores, etc):
```powershell
npm run dev
```
