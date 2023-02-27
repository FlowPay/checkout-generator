import { ICSV } from "./models/csv.js";
import { writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

export class CSVT<T> {
	constructor(
		csvPath: string,
		csvPathOutput?: string,
		nameToAdd = "generated",
	) {
		this.csvPath = csvPath;
		this.csvPathOutput = csvPathOutput
			? csvPathOutput
			: this.buildNewFileName(this.csvPath, nameToAdd);
	}

	csvPath: string;
	csvPathOutput: string;

	readCsv(): ICSV<T> {
		const { columnNames, datas, rowDatas } = this.csvExtract(this.csvPath);
		const result: ICSV<T> = {
			datas: datas as T[], // todo: gestione da migliorare
			columnNames,
			rowDatas,
		};
		return result;
	}

	writeCsv(content: string, pathOutput?: string) {
		let path = pathOutput ? pathOutput : this.csvPathOutput;
		if (!path) throw "Errore! Il path output non è undefined";
		return writeFile(path, content);
	}

	removeEmptyRows(rows: string[]) {
		return rows.filter((r) => /[^;]/gi.test(r));
	}

	csvExtract(path: string) {
		const rawFile = readFileSync(path, { encoding: "utf-8" });
		let rows = rawFile.split(/\r?\n/);
		rows = this.removeEmptyRows(rows); // rimuovo righe vuote
		const columnNames = rows.splice(0, 1)[0].split(";"); // ottieni intestazione colonne
		const rowDatas = rows.map((row) => row.split(";")); // ottieni dati per riga
		const datas = this.fromArrayToObject(rowDatas, columnNames); // genera un array di oggetti da nome colonna
		return { columnNames, rowDatas, datas };
	}

	fromArrayToObject(row: string[][], columns: string[]) {
		return row.map((r) =>
			columns.reduce((o, key, i) => ({ ...o, [key]: r[i] }), {}),
		);
	}

	buildNewFileName(path: string, nameToAdd: string): string {
		if (!path) throw "Errore! Il path richiesto non esiste.";

		let filename = basename(path, ".csv");
		filename = `${filename} ${nameToAdd}.csv`;

		const dir = dirname(path);
		const newPath = join(dir, filename);

		if (existsSync(newPath)) {
			return this.buildNewFileName(newPath, nameToAdd);
		}

		return newPath;
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
	constructor(csvPath: string, csvPathOutput = "") {
		super(csvPath, csvPathOutput);
	}
}
