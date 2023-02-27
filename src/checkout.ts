import { BASE_URL, BASE_URL_CHECKOUT } from "./constants/url.js";
import { ICheckoutOutput } from "./models/checkout.js";
import { ITransferInput } from "./models/trasnfer.js";
import { dateToISOString, yesterdayDate } from "./utils/date.js";
import { Http } from "./utils/http.js";

export class Checkout {
	constructor(
		transfer: ITransferInput,
		tokenType: string,
		accessToken: string,
		baseUrl?: string,
		baseUrlCheckout?: string,
		nokRedirect?: string,
		okRedirect?: string,
	) {
		this.transfer = transfer;
		this.tokenType = tokenType;
		this.accessToken = accessToken;
		this.nokRedirect = nokRedirect;
		this.okRedirect = okRedirect;

		this.baseUrl = baseUrl ? baseUrl : BASE_URL;
		this.baseUrlCheckout = baseUrlCheckout
			? baseUrlCheckout
			: BASE_URL_CHECKOUT;
	}

	transfer: ITransferInput;

	tokenType: string;
	accessToken: string;
	baseUrl: string;
	baseUrlCheckout: string;
	nokRedirect?: string;
	okRedirect?: string;

	async build(index: number, tenantId: string): Promise<ICheckoutOutput> {
		try {
			// todo: aggiungere un assert valori

			if (!this.transfer.creditorIban) {
				throw "Errore! Non esiste un IBAN del creditore.";
			}

			if (!this.transfer.debtor) {
				throw "Errore! Non esiste Partita Iva / Codice fiscale.";
			}

			const date = this.transfer.date
				? dateToISOString(new Date(this.transfer.date))
				: dateToISOString(yesterdayDate());

			const transferUrl = `${this.baseUrl}/${tenantId}/transfers`;
			const transferData = {
				amount: this.transfer.amount,
				creditor: this.transfer.creditor,
				creditorIBAN: this.transfer.creditorIban.replace(/\s/g, ""),
				remittance: this.transfer.remittance,
				debtor: this.transfer.debtor,
				recurringInfo: this.transfer.recurringInfo,
				date: date,
			};

			const http = new Http(this.accessToken, this.tokenType);
			const resData = await http.post(
				transferUrl,
				{}, // no headers aggiuntivi
				transferData,
			);

			const fingerprint = resData.data.fingerprint;
			if (!fingerprint) {
				throw `Errore! Non ho ottenuto il fingerprint`;
			}

			const checkoutUrl = `${this.baseUrl}/${tenantId}/checkout`;
			const checkoutData = {
				fingerprint: fingerprint,
				nokRedirect: this.nokRedirect,
				okRedirect: this.okRedirect,
				type: "transfer",
			};

			const resFinger = await http.post(
				checkoutUrl,
				{}, // headers aggiuntivi
				checkoutData,
			);

			const codeInvoice = resFinger.data.code;
			if (!codeInvoice)
				throw "Errore! Non è stato generato il code_invoice";

			const result: ICheckoutOutput = {
				url: `${this.baseUrlCheckout}/${codeInvoice}`,
				fingerprint,
				codeInvoice,
			};

			return result;
		} catch (err) {
			throw `\nGenerazione ${index}: ${err}`; // console.error(chalk.red(`\nGenerazione ${index}: ${err}`)); // per non thoware
		}
	}
}
