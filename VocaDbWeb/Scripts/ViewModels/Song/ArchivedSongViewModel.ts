import { SongRepository } from '@/Repositories/SongRepository';
import { ui } from '@/Shared/MessagesTyped';
import { ReportEntryViewModel } from '@/ViewModels/ReportEntryViewModel';

export class ArchivedSongViewModel {
	public constructor(
		songId: number,
		versionNumber: number,
		private repository: SongRepository,
	) {
		this.reportViewModel = new ReportEntryViewModel(
			null!,
			(reportType, notes) => {
				repository.createReport({
					songId: songId,
					reportType: reportType,
					notes: notes,
					versionNumber: versionNumber,
				});

				ui.showSuccessMessage(vdb.resources.shared.reportSent);
			},
			{ notesRequired: true, id: 'Other', name: null! },
		);
	}

	public reportViewModel: ReportEntryViewModel;
}
