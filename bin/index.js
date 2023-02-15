#!/usr/bin/env node

import dotenv from "dotenv";
import axios from "axios";
import yargs from "yargs/yargs";
import process from "node:process";

import { readFileSync, existsSync, writeFile } from "node:fs";
import {
	buildNewFileName,
	currencyToFloat,
	yesterdayISOString,
} from "./utils.js";

const options = yargs(process.argv.slice(2))
	.usage("Usage: -p <path>")
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
		buildNewFileName(process.env.CSV_PATH, "generated"), // todo: implementare logica cambiare nome automaticamente
	okRedirect: options.okRedirect,
	nokRedirect: options.nokRedirect,
	baseUrlOauth: isDevelopment
		? process.env.BASE_URL_OAUTH
		: "https://app.flowpay.it/api/oauth",
	baseUrlOpenId: isDevelopment
		? process.env.BASE_URL_OPENID
		: "https://app.flowpay.it/api/openid",
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
		const getCoumnNames = dataPerRow.splice(0, 1)[0].split(";");
		const dataPerRowPerColumn = dataPerRow.map((row) => row.split(";"));

		console.log(`Leggo dati da ${config.csvPath}`);

		const arrayContentData = [];
		for (let i = 0; i < dataPerRowPerColumn.length; i++) {
			const c = dataPerRowPerColumn[i];
			const checkoutGenerated = await buildCheckout(
				c,
				i,
				tenantId,
				tokenType,
				accessToken,
				config.baseUrlCheckout,
				config.okRedirect,
				config.nokRedirect
			);

			arrayContentData.push(checkoutGenerated);
		}

		getCoumnNames.push("Riferimento checkout");
		getCoumnNames.push("Link riferimento checkout");

		const arrayContentGenerated = [getCoumnNames, ...arrayContentData];
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

async function buildCheckout(
	data,
	index,
	tenantId,
	tokenType,
	accessToken,
	baseUrlCheckout,
	okRedirect,
	nokRedirect
) {
	return new Promise(async function (resolve, reject) {
		try {
			const amount = currencyToFloat(data[3]);
			const creditorIBAN = data[6];
			const remittance = ""; // ??
			const debtor = data[0];
			const date = yesterdayISOString();

			const res = await axios({
				method: "get",
				url: `${config.baseUrlPlatform}/${tenantId}/businesses/current`,
				headers: {
					Authorization: `${tokenType} ${accessToken}`,
				},
			});

			const vatCode = res.data.vatCountryID + res.data.vatCode;

			console.log(`Generazione ${index}: Ottieni un fingerprint...`);

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
				},
			});

			const fingerprint = resTransfer.data.fingerprint;
			if (!fingerprint) {
				throw `Generazione ${index}: Errore! Non ho ottenuto il fingerprint`;
			}

			console.log(
				`Generazione ${index}: Fingerprint ottenuto con successo.`
			);

			console.log(`Generazione ${index}: Genera checkout...`);

			const resFinger = await axios({
				method: "post",
				url: `${config.baseUrlPlatform}/${tenantId}/checkout`,
				headers: {
					"content-type": "application/json",
					Authorization: `${tokenType} ${accessToken}`,
				},
				data: {
					fingerprint: fingerprint,
					nokRedirect: nokRedirect,
					okRedirect: okRedirect,
					type: "transfer",
				},
			});

			const codeInvoice = resFinger.data.code;
			const copyData = [
				...data,
				codeInvoice,
				`${baseUrlCheckout}/${codeInvoice}`,
			];

			console.log(`Generazione ${index}: Checkout generato!`);

			resolve(copyData);
		} catch (err) {
			reject(`Generazione ${index}: ${err.message}`);
		}
	});
}
