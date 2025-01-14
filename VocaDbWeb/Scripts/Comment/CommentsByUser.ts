import { ResourceRepository } from '@/Repositories/ResourceRepository';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';
import { CommentListViewModel } from '@/ViewModels/Comment/CommentListViewModel';
import $ from 'jquery';
import ko from 'knockout';
import moment from 'moment';

export const CommentCommentsByUser = (model: { id: number }): void => {
	$(function () {
		moment.locale(vdb.values.culture);
		ko.punches.enableAll();

		const httpClient = new HttpClient();
		var urlMapper = new UrlMapper(vdb.values.baseAddress);
		var resourceRepo = new ResourceRepository(
			httpClient,
			vdb.values.baseAddress,
		);
		var userId = model.id;

		var vm = new CommentListViewModel(
			vdb.values,
			urlMapper,
			resourceRepo,
			userId,
		);
		ko.applyBindings(vm);
	});
};
