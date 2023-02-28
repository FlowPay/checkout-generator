export default function (record) {
	/*
        Esempio di struttura di un CSV custom: 
        
        Codice Fiscale/P.Iva; Causale; Data scadenza; Numero Rate; Importo Rata;....
        xxxxxx;xxxxxx;xxxxx;xxxxx;xxxxx;xxx
        xxxxxx;xxxxxx;xxxxx;xxxxx;xxxxx;xxx
        xxxxxx;xxxxxx;xxxxx;xxxxx;xxxxx;xxx

        "record" sarà dunque un oggetto di una lista 
        strutturato così:

        {
            Codice Fiscale/P.Iva: "xxxxx",
            Causale: "xxxxx",
            Data scadenza: "xxxxx",
            Numero Rat: "xxxxx",
            Importo Rata: "xxxxx",
            ....
        }
    */

	const numeroRate = parseFloat(record["Numero Rate"]);
	const importoRata = currencyToFloat(record["Importo Rata"]);
	const amount = parseFloat((numeroRate * importoRata).toFixed(2));
	const debtor = record["Codice Fiscale/P.Iva"];
	const remittance = `La mia causale: ${record["Causale"]}`;
	const date = new Date(record["Data scadenza"]).toISOString().split("T")[0]; // potrebbe esserci un errore nello script principale
	const creditorIban = "ITxxxxxxxxxx";

	/* altra logica ... */

	/* oggetto che lo script si aspetta di riceve*/
	return {
		recurring_info: recurringInfo,
		creditor_iban: creditorIban,
		vat_code: debtor,
		expire_date: date,
		amount: amount,
		remittance: remittance,
	};
}
