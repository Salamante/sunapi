import {SunApi} from '../index.js';

/**
 * #SUNAPI_ai_26.2.pdf
 * Chapter 7. AI Engine
 *
 * * The aiengine submenu is used to manage and view AI engine stats.
 * * This submenu is applicable to NVR only
 */

type TViewRequest = {
	ChannelIDList: string; // CSV of requested channel list
};

type TViewResponse = {
	TotalEngineUsage: {
		ObjectEngineUsage: number;
		RecognitionEngineUsage: number;
	};
	EngineStatus: {
		Channel: number;
		CamType: 'Unknown' | 'MetaDataCam' | 'AIMetaDataCam' | 'NoneMetaCam';
		ObjectEngine: boolean; // Enable or disable object detection engine
		RecognitionEngine: boolean; //Enable or disable recognition engine
		ObjectEngineUsage: number;
		RecognitionEngineUsage: number; //Agreement to run face recognition algorithm.
	}[];
};

class AIEngine extends SunApi {
	async viewAIEngineStats() {
		const url = `/stw-cgi/ai.cgi?msubmenu=aiengine&action=view`;

		try {
			const response = await this.axiosInstance.get<TViewResponse>(url);
			console.log('🚀 ~ AIEngine ~ viewAIEngineStats ~ response:', response.data);
			return response.data;
		} catch (error: any) {
			console.log('🚀 ~ AIEngine ~ viewAIEngineStats ~ error:', error.response);
		}
	}
}
