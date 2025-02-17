import {SunApi} from '../index.js';

type TObjectDetectionFromImageParameters = {
	ObjectType: 'Face';
};
interface TObjectDetectionFromImageOptions<T = 'control'> {
	action: T;
	parameters: TObjectDetectionFromImageParameters;
}
type TObjectDetectionFromImageResponse = {
	Response: 'Success' | 'Fail (No Face Detected)' | 'Fail (Too Face Detected)' | 'Fail (Unknown)';
	Results: [
		{
			Result: number;
			TempGroupID: number; // temp group ID
			TempImageID: number; // temp image ID
			ImageURL: string; // Image URL of the detected image
			Resolution: string; // widthxheight Resolution of the detected image
			Coordinates: [
				{
					x: number;
					y: number;
				}[],
			];
		},
	];
};

class ObjectDetection extends SunApi {
	async objectDetectionFromImage(options: TObjectDetectionFromImageOptions) {
		const url = `/stw-cgi/ai.cgi?msubmenu=objectdetectfromimage&action=control&ObjectType=Fase`;
		const {parameters} = options;
		const params = new URLSearchParams(String(parameters)).toString();

		try {
			const response = await this.axiosInstance.get<TObjectDetectionFromImageResponse>(url + params);
			console.log('🚀 ~ ObjectDetection ~ objectDetectionFromImage ~ response:', response.data);
			return response.data;
		} catch (error: any) {
			console.log('🚀 ~ ObjectDetection ~ objectDetectionFromImage ~ error:', error.response);
		}
	}
}
