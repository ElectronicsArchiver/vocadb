import { CommentContract } from '@/DataContracts/CommentContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { EntryType } from '@/Models/EntryType';
import { BaseRepository } from '@/Repositories/BaseRepository';
import { ICommentRepository } from '@/Repositories/ICommentRepository';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';

export class CommentRepository
	extends BaseRepository
	implements ICommentRepository {
	public constructor(
		private readonly httpClient: HttpClient,
		private readonly urlMapper: UrlMapper,
		private entryType: EntryType,
	) {
		super(urlMapper.baseUrl);
	}

	public createComment = ({
		entryId,
		contract,
	}: {
		entryId: number;
		contract: CommentContract;
	}): Promise<CommentContract> => {
		contract.entry = {
			entryType: EntryType[this.entryType],
			id: entryId,
			name: null!,
		};
		var url = this.urlMapper.mapRelative(
			UrlMapper.buildUrl(`api/comments/${EntryType[this.entryType]}-comments`),
		);
		return this.httpClient.post<CommentContract>(url, contract);
	};

	public deleteComment = ({
		commentId,
	}: {
		commentId: number;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative(
			UrlMapper.buildUrl(
				`api/comments/${EntryType[this.entryType]}-comments/`,
				commentId.toString(),
			),
		);
		return this.httpClient.delete<void>(url);
	};

	public getComments = async ({
		entryId: listId,
	}: {
		entryId: number;
	}): Promise<CommentContract[]> => {
		var url = this.urlMapper.mapRelative(
			UrlMapper.buildUrl(`api/comments/${EntryType[this.entryType]}-comments/`),
		);
		const result = await this.httpClient.get<
			PartialFindResultContract<CommentContract>
		>(url, { entryId: listId });
		return result.items;
	};

	public updateComment = ({
		commentId,
		contract,
	}: {
		commentId: number;
		contract: CommentContract;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative(
			UrlMapper.buildUrl(
				`api/comments/${EntryType[this.entryType]}-comments/`,
				commentId.toString(),
			),
		);
		return this.httpClient.post<void>(url, contract);
	};
}
