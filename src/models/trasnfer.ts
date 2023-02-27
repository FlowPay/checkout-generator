export interface ITransferInput {
	recurringInfo?: IRecurringInfo;
	creditor: string;
	creditorIban: string;
	date: Date;
	amount: number;
	remittance: string;
	debtor: string;
}

export interface ITransferOutput {
	amount: number;
	fingerprint: string;
	date: Date;
}

export class Transfer implements ITransferInput, ITransferOutput {
	constructor(
		creditorIban: string,
		date: Date,
		amount: number,
		remittance: string,
		creditor: string,
		debtor: string,
		fingerprint: string,
		recurringInfo?: IRecurringInfo,
	) {
		this.creditorIban = creditorIban;
		this.date = date;
		this.amount = amount;
		this.remittance = remittance;
		this.creditor = creditor;
		this.debtor = debtor;
		this.recurringInfo = recurringInfo;
		this.fingerprint = fingerprint;
	}
	fingerprint: string;
	creditor: string;
	debtor: string;
	recurringInfo?: IRecurringInfo;
	creditorIban: string;
	date: Date;
	amount: number;
	remittance: string;

	// assert(i?: string) {
	// 	if (!this.creditorIban || !this.hasOwnProperty("creditor_iban"))
	// 		throw `Errore! creditor_iban è undefined nella riga ${i}`;

	// 	if (!this.debtor || !this.hasOwnProperty("debtor"))
	// 		throw `Errore! vat_code è undefined nella riga ${i}`;

	// 	if (!this.amount || !this.hasOwnProperty("amount"))
	// 		throw `Errore! amount è undefined nella riga ${i}`;

	// 	if (!this.remittance || !this.hasOwnProperty("remittance"))
	// 		throw `Errore! remittance è undefined nella riga ${i}`;

	// 	if (!this.date || !this.hasOwnProperty("date"))
	// 		throw `Errore! date è undefined nella riga ${i}`;
	// }
}

export interface IRecurringInfo {
	frequency: FrequencyEnum;
	installments: number;
	executionRule?: ExecutionRuleEnum;
}

export enum FrequencyEnum {
	monthly = "monthly",
}

export enum ExecutionRuleEnum {
	following = "following",
	preceeding = "preceeding",
}

export class RecurringInfo implements IRecurringInfo {
	constructor(
		installments: number,
		frequency = FrequencyEnum.monthly,
		executionRule?: ExecutionRuleEnum,
	) {
		this.frequency = frequency;
		this.installments = installments;
		this.executionRule = executionRule;
	}

	frequency: FrequencyEnum;
	installments: number;
	executionRule?: ExecutionRuleEnum | undefined;
}
