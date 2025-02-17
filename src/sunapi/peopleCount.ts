import {SunApi} from './index.js';
import fs from 'fs/promises';

// ##SUNAPI_Application_Programmers_Guide.pdf
// # Chapter 15. People Count

type TGetPeopleCountConfigurationResponse = {
	PeopleCount: {
		Channle: number;
		MasterName: string;
		Enable: boolean;
		ReportEnable: boolean;
		ReportFilename: string;
		ReportFileType: string; // 'XLSX
		CalibrationMode: string; // 'CameraHeight'
		CameraHeight: number;
		ObjectSizeCoordinate: {
			x: number;
			y: number;
		}[];
		lines: {
			Line: number;
			Mode: 'LeftToRightIn' | 'RightToLeftIn' | 'LeftToRightOut' | 'RightToLeftOut';
			Name: string; // 'Gate1'
			Enable: boolean;
			Coordinates: {
				x: number;
				y: number;
			}[];
		}[];
	}[];
};

type TSetPeopleCountConfigurationOptions = {
	Channel: number;
	Lines: {
		Line: number;
		Name: string;
		Enable: boolean;
		Mode: 'LeftToRightIn' | 'RightToLeftIn' | 'LeftToRightOut' | 'RightToLeftOut';
		Coordinates: {
			x: number;
			y: number;
		}[];
	}[];
};

type TGetLivePeopleCountResponse = {
	PeopleCount: {
		Lines: [
			{
				LineIndex: number;
				Name: string;
				InCount: number;
				OutCount: number;
			}[],
		];
	}[];
};

type TPeopleCountSearchResponse = {
	ResultInterval: 'Hourly';
	PeopleCountSearchResults: {
		Camera: string; // 'PeopleCount-Master';
		LineResults: {
			Line: 'Gate1';
			DirectionResults: [
				{
					Direction: 'In';
					Result: string; // '0,0,0,0,0,0,2,0,0,0,0,0,0,0,6,0,0,0,0,0,3,0,2,2';
				},
				{
					Direction: 'Out';
					Result: string; //'0,0,0,0,0,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,2,0,5,3';
				},
			];
		}[];
	}[];
};

class PeopleCount {
	private device: SunApi;

	constructor(device: SunApi) {
		this.device = device;
	}
	async getPeopleCountConfiguration() {
		try {
			const path = `/stw-cgi/eventsources.cgi?msubmenu=peoplecount&action=view`;
			await this.device.getDigestAuthHeader(path);
			const response = await this.device.axiosInstance.get<TGetPeopleCountConfigurationResponse>(path);
			console.log('🚀 ~ SunApi ~ getPeopleCountConfiguration ~ response:', response.data);
			await fs.writeFile('peoplecount.json', JSON.stringify(response.data, null, 2));
		} catch (error: any) {
			console.log('🚀 ~ SunApi ~ getPeopleCountConfiguration ~ error:', error.response);
		}
	}
	/**
	 * #To Update the configuration
	 * @example
	 * http://<DeviceIP>/stw-cgi/eventsources.cgi?msubmenu=peoplecount&action=set&Channel=0&Line.1.Name=F
	 * rontGate&Line.1.Enable=True&Line.1.Mode=LeftToRightIn&Line.1.Coordinates=1,2
	 * ,3,4&Line.2.Name=BackGate&Line.2.Enable=True&Line.2.Mode=RightToLeftIn&Line.
	 * 2.Coordinates=5,6,7,8
	 */
	async setPeopleCountConfiguration(options: TSetPeopleCountConfigurationOptions) {
		const url = `/stw-cgi/eventsources.cgi?msubmenu=peoplecount&action=set`;
		const searchParams = new URLSearchParams();

		options.Lines.forEach((line, index) => {
			searchParams.append(`Line.${index + 1}.Name`, line.Name);
			searchParams.append(`Line.${index + 1}.Enable`, line.Enable.toString());
			searchParams.append(`Line.${index + 1}.Mode`, line.Mode);
			searchParams.append(
				`Line.${index + 1}.Coordinates`,
				line.Coordinates.map(({x, y}) => `${x},${y}`).join(','),
			);
		});

		const searchParamsString = searchParams.toString();

		try {
			const response = await this.device.axiosInstance.get(url + '&' + searchParamsString);
			console.log('🚀 ~ SunApi ~ setPeopleCountConfiguration ~ response:', response.data);
			return response.data;
		} catch (error) {
			console.log('🚀 ~ PeopleCount ~ setPeopleCountConfiguration ~ error:', error);
		}
	}

	async checkLivePeopleCount(options: {Channel: number}) {
		const url = `/stw-cgi/eventsources.cgi?msubmenu=peoplecount&action=check`;
		await this.device.getDigestAuthHeader(url);
		try {
			const response = await this.device.axiosInstance.get<TGetLivePeopleCountResponse>(url, {
				params: {
					Channel: options.Channel,
				},
			});
			console.log('🚀 ~ SunApi ~ checkPeopleCount ~ response:', response.data);
			fs.writeFile('live-people-count.json', JSON.stringify(response.data, null, 2));
		} catch (error: any) {
			console.log('🚀 ~ SunApi ~ checkPeopleCount ~ error:', error.response);
		}
	}

	async peopleCountSearch(params: {
		Channel: number;
		FromDate: string;
		ToDate: string;
		Lines: {
			Camera: string;
			Line: string;
			Direction: 'In,Out';
		}[];
	}) {
		const parsedParams: any = {
			msubmenu: 'peoplecountsearch',
			action: 'control',
			Channel: params.Channel,
			Mode: 'Start',
			FromDate: params.FromDate,
			ToDate: params.ToDate,
		};
		params.Lines.forEach((line, index) => {
			parsedParams[`Camera.${line.Camera}.Line.${line.Line}.Direction`] = line.Direction;
		});
		try {
			const path = `/stw-cgi/recording.cgi`;
			await this.device.getDigestAuthHeader(path);
			const response = await this.device.axiosInstance.get<{SearchToken: string}>(path, {
				params: parsedParams,
			});
			console.log('🚀 ~ SunApi ~ searchPeopleCount ~ response:', response.data);

			return response.data;
		} catch (error: any) {
			console.log('🚀 ~ SunApi ~ searchPeopleCount ~ error:178', error.response.data);
		}
	}
	/**
	 * To cancel the People Count search
	 */
	async peopleCountSearchCancel(params: {SearchToken: string}) {
		try {
			const path = `/stw-cgi/recording.cgi`;
			await this.device.getDigestAuthHeader(path);
			const response = await this.device.axiosInstance.get<{Response: 'Success'}>(path, {
				params: {
					msubmenu: 'peoplecountsearch',
					action: 'control',
					Mode: 'Cancel',
					SearchToken: params.SearchToken,
				},
			});
			console.log('🚀 ~ SunApi ~ peopleCountSearchCancel ~ response:', response.data);
			return response.data;
		} catch (error) {
			console.log('🚀 ~ SunApi ~ peopleCountSearchCancel ~ error:', error);
		}
	}

	/**
	 * To get the status of a People Count search
	 */
	async peopleCountSearchStatus(params: {SearchToken: string}) {
		try {
			const response = await this.device.axiosInstance.get('/stw-cgi/recording.cgi', {
				params: {
					msubmenu: 'peoplecountsearch',
					action: 'view',
					Type: 'Status',
					SearchToken: params.SearchToken,
				},
			});
			console.log('🚀 ~ SunApi ~ peopleCountSearchStatus ~ response:', response.data);
			return response.data;
		} catch (error) {
			console.log('🚀 ~ SunApi ~ peopleCountSearchStatus ~ error:', error);
		}
	}

	/**
	 * To get the results of a People Count search
	 */
	async peopleCountSearchResults(params: {SearchToken: string}) {
		try {
			const path = `/stw-cgi/recording.cgi`;
			await this.device.getDigestAuthHeader(path);
			const response = await this.device.axiosInstance.get<TPeopleCountSearchResponse>(path, {
				params: {
					msubmenu: 'peoplecountsearch',
					action: 'view',
					Type: 'Results',
					SearchToken: params.SearchToken,
				},
			});
			console.log('🚀 ~ SunApi ~ peopleCountSearchResults ~ response:', response.data);
			await fs.writeFile(`peoplecount-results-${Date.now()}.json`, JSON.stringify(response.data, null, 2));
			return response.data;
		} catch (error: any) {
			console.log('🚀 ~ SunApi ~ peopleCountSearchResults ~ error:', error.response.data);
		}
	}
}

export {PeopleCount};
