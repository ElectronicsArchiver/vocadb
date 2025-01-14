import { PagingProperties } from '@/DataContracts/PagingPropertiesContract';
import { PartialFindResultContract } from '@/DataContracts/PartialFindResultContract';
import { RatedSongForUserForApiContract } from '@/DataContracts/User/RatedSongForUserForApiContract';
import { ContentLanguagePreference } from '@/Models/Globalization/ContentLanguagePreference';
import { PVService } from '@/Models/PVs/PVService';
import { SongOptionalField } from '@/Repositories/SongRepository';
import { UserRepository } from '@/Repositories/UserRepository';
import { AdvancedSearchFilter } from '@/ViewModels/Search/AdvancedSearchFilter';
import {
	IPlayListRepository,
	ISongForPlayList,
} from '@/ViewModels/Song/PlayList/PlayListViewModel';
import { Computed, Observable, ObservableArray } from 'knockout';

export class PlayListRepositoryForRatedSongsAdapter
	implements IPlayListRepository {
	public constructor(
		private userRepo: UserRepository,
		private userId: number,
		private query: Observable<string>,
		private sort: Observable<string>,
		private tagIds: Computed<number[]>,
		private artistIds: Computed<number[]>,
		private childVoicebanks: Observable<boolean>,
		private rating: Observable<string>,
		private songListId: Observable<number | null>,
		private advancedFilters: ObservableArray<AdvancedSearchFilter>,
		private groupByRating: Observable<boolean>,
		private fields: Observable<string>,
	) {}

	public getSongs = (
		pvServices: PVService[],
		paging: PagingProperties,
		fields: SongOptionalField[],
		lang: ContentLanguagePreference,
	): Promise<PartialFindResultContract<ISongForPlayList>> =>
		this.userRepo
			.getRatedSongsList({
				fields: [SongOptionalField.ThumbUrl],
				lang: lang,
				paging: paging,
				pvServices: pvServices,
				queryParams: {
					userId: this.userId,
					query: this.query(),
					tagIds: this.tagIds(),
					artistIds: this.artistIds(),
					childVoicebanks: this.childVoicebanks(),
					rating: this.rating(),
					songListId: this.songListId()!,
					advancedFilters: this.advancedFilters(),
					groupByRating: this.groupByRating(),
					sort: this.sort(),
				},
			})
			.then(
				(result: PartialFindResultContract<RatedSongForUserForApiContract>) => {
					var mapped = result.items.map((song, idx) => ({
						name: song.song!.name,
						song: song.song!,
						indexInPlayList: paging.start! + idx,
					}));

					return {
						items: mapped,
						totalCount: result.totalCount,
					};
				},
			);
}
