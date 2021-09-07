namespace GemPuzzle {
	interface time {
		minutes: string;
		seconds: string;
	}
	export class Timer {
		private addZero = (n: number) => (n > 9) ? `${n}` : `0${n}`;
		private startPoint: number;

		constructor(previous: number = 0) {
		}

		public start = (previous: number = 0) => {
			this.startPoint = Date.now() - previous;
		}

		public convert = (ms: number): time => {
			const elapsedTime = Math.trunc(ms / 1000);
			return {
				minutes: this.addZero(Math.trunc(elapsedTime / 60)),
				seconds: this.addZero(elapsedTime % 60),
			}
		}

		public getRowData = () => {
			return (Date.now() - this.startPoint);
		}
	}
}