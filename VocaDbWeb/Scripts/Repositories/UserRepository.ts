import { CommentContract } from '@/DataContracts/CommentContract';
import { PagingProperties } from '@/DataContracts/PagingPropertiesContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { ReleaseEventContract } from '@/DataContracts/ReleaseEvents/ReleaseEventContract';
import { SongListContract } from '@/DataContracts/Song/SongListContract';
import { SongWithPVsContract } from '@/DataContracts/Song/SongWithPVsContract';
import { TagBaseContract } from '@/DataContracts/Tag/TagBaseContract';
import { TagSelectionContract } from '@/DataContracts/Tag/TagSelectionContract';
import { TagUsageForApiContract } from '@/DataContracts/Tag/TagUsageForApiContract';
import {
	AlbumForUserForApiContract,
	MediaType,
} from '@/DataContracts/User/AlbumForUserForApiContract';
import { ArtistForUserForApiContract } from '@/DataContracts/User/ArtistForUserForApiContract';
import { EntryEditDataContract } from '@/DataContracts/User/EntryEditDataContract';
import { RatedSongForUserForApiContract } from '@/DataContracts/User/RatedSongForUserForApiContract';
import { UserApiContract } from '@/DataContracts/User/UserApiContract';
import { UserDetailsContract } from '@/DataContracts/User/UserDetailsContract';
import { UserMessageSummaryContract } from '@/DataContracts/User/UserMessageSummaryContract';
import { AjaxHelper } from '@/Helpers/AjaxHelper';
import { Tuple2 } from '@/Helpers/HighchartsHelper';
import { AlbumType } from '@/Models/Albums/AlbumType';
import { ArtistType } from '@/Models/Artists/ArtistType';
import { EntryType } from '@/Models/EntryType';
import { ContentLanguagePreference } from '@/Models/Globalization/ContentLanguagePreference';
import { PVService } from '@/Models/PVs/PVService';
import { SongVoteRating } from '@/Models/SongVoteRating';
import { UserEventRelationshipType } from '@/Models/Users/UserEventRelationshipType';
import { AlbumOptionalField } from '@/Repositories/AlbumRepository';
import { ArtistOptionalField } from '@/Repositories/ArtistRepository';
import { ICommentRepository } from '@/Repositories/ICommentRepository';
import { SongListOptionalField } from '@/Repositories/SongListRepository';
import { SongOptionalField } from '@/Repositories/SongRepository';
import { HeaderNames, HttpClient, MediaTypes } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';
import { AdvancedSearchFilter } from '@/ViewModels/Search/AdvancedSearchFilter';

export enum UserInboxType {
	Nothing,
	Received,
	Sent,
	Notifications,
}

export interface UserGetRatedSongsListQueryParams {
	userId: number;
	query: string;
	tagIds: number[];
	artistIds: number[];
	childVoicebanks: boolean;
	rating: string;
	songListId?: number;
	advancedFilters: AdvancedSearchFilter[];
	groupByRating: boolean;
	sort: string;
}

export enum UserOptionalField {
	'KnownLanguages' = 'KnownLanguages',
	'MainPicture' = 'MainPicture',
	'OldUsernames' = 'OldUsernames',
}

// Repository for managing users and related objects.
// Corresponds to the UserController class.
export class UserRepository implements ICommentRepository {
	// Maps a relative URL to an absolute one.
	private mapUrl: (relative: string) => string;

	public constructor(
		private readonly httpClient: HttpClient,
		private readonly urlMapper: UrlMapper,
	) {
		this.mapUrl = (relative: string): string => {
			return `${urlMapper.mapRelative('/User')}${relative}`;
		};
	}

	public addFollowedTag = ({ tagId }: { tagId: number }): Promise<void> => {
		return this.httpClient.post<void>(
			this.urlMapper.mapRelative(`/api/users/current/followedTags/${tagId}`),
		);
	};

	public createArtistSubscription = ({
		artistId,
	}: {
		artistId: number;
	}): Promise<void> => {
		return this.httpClient.post<void>(
			this.mapUrl('/AddArtistForUser'),
			AjaxHelper.stringify({
				artistId: artistId,
			}),
			{
				headers: {
					[HeaderNames.ContentType]: MediaTypes.APPLICATION_FORM_URLENCODED,
				},
			},
		);
	};

	public createComment = ({
		entryId: userId,
		contract,
	}: {
		entryId: number;
		contract: CommentContract;
	}): Promise<CommentContract> => {
		return this.httpClient.post<CommentContract>(
			this.urlMapper.mapRelative(`/api/users/${userId}/profileComments`),
			contract,
		);
	};

	public createMessage = ({
		userId,
		contract,
	}: {
		userId: number;
		contract: UserApiContract;
	}): Promise<UserMessageSummaryContract> => {
		return this.httpClient.post<UserMessageSummaryContract>(
			this.urlMapper.mapRelative(`/api/users/${userId}/messages`),
			contract,
		);
	};

	public deleteArtistSubscription = ({
		artistId,
	}: {
		artistId: number;
	}): Promise<void> => {
		return this.httpClient.post<void>(
			this.mapUrl('/RemoveArtistFromUser'),
			AjaxHelper.stringify({
				artistId: artistId,
			}),
			{
				headers: {
					[HeaderNames.ContentType]: MediaTypes.APPLICATION_FORM_URLENCODED,
				},
			},
		);
	};

	public deleteComment = ({
		commentId,
	}: {
		commentId: number;
	}): Promise<void> => {
		return this.httpClient.delete<void>(
			this.urlMapper.mapRelative(`/api/users/profileComments/${commentId}`),
		);
	};

	public deleteEventForUser = ({
		eventId,
	}: {
		eventId: number;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative(
			`/api/users/current/events/${eventId}`,
		);
		return this.httpClient.delete<void>(url);
	};

	public deleteFollowedTag = ({ tagId }: { tagId: number }): Promise<void> => {
		return this.httpClient.delete<void>(
			this.urlMapper.mapRelative(`/api/users/current/followedTags/${tagId}`),
		);
	};

	public deleteMessage = ({
		messageId,
	}: {
		messageId: number;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative('/User/DeleteMessage');
		return this.httpClient.post<void>(
			url,
			AjaxHelper.stringify({ messageId: messageId }),
			{
				headers: {
					[HeaderNames.ContentType]: MediaTypes.APPLICATION_FORM_URLENCODED,
				},
			},
		);
	};

	public deleteMessages = ({
		userId,
		messageIds,
	}: {
		userId: number;
		messageIds: number[];
	}): Promise<void> => {
		var dataParamName = 'messageId';
		var dataParam =
			'?' + dataParamName + '=' + messageIds.join('&' + dataParamName + '=');
		var url = this.urlMapper.mapRelative(
			`/api/users/${userId}/messages${dataParam}`,
		);
		return this.httpClient.delete<void>(url);
	};

	public getAlbumCollectionList = ({
		userId,
		paging,
		lang,
		query,
		tag,
		albumType,
		artistId,
		purchaseStatuses,
		releaseEventId,
		advancedFilters,
		sort,
		mediaType,
	}: {
		userId: number;
		paging: PagingProperties;
		lang: ContentLanguagePreference;
		query: string;
		tag?: number;
		albumType: AlbumType;
		artistId?: number;
		purchaseStatuses: string;
		releaseEventId?: number;
		advancedFilters: AdvancedSearchFilter[];
		sort: string;
		mediaType?: MediaType;
	}): Promise<PartialFindResultContract<AlbumForUserForApiContract>> => {
		var url = this.urlMapper.mapRelative(`/api/users/${userId}/albums`);
		var data = {
			start: paging.start,
			getTotalCount: paging.getTotalCount,
			maxResults: paging.maxEntries,
			query: query,
			tagId: tag,
			albumTypes: albumType,
			artistId: artistId,
			purchaseStatuses: purchaseStatuses,
			releaseEventId: releaseEventId || undefined,
			fields: [
				AlbumOptionalField.AdditionalNames,
				AlbumOptionalField.MainPicture,
				AlbumOptionalField.ReleaseEvent,
			].join(','),
			lang: lang,
			nameMatchMode: 'Auto',
			sort: sort,
			advancedFilters: advancedFilters,
			mediaType: mediaType,
		};

		return this.httpClient.get<
			PartialFindResultContract<AlbumForUserForApiContract>
		>(url, data);
	};

	public getComments = async ({
		entryId: userId,
	}: {
		entryId: number;
	}): Promise<CommentContract[]> => {
		var url = this.urlMapper.mapRelative(
			`/api/users/${userId}/profileComments`,
		);
		var data = {
			start: 0,
			getTotalCount: false,
			maxResults: 300,
			userId: userId,
		};

		const result = await this.httpClient.get<
			PartialFindResultContract<CommentContract>
		>(url, data);
		return result.items;
	};

	public getEvents = ({
		userId,
		relationshipType,
	}: {
		userId: number;
		relationshipType: UserEventRelationshipType;
	}): Promise<ReleaseEventContract[]> => {
		var url = this.urlMapper.mapRelative(`/api/users/${userId}/events`);
		return this.httpClient.get<ReleaseEventContract[]>(url, {
			relationshipType: relationshipType,
		});
	};

	public getFollowedArtistsList = ({
		userId,
		paging,
		lang,
		tagIds,
		artistType,
	}: {
		userId: number;
		paging: PagingProperties;
		lang: ContentLanguagePreference;
		tagIds: number[];
		artistType: ArtistType;
	}): Promise<PartialFindResultContract<ArtistForUserForApiContract>> => {
		var url = this.urlMapper.mapRelative(
			`/api/users/${userId}/followedArtists`,
		);
		var data = {
			start: paging.start,
			getTotalCount: paging.getTotalCount,
			maxResults: paging.maxEntries,
			tagId: tagIds,
			fields: [
				ArtistOptionalField.AdditionalNames,
				ArtistOptionalField.MainPicture,
			].join(','),
			lang: lang,
			nameMatchMode: 'Auto',
			artistType: artistType,
		};

		return this.httpClient.get<
			PartialFindResultContract<ArtistForUserForApiContract>
		>(url, data);
	};

	public getList = ({
		paging,
		query,
		sort,
		groups,
		includeDisabled,
		onlyVerified,
		knowsLanguage,
		nameMatchMode,
		fields,
	}: {
		paging?: PagingProperties;
		query: string;
		sort?: string;
		groups?: string;
		includeDisabled: boolean;
		onlyVerified: boolean;
		knowsLanguage?: string;
		nameMatchMode: string;
		fields?: UserOptionalField[];
	}): Promise<PartialFindResultContract<UserApiContract>> => {
		var url = this.urlMapper.mapRelative('/api/users');
		var data = {
			start: paging?.start,
			getTotalCount: paging?.getTotalCount,
			maxResults: paging?.maxEntries,
			query: query,
			nameMatchMode: nameMatchMode,
			sort: sort,
			includeDisabled: includeDisabled,
			onlyVerified: onlyVerified,
			knowsLanguage: knowsLanguage,
			groups: groups || undefined,
			fields: fields?.join(','),
		};

		return this.httpClient.get<PartialFindResultContract<UserApiContract>>(
			url,
			data,
		);
	};

	public getOne = ({
		id,
		fields,
	}: {
		id: number;
		fields?: UserOptionalField[];
	}): Promise<UserApiContract> => {
		var url = this.urlMapper.mapRelative(`/api/users/${id}`);
		return this.httpClient.get<UserApiContract>(url, {
			fields: fields?.join(','),
		});
	};

	public getOneByName = async ({
		username,
	}: {
		username: string;
	}): Promise<UserApiContract | null> => {
		const result = await this.getList({
			query: username,
			sort: undefined,
			groups: undefined,
			includeDisabled: false,
			onlyVerified: false,
			knowsLanguage: undefined,
			nameMatchMode: 'Exact',
			fields: undefined,
		});
		return result.items.length === 1 ? result.items[0] : null;
	};

	public getMessage = ({
		messageId,
	}: {
		messageId: number;
	}): Promise<UserMessageSummaryContract> => {
		var url = this.urlMapper.mapRelative(`/api/users/messages/${messageId}`);
		return this.httpClient.get<UserMessageSummaryContract>(url);
	};

	public getMessageSummaries = ({
		userId,
		inbox,
		paging,
		unread = false,
		anotherUserId,
		iconSize = 40,
	}: {
		userId: number;
		inbox?: UserInboxType;
		paging: PagingProperties;
		unread: boolean;
		anotherUserId?: number;
		iconSize?: number;
	}): Promise<PartialFindResultContract<UserMessageSummaryContract>> => {
		var url = this.urlMapper.mapRelative(`/api/users/${userId}/messages`);
		return this.httpClient.get<
			PartialFindResultContract<UserMessageSummaryContract>
		>(url, {
			inbox: inbox ? UserInboxType[inbox] : undefined,
			start: paging.start,
			maxResults: paging.maxEntries,
			getTotalCount: paging.getTotalCount,
			unread: unread,
			anotherUserId: anotherUserId,
		});
	};

	public getRatedSongsList = ({
		fields,
		lang,
		paging,
		pvServices,
		queryParams,
	}: {
		fields: SongOptionalField[];
		lang: ContentLanguagePreference;
		paging: PagingProperties;
		pvServices?: PVService[];
		queryParams: UserGetRatedSongsListQueryParams;
	}): Promise<PartialFindResultContract<RatedSongForUserForApiContract>> => {
		const {
			userId,
			query,
			tagIds,
			artistIds,
			childVoicebanks,
			rating,
			songListId,
			advancedFilters,
			groupByRating,
			sort,
		} = queryParams;

		var url = this.urlMapper.mapRelative(`/api/users/${userId}/ratedSongs`);
		var data = {
			start: paging.start,
			getTotalCount: paging.getTotalCount,
			maxResults: paging.maxEntries,
			query: query,
			tagId: tagIds,
			artistId: artistIds,
			childVoicebanks: childVoicebanks,
			rating: rating,
			songListId: songListId,
			advancedFilters: advancedFilters,
			groupByRating: groupByRating,
			pvServices: pvServices?.join(','),
			fields: fields.join(','),
			lang: lang,
			nameMatchMode: 'Auto',
			sort: sort,
		};

		return this.httpClient.get<
			PartialFindResultContract<RatedSongForUserForApiContract>
		>(url, data);
	};

	public getRatedSongsListWithPVs = async ({
		lang,
		paging,
		pvServices,
		queryParams,
	}: {
		lang: ContentLanguagePreference;
		paging: PagingProperties;
		pvServices?: PVService[];
		queryParams: UserGetRatedSongsListQueryParams;
	}): Promise<
		PartialFindResultContract<
			RatedSongForUserForApiContract & { song: SongWithPVsContract }
		>
	> => {
		const { items, totalCount } = await this.getRatedSongsList({
			fields: [SongOptionalField.MainPicture, SongOptionalField.PVs],
			lang: lang,
			paging: paging,
			pvServices: pvServices,
			queryParams: queryParams,
		});

		const songsForUser = items
			.filter((songForUser) => !!songForUser.song)
			.map((songForUser) => ({
				...songForUser,
				song: {
					...songForUser.song!,
					entryType: EntryType[EntryType.Song],
					pvs: songForUser.song!.pvs ?? [],
				},
			}));

		return { items: songsForUser, totalCount: totalCount };
	};

	public getRatingsByGenre = ({
		userId,
	}: {
		userId: number;
	}): Promise<Tuple2<string, number>[]> => {
		var url = this.urlMapper.mapRelative(
			`/api/users/${userId}/songs-per-genre/`,
		);
		return this.httpClient.get<Tuple2<string, number>[]>(url);
	};

	public getSongLists = ({
		userId,
		query,
		paging,
		tagIds,
		sort,
		fields,
	}: {
		userId: number;
		query?: string;
		paging: PagingProperties;
		tagIds: number[];
		sort: string;
		fields?: SongListOptionalField[];
	}): Promise<PartialFindResultContract<SongListContract>> => {
		var url = this.urlMapper.mapRelative(`/api/users/${userId}/songLists`);
		return this.httpClient.get<PartialFindResultContract<SongListContract>>(
			url,
			{
				query: query,
				start: paging.start,
				getTotalCount: paging.getTotalCount,
				maxResults: paging.maxEntries,
				tagId: tagIds,
				sort: sort,
				fields: fields?.join(','),
			},
		);
	};

	// Gets a specific user's rating for a specific song.
	// userId: User ID.
	// songId: ID of the song for which to get the rating. Cannot be null.
	// callback: Callback receiving the rating. If the user has not rated the song, or if the user is not logged in, this will be "Nothing".
	public getSongRating = ({
		userId,
		songId,
	}: {
		userId: number;
		songId: number;
	}): Promise<string> => {
		if (!userId) {
			return Promise.resolve('Nothing');
		}

		var url = this.urlMapper.mapRelative(
			`/api/users/${userId}/ratedSongs/${songId}`,
		);
		return this.httpClient.get<string>(url);
	};

	public getAlbumTagSelections = ({
		albumId,
	}: {
		albumId: number;
	}): Promise<TagSelectionContract[]> => {
		return this.httpClient.get<TagSelectionContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/albumTags/${albumId}`),
		);
	};

	public getArtistTagSelections = ({
		artistId,
	}: {
		artistId: number;
	}): Promise<TagSelectionContract[]> => {
		return this.httpClient.get<TagSelectionContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/artistTags/${artistId}`),
		);
	};

	public getEventTagSelections = ({
		eventId,
	}: {
		eventId: number;
	}): Promise<TagSelectionContract[]> => {
		return this.httpClient.get<TagSelectionContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/eventTags/${eventId}`),
		);
	};

	public getEventSeriesTagSelections = ({
		seriesId,
	}: {
		seriesId: number;
	}): Promise<TagSelectionContract[]> => {
		return this.httpClient.get<TagSelectionContract[]>(
			this.urlMapper.mapRelative(
				`/api/users/current/eventSeriesTags/${seriesId}`,
			),
		);
	};

	public getSongListTagSelections = ({
		songListId,
	}: {
		songListId: number;
	}): Promise<TagSelectionContract[]> => {
		return this.httpClient.get<TagSelectionContract[]>(
			this.urlMapper.mapRelative(
				`/api/users/current/songListTags/${songListId}`,
			),
		);
	};

	public getSongTagSelections = ({
		songId,
	}: {
		songId: number;
	}): Promise<TagSelectionContract[]> => {
		return this.httpClient.get<TagSelectionContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/songTags/${songId}`),
		);
	};

	public refreshEntryEdit = ({
		entryType,
		entryId,
	}: {
		entryType: EntryType;
		entryId: number;
	}): Promise<EntryEditDataContract> => {
		return this.httpClient.post<EntryEditDataContract>(
			this.urlMapper.mapRelative(
				`/api/users/current/refreshEntryEdit/?entryType=${EntryType[entryType]}&entryId=${entryId}`,
			),
		);
	};

	// eslint-disable-next-line no-empty-pattern
	public requestEmailVerification = ({}: {}): Promise<void> => {
		var url = this.mapUrl('/RequestEmailVerification');
		return this.httpClient.post<void>(url, undefined, {
			headers: {
				[HeaderNames.ContentType]: MediaTypes.APPLICATION_FORM_URLENCODED,
			},
		});
	};

	public updateAlbumTags = ({
		albumId,
		tags,
	}: {
		albumId: number;
		tags: TagBaseContract[];
	}): Promise<TagUsageForApiContract[]> => {
		return this.httpClient.put<TagUsageForApiContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/albumTags/${albumId}`),
			tags,
		);
	};

	// Updates artist subscription settings for an artist followed by a user.
	public updateArtistSubscription = ({
		artistId,
		emailNotifications,
		siteNotifications,
	}: {
		artistId: number;
		emailNotifications?: boolean;
		siteNotifications?: boolean;
	}): Promise<void> => {
		return this.httpClient.post<void>(
			this.mapUrl('/UpdateArtistSubscription'),
			AjaxHelper.stringify({
				artistId: artistId,
				emailNotifications: emailNotifications,
				siteNotifications: siteNotifications,
			}),
			{
				headers: {
					[HeaderNames.ContentType]: MediaTypes.APPLICATION_FORM_URLENCODED,
				},
			},
		);
	};

	public updateArtistTags = ({
		artistId,
		tags,
	}: {
		artistId: number;
		tags: TagBaseContract[];
	}): Promise<TagUsageForApiContract[]> => {
		return this.httpClient.put<TagUsageForApiContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/artistTags/${artistId}`),
			tags,
		);
	};

	public updateComment = ({
		commentId,
		contract,
	}: {
		commentId: number;
		contract: CommentContract;
	}): Promise<void> => {
		return this.httpClient.post<void>(
			this.urlMapper.mapRelative(`/api/users/profileComments/${commentId}`),
			contract,
		);
	};

	public updateEventForUser = ({
		eventId,
		associationType,
	}: {
		eventId: number;
		associationType: UserEventRelationshipType;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative(
			`/api/users/current/events/${eventId}`,
		);
		return this.httpClient.post<void>(url, {
			associationType: UserEventRelationshipType[associationType],
		});
	};

	public updateEventTags = ({
		eventId,
		tags,
	}: {
		eventId: number;
		tags: TagBaseContract[];
	}): Promise<TagUsageForApiContract[]> => {
		return this.httpClient.put<TagUsageForApiContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/eventTags/${eventId}`),
			tags,
		);
	};

	public updateEventSeriesTags = ({
		seriesId,
		tags,
	}: {
		seriesId: number;
		tags: TagBaseContract[];
	}): Promise<TagUsageForApiContract[]> => {
		return this.httpClient.put<TagUsageForApiContract[]>(
			this.urlMapper.mapRelative(
				`/api/users/current/eventSeriesTags/${seriesId}`,
			),
			tags,
		);
	};

	public updateSongListTags = ({
		songListId,
		tags,
	}: {
		songListId: number;
		tags: TagBaseContract[];
	}): Promise<TagUsageForApiContract[]> => {
		return this.httpClient.put<TagUsageForApiContract[]>(
			this.urlMapper.mapRelative(
				`/api/users/current/songListTags/${songListId}`,
			),
			tags,
		);
	};

	// Updates rating score for a song.
	// songId: Id of the song to be updated.
	// rating: Song rating.
	// callback: Callback function to be executed when the operation is complete.
	public updateSongRating = ({
		songId,
		rating,
	}: {
		songId: number;
		rating: SongVoteRating;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative(`/api/songs/${songId}/ratings`);
		return this.httpClient.post<void>(url, { rating: SongVoteRating[rating] });
	};

	public updateSongTags = ({
		songId,
		tags,
	}: {
		songId: number;
		tags: TagBaseContract[];
	}): Promise<TagUsageForApiContract[]> => {
		return this.httpClient.put<TagUsageForApiContract[]>(
			this.urlMapper.mapRelative(`/api/users/current/songTags/${songId}`),
			tags,
		);
	};

	// Updates user setting.
	// userId: user ID.
	// settingName: name of the setting to be updated, for example 'showChatBox'.
	// value: setting value, for example 'false'.
	public updateUserSetting = ({
		userId,
		settingName,
		value,
	}: {
		userId: number;
		settingName: string;
		value: string;
	}): Promise<void> => {
		var url = this.urlMapper.mapRelative(
			`/api/users/${userId}/settings/${settingName}`,
		);
		return this.httpClient.post<void>(url, `${value}`, {
			headers: { [HeaderNames.ContentType]: MediaTypes.APPLICATION_JSON },
		});
	};

	public getDetails = ({
		name,
	}: {
		name: string;
	}): Promise<UserDetailsContract> => {
		return this.httpClient.get<UserDetailsContract>(
			this.urlMapper.mapRelative(`/api/profiles/${name}`),
		);
	};
}
