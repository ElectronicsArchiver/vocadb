import { LocalizedStringWithIdContract } from '@/DataContracts/Globalization/LocalizedStringWithIdContract';
import { WebLinkContract } from '@/DataContracts/WebLinkContract';
import { EntryType } from '@/Models/EntryType';
import { NameMatchMode } from '@/Models/NameMatchMode';
import { ReleaseEventRepository } from '@/Repositories/ReleaseEventRepository';
import { UserRepository } from '@/Repositories/UserRepository';
import { EntryUrlMapper } from '@/Shared/EntryUrlMapper';
import { UrlMapper } from '@/Shared/UrlMapper';
import { DeleteEntryViewModel } from '@/ViewModels/DeleteEntryViewModel';
import { NamesEditViewModel } from '@/ViewModels/Globalization/NamesEditViewModel';
import { WebLinksEditViewModel } from '@/ViewModels/WebLinksEditViewModel';
import ko, { Observable } from 'knockout';

export class ReleaseEventSeriesEditViewModel {
	public constructor(
		private readonly eventRepository: ReleaseEventRepository,
		userRepository: UserRepository,
		private readonly urlMapper: UrlMapper,
		private readonly id: number,
		defaultNameLanguage: string,
		names: LocalizedStringWithIdContract[],
		webLinks: WebLinkContract[],
	) {
		this.defaultNameLanguage = ko.observable(defaultNameLanguage);
		this.names = NamesEditViewModel.fromContracts(names);
		this.webLinks = new WebLinksEditViewModel(webLinks);

		if (!this.isNew()) {
			window.setInterval(
				() =>
					userRepository.refreshEntryEdit({
						entryType: EntryType.ReleaseEventSeries,
						entryId: id,
					}),
				10000,
			);
		} else {
			for (const name of [
				this.names.originalName,
				this.names.romajiName,
				this.names.englishName,
			]) {
				ko.computed(() => name.value())
					.extend({ rateLimit: 500 })
					.subscribe(this.checkName);
			}
		}
	}

	private checkName = (value: string): void => {
		if (!value) {
			this.duplicateName(null!);
			return;
		}

		this.eventRepository
			.getSeriesList({
				query: value,
				nameMatchMode: NameMatchMode.Exact,
				maxResults: 1,
			})
			.then((result) => {
				this.duplicateName(result.items.length ? value : null!);
			});
	};

	public defaultNameLanguage: Observable<string>;
	public description = ko.observable<string>();
	public duplicateName = ko.observable<string>();
	public names: NamesEditViewModel;
	public submitting = ko.observable(false);
	public webLinks: WebLinksEditViewModel;

	public deleteViewModel = new DeleteEntryViewModel((notes) => {
		this.eventRepository
			.deleteSeries({ id: this.id, notes: notes, hardDelete: false })
			.then(() => {
				window.location.href = this.urlMapper.mapRelative(
					EntryUrlMapper.details(EntryType.ReleaseEventSeries, this.id),
				);
			});
	});

	private redirectToRoot = (): void => {
		window.location.href = this.urlMapper.mapRelative('Event');
	};

	public trashViewModel = new DeleteEntryViewModel((notes) => {
		this.eventRepository
			.deleteSeries({ id: this.id, notes: notes, hardDelete: true })
			.then(this.redirectToRoot);
	});

	private isNew = (): boolean => !this.id;

	public submit = (): boolean => {
		this.submitting(true);
		return true;
	};
}
