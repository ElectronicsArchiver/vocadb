import { CommentContract } from '@/DataContracts/CommentContract';
import { TagUsageForApiContract } from '@/DataContracts/Tag/TagUsageForApiContract';
import { UserBaseContract } from '@/DataContracts/User/UserBaseContract';
import { LoginManager } from '@/Models/LoginManager';
import { UserEventRelationshipType } from '@/Models/Users/UserEventRelationshipType';
import { ReleaseEventRepository } from '@/Repositories/ReleaseEventRepository';
import { UserRepository } from '@/Repositories/UserRepository';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';
import { ReleaseEventDetailsViewModel } from '@/ViewModels/ReleaseEvent/ReleaseEventDetailsViewModel';
import { IEntryReportType } from '@/ViewModels/ReportEntryViewModel';
import $ from 'jquery';
import ko from 'knockout';

export const EventDetails = (
	eventAssociationType: UserEventRelationshipType,
	model: {
		id: number;
		latestComments: CommentContract[];
		tags: TagUsageForApiContract[];
		usersAttending: UserBaseContract[];
	},
	reportTypes: IEntryReportType[],
): void => {
	$(function () {
		const loginManager = new LoginManager(vdb.values);
		const canDeleteAllComments = loginManager.canDeleteComments;

		$('#editEventLink').button({
			disabled: $('#editEventLink').hasClass('disabled'),
			icons: { primary: 'ui-icon-wrench' },
		});
		$('#viewVersions').button({ icons: { primary: 'ui-icon-clock' } });
		$('#reportEntryLink').button({ icons: { primary: 'ui-icon-alert' } });
		$('#manageTags').button({ icons: { primary: 'ui-icon-wrench' } });

		const httpClient = new HttpClient();
		var rootPath = vdb.values.baseAddress;
		var urlMapper = new UrlMapper(rootPath);
		var eventRepo = new ReleaseEventRepository(httpClient, urlMapper);
		var userRepo = new UserRepository(httpClient, urlMapper);
		var latestComments = model.latestComments;
		var users = model.usersAttending;
		var tags = model.tags;

		var vm = new ReleaseEventDetailsViewModel(
			vdb.values,
			httpClient,
			urlMapper,
			eventRepo,
			userRepo,
			latestComments,
			reportTypes,
			vdb.values.loggedUserId,
			model.id,
			eventAssociationType,
			users,
			tags,
			canDeleteAllComments,
		);
		ko.applyBindings(vm);

		$('.artistLink').vdbArtistToolTip();
	});
};
