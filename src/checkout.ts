// @ts-ignore
import * as axios from "../node_modules/axios/dist/axios.js";

import { ITransferInput } from "./models/trasnfer.js";
import { currencyToFloat } from "./utils/currency.js";
import { dateToISOString, yesterdayDate } from "./utils/date.js";

export class Checkout {
	constructor(
		transfer: ITransferInput,
		tokenType: string,
		accessToken: string,
		baseUrl: string,
		baseUrlCheckout: string,
		nokRedirect = "",
		okRedirect = "",
	) {
		this.transfer = transfer;
		this.tokenType = tokenType;
		this.accessToken = accessToken;
		this.baseUrl = baseUrl;
		this.baseUrlCheckout = baseUrlCheckout;
		this.nokRedirect = nokRedirect;
		this.okRedirect = okRedirect;
	}

	transfer: ITransferInput;

	tokenType: string;
	accessToken: string;
	baseUrl: string;
	baseUrlCheckout: string;
	nokRedirect: string;
	okRedirect: string;

	async build(index: number, tenantId: string): Promise<string> {
		try {
			// todo: aggiungere un assert valori

			// if (
			// 	!isValidDate(
			// 		this.transfer.date,
			// 	) /*&& Date.parse(this.transfer.expire_date) == 0*/
			// ) {
			// 	throw "Errore! Il formato della this.transfer non è corretto. Formato corretto YYYY-MM-DD oppure YYYY-MM-DD";
			// }

			if (!this.transfer.creditorIban) {
				throw "Errore! Non esiste un IBAN del creditore.";
			}

			if (!this.transfer.debtor) {
				throw "Errore! Non esiste Partita Iva / Codice fiscale.";
			}

			const amount = currencyToFloat(this.transfer.amount);
			const creditorIBAN = this.transfer.creditorIban.replace(/\s/g, "");
			const remittance = this.transfer.remittance;
			const vatCodeDebtor = this.transfer.debtor;
			// const recurringInfo = this.transfer.recurringInfo
			// 	? parseInt(this.transfer.recurringInfo)
			// 	: 0;
			const recurringInfo = this.transfer.recurringInfo;
			const date = this.transfer.date
				? dateToISOString(new Date(this.transfer.date))
				: dateToISOString(yesterdayDate());

			const res = await axios({
				method: "get",
				url: `${this.baseUrl}/${tenantId}/businesses/current`,
				headers: {
					Authorization: `${this.tokenType} ${this.accessToken}`,
				},
			});

			const vatCodeCreditor = res.data.vatCountryID + res.data.vatCode;

			const resData = await axios({
				method: "post",
				url: `${this.baseUrl}/${tenantId}/transfers`,
				headers: {
					"content-type": "application/json",
					Authorization: `${this.tokenType} ${this.accessToken}`,
				},
				data: {
					amount: amount,
					creditor: vatCodeCreditor,
					creditorIBAN: creditorIBAN,
					remittance: remittance,
					debtor: vatCodeDebtor,
					date: date,
					recurringInfo: recurringInfo,
				},
			});

			const fingerprint = resData.data.fingerprint;
			if (!fingerprint) {
				throw `Errore! Non ho ottenuto il fingerprint`;
			}

			const resFinger = await axios({
				method: "post",
				url: `${this.baseUrl}/${tenantId}/checkout`,
				headers: {
					"content-type": "application/json",
					Authorization: `${this.tokenType} ${this.accessToken}`,
				},
				data: {
					fingerprint: fingerprint,
					nokRedirect: this.nokRedirect,
					okRedirect: this.okRedirect,
					type: "transfer",
				},
			});

			const codeInvoice = resFinger.data.code;
			if (!codeInvoice)
				throw "Errore! Non è stato generato il code_invoice";

			// let copyData = Object.assign({}, this.transfer);
			// copyData["fingerprint"] = fingerprint;
			// copyData["code_invoice"] = codeInvoice;
			// copyData["url_checkout"] = `${this.baseUrlCheckout}/${codeInvoice}`;

			return codeInvoice;
		} catch (err) {
			throw `\nGenerazione ${index}: ${err}`; // console.error(chalk.red(`\nGenerazione ${index}: ${err}`)); // per non thoware
		}
	}
}
