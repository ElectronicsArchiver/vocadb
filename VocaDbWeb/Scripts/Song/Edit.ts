import { SongForEditContract } from '@/DataContracts/Song/SongForEditContract';
import { TranslatedEnumField } from '@/DataContracts/TranslatedEnumField';
import { LoginManager } from '@/Models/LoginManager';
import { RepositoryFactory } from '@/Repositories/RepositoryFactory';
import { DialogService } from '@/Shared/DialogService';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';
import { SongEditViewModel } from '@/ViewModels/Song/SongEditViewModel';
import $ from 'jquery';
import ko from 'knockout';
import moment from 'moment';

function initPage(): void {
	$('#tabs').tabs();
	$('#deleteLink').button({ icons: { primary: 'ui-icon-trash' } });
	$('#restoreLink').button({ icons: { primary: 'ui-icon-trash' } });
	$('#mergeLink').button();
	$('#pvLoader')
		.ajaxStart(function (this: any) {
			$(this).show();
		})
		.ajaxStop(function (this: any) {
			$(this).hide();
		});

	$('#artistsTableBody a.artistLink').vdbArtistToolTip();
}

export const SongEdit = (
	addExtraArtist: string,
	artistRoleJson: { [key: string]: string },
	languageNames: any,
	model: {
		editedSong: SongForEditContract;
		id: number;
		instrumentalTagId: number;
	},
	saveWarning: any,
	webLinkCategoryJson: TranslatedEnumField[],
): void => {
	$(document).ready(function () {
		const loginManager = new LoginManager(vdb.values);
		const canBulkDeletePVs = loginManager.canBulkDeletePVs;

		moment.locale(vdb.values.culture);
		ko.punches.enableAll();

		vdb.resources.entryEdit = {
			saveWarning: saveWarning,
		};

		vdb.resources.song = {
			addExtraArtist: addExtraArtist,
		};

		var editedModel = model.editedSong;
		const httpClient = new HttpClient();
		var rootPath = vdb.values.baseAddress;
		var urlMapper = new UrlMapper(rootPath);
		var repoFactory = new RepositoryFactory(httpClient, urlMapper);
		var songRepo = repoFactory.songRepository();
		var artistRepo = repoFactory.artistRepository();
		var pvRepo = repoFactory.pvRepository();
		var userRepo = repoFactory.userRepository();
		var instrumentalTagId = model.instrumentalTagId;
		var vm;

		if (editedModel) {
			vm = new SongEditViewModel(
				vdb.values,
				songRepo,
				artistRepo,
				pvRepo,
				userRepo,
				urlMapper,
				artistRoleJson,
				webLinkCategoryJson,
				editedModel,
				canBulkDeletePVs,
				new DialogService(),
				instrumentalTagId,
				languageNames,
			);
			ko.applyBindings(vm);
		} else {
			songRepo.getForEdit({ id: model.id }).then(function (model) {
				vm = new SongEditViewModel(
					vdb.values,
					songRepo,
					artistRepo,
					pvRepo,
					userRepo,
					urlMapper,
					artistRoleJson,
					webLinkCategoryJson,
					model,
					canBulkDeletePVs,
					new DialogService(),
					instrumentalTagId,
					languageNames,
				);
				ko.applyBindings(vm);
			});
		}

		initPage();
	});
};
