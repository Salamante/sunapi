import {SunApi} from './index.js';

type TInitializedCameraResponse = {
	Initialized: true;
	Language: string;
	MaxChannel: number;
	SpecialType: string;
	NewPasswordPolicy: true;
	MaxPasswordLength?: 64;
	Manufacturer: 'Hanwha Vision';
};

type TNotInitializedCameraResponse = {
	Initialized: false;
	Language: string;
	MaxChannel: number;
	SpecialType: 'none';
	NewPasswordPolicy: true;
	MaxPasswordLength?: 64;
	SupportedPublicKeyFormats: ['PKCS1', 'X509'];
	PublicKey: string; // "-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAwv,
	Manufacturer: 'Hanwha Vision';
};

type TCheckPasswordInitializedResponse =
	| TInitializedCameraResponse
	| TNotInitializedCameraResponse;

class Auth {
	private device: SunApi;
	constructor(device: SunApi) {
		this.device = device;
	}
	/**
	 * #4.1. To check if the camera password is initialized or not initialized
	 */
	async checkPasswordInitialized() {
		const url = `/init-cgi/pw_init.cgi?msubmenu=status&action=view`;

		try {
			const response =
				await this.device.axiosInstance.get<TCheckPasswordInitializedResponse>(
					url,
				);
			console.log(
				'🚀 ~ Auth ~ checkPasswordInitialized ~ response:',
				response.data,
			);
			return response.data;
		} catch (error: any) {
			console.log(
				'🚀 ~ Auth ~ checkPasswordInitialized ~ error:',
				error.response,
			);
		}
	}

	/**
	 * # 4.3. To set the initial password
	 * Setting the initial password will work only once. If the password is already set, it will fail.
	 */
	async setInitialPassword(password: string) {
		const url = `/init-cgi/pw_init.cgi?msubmenu=setinitialpassword&Password=${password}`;
		const params = new URLSearchParams({Password: password}).toString();

		try {
			const response = await this.device.axiosInstance.get(url + params);
			console.log(
				'🚀 ~ Auth ~ setInitialPassword ~ response:',
				response.data,
			);
			return response.data;
		} catch (error: any) {
			console.log(
				'🚀 ~ Auth ~ setInitialPassword ~ error:',
				error.response,
			);
		}
	}

	async setInitialPasswordWithPublicKey(password: string, publicKey: string) {
		const url = `/init-cgi/pw_init.cgi?msubmenu=setinitpassword&action=set&IsPasswordEncrypted=True`;
	}

	async encryptPassword(password: string, publicKeyPEM: string) {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);

		const publicKey = await window.crypto.subtle.importKey(
			'spki',
			new TextEncoder().encode(publicKeyPEM),
			{name: 'RSA-OAEP', hash: 'SHA-256'},
			false,
			['encrypt'],
		);

		const ciphertext = await window.crypto.subtle.encrypt(
			{name: 'RSA-OAEP'},
			publicKey,
			data,
		);

		// Convert ArrayBuffer to base64 without btoa
		const base64Ciphertext = await new Promise<string>(
			(resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					const dataUrl = reader.result as string;
					resolve(dataUrl.split(',')[1] as string);
				};
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(new Blob([ciphertext]));
			},
		);

		return base64Ciphertext;
	}
}

export {Auth};
