#!/usr/bin/env node

import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// @ts-ignore-start
import axios from "../node_modules/axios/lib/axios.js";
import chalk from "../node_modules/chalk/source/index.js";
import yargs from "yargs/yargs";
import dotenv from "dotenv";
//@ts-ignore-end

import { buildContentCsv, buildNewFileName, csvExtract } from "./utils/csv.js";
import { Mapping } from "./utils/mapping.js";
import { Config } from "./models/config.js";
import { Loader } from "./utils/loader.js";
import { writeFile } from "node:fs";
import { Checkout } from "./checkout.js";
import { ITransferInput, RecurringInfo } from "./models/trasnfer.js";

export class CommandLineInterface {
	async start() {
		try {
			const __filename = fileURLToPath(import.meta.url);
			const __dirname = dirname(__filename);

			const options = await yargs(process.argv.slice(2))
				.usage("Utilizzo: -p <path>")
				// .example(
				// 	'py-generator --p "<your_path_csv>" --i "<your_client_id>" --s "<your_client_secret>"',
				// )
				.option("p", {
					alias: "path",
					describe:
						"Inserisci il csv path del file da cui generare i checkout",
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
				.option("k", {
					alias: "creditorIBAN",
					describe: "Inserisci il tuo IBAN",
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
				.option("y", {
					alias: "pathScirpt",
					describe:
						"Path Script personale in JS per mappare ed eseguire operazioni sulle proprie colonne. Accetta in input -> [{nomeColonna: valore}] e output -> {amount, creditor, creditorIBAN, remittance, debtor, date, recurringInfo}",
					type: "string",
				})

				// opstions mapping
				.option("v", {
					alias: "vatCode",
					describe:
						"Mappa nome della colonna di vat_code (Partita IVA)",
					type: "string",
				})
				.option("c", {
					alias: "creditorIban",
					describe:
						"Mappa nome della colonna di creditor_iban (Creditore IBAN)",
					type: "string",
				})
				.option("a", {
					alias: "amount",
					describe: "Mappa nome della colonna di amount (Importo)",
					type: "string",
				})
				.option("e", {
					alias: "expireDate",
					describe:
						"Mappa nome della colonna di expire_date (Data di scadenza)",
					type: "string",
				})
				.option("r", {
					alias: "remittance",
					describe:
						"Mappa nome della colonna di remittance (Causale)",
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
					describe:
						"Mappa nome della colonna di recurring_info (Ricorrenza)",
					type: "string",
				})
				.option("f", {
					alias: "fingerprint",
					describe: "Mappa nome della colonna di fingerprint",
					type: "string",
				}).argv;

			// read in .env
			dotenv.config();

			const isDevelopment = process.env.NODE_ENV === "development";

			const config = {
				clientId: options.clientId ?? process.env.CLIENT_ID,
				clientSecret: options.clientSecret ?? process.env.CLIENT_SECRET,
				csvPath: options.path ?? process.env.CSV_PATH,
				scriptPath: options.pathScirpt ?? process.env.SCRIPT_PATH,
				csvPathOutput:
					options.pathOutput ??
					buildNewFileName(options.path as string, "generated") ??
					buildNewFileName(process.env.CSV_PATH, "generated"),
				creditorIBAN: options.creditorIBAN,
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
					fingerprint: options.fingerprint,
				},

				// or path mapping
				mapPath: isDevelopment
					? process.env.MAP_PATH
					: options.pathMap ?? join(__dirname, "..", "map.json"),

				// baseUrl
				baseUrlOauth: isDevelopment
					? (process.env.BASE_URL_OAUTH as string)
					: "https://core.flowpay.it/api/oauth",
				baseUrlOpenId: isDevelopment
					? (process.env.BASE_URL_OPENID as string)
					: "https://core.flowpay.it/api/openid",
				baseUrlPlatform: isDevelopment
					? (process.env.BASE_URL_PLATFORM as string)
					: "https://app.flowpay.it/api",
				baseUrlCheckout: isDevelopment
					? (process.env.BASE_URL_CHECKOUT as string)
					: "https://checkout.flowpay.it",
				baseUrl: isDevelopment
					? (process.env.BASE_URL as string)
					: "https://app.flowpay.it/api",
			} as Config;

			// assert di config
			// dunque valida i dati inseriti
			// assertConfig(config);

			console.log(
				chalk.white(
					`Avvio generazione da "${basename(config.csvPath)}" ...`,
				),
			);

			const token = await axios({
				method: "post",
				url: `${config.baseUrlOauth}/token`,
				headers: {
					"content-type": "application/x-www-form-urlencoded",
				},
				data: {
					client_id: config.clientId,
					client_secret: config.clientSecret,
					scope: "transfer:read transfer:write business:read",
					grant_type: "client_credentials",
				},
			});

			if (token.status !== 200) {
				throw "Authentication broken";
			}

			console.log(chalk.green("Autenticazione eseguita con successo!"));

			const accessToken = token.data.access_token;
			const tokenType = token.data.token_type;

			const intro = await axios({
				method: "post",
				url: `${config.baseUrlOpenId}/token/introspection`,
				headers: {
					"content-type": "application/x-www-form-urlencoded",
				},
				data: {
					token: accessToken,
				},
			});

			if (intro.status !== 200) {
				throw "Errore";
			}

			const tenantId = intro.data.tenant_id
				? intro.data.tenant_id
				: intro.data.business_id;

			const { columnNames, datas } = csvExtract(config.csvPath);
			// const mapField = mapBuilder(config.mapPath, config.mapField);

			const mapping = new Mapping(config.mapPath, config.mapField as any);
			mapping.build();

			let records = [];
			const isMapMode = !config.scriptPath;

			if (isMapMode)
				// map mode
				records = mapping.to(datas);
			else {
				// script mode
				console.log(
					chalk.yellow(`Importo script "${config.scriptPath}"`),
				);

				// importo script da path
				const myscript = await import(config.scriptPath);

				console.log(chalk.green(`Importato con successo!`));
				console.log(chalk.white(`Eseguo script...`));

				for (const i in datas) {
					const res = myscript.default(datas[i]);

					if (config.creditorIBAN) {
						res.creditor_iban = config.creditorIBAN;
					}

					// assertScript(res, i);
					records.push(Object.assign(datas[i], res));
				}

				console.log(chalk.green(`Script eseguito con sucecsso!`));
			}

			const arrayRecordData = [];

			const progressStatus = "Stato di generazione: ";
			const loader = new Loader(records.length, progressStatus);
			loader.start();

			for (const i in records) {
				const record = records[i];

				const recurringInfo =
					record.recurring_info > 1
						? new RecurringInfo(record.recurring_info)
						: undefined;

				const transfer: ITransferInput = {
					amount: record.amount,
					creditorIban: record.creditor_iban,
					creditor: "",
					date: record.expire_date,
					debtor: record.vatCode,
					remittance: record.remittance,
					recurringInfo: recurringInfo,
				};

				const newCheckout = new Checkout(
					transfer,
					tokenType,
					accessToken,
					config.baseUrlPlatform as string, // todo: da risolvere undefined di .env
					config.baseUrlCheckout as string,
				);

				const checkoutGenerated = await newCheckout.build(
					parseInt(i),
					tenantId,
				);

				arrayRecordData.push(checkoutGenerated);
				loader.next();
			}

			process.stdout.write("\r\n");

			if (!isMapMode) {
				// rimuovi proprietà aggiunte per business logic
				// che non devono essere stampate
				// todo: da correggere
				// arrayRecordData.forEach((m) => {
				// 	delete m.recurring_info;
				// 	delete m.creditor_iban;
				// 	delete m.vat_code;
				// 	delete m.amount;
				// 	delete m.remittance;
				// 	delete m.date;
				// });
			}

			// todo: da correggere
			// columnNames.push(mapping.mapField["fingerprint"]);
			// columnNames.push(mapping.mapField["code_invoice"]);
			// columnNames.push(mapping.mapField[0]);

			const recordsMapReversed = mapping.from(arrayRecordData);
			const newContentCsv = buildContentCsv(
				recordsMapReversed,
				columnNames,
			);

			writeFile(config.csvPathOutput as string, newContentCsv, (err) => {
				if (err) throw err;
				console.log(
					chalk.green(
						`Checkout generati con successo in "${config.csvPathOutput}"`,
					),
				);
			});
		} catch (err) {
			console.error(chalk.red(err));
		}
	}
}
