import { ArtistHelper } from '@/Helpers/ArtistHelper';
import { ArtistAutoCompleteParams } from '@/KnockoutExtensions/AutoCompleteParams';
import { ArtistRepository } from '@/Repositories/ArtistRepository';
import { GlobalValues } from '@/Shared/GlobalValues';
import { ArtistFilter } from '@/ViewModels/Search/ArtistFilter';
import ko, { Computed, Observable } from 'knockout';
import _ from 'lodash';

// Manages artist filters for search
// These can be used wherever artist filtering is needed - search page, rated songs page, song list page
export class ArtistFilters {
	public constructor(
		private readonly values: GlobalValues,
		private readonly artistRepo: ArtistRepository,
		childVoicebanks?: boolean,
	) {
		this.artistSearchParams = { acceptSelection: this.selectArtist };

		this.childVoicebanks = ko.observable(childVoicebanks || false);

		this.filters = ko
			.computed(() => {
				this.artists();
				this.artistParticipationStatus();
				this.childVoicebanks();
				this.includeMembers();
			})
			.extend({ notify: 'always' });

		this.showChildVoicebanks = ko.computed(
			() =>
				this.hasSingleArtist() &&
				ArtistHelper.canHaveChildVoicebanks(this.artists()[0].artistType()!),
		);
		this.showMembers = ko.computed(
			() =>
				this.hasSingleArtist() &&
				_.includes(ArtistHelper.groupTypes, this.firstArtist().artistType()),
		);
	}

	public artists = ko.observableArray<ArtistFilter>();
	public artistIds = ko.computed(() => this.artists().map((a) => a.id));
	public artistParticipationStatus = ko.observable('Everything');
	public artistSearchParams: ArtistAutoCompleteParams;
	public childVoicebanks: Observable<boolean>;
	public filters: Computed<void>;
	public hasMultipleArtists = ko.computed(() => this.artists().length > 1);
	public hasSingleArtist = ko.computed(() => this.artists().length === 1);
	public includeMembers = ko.observable(false);

	private firstArtist = (): ArtistFilter => this.artists()[0];

	public selectArtist = (selectedArtistId?: number): void => {
		this.selectArtists([selectedArtistId!]);
	};

	public selectArtists = (selectedArtistIds: number[]): void => {
		if (!selectedArtistIds) return;

		var filters = selectedArtistIds.map((a) => new ArtistFilter(a));
		ko.utils.arrayPushAll(this.artists, filters);

		if (!this.artistRepo) return;

		for (const newArtist of filters) {
			var selectedArtistId = newArtist.id;

			this.artistRepo
				.getOne({
					id: selectedArtistId,
					lang: this.values.languagePreference,
				})
				.then((artist) => {
					newArtist.name(artist.name);
					newArtist.artistType(artist.artistType);
				});
		}
	};

	public showChildVoicebanks: Computed<boolean>;
	public showMembers: Computed<boolean>;
}
