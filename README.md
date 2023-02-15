# Checkout Generator 🧬

**Checkout Generator** è uno script in node.js che può generare una lista di checkout da un CSV, integrato perfettamente con le api di [Flowpay](https://www.flowpay.it/).

## Requisiti

Requisiti necessari per eseguire lo script node 
- [Node](https://nodejs.org/)
- **Client_id** (generato [Flowpay](https://www.flowpay.it/))
- **Client_secret** (generato sempre da [Flowpay](https://www.flowpay.it/))
- File CSV da [esempio](./example/esempio.csv)

## Installazione

Usa il package manager [npm](https://www.npmjs.com/) per installare **Checkout Generator**.

```sh
# clona la repository oppure scarica la zip
git clone https://github.com/FlowPay/checkout-generator.git

# apri la cartella della repo appena scaricata 
cd checkout-generator

# installa il pacchetto globale
npm install -g
```

Se ancora non hai il client di e il client secret, puoi generarli dalla piattaforma di sviluppo dedicata [Flowpay](https://app.flowpay.it/). 

Puoi impostare le due chiavi come variabile ambiente oppure come parametro script. Per variabile ambiente segui queste istruzioni.

```sh

# [facoltativo] imposta le variabili di ambiente clientId e clientSecret

# inserisci il tuo client id al posto di <your_client_id>
export CLIENT_ID=<your_client_id>

# inserisci il tuo client secret al posto di <your_client_secret>
export CLIENT_SECRET=<your_client_secret>
```

Per windows invece segui queste [istruzioni](https://phoenixnap.com/kb/windows-set-environment-variable).


## Utilizzo

È importante sapere che oltre alle chiavi utili per accedere alle api di **flowpay** è necessario impostare un input path del csv da cui generare il ceckout. Oltre al parametro di input è possibile impostare il path output per scegliere il nome e la directory del csv generato, se si desidera generare nella stessa cartella non importare alcun parametro di output. Vedi gli esempi qui.

```sh
# esegui questa istruzione con chiavi impostate nella variabile di ambiente 
fpy-generator --p "<your_path_csv>"

# esegui quest istruzione per impostare oltre all'input un output path per la generazione del csv finale
fpy-generator --p "<your_path_csv>" --o "<your_path_output_csv>"

# esegui script impostando le chiavi come parametro se non sono come variabile ambiente
fpy-generator --p "<your_path_csv>" --i "<your_client_id>" --s "<your_client_secret>"
```

## Opzioni

Lo script è in grado di accettare alre opzioni per esempio il link di redirect di un checkout. Qui tutte le opzioni che accetta lo script.

| Parametri   | Alias | Descrizione | Tipo |
| ----------- | ----- | ----------- | ---- |
| -p | --path | Inserisci il csv path del file da cui generare i checkout | string |
| -o | --pathOutput | Inserisci un path per output del csv generato. Se omesso sarà nella stessa cartella del file caricato. | string |
| -r | --okRedirect | Configura un link per il redirect per checkout. | string |
| -n | --nokRedirect | Configura un link per il redirect nel caso non esegua con successo il checkout. | string |
| -i | --clientId | Configura il tuo client_id. | string |
| -s | --clientSecret | Configura il tuo client_secret. | string |
