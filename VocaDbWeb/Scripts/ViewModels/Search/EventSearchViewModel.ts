import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { ReleaseEventContract } from '@/DataContracts/ReleaseEvents/ReleaseEventContract';
import { ArtistRepository } from '@/Repositories/ArtistRepository';
import {
	ReleaseEventOptionalField,
	ReleaseEventRepository,
} from '@/Repositories/ReleaseEventRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import { ArtistFilters } from '@/ViewModels/Search/ArtistFilters';
import { SearchCategoryBaseViewModel } from '@/ViewModels/Search/SearchCategoryBaseViewModel';
import { SearchViewModel } from '@/ViewModels/Search/SearchViewModel';
import ko, { Computed } from 'knockout';

export class EventSearchViewModel extends SearchCategoryBaseViewModel<ReleaseEventContract> {
	public constructor(
		searchViewModel: SearchViewModel,
		values: GlobalValues,
		private readonly eventRepo: ReleaseEventRepository,
		artistRepo: ArtistRepository,
		/* TODO: remove */ public loggedUserId: number,
		sort: string,
		artistId: number[],
		category: string,
	) {
		super(searchViewModel);

		this.artistFilters = new ArtistFilters(values, artistRepo, false);
		this.artistFilters.selectArtists(artistId);

		if (sort) this.sort(sort);

		if (category) this.category(category);

		this.afterDate.subscribe(this.updateResultsWithTotalCount);
		this.artistFilters.filters.subscribe(this.updateResultsWithTotalCount);
		this.beforeDate.subscribe(this.updateResultsWithTotalCount);
		this.category.subscribe(this.updateResultsWithTotalCount);
		this.onlyMyEvents.subscribe(this.updateResultsWithTotalCount);
		this.sort.subscribe(this.updateResultsWithTotalCount);

		this.loadResults = (
			pagingProperties,
			searchTerm,
			tag,
			childTags,
			status,
		): Promise<PartialFindResultContract<ReleaseEventContract>> =>
			this.eventRepo.getList({
				queryParams: {
					start: pagingProperties.start,
					maxResults: pagingProperties.maxEntries,
					getTotalCount: pagingProperties.getTotalCount,
					lang: values.languagePreference,
					query: searchTerm,
					sort: this.sort(),
					category: this.category() === 'Unspecified' ? null! : this.category(),
					childTags: childTags,
					tagIds: tag,
					userCollectionId: this.onlyMyEvents() ? values.loggedUserId : null!,
					artistId: this.artistFilters.artistIds(),
					childVoicebanks: this.artistFilters.childVoicebanks(),
					includeMembers: this.artistFilters.includeMembers(),
					afterDate: this.afterDate()!,
					beforeDate: this.beforeDate()!,
					status: status,
					fields: this.fields(),
				},
			});

		this.sortName = ko.computed(() => {
			return searchViewModel.resourcesManager.resources().eventSortRuleNames !=
				null
				? searchViewModel.resourcesManager.resources().eventSortRuleNames![
						this.sort()
				  ]
				: '';
		});
	}

	public afterDate = ko.observable<Date>(null!);
	public allowAliases = ko.observable(false);
	public artistFilters: ArtistFilters;
	public beforeDate = ko.observable<Date>(null!);
	public category = ko.observable('');
	public onlyMyEvents = ko.observable(false);
	public sort = ko.observable('Name');
	public sortName: Computed<string>;

	public fields = ko.computed(() =>
		this.searchViewModel.showTags()
			? [
					ReleaseEventOptionalField.AdditionalNames,
					ReleaseEventOptionalField.MainPicture,
					ReleaseEventOptionalField.Series,
					ReleaseEventOptionalField.Venue,
					ReleaseEventOptionalField.Tags,
			  ]
			: [
					ReleaseEventOptionalField.AdditionalNames,
					ReleaseEventOptionalField.MainPicture,
					ReleaseEventOptionalField.Series,
					ReleaseEventOptionalField.Venue,
			  ],
	);

	public getCategoryName = (event: ReleaseEventContract): string => {
		var inherited = event.series ? event.series.category : event.category;

		if (!inherited || inherited === 'Unspecified') return '';

		return this.searchViewModel.resourcesManager.resources()
			.eventCategoryNames != null
			? this.searchViewModel.resourcesManager.resources().eventCategoryNames![
					inherited
			  ]
			: '';
	};
}
