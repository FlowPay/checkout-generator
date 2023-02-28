export class CSV<T> implements ICSV<T> {
	rowDatas!: string[][];
	columnNames!: string[];
	datas!: T[];
}

export interface ICSV<T>  {
	columnNames: string[];
	rowDatas: string[][];
	datas: T[];
}
