import { CSV } from "../csv";

test("csv reader", () => {
	expect(new CSV("../../.csv/development.csv").readCsv()).toBe({
		columnNames: [
			"Partita Iva",
			"Importo",
			"Causale",
			"Creditore IBAN",
			"Data di scadenza 2",
			"Ricorrenze",
			"Ciao",
		],
		datas: [
			{
				"Partita Iva": "IT17060420290",
				Importo: "1,01 €",
				Causale: "Rata XYZ ",
				"Creditore IBAN": "IT78B0300203280976738871873",
				"Data di scadenza 2": "2022-10-11",
				Ricorrenze: "2",
				Ciao: "",
			},
			{
				"Partita Iva": "IT03938530163",
				Importo: "2,02 €",
				Causale: "Rata XYZ ",
				"Creditore IBAN": "IT78B0300203280976738871873",
				"Data di scadenza 2": "2022-10-11",
				Ricorrenze: "0",
				Ciao: "",
			},
			{
				"Partita Iva": "IT12357931000",
				Importo: "3,03 €",
				Causale: "Rata XYZ ",
				"Creditore IBAN": "IT78B0300203280976738871873",
				"Data di scadenza 2": "2022-10-11",
				Ricorrenze: "3",
				Ciao: "",
			},
			{
				"Partita Iva": "IT05274261006",
				Importo: "3,03 €",
				Causale: "Rata XYZ ",
				"Creditore IBAN": "IT78B0300203280976738871873",
				"Data di scadenza 2": "2022-10-11",
				Ricorrenze: "0",
				Ciao: "",
			},
			{
				"Partita Iva": "IT14032041007",
				Importo: "3,03 €",
				Causale: "Rata XYZ ",
				"Creditore IBAN": "IT78B0300203280976738871873",
				"Data di scadenza 2": "2022-10-11",
				Ricorrenze: "0",
				Ciao: "",
			},
		],
		rowDatas: [
			"IT17060420290;1,01 €;Rata XYZ ;IT78B0300203280976738871873;2022-10-11;2;",
			"IT03938530163;2,02 €;Rata XYZ ;IT78B0300203280976738871873;2022-10-11;0;",
			"IT05274261006;3,03 €;Rata XYZ ;IT78B0300203280976738871873;2022-10-11;0;",
			"IT05274261006;3,03 €;Rata XYZ ;IT78B0300203280976738871873;2022-10-11;0;",
			"IT14032041007;3,03 €;Rata XYZ ;IT78B0300203280976738871873;2022-10-11;0;",
		],
	});
});
