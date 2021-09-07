namespace GemPuzzle {
	interface record {
		name: string;
		moves: number;
	}

	export class AppCache {
		static recordsAmount = 10;
		public time: number = 0;
		public steps: number = 0;
		public sequence: number[] = null;
		public records: record[] = [];
		public sound: boolean = true;
		public image: number = 0;

		private constructor() {}

		public static load = () => {
			const res = JSON.parse(localStorage.getItem('cache-puzzle')) as AppCache;
			if (res === null) {
				return new AppCache();
			}
			else {
				const newObj = new AppCache();
				newObj.sequence = res.sequence;
				newObj.steps = res.steps;
				newObj.time = res.time;
				newObj.records = res.records;
				newObj.sound = res.sound;
				newObj.image = res.image;
				return newObj;
			}
		}

		public save = () => {
			localStorage.setItem(
				'cache-puzzle',
				JSON.stringify(this)
			);
		}


		public saveRecord(n: string, m: number) {
			this.records.push({ name: n, moves: m });
			this.records = this.records.sort((a, b) => a.moves - b.moves);
			if (this.records.length > AppCache.recordsAmount) {
				this.records.pop();
			}
		}
	}
}