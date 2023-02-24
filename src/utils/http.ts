//@ts-ignore
import axios from "../node_modules/axios/lib/axios.js";

export class Http {
	constructor() {}

	accessToken: string | undefined;
	tokenType: string | undefined;

	async token(baseUrlOauth: string, clientId: string, clientSecret: string) {
		const token = await this.post(
			`${baseUrlOauth}/token`,
			{
				"content-type": "application/x-www-form-urlencoded",
			},
			{
				client_id: clientId,
				client_secret: clientSecret,
				scope: "transfer:read transfer:write business:read",
				grant_type: "client_credentials",
			},
		);

		if (token.status !== 200) {
			throw "Authentication broken";
		}

		this.accessToken = token.data.access_token;
		this.tokenType = token.data.token_type;
	}

	async post(url: string, headers: {}, data: {}, auth = true) {
		return axios({
			method: "post",
			url: url,
			headers: auth
				? {
						Authorization: `${this.tokenType} ${this.accessToken}`,
						...headers,
				  }
				: headers,
			data: data,
		});
	}

	async get(url: string, headers: {}, data: {}, auth = true) {
		return axios({
			method: "get",
			url: url,
			headers: auth
				? {
						Authorization: `${this.tokenType} ${this.accessToken}`,
						...headers,
				  }
				: headers,
			data: data,
		});
	}
}
