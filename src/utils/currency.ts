export function isInt(n: any): boolean {
	return Number(n) === n && n % 1 === 0;
}

export function isFloat(n: any): boolean {
	return Number(n) === n && n % 1 !== 0;
}

export function currencyToFloat(value: string | number): number {
	if (!value) throw "Value is undefined";
	if (typeof value === "number") return value;

	// rimuovo eventuali spazi bianchi
	value = value.replace(/[^0-9\,\.]/g, "");

	// questa regex ottiene le migliai e decimali
	const decimalRegex =
		/^((?=.*[1-9]|0)(?:\d{1,3}))((?=.*\d)(?:\.\d{3})?)*((?=.*\d)(?:\,\d\d){1}?){0,1}$/gm;
	if (decimalRegex.test(value)) {
		value = value
			.replace(".", "") // rimuovo punteggiatura per migliaia
			.replace(",", "."); // converto in decimali
	}

	return parseFloat(value);
}
