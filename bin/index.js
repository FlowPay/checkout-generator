#!/usr/bin/env node

import dotenv from "dotenv";
import axios from "axios";
import yargs from "yargs/yargs";
import process from "node:process";

import { readFileSync, existsSync, writeFile } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "url";
import { progressBar } from "./loader.js";
import {
	buildNewFileName,
	currencyToFloat,
	yesterdayDate,
	dateToISOString,
	someValues,
} from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = yargs(process.argv.slice(2))
	.usage("Utilizzo: -p <path>")
	.example(
		'py-generator --p "<your_path_csv>" --i "<your_client_id>" --s "<your_client_secret>"'
	)
	.option("p", {
		alias: "path",
		describe: "Inserisci il csv path del file da cui generare i checkout",
		type: "string",
		demandOption: true,
	})
	.option("o", {
		alias: "pathOutput",
		describe:
			"Inserisci un path per output del csv generato. Se omesso sarà nella stessa cartella del file caricato.",
		type: "string",
	})
	.option("j", {
		alias: "pathMap",
		describe:
			"Inserisci il path del map.json per mappare i titoli di colonna custom (property field custom)",
		type: "string",
	})
	.option("r", {
		alias: "okRedirect",
		describe: "Configura un link per il redirect per checkout.",
		type: "string",
	})
	.option("n", {
		alias: "nokRedirect",
		describe:
			"Configura un link per il redirect nel caso non esegua con successo il checkout.",
		type: "string",
	})
	.option("i", {
		alias: "clientId",
		describe: "Configura il tuo client_id",
		type: "string",
	})
	.option("s", {
		alias: "clientSecret",
		describe: "Configura il tuo client_secret",
		type: "string",
	})

	// opstions mapping
	.option("v", {
		alias: "vatCode",
		describe: "Mappa nome della colonna di vat_code (Partita IVA)",
		type: "string",
	})
	.option("c", {
		alias: "creditorIban",
		describe: "Mappa nome della colonna di creditor_iban (Creditore IBAN)",
		type: "string",
	})
	.option("a", {
		alias: "amount",
		describe: "Mappa nome della colonna di amount (Importo)",
		type: "string",
	})
	.option("e", {
		alias: "expireDate",
		describe: "Mappa nome della colonna di expire_date (Data di scadenza)",
		type: "string",
	})
	.option("r", {
		alias: "remittance",
		describe: "Mappa nome della colonna di remittance (Causale)",
		type: "string",
	})
	.option("d", {
		alias: "codeInvoice",
		describe:
			"Mappa nome della colonna di code_invoice (Codice checkout **generato**)",
		type: "string",
	})
	.option("u", {
		alias: "urlCheckout",
		describe:
			"Mappa nome della colonna di url_checkout (Url checkout **generato**)",
		type: "string",
	})
	.option("ri", {
		alias: "recurringInfo",
		describe: "Mappa nome della colonna di recurring_info (Ricorrenza)",
		type: "string",
	}).argv;

// read in .env
dotenv.config();

const isDevelopment = process.env.NODE_ENV === "development";

const config = {
	clientId: options.clientId ?? process.env.CLIENT_ID,
	clientSecret: options.clientSecret ?? process.env.CLIENT_SECRET,
	csvPath: options.path ?? process.env.CSV_PATH,
	csvPathOutput:
		options.pathOutput ??
		buildNewFileName(options.path, "generated") ??
		buildNewFileName(process.env.CSV_PATH, "generated"),
	okRedirect: options.okRedirect,
	nokRedirect: options.nokRedirect,

	// Mapping
	// le filed devono corrispondere al mapping del json
	// quindi: vat_code, creditor_iban, expire_date...
	mapField: {
		vat_code: options.vatCode,
		creditor_iban: options.creditorIban,
		amount: options.amount,
		expire_date: options.expireDate,
		remittance: options.remittance,
		code_invoice: options.codeInvoice,
		url_checkout: options.urlCheckout,
		recurring_info: options.recurringInfo,
	},

	// or path mapping
	mapPath: isDevelopment
		? process.env.MAP_PATH
		: options.pathMap ?? join(__dirname, "..", "map.json"),

	// baseUrl
	baseUrlOauth: isDevelopment
		? process.env.BASE_URL_OAUTH
		: "https://core.flowpay.it/api/oauth",
	baseUrlOpenId: isDevelopment
		? process.env.BASE_URL_OPENID
		: "https://core.flowpay.it/api/openid",
	baseUrlPlatform: isDevelopment
		? process.env.BASE_URL_PLATFORM
		: "https://app.flowpay.it/api",
	baseUrlCheckout: isDevelopment
		? process.env.BASE_URL_CHECKOUT
		: "https://checkout.flowpay.it",
	baseUrl: isDevelopment
		? process.env.BASE_URL
		: "https://app.flowpay.it/api",
};

console.log("####", config.mapPath);

// Validazione dati inseriti

if (!config.clientId || !config.clientSecret) {
	console.log("Attenzione! Non ho il client id o il client secret");
	process.exit(0); // exit process
}

if (!existsSync(config.csvPath)) {
	throw `Errore! Non esiste il file nel path ${config.csvPath}`;
}

if (!/^.*\.(csv)$/gi.test(config.csvPathOutput)) {
	throw `Errore! Il file di output impostato o generato non è valido: ${config.csvPathOutput}`;
}

if (!/^.*\.(csv)$/gi.test(config.csvPath)) {
	throw "Errore! Il file richiesto non è supportato, deve essere un csv.";
}

if (
	config.mapPath &&
	(!existsSync(config.mapPath) || !/^.*\.(json)$/gi.test(config.mapPath))
) {
	throw "Errore! Il file richiesto non esiste o non è supportato, deve essere un json.";
}

console.log("Richiseta di autenticazione...");

axios({
	method: "post",
	url: `${config.baseUrlOauth}/token`,
	headers: { "content-type": "application/x-www-form-urlencoded" },
	data: {
		client_id: config.clientId,
		client_secret: config.clientSecret,
		scope: "transfer:read transfer:write business:read",
		grant_type: "client_credentials",
	},
}).then((res) => {
	if (res.status !== 200) {
		throw "Authentication broken";
	}

	console.log("Autenticato!");

	const accessToken = res.data.access_token;
	const tokenType = res.data.token_type;

	console.log("Richiesta tentand id...");

	axios({
		method: "post",
		url: `${config.baseUrlOpenId}/token/introspection`,
		headers: {
			"content-type": "application/x-www-form-urlencoded",
		},
		data: {
			token: accessToken,
		},
	}).then(async (res) => {
		if (res.status !== 200) {
			throw "Errore";
		}

		const tenantId = res.data.tenant_id ?? res.data.business_id;

		const dataFile = readFileSync(config.csvPath, {
			encoding: "UTF-8",
		});

		const dataPerRow = dataFile.split(/\r?\n/);
		const columnNames = dataPerRow.splice(0, 1)[0].split(";");
		const columnNamesCopied = [...columnNames];
		const dataPerRowPerColumn = dataPerRow.map((row) => row.split(";"));

		const rawdata = readFileSync(config.mapPath);
		const mapField = JSON.parse(rawdata);

		for (const name in mapField) {
			const i = columnNames.indexOf(mapField[name]);
			if (i > -1) columnNames[i] = name;
			else columnNames.push(name);
		}

		if (someValues(config.mapField)) {
			// se ci sono dati in mapField
			for (const field in config.mapField) {
				const name = config.mapField[field];
				if (name) {
					const index = columnNames.indexOf(name);
					columnNames[index] = field;
				}
			}
		}

		const records = dataPerRowPerColumn.map((r) =>
			columnNames.reduce((o, key, i) => ({ ...o, [key]: r[i] }), {})
		);

		console.log(`Leggo dati da ${config.csvPath}`);
		const arrayRecordData = [];

		let index = 0;
		progressBar(records.length, index, "Stiamo generando ");

		for (const i in records) {
			const record = records[i];
			const checkoutGenerated = await buildCheckout(
				record,
				i,
				tenantId,
				tokenType,
				accessToken,
				config
			);

			arrayRecordData.push(checkoutGenerated);

			index++;
			progressBar(records.length, index, "Stiamo generando ");
		}

		process.stdout.write("\r\n");

		columnNamesCopied.push(config.code_invoice ?? mapField["code_invoice"]);
		columnNamesCopied.push(config.url_checkout ?? mapField["url_checkout"]);

		// const arrayContentData = arrayRecordData.map((v) => Object.values(v));

		const arrayContentGenerated = [
			columnNamesCopied,
			...arrayRecordData.map((v) => Object.values(v)),
		];

		const listContent = arrayContentGenerated.map((m) => m.join(";"));
		const newContentCsv = `${listContent.join("\r\n")}`;

		writeFile(config.csvPathOutput, newContentCsv, (err) => {
			if (err) throw err;
			console.log(
				`Checkout generati con successo in ${config.csvPathOutput}`
			);
		});
	});
});

async function buildCheckout(data, index, tenantId, tokenType, accessToken) {
	return new Promise(async function (resolve, reject) {
		try {
			// todo: aggiungere un assert valori

			if (data.expire_date && Date.parse(data.expire_date) == 0) {
				throw "Errore! Il formato della data non è corretto. Formato corretto YYYY-MM-DD HH:mm:ss oppure YYYY-MM-DDTHH:mm:ss";
			}

			const amount = currencyToFloat(data.amount);
			const creditorIBAN = data.creditor_iban;
			const remittance = data.remittance;
			const debtor = data.vat_code;
			const recurringInfo = data.recurring_info
				? parseInt(data.recurring_info)
				: 0;
			const date = data.expire_date
				? dateToISOString(new Date(data.expire_date))
				: dateToISOString(yesterdayDate());

			const res = await axios({
				method: "get",
				url: `${config.baseUrlPlatform}/${tenantId}/businesses/current`,
				headers: {
					Authorization: `${tokenType} ${accessToken}`,
				},
			});

			const vatCode = res.data.vatCountryID + res.data.vatCode;

			// console.log(`Generazione ${index}: Ottieni un fingerprint...`);

			const resTransfer = await axios({
				method: "post",
				url: `${config.baseUrlPlatform}/${tenantId}/transfers`,
				headers: {
					"content-type": "application/json",
					Authorization: `${tokenType} ${accessToken}`,
				},
				data: {
					amount: amount,
					creditor: vatCode,
					creditorIBAN: creditorIBAN,
					remittance: remittance,
					debtor: debtor,
					date: date,
					recurringInfo:
						recurringInfo > 1
							? {
									installments: recurringInfo,
									frequency: "monthly",
							  }
							: null,
				},
			});

			const fingerprint = resTransfer.data.fingerprint;
			if (!fingerprint) {
				throw `Errore! Non ho ottenuto il fingerprint`;
			}

			// console.log(
			// 	`Generazione ${index}: Fingerprint ottenuto con successo.`
			// );

			// console.log(`Generazione ${index}: Genera checkout...`);

			const resFinger = await axios({
				method: "post",
				url: `${config.baseUrlPlatform}/${tenantId}/checkout`,
				headers: {
					"content-type": "application/json",
					Authorization: `${tokenType} ${accessToken}`,
				},
				data: {
					fingerprint: fingerprint,
					nokRedirect: config.nokRedirect,
					okRedirect: config.okRedirect,
					type: "transfer",
				},
			});

			const codeInvoice = resFinger.data.code;
			if (!codeInvoice)
				throw "Errore! Non è stato generato il code_invoice";

			let copyData = Object.assign({}, data);
			copyData["code_invoice"] = codeInvoice;
			copyData[
				"url_checkout"
			] = `${config.baseUrlCheckout}/${codeInvoice}`;

			// console.log(`Generazione ${index}: Checkout generato!`);

			resolve(copyData);
		} catch (err) {
			reject(`Generazione ${index}: ${err}`);
		}
	});
}
