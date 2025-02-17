import {SunApi} from '../index.js';

/**
 * #SUNAPI_ai_26.2.pdf
 * # Chapter 2. Metaattributesearch
 * * This submenu is applicable to NVR only
 */
type TMetaAttributeSearchOptionViewParameters = {
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
	'Result.#.ObjectID': number;
	'Result.#.BoundingBox': string; //left, top, right, bottom
};

type TMetaAttributeSearchOptionControlParameters = {
	Mode: 'Start' | 'Cancel' | 'Renew' | 'Stop'; // Corrected typo: Cance -> Cancel
	ClassType: 'Person' | 'Vehicle' | 'Face';
	ChannelIDList: string; // Comma separated list of channel IDs
	OverlappedID: number;
	Gender: 'Any' | 'Male' | 'Female'; // From the "Search Attributes.Person.Gender" row
	Clothing_Tops_ColorString:
		| 'Any'
		| 'Black'
		| 'Gray'
		| 'White'
		| 'Red'
		| 'Orange'
		| 'Yellow'
		| 'Green'
		| 'Blue'
		| 'Purple'; // From "Search Attributes.Person.Clothing.Tops.ColorString"
	Clothing_Tops_Length: 'Any' | 'Long' | 'Short'; // From "Search Attributes.Person.Clothing.Tops.Length"
	Clothing_Bottoms_ColorString:
		| 'Any'
		| 'Black'
		| 'Gray'
		| 'White'
		| 'Red'
		| 'Orange'
		| 'Yellow'
		| 'Green'
		| 'Blue'
		| 'Purple'; // From "Search Attributes.Person.Clothing.Bottoms.ColorString"
	Clothing_Bottoms_Length: 'Any' | 'Long' | 'Short'; // From "Search Attributes.Person.Clothing.Bottoms.Length"
	Clothing_Hat: 'Any' | 'Wear' | 'No'; // From "Search Attributes.Person.Clothing.Hat", added "No" as an alternative to "Wear"
	Belonging_Bag: 'Any' | 'Wear' | 'No'; // Search Attributes.Person.Belonging.Bag
	Face_Gender: 'Any' | 'Male' | 'Female'; // Search Attributes.Face.Gender (likely redundant, but included as per screenshot)
	Face_AgeType: 'Any' | 'Young' | 'Adult' | 'Middle' | 'Senior'; // Search Attributes.Face.AgeType
	Face_Hat: 'Any' | 'Wear' | 'No'; // Search Attributes.Face.Hat (likely redundant, but included as per screenshot)
	Face_Opticals: 'Any' | 'Wear' | 'No'; // Search Attributes.Face.Opticals
	Vehicle_Type: 'Any' | 'Car' | 'Bus' | 'Truck' | 'Motorcycle' | 'Bicycle' | 'Train'; // Search Attributes.Vehicle.Type
	Vehicle_ColorString: 'Any' | 'Black' | 'Gray' | 'White' | 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple'; // Search Attributes.Vehicle.ColorString
	FromDate: string; // Time in UTC format: YYYY-MM-DDTHH:MM:SSZ
	ToDate: string; // Time in UTC format: YYYY-MM-DDTHH:MM:SSZ
	Async: boolean; // Asynchronous search option (true/false)
	WaitTime: number; // Timeout in seconds (default: 60)
	SearchToken: string; // Search token given as response, which can be used for view operation
	TotalCount: number; // Total count
	ResultFromDate: string; // Time in UTC format: YYYY-MM-DDTHH:MM:SSZ
	ResultToDate: string; // Time in UTC format: YYYY-MM-DDTHH:MM:SSZ
};

interface TMetaAttributeSearchOptions<T = 'view' | 'control'> {
	action: T;
	parameters: T extends 'view'
		? TMetaAttributeSearchOptionViewParameters
		: TMetaAttributeSearchOptionControlParameters;
}

class MetaSearch extends SunApi {
	/**
	 * #2.4.1. Meta attribute search
	 * @example:
	 * http://<Device IP>/stw-cgi/ai.cgi?msubmenu=metaattributesearch&action=control&Mode=Start&Async=True
	 * &ClassType=Person&ChannelIDList=0,1,2,3,63&OverlappedID=-1&FromDate=1970-01-
	 * 01T01:02:03Z&ToDate=2021-01-
	 * 26T01:02:03Z&SearchAttributes.Person.Gender=Male&SearchAttributes.Person.Clo
	 * thing.Tops.ColorString=Black,Red&SearchAttributes.Person.Clothing.Bottoms.Co
	 * lorString=Gray,White&SearchAttributes.Person.Belonging.Bag=Wear
	 */
	async metaAttributeSearch(options: TMetaAttributeSearchOptions) {
		const url = `http:${this.hostname}/stw-cgi/ai.cgi?submenu=metaattributesearch&action=${options.action}&Start&Async=True`;
		const {parameters} = options;
		const params = new URLSearchParams(String(parameters)).toString();

		try {
			const response = await this.axiosInstance.get(url + params);
			console.log('🚀 ~ MetaSearch ~ metaAttributeSearch ~ response:', response.data);
		} catch (error: any) {
			console.log('🚀 ~ MetaSearch ~ metaAttributeSearch ~ error:', error.response);
		}
	}

	async viewSearchResultStatus(SearchToken: string) {
		const url = `http:${this.hostname}/stw-cgi/ai.cgi?submenu=metaattributesearch&action=view&Type=Status&SearchToken=${SearchToken}`;
		try {
			const response = await this.axiosInstance.get(url);
			console.log('🚀 ~ MetaSearch ~ viewSearchResultStatus ~ response:', response.data);
		} catch (error: any) {
			console.log('🚀 ~ MetaSearch ~ viewSearchResultStatus ~ error:', error.response);
		}
	}
	/**
	 * @example of the response:
	 * {
	 *   "SearchTokenExpiryTime": "2019-06-15T23:14:45Z",
	 *   "Status": "Completed",
	 *   "TotalResultsFound": 100,
	 *   "TotalCount": 1414,
	 *   "TimedOut": "False",
	 *   "Results": [
	 *     {
	 *       "Result": 0,
	 *       "DateTime": "2019-06-15T23:13:32Z",
	 *       "Channel": 2,
	 *       "Attributes": {
	 *         "Person": {
	 *           "Gender": ["Male"],
	 *           "Clothing": {
	 *             "Tops": {
	 *               "ColorString": ["Black"]
	 *             },
	 *             "Bottoms": {
	 *               "ColorString": ["Gray"]
	 *             }
	 *           },
	 *           "Belonging": {
	 *             "Bag": ["Wear"]
	 *           }
	 *         }
	 *       },
	 *       "ImageURL": "/stw-cgi/ai.cgi?msubmenu=imageget&action=view&type=metaattributesearch&ID=000000000000000000_10_0_2_1560640412_298530",
	 *       "Resolution": "208x336",
	 *       "ObjectID": 298530,
	 *       "Coordinate_Del": "1372,160,1579,497",
	 *       "BoundingBox": [
	 *         {
	 *           "left": -0.285231,
	 *           "top": -0.851852,
	 *           "right": -0.17739,
	 *           "bottom": -0.539815
	 *         }
	 *       ],
	 *       "BkID": "00000000000000000000000000000000"
	 *     },
	 *     {
	 *       "Result": 99,
	 *       "DateTime": "2019-06-15T22:32:27Z",
	 *       "Channel": 2,
	 *       "Attributes": {
	 *         "Person": {
	 *           "Gender": ["Male"],
	 *           "Clothing": {
	 *             "Tops": {
	 *               "ColorString": ["Red"]
	 *             },
	 *             "Bottoms": {
	 *               "ColorString": ["Gray"]
	 *             }
	 *           },
	 *           "Belonging": {
	 *             "Bag": ["Wear"]
	 *           }
	 *         }
	 *       },
	 *       "ImageURL": "/stw-cgi/ai.cgi?msubmenu=imageget&action=view&type=metaattributesearch&ID=000000000000000000_10_0_2_1560637947_286642",
	 *       "Resolution": "160x256",
	 *       "ObjectID": 286642,
	 *       "Coordinate_Del": "1221,0,1382,262",
	 *       "BoundingBox": [
	 *         {
	 *           "left": -0.363897,
	 *           "top": -1,
	 *           "right": -0.280021,
	 *           "bottom": -0.757407
	 *         }
	 *       ],
	 *       "BkID": "00000000000000000000000000000000"
	 *     }
	 *   ]
	 * }
	 */

	async viewSearchResult(SearchToken: string) {
		const url = `http:${this.hostname}/stw-cgi/ai.cgi?submenu=metaattributesearch&action=view&Type=Results&ResultFromIndex=1&MaxResults=100&SearchToken=${SearchToken}`;
		try {
			const response = await this.axiosInstance.get(url);
			console.log('🚀 ~ MetaSearch ~ viewSearchResult ~ response:', response.data);
		} catch (error: any) {
			console.log('🚀 ~ MetaSearch ~ viewSearchResult ~ error:', error.response);
		}
	}
}

export {MetaSearch};
