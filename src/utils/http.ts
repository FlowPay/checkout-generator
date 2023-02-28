import axios from "axios";

export class Http {
	constructor(accessToken?: string, tokenType?: string) {
		this.tokenType = tokenType;
		this.accessToken = accessToken;
	}

	accessToken?: string;
	tokenType?: string;

	scope: string | undefined;
	grantType: string | undefined;

	async token(
		baseUrlOauth: string,
		clientId: string,
		clientSecret: string,
		scope: string,
		grantType: string,
	) {
		const token = await this.post(
			`${baseUrlOauth}/token`,
			{
				"content-type": "application/x-www-form-urlencoded",
			},
			{
				client_id: clientId,
				client_secret: clientSecret,
				grant_type: grantType,
				scope,
			},
		);

		if (token.status !== 200) {
			throw "Authentication broken";
		}

		this.setAccessToken(token.data.access_token);
		this.setTokeType(token.data.token_type);

		return token;
	}

	setAccessToken(value: string) {
		this.accessToken = value;
	}

	setTokeType(value: string) {
		this.tokenType = value;
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

	async get(url: string, headers?: {}, data?: {}, auth = true) {
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
