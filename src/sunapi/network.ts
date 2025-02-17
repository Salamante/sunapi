import {SunApi} from './index.js';

class Network {
	private device: SunApi;

	constructor(device: SunApi) {
		this.device = device;
	}
	async getNetworkInterface() {
		const url = `/stw-cgi/recording.cgi?msubmenu=network&action=view`;
		try {
			const response = await this.device.axiosInstance.get(url);
			console.log('🚀 ~ Network ~ getNetworkInterface ~ response:', response.data);
		} catch (error: any) {
			console.log('🚀 ~ Network ~ getNetworkInterface ~ error:', error.response);
		}
	}
}

export {Network};
