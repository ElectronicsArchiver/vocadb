import { EntryWithTagUsagesContract } from '@/DataContracts/Base/EntryWithTagUsagesContract';
import { PagingProperties } from '@/DataContracts/PagingPropertiesContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { TagBaseContract } from '@/DataContracts/Tag/TagBaseContract';
import { AdvancedSearchFilters } from '@/Stores/Search/AdvancedSearchFilters';
import { ICommonSearchStore } from '@/Stores/Search/CommonSearchStore';
import { SearchRouteParams } from '@/Stores/Search/SearchStore';
import { TagFilter } from '@/Stores/Search/TagFilter';
import { ServerSidePagingStore } from '@/Stores/ServerSidePagingStore';
import { StoreWithPagination } from '@vocadb/route-sphere';
import _ from 'lodash';
import {
	action,
	computed,
	makeObservable,
	observable,
	reaction,
	runInAction,
} from 'mobx';
import moment from 'moment';

export interface ISearchCategoryBaseStore<
	TRouteParams extends SearchRouteParams
> extends Omit<
		StoreWithPagination<TRouteParams>,
		'popState' | 'validateRouteParams'
	> {
	paging: ServerSidePagingStore;
	updateResultsWithTotalCount: () => Promise<void>;
}

// Base class for different types of searches.
export abstract class SearchCategoryBaseStore<
	TRouteParams extends SearchRouteParams,
	TEntry extends EntryWithTagUsagesContract
> implements ISearchCategoryBaseStore<TRouteParams> {
	public readonly advancedFilters = new AdvancedSearchFilters();
	private readonly commonSearchStore: ICommonSearchStore;
	@observable public loading = true; // Currently loading for data
	@observable public page: TEntry[] = []; // Current page of items
	public readonly paging = new ServerSidePagingStore(); // Paging store

	public constructor(commonSearchStore: ICommonSearchStore) {
		makeObservable(this);

		this.commonSearchStore = commonSearchStore;

		reaction(
			() => commonSearchStore.pageSize,
			(pageSize) => {
				this.paging.pageSize = pageSize;
			},
		);
		reaction(
			() => this.paging.pageSize,
			(pageSize) => {
				commonSearchStore.pageSize = pageSize;
			},
		);
	}

	@computed public get childTags(): boolean {
		return this.commonSearchStore.tagFilters.childTags;
	}
	public set childTags(value: boolean) {
		this.commonSearchStore.tagFilters.childTags = value;
	}

	@computed public get draftsOnly(): boolean {
		return this.commonSearchStore.draftsOnly;
	}
	public set draftsOnly(value: boolean) {
		this.commonSearchStore.draftsOnly = value;
	}

	@computed public get pageSize(): number {
		return this.commonSearchStore.pageSize;
	}
	public set pageSize(value: number) {
		this.commonSearchStore.pageSize = value;
	}

	@computed public get searchTerm(): string {
		return this.commonSearchStore.searchTerm;
	}
	public set searchTerm(value: string) {
		this.commonSearchStore.searchTerm = value;
	}

	@computed public get showTags(): boolean {
		return this.commonSearchStore.showTags;
	}
	public set showTags(value: boolean) {
		this.commonSearchStore.showTags = value;
	}

	@computed public get tags(): TagFilter[] {
		return this.commonSearchStore.tagFilters.tags;
	}
	public set tags(value: TagFilter[]) {
		this.commonSearchStore.tagFilters.tags = value;
	}

	@computed public get tagIds(): number[] {
		return this.tags.map((t) => t.id);
	}
	public set tagIds(value: number[]) {
		// OPTIMIZE
		this.commonSearchStore.tagFilters.tags = [];
		this.commonSearchStore.tagFilters.addTags(value);
	}

	public formatDate = (dateStr: string): string => {
		return moment(dateStr).utc().format('l');
	};

	// Method for loading a page of results.
	public abstract loadResults: (
		pagingProperties: PagingProperties,
	) => Promise<PartialFindResultContract<TEntry>>;

	@action public selectTag = (tag: TagBaseContract): void => {
		this.tags = [TagFilter.fromContract(tag)];
	};

	public abstract clearResultsByQueryKeys: (keyof TRouteParams)[];
	public abstract routeParams: TRouteParams;

	private pauseNotifications = false;

	@action public updateResults = async (
		clearResults: boolean,
	): Promise<void> => {
		// Disable duplicate updates
		if (this.pauseNotifications) return;

		this.pauseNotifications = true;
		this.loading = true;

		const pagingProperties = this.paging.getPagingProperties(clearResults);

		const result = await this.loadResults(pagingProperties);

		if (this.showTags) {
			for (const item of result.items) {
				if (item.tags) {
					item.tags = _.take(
						_.sortBy(item.tags, (t) => t.tag.name.toLowerCase()),
						10,
					);
				}
			}
		}

		this.pauseNotifications = false;

		runInAction(() => {
			if (pagingProperties.getTotalCount)
				this.paging.totalItems = result.totalCount;

			this.page = result.items;
			this.loading = false;
		});
	};

	// Update results loading the first page and updating total number of items.
	// Commonly this is done after changing the filters or sorting.
	public updateResultsWithTotalCount = (): Promise<void> => {
		return this.updateResults(true);
	};

	public updateResultsWithoutTotalCount = (): Promise<void> => {
		return this.updateResults(false);
	};

	public onClearResults = (): void => {
		this.paging.goToFirstPage();
	};
}
