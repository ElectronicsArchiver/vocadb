// Basic list view model implementation where items are constructed from data contracts.
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';

// Item type can be constructed from a contract, or with default parameters (for new items).
export class BasicListEditStore<TItem extends TContract, TContract> {
	@observable public items: TItem[];

	// type: item constructor, optionally receiving a data contract parameter.
	// contracts: list of data contracts for current items.
	public constructor(
		private readonly type: { new (contract?: TContract): TItem },
		contracts: TContract[],
	) {
		makeObservable(this);

		this.items = contracts.map((contract) => new type(contract));
	}

	// add new item by instansiating the item type with default parameters
	@action public add = (): void => {
		this.items.push(new this.type());
	};

	@action public remove = (item: TItem): void => {
		_.pull(this.items, item);
	};

	public toContracts = (): TContract[] => {
		return this.items as TContract[];
	};
}
