import { ICSV } from "./models/index.js";

export class CSVT<T> {
	constructor(content: string) {
		this.content = content;
	}

	content: string;

	// readCsv(): ICSV<T> {
	// 	const { columnNames, datas, rowDatas } = this.csvExtract(this.csvPath);
	// 	const result: ICSV<T> = {
	// 		datas: datas as T[], // todo: gestione da migliorare
	// 		columnNames,
	// 		rowDatas,
	// 	};
	// 	return result;
	// }

	// writeCsv(content: string, pathOutput?: string) {
	// 	let path = pathOutput ? pathOutput : this.csvPathOutput;
	// 	if (!path) throw "Errore! Il path output non è undefined";
	// 	return writeFile(path, content);
	// }

	removeEmptyRows(rows: string[]) {
		return rows.filter((r) => /[^;]/gi.test(r));
	}

	extract(): ICSV<T> {
		let rows = this.content.split(/\r?\n/);
		rows = this.removeEmptyRows(rows); // rimuovo righe vuote
		const columnNames = rows.splice(0, 1)[0].split(";"); // ottieni intestazione colonne
		const rowDatas = rows.map((row) => row.split(";")); // ottieni dati per riga
		const datas = this.fromArrayToObject(rowDatas, columnNames); // genera un array di oggetti da nome colonna
		return { columnNames, rowDatas, datas: datas as T[] };
	}

	fromArrayToObject(row: string[][], columns: string[]) {
		return row.map((r) =>
			columns.reduce((o, key, i) => ({ ...o, [key]: r[i] }), {}),
		);
	}

	sortFrom(a: string, b: string, arr: string[]) {
		return arr.indexOf(a) - arr.indexOf(b);
	}

	buildContentCsv(array: any[], columns: string[]) {
		const keys = Object.keys(array[0]).sort((a, b) =>
			this.sortFrom(a, b, columns),
		);
		const content = [keys, ...array.map((v) => keys.map((k) => v[k]))];
		return `${content.map((m) => m.join(";")).join("\r\n")}`;
	}
}

export class CSV extends CSVT<{}> {
	constructor(content: string) {
		super(content);
	}
}
