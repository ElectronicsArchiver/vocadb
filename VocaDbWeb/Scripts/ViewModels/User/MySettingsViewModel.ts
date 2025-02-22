import { UserKnownLanguageContract } from '@/DataContracts/User/UserKnownLanguageContract';
import { WebLinkContract } from '@/DataContracts/WebLinkContract';
import { UserRepository } from '@/Repositories/UserRepository';
import { ui } from '@/Shared/MessagesTyped';
import { WebLinksEditViewModel } from '@/ViewModels/WebLinksEditViewModel';
import ko, { Computed, Observable, ObservableArray } from 'knockout';

// User my settings view model
export class MySettingsViewModel {
	public aboutMe: Observable<string>;

	public canVerifyEmail: Computed<boolean>;

	public email: Observable<string>;

	public emailVerified: Observable<boolean>;

	public emailVerificationSent = ko.observable(false);

	public knownLanguages: ObservableArray<UserKnownLanguageEditViewModel>;

	public webLinksViewModel: WebLinksEditViewModel;

	public constructor(
		private userRepository: UserRepository,
		aboutMe: string,
		email: string,
		emailVerified: boolean,
		webLinkContracts: WebLinkContract[],
		knownLanguages: UserKnownLanguageContract[],
	) {
		this.aboutMe = ko.observable(aboutMe);
		this.email = ko.observable(email);
		this.emailVerified = ko.observable(emailVerified);
		this.knownLanguages = ko.observableArray(
			knownLanguages.map((l) => new UserKnownLanguageEditViewModel(l)),
		);
		this.webLinksViewModel = new WebLinksEditViewModel(webLinkContracts);

		// TODO: support showing the verification button by saving email immediately after it's changed
		this.canVerifyEmail = ko.computed(
			() => !!email && !emailVerified && !this.emailVerificationSent(),
		);
	}

	public addKnownLanguage = (): void => {
		this.knownLanguages.push(new UserKnownLanguageEditViewModel());
	};

	public verifyEmail = (): void => {
		this.emailVerificationSent(true);
		this.userRepository.requestEmailVerification({}).then(() => {
			ui.showSuccessMessage('Message sent, please check your email');
		});
	};
}

export class UserKnownLanguageEditViewModel {
	public constructor(contract?: UserKnownLanguageContract) {
		this.cultureCode = ko.observable(
			contract != null ? contract.cultureCode : '',
		);
		this.proficiency = ko.observable(
			contract != null ? contract.proficiency : '',
		);
	}

	public cultureCode: Observable<string>;

	public proficiency: Observable<string>;
}
