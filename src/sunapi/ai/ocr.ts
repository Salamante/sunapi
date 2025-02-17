import {SunApi} from '../index.js';

type TOCRSearchOptionViewParameters = {
	Type: any;
	SearchToken: string;
	ResultFromIndex: string;
	ResultFromTime: string; //YYYY-MM-DDTHH:MM::SSZ
	ResultToTime: string; //YYYY-MM-DDTHH:MM::SSZ
	MaxResults: number;
	Status: 'Completed' | 'NotCompleted';
	TotalResultsFound: number;
	TotalCount: number;
	TimedOut: boolean;
	ResultFromDate: string; //YYYY-MM-DDTHH:MM::SSZ
	ResultToDate: string; //YYYY-MM-DDTHH:MM::SSZ
	SearchTokenExpiryTime: string; //YYYY-MM-DDTHH:MM::SSZ
	'Result.#.DateTime': string; //YYYY-MM-DDTHH:MM::SSZ
	'Result.#.Channel': number;
	'Result.#.Attributes': string;
	'Result.#.ImageURL': string;
	'Result.#.Resolution': string; //widthxheight
	'Result.#.BkID': string;
	'Result.#.BoundingBox': string; //left, top, right, bottom
};
type TOCRSearchOptionControlParameters = {
	Mode: 'Start' | 'Cancel' | 'Renew' | 'Stop'; // Corrected typo: Cance -> Cancel
	ChannelIDList: string; // Comma separated list of channel IDs
	OverlappedID: number;
	SearchText: string; // The text to search for
	FromDate: string; //YYYY-MM-DDTHH:MM::SSZ
	ToDate: string; //YYYY-MM-DDTHH:MM::SSZ
	Async: boolean; // If true, the search will be asynchronous
	WaitTime: number; // Thimeout second (default 60)
	SearchToken: string; // Search token given as response, which can be used for view operation
	TotalCount: number; // Total count
	ResultFromDate: string; // Time in UTC format: YYYY-MM-DDTHH:MM:SSZ
	ResultToDate: string; // Time in UTC format: YYYY-MM-DDTHH:MM:SSZ
};

interface TMetaAttributeSearchOptions<T = 'view' | 'control'> {
	action: T;
	parameters: T extends 'view' ? TOCRSearchOptionViewParameters : TOCRSearchOptionControlParameters;
}

class OCR extends SunApi {
	/**
	 * @description The ocrsearch submenu is used to search a video that matches an input string.
	 *
	 * @example:
	 * http://<Device IP>/stw-cgi/ai.cgi?msubmenu=ocrsearch&action=control&Mode=Start&Async=True&ChannelID
	 * List=0,1,2,3,4&OverlappedID=-1&FromDate=1970-01-01T01-02-03&ToDate=2021-01-01T01-02-03&SearchText=*nu*
	 */
	async OCRSearch(options: TMetaAttributeSearchOptions) {
		const url = `/stw-cgi/recording.cgi?submenu=ocrsearch&action=${options.action}&Start`;
		const {parameters} = options;
		const params = new URLSearchParams(String(parameters)).toString();

		try {
			const response = await this.axiosInstance.get(url + params);
			console.log('🚀 ~ OCR ~ OCRSearch ~ response:', response.data);
			return response.data.SearchToken;
		} catch (error: any) {
			console.log('🚀 ~ OCR ~ OCRSearch ~ error:', error.response);
		}
	}

	/**
	 * @description The view operation is used to view the status of the search operation.
	 *
	 * @example:
	 * http://<Device IP>/stw-cgi/ai.cgi?msubmenu=ocrsearch&action=view&Type=Status&SearchToken=1234567890
	 */
	async viewOCRSearchResultStatus(SearchToken: string) {
		const url = `/stw-cgi/recording.cgi?submenu=ocrsearch&action=view&Type=Status&SearchToken=${SearchToken}`;
		try {
			const response = await this.axiosInstance.get(url);

			console.log('🚀 ~ OCR ~ viewOCRSearchResultStatus ~ response:', response.data);
			return response.data;
		} catch (error: any) {
			console.log('🚀 ~ OCR ~ viewOCRSearchResultStatus ~ error:', error.response);
		}
	}

	/**
	 * @description The view operation is used to view search result.
	 *
	 * @example:
	 * http://<Device IP>/stw-cgi/ai.cgi?msubmenu=ocrsearch&action=view&Type=Results&ResultFromIndex=1&MaxResults=5&SearchToken=48928
	 */
	async viewOCRSearchResult(SearchToken: string) {
		const url = `/stw-cgi/recording.cgi?submenu=ocrsearch&action=view&Type=Results&ResultFromIndex=1&MaxResults=5&SearchToken=${SearchToken}`;
		try {
			const response = await this.axiosInstance.get(url);
			console.log('🚀 ~ OCR ~ viewOCRSearchResult ~ response:', response.data);
			return response.data;
		} catch (error: any) {
			console.log('🚀 ~ OCR ~ viewOCRSearchResult ~ error:', error.response);
		}
	}
}
