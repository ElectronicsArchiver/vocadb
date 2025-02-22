import { CommentContract } from '@/DataContracts/CommentContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { ICommentRepository } from '@/Repositories/ICommentRepository';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';

export class EntryCommentRepository implements ICommentRepository {
	private baseUrl: string;

	public constructor(
		private readonly httpClient: HttpClient,
		private readonly urlMapper: UrlMapper,
		resourcePath: string,
	) {
		this.baseUrl = UrlMapper.mergeUrls('/api/', resourcePath);
	}

	public createComment = ({
		entryId,
		contract,
	}: {
		entryId: number;
		contract: CommentContract;
	}): Promise<CommentContract> => {
		var url = this.urlMapper.mapRelative(
			UrlMapper.buildUrl(this.baseUrl, entryId.toString(), '/comments'),
		);
		return this.httpClient.post<CommentContract>(url, contract);
	};

	public deleteComment = ({
		commentId,
	}: {
		commentId: number;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative(
			UrlMapper.buildUrl(this.baseUrl, '/comments/', commentId.toString()),
		);
		return this.httpClient.delete<void>(url);
	};

	public getComments = async ({
		entryId: listId,
	}: {
		entryId: number;
	}): Promise<CommentContract[]> => {
		var url = this.urlMapper.mapRelative(
			UrlMapper.buildUrl(this.baseUrl, listId.toString(), '/comments/'),
		);
		const result = await this.httpClient.get<
			PartialFindResultContract<CommentContract>
		>(url);
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
			UrlMapper.buildUrl(this.baseUrl, '/comments/', commentId.toString()),
		);
		return this.httpClient.post<void>(url, contract);
	};
}
