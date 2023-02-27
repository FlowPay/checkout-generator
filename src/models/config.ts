import { existsSync } from "fs";
import { MAP_PATH } from "../constants/path.js";

export interface IConfig {
	clientId: string;
	clientSecret: string;
	csvPath: string;
	scriptPath: string;
	csvPathOutput: string;
	creditorIBAN: string | undefined;
	okRedirect: string | undefined;
	nokRedirect: string | undefined;

	// Mapping
	// le filed devono corrispondere al mapping del json
	// quindi: vat_code, creditor_iban, expire_date...
	mapField?: {
		vat_code: string | undefined;
		creditor_iban: string | undefined;
		amount: string | undefined;
		expire_date: string | undefined;
		remittance: string | undefined;
		code_invoice: string | undefined;
		url_checkout: string | undefined;
		recurring_info: string | undefined;
		fingerprint: string | undefined;
	};

	// or path mapping
	mapPath: string;

	// baseUrl
	baseUrlOauth: string;
	baseUrlOpenId: string;
	baseUrlPlatform: string;
	baseUrlCheckout: string;
	baseUrl: string;

	// assert: () => void;
}

export class Config implements IConfig {
	constructor(
		csvPath: string,
		csvPathOutput?: string,
		nameToAddOutput = "generated",
		mapPath?: string,
	) {
		this.csvPath = csvPath;
		this.mapPath = mapPath ? mapPath : MAP_PATH;
		// this.csvPathOutput = csvPathOutput
		// 	? csvPathOutput
		// 	: buildNewFileName(csvPath, nameToAddOutput); // todo: da correggere

		// this.assert();
	}

	csvPath;
	csvPathOutput!: string;
	scriptPath!: string;
	mapPath: string;

	clientId!: string;
	clientSecret!: string;

	creditorIBAN: string | undefined;
	okRedirect: string | undefined;
	nokRedirect: string | undefined;

	mapField?: {
		vat_code: string | undefined;
		creditor_iban: string | undefined;
		amount: string | undefined;
		expire_date: string | undefined;
		remittance: string | undefined;
		code_invoice: string | undefined;
		url_checkout: string | undefined;
		recurring_info: string | undefined;
		fingerprint: string | undefined;
	};

	baseUrlOauth!: string;
	baseUrlOpenId!: string;
	baseUrlPlatform!: string;
	baseUrlCheckout!: string;
	baseUrl!: string;

	assert() {
		if (!this.clientId || !this.clientSecret)
			throw "Attenzione! Non ho il client id o il client secret";

		if (!this.csvPath || (this.csvPath && !existsSync(this.csvPath)))
			throw `Errore! Non esiste il file nel path ${this.csvPath}`;

		if (this.csvPathOutput && !/^.*\.(csv)$/gi.test(this.csvPathOutput))
			throw `Errore! Il file di output impostato o generato non è valido: ${this.csvPathOutput}`;

		if (!/^.*\.(csv)$/gi.test(this.csvPath))
			throw "Errore! Il file richiesto non è supportato, deve essere un csv.";

		if (
			this.mapPath &&
			(!existsSync(this.mapPath) || !/^.*\.(json)$/gi.test(this.mapPath))
		)
			throw 'Errore! Il file richiesto non esiste o non è supportato, deve essere un "json".';

		if (
			this.scriptPath &&
			(!existsSync(this.scriptPath) ||
				!/^.*\.(mjs)$/gi.test(this.scriptPath))
		)
			throw 'Errore! Il file richiesto non esiste o non è supportato, deve essere uno script in "mjs".';
	}
}
