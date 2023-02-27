export function assertScript(data: any, i: number, nameScript: string) {
	if (!data.creditor_iban || !data.hasOwnProperty("creditor_iban"))
		throw `Errore! creditor_iban è undefined nella riga ${i} da script ${nameScript}.`;

	if (!data.vat_code || !data.hasOwnProperty("vat_code"))
		throw `Errore! vat_code è undefined nella riga ${i} da script ${nameScript}.`;

	if (!data.amount || !data.hasOwnProperty("amount"))
		throw `Errore! amount è undefined nella riga ${i} da script ${nameScript}.`;

	if (!data.remittance || !data.hasOwnProperty("remittance"))
		throw `Errore! remittance è undefined nella riga ${i} da script ${nameScript}.`;

	if (!data.expire_date || !data.hasOwnProperty("expire_date"))
		throw `Errore! date è undefined nella riga ${i} da script ${nameScript}.`;
}
