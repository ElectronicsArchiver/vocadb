import { CommentContract } from '@/DataContracts/CommentContract';
import { TagUsageForApiContract } from '@/DataContracts/Tag/TagUsageForApiContract';
import { LoginManager } from '@/Models/LoginManager';
import { RepositoryFactory } from '@/Repositories/RepositoryFactory';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';
import { PVPlayersFactory } from '@/ViewModels/PVs/PVPlayersFactory';
import { SongListViewModel } from '@/ViewModels/SongList/SongListViewModel';
import $ from 'jquery';
import ko from 'knockout';

export const SongListDetails = (
	defaultSortRuleName: string,
	model: {
		songList: {
			id: number;
			latestComments: CommentContract[];
			tags: TagUsageForApiContract[];
		};
	},
): void => {
	$(function () {
		const loginManager = new LoginManager(vdb.values);
		const canDeleteAllComments = loginManager.canDeleteComments;

		$('#editListLink').button({ icons: { primary: 'ui-icon-wrench' } });
		$('#viewVersions').button({ icons: { primary: 'ui-icon-clock' } });
		$('#export').button({ icons: { primary: 'ui-icon-arrowthickstop-1-s' } });

		var listId = model.songList.id;

		const httpClient = new HttpClient();
		var rootPath = vdb.values.baseAddress;
		var urlMapper = new UrlMapper(rootPath);
		var repoFactory = new RepositoryFactory(httpClient, urlMapper);
		var userRepo = repoFactory.userRepository();
		var songRepo = repoFactory.songRepository();
		var artistRepo = repoFactory.artistRepository();
		var songListRepo = repoFactory.songListRepository();
		var resourceRepo = repoFactory.resourceRepository();
		var pvPlayerElem = $('#pv-player-wrapper')[0];
		var pvPlayersFactory = new PVPlayersFactory(pvPlayerElem);
		var latestComments = model.songList.latestComments;
		var tagUsages = model.songList.tags;

		var vm = new SongListViewModel(
			vdb.values,
			urlMapper,
			songListRepo,
			songRepo,
			userRepo,
			artistRepo,
			resourceRepo,
			defaultSortRuleName,
			latestComments,
			listId,
			tagUsages,
			pvPlayersFactory,
			canDeleteAllComments,
		);
		ko.applyBindings(vm);
	});
};
