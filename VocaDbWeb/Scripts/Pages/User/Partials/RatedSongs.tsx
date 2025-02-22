import Button from '@/Bootstrap/Button';
import { TagAutoComplete } from '@/Components/KnockoutExtensions/TagAutoComplete';
import { ArtistFilters } from '@/Components/Shared/Partials/Knockout/ArtistFilters';
import { RatedSongsSearchDropdown } from '@/Components/Shared/Partials/Knockout/SearchDropdown';
import { SongAdvancedFilters } from '@/Components/Shared/Partials/Search/AdvancedFilters';
import { TagFiltersBase } from '@/Components/Shared/Partials/TagFiltersBase';
import { SongVoteRatingsRadioKnockout } from '@/Components/Shared/Partials/User/SongVoteRatingsRadioKnockout';
import { useVdbPlayer } from '@/Components/VdbPlayer/VdbPlayerContext';
import { VideoServiceHelper } from '@/Helpers/VideoServiceHelper';
import SongSearchList from '@/Pages/Search/Partials/SongSearchList';
import { UserRepository } from '@/Repositories/UserRepository';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';
import { RatedSongsSearchStore } from '@/Stores/User/RatedSongsSearchStore';
import { PlayQueueRepositoryForRatedSongsAdapter } from '@/Stores/VdbPlayer/PlayQueueRepositoryForRatedSongsAdapter';
import classNames from 'classnames';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { DebounceInput } from 'react-debounce-input';
import { useTranslation } from 'react-i18next';

const httpClient = new HttpClient();
const urlMapper = new UrlMapper(vdb.values.baseAddress);

const userRepo = new UserRepository(httpClient, urlMapper);

const playQueueRepo = new PlayQueueRepositoryForRatedSongsAdapter(userRepo);

interface RatedSongsProps {
	ratedSongsStore: RatedSongsSearchStore;
}

const RatedSongs = observer(
	({ ratedSongsStore }: RatedSongsProps): React.ReactElement => {
		const { t } = useTranslation([
			'ViewRes',
			'ViewRes.Search',
			'ViewRes.User',
			'VocaDb.Web.Resources.Domain',
		]);

		const { playQueue } = useVdbPlayer();

		return (
			<>
				<div className="form-horizontal well well-transparent">
					<div className="pull-right">
						<RatedSongsSearchDropdown ratedSongsStore={ratedSongsStore} />{' '}
						<Button
							onClick={(): void =>
								runInAction(() => {
									ratedSongsStore.groupByRating = !ratedSongsStore.groupByRating;
								})
							}
							className={classNames(ratedSongsStore.groupByRating && 'active')}
						>
							{t('ViewRes.User:RatedSongs.GroupByRating')}
						</Button>{' '}
						<div className="inline-block">
							<div className="btn-group">
								<Button
									onClick={async (): Promise<void> => {
										// Access queryParams here, not in the function body.
										const { queryParams } = ratedSongsStore;

										await playQueue.startAutoplay((pagingProps) =>
											playQueueRepo.getItems(
												VideoServiceHelper.autoplayServices,
												pagingProps,
												queryParams,
											),
										);
									}}
									title="Play" /* TODO: localize */
									className="btn-nomargin"
								>
									<i className="icon-play noMargin" /> Play
									{/* TODO: localize */}
								</Button>
							</div>
						</div>{' '}
						<Button
							onClick={(): void =>
								runInAction(() => {
									ratedSongsStore.showTags = !ratedSongsStore.showTags;
								})
							}
							className={classNames(
								ratedSongsStore.showTags && 'active',
								'btn-nomargin',
							)}
							href="#"
							title={t('ViewRes.User:RatedSongs.ShowTags')}
						>
							<i className="icon-tags" />
						</Button>
					</div>

					<div className="control-label">
						<i className="icon-search" />
					</div>
					<div className="control-group">
						<div className="controls">
							<div className="input-append">
								<DebounceInput
									type="text"
									value={ratedSongsStore.searchTerm}
									onChange={(e): void =>
										runInAction(() => {
											ratedSongsStore.searchTerm = e.target.value;
										})
									}
									className="input-xlarge"
									placeholder={t('ViewRes.Search:Index.TypeSomething')}
									debounceTimeout={300}
								/>
								{ratedSongsStore.searchTerm && (
									<Button
										variant="danger"
										onClick={(): void =>
											runInAction(() => {
												ratedSongsStore.searchTerm = '';
											})
										}
									>
										{t('ViewRes:Shared.Clear')}
									</Button>
								)}
							</div>
						</div>
					</div>

					<div className="control-group">
						<div className="control-label">
							{t('ViewRes.Search:Index.Rating')}
						</div>
						<div className="controls">
							<SongVoteRatingsRadioKnockout
								rating={ratedSongsStore.rating}
								onRatingChange={(rating): void =>
									runInAction(() => {
										ratedSongsStore.rating = rating;
									})
								}
							/>
						</div>
					</div>

					<div className="control-group">
						<div className="control-label">{t('ViewRes:Shared.Tag')}</div>
						<div className="controls">
							<TagFiltersBase tagFilters={ratedSongsStore.tagFilters} />
							<div>
								<TagAutoComplete
									type="text"
									className="input-large"
									onAcceptSelection={ratedSongsStore.tagFilters.addTag}
									placeholder={t('ViewRes:Shared.Search')}
								/>
							</div>
						</div>
					</div>

					<div className="control-group">
						<div className="control-label">
							{t('VocaDb.Web.Resources.Domain:EntryTypeNames.Artist')}
						</div>
						<div className="controls">
							<ArtistFilters
								artistFilters={ratedSongsStore.artistFilters}
								artistParticipationStatus={false}
							/>
						</div>
					</div>

					<div className="control-group">
						<div className="control-label">
							{t('ViewRes.User:RatedSongs.SongList')}
						</div>
						<div className="controls">
							<div className="input-append">
								<select
									value={ratedSongsStore.songListId}
									onChange={(e): void =>
										runInAction(() => {
											ratedSongsStore.songListId = e.target.value
												? Number(e.target.value)
												: undefined;
										})
									}
								>
									<option>
										{t('ViewRes.User:RatedSongs.NoSongListSelection')}
									</option>
									{ratedSongsStore.songLists.map((songList) => (
										<option value={songList.id} key={songList.id}>
											{songList.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					<div className="control-group">
						<div className="control-label"></div>
						<div className="controls">
							<SongAdvancedFilters
								advancedFilters={ratedSongsStore.advancedFilters}
							/>
						</div>
					</div>
				</div>

				<div>
					<SongSearchList songSearchStore={ratedSongsStore} />
				</div>
			</>
		);
	},
);

export default RatedSongs;
