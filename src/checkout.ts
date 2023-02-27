import { ICheckoutOutput } from "./models/checkout.js";
import { ITransferInput } from "./models/trasnfer.js";
import { currencyToFloat } from "./utils/currency.js";
import { dateToISOString, yesterdayDate } from "./utils/date.js";
import { Http } from "./utils/http.js";

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

	async build(index: number, tenantId: string): Promise<ICheckoutOutput> {
		try {
			// todo: aggiungere un assert valori

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
			const vatCodeCreditor = this.transfer.creditor;
			const recurringInfo = this.transfer.recurringInfo;
			const date = this.transfer.date
				? dateToISOString(new Date(this.transfer.date))
				: dateToISOString(yesterdayDate());

			const transferUrl = `${this.baseUrl}/${tenantId}/transfers`;
			const transferData = {
				amount: amount,
				creditor: vatCodeCreditor,
				creditorIBAN: creditorIBAN,
				remittance: remittance,
				debtor: vatCodeDebtor,
				date: date,
				recurringInfo: recurringInfo,
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
