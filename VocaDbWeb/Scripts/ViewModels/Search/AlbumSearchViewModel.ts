import { AlbumContract } from '@/DataContracts/Album/AlbumContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { AlbumType } from '@/Models/Albums/AlbumType';
import { ResourcesManager } from '@/Models/ResourcesManager';
import {
	AlbumOptionalField,
	AlbumRepository,
} from '@/Repositories/AlbumRepository';
import { ArtistRepository } from '@/Repositories/ArtistRepository';
import { ResourceRepository } from '@/Repositories/ResourceRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import { ArtistFilters } from '@/ViewModels/Search/ArtistFilters';
import { SearchCategoryBaseViewModel } from '@/ViewModels/Search/SearchCategoryBaseViewModel';
import { SearchViewModel } from '@/ViewModels/Search/SearchViewModel';
import ko, { Computed, Observable } from 'knockout';

export class AlbumSearchViewModel extends SearchCategoryBaseViewModel<AlbumContract> {
	public constructor(
		searchViewModel: SearchViewModel,
		values: GlobalValues,
		private unknownPictureUrl: string,
		private albumRepo: AlbumRepository,
		private artistRepo: ArtistRepository,
		resourceRep: ResourceRepository,
		sort: string,
		artistId: number[],
		childVoicebanks: boolean,
		albumType: AlbumType,
		viewMode: string,
	) {
		super(searchViewModel);

		if (searchViewModel) {
			this.resourceManager = searchViewModel.resourcesManager;
		} else {
			this.resourceManager = new ResourcesManager(
				resourceRep,
				values.uiCulture,
			);
			this.resourceManager.loadResources('albumSortRuleNames', 'discTypeNames');
		}

		this.advancedFilters.filters.subscribe(this.updateResultsWithTotalCount);
		this.artistFilters = new ArtistFilters(
			values,
			this.artistRepo,
			childVoicebanks,
		);
		this.artistFilters.selectArtists(artistId);

		this.albumType = ko.observable(albumType || AlbumType.Unknown);
		this.sort = ko.observable(sort || 'Name');
		this.viewMode = ko.observable(viewMode || 'Details');

		this.sort.subscribe(this.updateResultsWithTotalCount);
		this.albumType.subscribe(this.updateResultsWithTotalCount);
		this.artistFilters.filters.subscribe(this.updateResultsWithTotalCount);

		this.sortName = ko.computed(() => {
			return this.resourceManager.resources().albumSortRuleNames != null
				? this.resourceManager.resources().albumSortRuleNames![this.sort()]
				: '';
		});

		this.loadResults = (
			pagingProperties,
			searchTerm,
			tags,
			childTags,
			status,
		): Promise<PartialFindResultContract<AlbumContract>> => {
			var artistIds = this.artistFilters.artistIds();

			return this.albumRepo.getList({
				paging: pagingProperties,
				lang: values.languagePreference,
				query: searchTerm,
				sort: this.sort(),
				discTypes: [this.albumType()],
				tags: tags,
				childTags: childTags,
				artistIds: artistIds,
				artistParticipationStatus: this.artistFilters.artistParticipationStatus(),
				childVoicebanks: this.artistFilters.childVoicebanks(),
				includeMembers: this.artistFilters.includeMembers(),
				fields: this.fields(),
				status: status,
				deleted: false,
				advancedFilters: this.advancedFilters.filters(),
			});
		};
	}

	public albumType: Observable<AlbumType>;
	public artistFilters: ArtistFilters;
	private resourceManager: ResourcesManager;
	public sort: Observable<string>;
	public sortName: Computed<string>;
	public viewMode: Observable<string>;

	public discTypeName = (discTypeStr: string): string =>
		this.resourceManager.resources().discTypeNames != null
			? this.resourceManager.resources().discTypeNames![discTypeStr]
			: '';

	public fields = ko.computed(() =>
		this.showTags()
			? [
					AlbumOptionalField.AdditionalNames,
					AlbumOptionalField.MainPicture,
					AlbumOptionalField.ReleaseEvent,
					AlbumOptionalField.Tags,
			  ]
			: [
					AlbumOptionalField.AdditionalNames,
					AlbumOptionalField.MainPicture,
					AlbumOptionalField.ReleaseEvent,
			  ],
	);

	public ratingStars = (album: AlbumContract): { enabled: boolean }[] => {
		if (!album) return [];

		var ratings = [1, 2, 3, 4, 5].map((rating) => ({
			enabled: Math.round(album.ratingAverage) >= rating,
		}));
		return ratings;
	};
}
