import { DiscussionFolderContract } from '@/DataContracts/Discussion/DiscussionFolderContract';
import { DiscussionTopicContract } from '@/DataContracts/Discussion/DiscussionTopicContract';
import { DiscussionRepository } from '@/Repositories/DiscussionRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import { UrlMapper } from '@/Shared/UrlMapper';
import {
	DiscussionTopicEditViewModel,
	DiscussionTopicViewModel,
} from '@/ViewModels/Discussion/DiscussionTopicViewModel';
import { ServerSidePagingViewModel } from '@/ViewModels/ServerSidePagingViewModel';
import ko, { Observable } from 'knockout';

export class DiscussionIndexViewModel {
	public constructor(
		private readonly values: GlobalValues,
		private readonly repo: DiscussionRepository,
		private readonly urlMapper: UrlMapper,
		private readonly canDeleteAllComments: boolean,
	) {
		this.newTopic = ko.observable(
			new DiscussionTopicEditViewModel(values.loggedUserId, this.folders()),
		);

		this.mapRoute('folders/:folderId?', (context) => {
			var folderId = parseInt(context.params.folderId);
			this.selectFolderById(folderId);
		});

		this.mapRoute('topics/:topicId?', (context) => {
			var topicId = parseInt(context.params.topicId);
			this.selectTopicById(topicId);
		});

		this.mapRoute('/', () => {
			this.selectedFolder(null!);
			this.selectedTopic(null!);
		});

		repo.getFolders({}).then((folders) => {
			this.folders(folders);
			page.start();
		});

		repo.getTopics({}).then((result) => this.recentTopics(result.items));

		this.selectedFolder.subscribe((folder) => {
			this.showCreateNewTopic(false);
			this.selectedTopic(null!);
			this.paging.goToFirstPage();

			this.loadTopics(folder!);
		});

		this.paging.page.subscribe(this.loadTopicsForCurrentFolder);
		this.paging.pageSize.subscribe(this.loadTopicsForCurrentFolder);
	}

	private canDeleteTopic = (topic: DiscussionTopicContract): boolean => {
		return (
			this.canDeleteAllComments ||
			(topic.author && topic.author.id === this.values.loggedUserId)
		);
	};

	private canEditTopic = (topic: DiscussionTopicContract): boolean => {
		return (
			this.canDeleteAllComments ||
			(topic.author && topic.author.id === this.values.loggedUserId)
		);
	};

	public createNewTopic = (): void => {
		var folder = this.selectedFolder();
		this.repo
			.createTopic({
				folderId: folder!.id,
				contract: this.newTopic().toContract(),
			})
			.then((topic) => {
				topic.canBeDeleted = false;
				this.newTopic(
					new DiscussionTopicEditViewModel(
						this.values.loggedUserId,
						this.folders(),
					),
				);
				this.showCreateNewTopic(false);
				this.topics.unshift(topic);
				this.selectTopic(topic);
			});
	};

	public deleteTopic = (topic: DiscussionTopicContract): void => {
		this.repo.deleteTopic({ topicId: topic.id }).then(() => {
			this.selectTopic(null!);
		});
	};

	public folders = ko.observableArray<DiscussionFolderContract>([]);

	private getFolder = (folderId: number): DiscussionFolderContract => {
		return this.folders().find((f) => f.id === folderId)!;
	};

	private loadTopicsForCurrentFolder = (): void => {
		this.loadTopics(this.selectedFolder()!);
	};

	private loadTopics = (folder: DiscussionFolderContract): Promise<void> => {
		if (!folder) {
			this.topics([]);

			return Promise.resolve();
		}

		const paging = this.paging.getPagingProperties(true);
		return this.repo
			.getTopicsForFolder({ folderId: folder.id, paging: paging })
			.then((result) => {
				this.topics(result.items);

				if (paging.getTotalCount) this.paging.totalItems(result.totalCount);
			});
	};

	private mapRoute = (
		partialUrl: string,
		callback: (context: page.PageContext) => void,
	): void => {
		page(UrlMapper.mergeUrls('/discussion/', partialUrl), callback);
	};

	public newTopic: Observable<DiscussionTopicEditViewModel>;

	public paging = new ServerSidePagingViewModel(30); // Paging view model

	public recentTopics = ko.observableArray<DiscussionTopicContract>([]);

	public selectFolder = (folder: DiscussionFolderContract): void => {
		if (!folder) {
			page('/discussion');
		} else {
			page('/discussion/folders/' + folder.id);
		}
	};

	private selectFolderById = (folderId: number): void => {
		this.selectedFolder(this.getFolder(folderId));
	};

	public selectTopic = (topic: DiscussionTopicContract): void => {
		if (!topic) {
			page('/discussion/topics');
		} else {
			page('/discussion/topics/' + topic.id);
		}
	};

	private selectTopicById = (topicId: number): void => {
		if (!topicId) {
			this.loadTopics(this.selectedFolder()!).then(() =>
				this.selectedTopic(null!),
			);
			return;
		}

		this.repo.getTopic({ topicId: topicId }).then((contract) => {
			contract.canBeDeleted = this.canDeleteTopic(contract);
			contract.canBeEdited = this.canEditTopic(contract);

			this.selectFolderById(contract.folderId);
			this.selectedTopic(
				new DiscussionTopicViewModel(
					this.values,
					this.repo,
					this.canDeleteAllComments,
					contract,
					this.folders(),
				),
			);
		});
	};

	public selectedFolder = ko.observable<DiscussionFolderContract>(null!);

	public selectedTopic = ko.observable<DiscussionTopicViewModel>(null!);

	public showCreateNewTopic = ko.observable(false);

	public topics = ko.observableArray<DiscussionTopicContract>([]);
}
