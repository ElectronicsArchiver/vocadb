import { TagBaseContract } from '@/DataContracts/Tag/TagBaseContract';
import { TagMappingContract } from '@/DataContracts/Tag/TagMappingContract';
import { TagRepository } from '@/Repositories/TagRepository';
import { EntryUrlMapper } from '@/Shared/EntryUrlMapper';
import { functions } from '@/Shared/GlobalFunctions';
import { ui } from '@/Shared/MessagesTyped';
import { BasicEntryLinkViewModel } from '@/ViewModels/BasicEntryLinkViewModel';
import { ServerSidePagingViewModel } from '@/ViewModels/ServerSidePagingViewModel';
import ko from 'knockout';
import _ from 'lodash';

export class ManageTagMappingsViewModel {
	public constructor(private readonly tagRepo: TagRepository) {
		this.filter.subscribe(() => {
			this.paging.totalItems(this.filteredMappings().length);
			this.paging.goToFirstPage();
		});
		this.loadMappings();
	}

	public addMapping = (): void => {
		if (!this.newSourceName || this.newTargetTag.isEmpty()) return;

		if (
			this.mappings().some(
				(m) =>
					m.tag.id === this.newTargetTag.id() &&
					m.sourceTag.toLowerCase() === this.newSourceName().toLowerCase(),
			)
		) {
			ui.showErrorMessage(
				'Mapping already exists for source tag ' + this.newSourceName(),
			);
			return;
		}

		this.mappings.push(
			new EditTagMappingViewModel(
				{ tag: this.newTargetTag.entry(), sourceTag: this.newSourceName() },
				true,
			),
		);
		this.newSourceName('');
		this.newTargetTag.clear();
	};

	public deleteMapping = (mapping: EditTagMappingViewModel): void => {
		mapping.isDeleted(true);
	};

	public filter = ko.observable('');

	public getSourceTagUrl = (tag: EditTagMappingViewModel): string => {
		return 'http://www.nicovideo.jp/tag/' + encodeURIComponent(tag.sourceTag);
	};

	public getTagUrl = (tag: EditTagMappingViewModel): string => {
		return functions.mapAbsoluteUrl(
			EntryUrlMapper.details_tag(tag.tag.id, tag.tag.urlSlug),
		);
	};

	private loadMappings = async (): Promise<void> => {
		const result = await this.tagRepo.getMappings({
			paging: {
				start: 0,
				maxEntries: 10000,
				getTotalCount: false,
			},
		});
		this.mappings(result.items.map((t) => new EditTagMappingViewModel(t)));
		this.paging.totalItems(this.filteredMappings().length);
		this.paging.goToFirstPage();
	};

	public mappings = ko.observableArray<EditTagMappingViewModel>();

	public filteredMappings = ko.computed(() => {
		const filter = this.filter().toLowerCase();
		if (!filter) return this.mappings();
		return this.mappings().filter(
			(mapping) =>
				mapping.sourceTag.toLowerCase().includes(filter) ||
				mapping.tag.name.toLowerCase().includes(filter),
		);
	});

	public paging = new ServerSidePagingViewModel(50);

	public activeMappings = ko.computed(() =>
		this.mappings().filter((m) => !m.isDeleted()),
	);

	public newSourceName = ko.observable('');
	public newTargetTag = new BasicEntryLinkViewModel<TagBaseContract>();

	public save = async (): Promise<void> => {
		const mappings = this.activeMappings();
		await this.tagRepo.saveMappings({ mappings: mappings });
		ui.showSuccessMessage('Saved');
		await this.loadMappings();
	};

	public sortedMappings = ko.computed(() =>
		_.sortBy(this.filteredMappings(), (m) => m.tag.name.toLowerCase()),
	);

	public sortedMappingsPage = ko.computed(() => {
		return this.sortedMappings().slice(
			this.paging.firstItem(),
			this.paging.firstItem() + this.paging.pageSize(),
		);
	});
}

export class EditTagMappingViewModel {
	public constructor(mapping: TagMappingContract, isNew: boolean = false) {
		this.sourceTag = mapping.sourceTag;
		this.tag = mapping.tag;
		this.isNew = isNew;
	}

	public isDeleted = ko.observable(false);
	public isNew: boolean;
	public sourceTag: string;
	public tag: TagBaseContract;

	public deleteMapping = (): void => this.isDeleted(true);
}
