import axios, {AxiosInstance} from 'axios';
import crypto from 'crypto';
import fs from 'node:fs/promises';
import {Network} from './network.js';
import {PeopleCount} from './peopleCount.js';
import {Auth} from './auth.js';

export class SunApi {
	publicKey: string;
	hostname: string;
	username: string;
	password: string;
	authHeader: string;
	axiosInstance: AxiosInstance;
	network: Network;
	peopleCount: PeopleCount;
	auth: Auth;

	constructor({
		hostname,
		username,
		password,
	}: {
		hostname: string;
		username: string;
		password: string;
	}) {
		this.hostname = hostname;
		this.username = username;
		this.password = password;
		this.publicKey = '';
		this.authHeader = '';

		this.axiosInstance = axios.create({
			baseURL: `http://${this.hostname}`,
		});

		this.network = new Network(this);
		this.peopleCount = new PeopleCount(this);
		this.auth = new Auth(this);
	}

	async getDigestAuthHeader(
		url: string = `http://${this.hostname}/stw-cgi/system.cgi?msubmenu=deviceinfo&action=view`,
	) {
		if (url.startsWith('/')) {
			url = `http://${this.hostname}${url}`;
		}
		await this._getDigestAuthHeader(url, this.username, this.password);
		this.axiosInstance.defaults.headers.common['Authorization'] =
			this.authHeader;
	}

	async getDeviceInformation() {
		try {
			const path = `/stw-cgi/system.cgi?msubmenu=deviceinfo&action=view`;
			await this.getDigestAuthHeader(path);
			const response = await this.axiosInstance.get(path);

			console.log(
				'🚀 ~ SunApi ~ getDeviceInformation ~ response:',
				response.data,
			);
		} catch (error: any) {
			console.log(
				'🚀 ~ SunApi ~ getDeviceInformation ~ error:54',
				error.response.data,
			);
		}
	}

	_parseDigestAuthHeader(header: string) {
		const authParams = header
			.substring(header.indexOf('Digest ') + 7)
			.split(', ')
			.reduce((acc, current) => {
				const [key, value] = current.split('=');
				/*@ts-expect-error*/
				acc[key] = value?.replace(/"/g, '');
				return acc;
			}, {} as Record<string, string>);
		return authParams;
	}

	_generateDigestAuthHeader(
		authParams: Record<string, string>,
		uri: string,
		username: string,
		password: string,
	) {
		const ha1 = crypto
			.createHash('md5')
			.update(`${username}:${authParams.realm}:${password}`)
			.digest('hex');
		const ha2 = crypto.createHash('md5').update(`GET:${uri}`).digest('hex');
		const nonceCount = '00000001';
		const cnonce = crypto.randomBytes(8).toString('hex');
		const response = crypto
			.createHash('md5')
			.update(
				`${ha1}:${authParams.nonce}:${nonceCount}:${cnonce}:${authParams.qop}:${ha2}`,
			)
			.digest('hex');

		return `Digest username="${username}", realm="${authParams.realm}", nonce="${authParams.nonce}", uri="${uri}", response="${response}", qop=${authParams.qop}, nc=${nonceCount}, cnonce="${cnonce}"`;
	}

	async _getDigestAuthHeader(
		url: string,
		username: string,
		password: string,
	) {
		// Step 1: Send an initial request to get the server's challenge
		const initialResponse = await axios.get(url, {
			validateStatus: (status) => status === 401,
		});

		const authHeader = initialResponse.headers['www-authenticate'];
		const digestAuth = this._parseDigestAuthHeader(authHeader);

		// Step 2: Generate the Digest header
		const authHeaderDigest = this._generateDigestAuthHeader(
			digestAuth,
			url,
			username,
			password,
		);

		this.authHeader = authHeaderDigest;
		return authHeaderDigest;
	}
}
