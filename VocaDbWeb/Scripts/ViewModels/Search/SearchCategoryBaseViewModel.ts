import { EntryContract } from '@/DataContracts/EntryContract';
import { PagingProperties } from '@/DataContracts/PagingPropertiesContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { TagBaseContract } from '@/DataContracts/Tag/TagBaseContract';
import { AdvancedSearchFilters } from '@/ViewModels/Search/AdvancedSearchFilters';
import { SearchViewModel } from '@/ViewModels/Search/SearchViewModel';
import { TagFilter } from '@/ViewModels/Search/TagFilter';
import { ServerSidePagingViewModel } from '@/ViewModels/ServerSidePagingViewModel';
import ko, { Computed, Observable, ObservableArray } from 'knockout';
import _ from 'lodash';
import moment from 'moment';

export interface ISearchCategoryBaseViewModel {
	updateResultsWithTotalCount: () => void;
}

// Base class for different types of searches.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class SearchCategoryBaseViewModel<TEntry>
	implements ISearchCategoryBaseViewModel {
	public constructor(public searchViewModel: SearchViewModel) {
		if (searchViewModel) {
			this.childTags = searchViewModel.tagFilters.childTags;
			this.draftsOnly = searchViewModel.draftsOnly;
			this.searchTerm = searchViewModel.searchTerm;
			this.showTags = searchViewModel.showTags;
			this.tags = searchViewModel.tagFilters.tags;
			this.tagIds = searchViewModel.tagFilters.tagIds;
			searchViewModel.pageSize.subscribe((pageSize) =>
				this.paging.pageSize(pageSize),
			);
			this.paging.pageSize.subscribe((pageSize) =>
				searchViewModel.pageSize(pageSize),
			);
		} else {
			this.childTags = ko.observable(false);
			this.draftsOnly = ko.observable(false);
			this.searchTerm = ko.observable('');
			this.showTags = ko.observable(false);
			this.tags = ko.observableArray<TagFilter>([]);
			this.childTags.subscribe(this.updateResultsWithTotalCount);
			this.draftsOnly.subscribe(this.updateResultsWithTotalCount);
			this.searchTerm.subscribe(this.updateResultsWithTotalCount);
			this.showTags.subscribe(this.updateResultsWithoutTotalCount);
			this.tags.subscribe(this.updateResultsWithTotalCount);
			this.tagIds = ko.computed(() => this.tags().map((t) => t.id));
			this.paging.pageSize.subscribe(this.updateResultsWithTotalCount);
		}

		this.paging.page.subscribe(this.updateResultsWithoutTotalCount);
	}

	public advancedFilters = new AdvancedSearchFilters();

	public childTags = ko.observable(false);

	public draftsOnly: Observable<boolean>;

	public formatDate = (dateStr: string): string => {
		return moment(dateStr).utc().format('l');
	};

	// Method for loading a page of results.
	public loadResults!: (
		pagingProperties: PagingProperties,
		searchTerm: string,
		tags: number[],
		childTags: boolean,
		status: string,
	) => Promise<PartialFindResultContract<any>>;

	public loading = ko.observable(true); // Currently loading for data

	public page = ko.observableArray<EntryContract>([]); // Current page of items
	public paging = new ServerSidePagingViewModel(); // Paging view model
	public pauseNotifications = false;

	public searchTerm: Observable<string>;

	public selectTag = (tag: TagBaseContract): void => {
		this.tags([TagFilter.fromContract(tag)]);
	};

	public showTags: Observable<boolean>;

	public tags: ObservableArray<TagFilter>;

	public tagIds: Computed<number[]>;

	// Update results loading the first page and updating total number of items.
	// Commonly this is done after changing the filters or sorting.
	public updateResultsWithTotalCount = (): void => this.updateResults(true);

	// Update a new page of results. Does not update total number of items.
	// This assumes the filters have not changed. Commonly this is done when paging.
	public updateResultsWithoutTotalCount = (): void => this.updateResults(false);

	public updateResults = (clearResults: boolean): void => {
		// Disable duplicate updates
		if (this.pauseNotifications) return;

		this.pauseNotifications = true;
		this.loading(true);

		if (clearResults) this.paging.page(1);

		var pagingProperties = this.paging.getPagingProperties(clearResults);

		this.loadResults(
			pagingProperties,
			this.searchTerm(),
			this.tagIds(),
			this.childTags(),
			this.draftsOnly() ? 'Draft' : null!,
		).then((result: PartialFindResultContract<any>) => {
			if (this.showTags()) {
				for (const item of result.items) {
					if (item.tags)
						item.tags = _.take(
							_.sortBy(item.tags, (t) => t.tag.name.toLowerCase()),
							10,
						);
				}
			}

			this.pauseNotifications = false;

			if (pagingProperties.getTotalCount)
				this.paging.totalItems(result.totalCount);

			this.page(result.items);
			this.loading(false);
		});
	};
}
