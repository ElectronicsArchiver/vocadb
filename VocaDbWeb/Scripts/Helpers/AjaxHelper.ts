import $ from 'jquery';
import _ from 'lodash';

export class AjaxHelper {
	public static createUrl = (params: {
		[key: string]: string[] | number[];
	}): string | null => {
		if (!params) return null;

		var par: string[] = [];

		_.forOwn(params, (val, key) => {
			par.push(
				key +
					'=' +
					(val as string[])
						.map((v) => encodeURIComponent(v || ''))
						.join('&' + key + '='),
			);
		});

		var query = par.join('&');
		return query;
	};

	public static stringify = (params: any): string => {
		// HACK: Removes undefined.
		// Code from: https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript/30386744#30386744
		return $.param(JSON.parse(JSON.stringify(params)));
	};
}
