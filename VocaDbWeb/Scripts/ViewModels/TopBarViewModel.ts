import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { UserMessageSummaryContract } from '@/DataContracts/User/UserMessageSummaryContract';
import { EntryReportRepository } from '@/Repositories/EntryReportRepository';
import { UserRepository } from '@/Repositories/UserRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import ko, { Computed, Observable } from 'knockout';

// View model for the top bar.
export class TopBarViewModel {
	public ensureMessagesLoaded = (): void => {
		if (this.isLoaded()) return;

		this.userRepository
			.getMessageSummaries({
				userId: this.values.loggedUserId,
				inbox: undefined,
				paging: { maxEntries: 3, start: 0, getTotalCount: false },
				unread: true,
				anotherUserId: undefined,
				iconSize: 40,
			})
			.then(
				(messages: PartialFindResultContract<UserMessageSummaryContract>) => {
					this.unreadMessages(messages.items);
					this.isLoaded(true);
				},
			);
	};

	public entryType: Observable<string>;

	public hasNotifications: Computed<boolean>;

	public isLoaded = ko.observable(false);

	public reportCount = ko.observable(0);

	public searchTerm: Observable<string>;

	public entryTypeName: Computed<string>;

	public unreadMessages = ko.observableArray<UserMessageSummaryContract>();

	public unreadMessagesCount: Observable<number>;

	// Initializes view model
	// entryTypeTranslations: translations for entry types.
	// entryType: currently selected entry type (for search).
	// unreadMessagesCount: number of unread received messages (includes notifications).
	// getNewReportsCount: whether to load new reports count (for mods only).
	// entryReportRepository: entry reports repository.
	// userRepository: user repository.
	public constructor(
		private readonly values: GlobalValues,
		entryTypeTranslations: { [x: string]: string },
		entryType: string,
		searchTerm: string,
		unreadMessagesCount: number,
		getNewReportsCount: boolean,
		entryReportRepository: EntryReportRepository,
		private userRepository: UserRepository,
	) {
		this.entryType = ko.observable(entryType);
		this.searchTerm = ko.observable(searchTerm);
		this.unreadMessagesCount = ko.observable(unreadMessagesCount);

		this.entryTypeName = ko.computed(() => {
			return entryTypeTranslations[this.entryType()] as string;
		});

		this.hasNotifications = ko.computed(() => {
			return this.reportCount() > 0;
		});

		if (getNewReportsCount) {
			entryReportRepository.getNewReportCount({}).then((count) => {
				this.reportCount(count);
			});
		}
	}
}
