# Checkout Generator SDK

**Checkout Generator SDK** è una libreria per generare checkout con [Flowpay](https://www.flowpay.it/).

## Requisiti

Requisiti necessari per usare la libreria

-   [npm](https://nodejs.org/)
-   **Client_id** (generato [Flowpay](https://www.flowpay.it/))
-   **Client_secret** (generato sempre da [Flowpay](https://www.flowpay.it/))

## Struttura

-   [Checkout](#quick-start-checkout)
-   [CSV](#csv)
-   [Mapping](#mapping)

## Installazione

Usa il package manager [npm](https://www.npmjs.com/) per installare **Checkout Generator SDK**.

```sh
# installa il pacchetto nel tuo progetto
npm install --save @flowpay/checkout-generator
```

Se ancora non hai il client di e il client secret, puoi generarli dalla piattaforma di sviluppo dedicata [Flowpay](https://app.flowpay.it/).

## Quick start Checkout

Per generare dei checkout è sufficiente istanziare la classe `Checkout` con i dati richiesti.

```ts
import { Checkout } from "@flowpay/checkout-generator";
import { ITransferInput } from "@flowpay/checkout-generator/models";

const transfer: ITransferInput = {
	amount: 0.01, // importo
	creditorIban: "creditor_iban", // iban del creditore
	creditor: "creditor", // codice fiscale o partita iva del creditore
	date: new Date(), // data di scadenza
	debtor: "vat_code", // codice fiscale o partita iva del debitore
	remittance: "remittance", // casuale
	recurringInfo: new RecurringInfo(numeroRicorrenze), // se ci sono, ricorrenze del piano
};

const newCheckout = new Checkout(
	transfer,
	"toke_type",
	"access_token",
	"tenant_id",
);

const checkoutGenerated = await newCheckout.build();

/* Dunque checkoutGenerated avrà 

export interface ICheckoutOutput {
	codeInvoice: string; // codice fattura
	url: string; // url del checkout
	fingerprint: string; // chiave di riferimento checkout
}

*/
```

> Se non possiedi i dati richiesti segui questi passaggi [Token](#token-type-e-access-token) e [Tenant](#tenant-id).

### Token Type e Access Token

Per ottenere le chiavi di accesso puoi seguire dalla [documentazione](https://docs.flowpay.it/#section/Autenticazione/Autenticazione-con-client-credentials) api Flowpay oppure segui queste indicazioni.

```ts
import { Http } from "@flowpay/checkout-generator/utils";

const http = new Http();
const scope = "transfer:read transfer:write business:read";
const token = await http.token(
	"CLIENT_ID",
	"CLIENT_SECRET",
	scope,
	"client_credentials",
);

/* token avrà 
 {
        "access_token": "<access_token>",
        "token_type": "bearer",
        "expires_in": 3600,
        "scope": "<scope>"
    }
*/
```

La funzione `token(...)` inoltre imposta le chiavi necessarie per l'autenticazione per le richieste `post` e `get` future.

### Tenant Id

Per ottenere il tenant id è sufficiente chiamare l'api introspetion (vedi [documentazione](https://docs.flowpay.it/#section/TenantID) api Flowpay) oppure scrivi questo codice sostituendo i dati utili.

```ts
import { Http } from "@flowpay/checkout-generator/utils";

const url = "https://core.flowpay.it/api/openid/token/introspection";
const headers = { "content-type": "application/x-www-form-urlencoded" };
const data = { token: "access_token" };
const intro = await http.post(url, headers, data, false);

const tenantId = intro.data.tenant_id
	? intro.data.tenant_id
	: intro.data.business_id;

/*
	tenant id sarà una chiave di riferimento del tuo business
*/
```

## CSV

Se desideri generare dei checkout da csv, puoi usufruire della libreria `CSV`come da questo codice.

```ts
import { CSV } from "@flowpay/checkout-generator";

// carica e leggi il contenuto del tuo csv in base alla
// client di utilizzo, se node.js readFile()
// se da DOM new FileReader()

const csv = new CSV(rawData /* contenuto string del csv */);
const { columnNames, datas } = csv.extract();

// oppure se ti aspetti di ricevere
// un oggetto puoi usare CSVT
const csv = new CSVT<T>(rawData /* contenuto string del csv */);
const { columnNames, datas } = csv.extract();

/*
	il risultato di extract è un oggetto 
	{
		columnNames, // array con i titoli delle colonne
		rowDatas, // array di array di dati riga per colonna 
		datas, // array di oggetto ricostruito
	}
*/

// per ricostruire il csv puoi scrivere questo codice
const newContentCsv = csv.buildContentCsv(datas, columnNames);

/*
	newContentCsv sarà una string da poter scrivere in un file csv
*/
```

## Mapping

È possibile mappare le colonne del proprio csv utilizzando una struttura JSON.
Di default la configurazione è questa ed è presente nel file [map.json](map.json)

```json
{
	"vat_code": "Partita Iva",
	"amount": "Importo",
	"expire_date": "Data di scadenza",
	"creditor_iban": "Creditore IBAN",
	"remittance": "Causale",
	"code_invoice": "Riferimento checkout",
	"url_checkout": "Link riferimento checkout",
	"recurring_info": "Ricorrenze"
}
```

> NB. Il valore che modificherai dovrà essere equivalente con il nome della colonna da mappare.

Per utilizzare questa funzione della libreria segui questo codice.

```ts
import { Mapping } from "@flowpay/checkout-generator/utils";

const mapField = { "...": "..." }; // struttura json da mappare con nel esempio qui sopra di map.json
const mapping = new Mapping(mapField);

// mappa la key con value
const records = mapping.to(
	datas /* oggetto estratto dal csv con la libreria CSV */,
);

// viceversa
const records = mapping.from(
	datas /* oggetto estratto dal csv con la libreria CSV */,
);

// nel caso uso di due map da unire in una
const newMapField = mapping.merge(
	{ "...": "..." },
	{ "...": "..." }, // struttura json da mappare con nel esempio qui sopra di map.json,
);
```
