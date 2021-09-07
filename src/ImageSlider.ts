namespace GemPuzzle {
	export class ImageSlider {
		private body: HTMLDivElement;
		private imageNode: HTMLImageElement;
		private imageCount = 10;

		constructor(query: string) {
			this.body = document.querySelector(query) as HTMLDivElement;
			this.imageNode = this.body.querySelector('.game-image');
			this.changeImage(Game.appCache.image);

			(this.body.querySelector('.image-right') as HTMLButtonElement).addEventListener('click', (e) => {
				this.changeImage(Game.appCache.image - 1);
			});

			(this.body.querySelector('.image-left') as HTMLButtonElement).addEventListener('click', (e) => {
				this.changeImage(Game.appCache.image + 1);
			});
		}

		private changeImage(num: number) {
			if (num === this.imageCount) { num = 0; };
			if (num < 0) { num=this.imageCount; };

			this.imageNode.src = `src/images/${num}.jpg`;
			Game.appCache.image = num;
		}
	}
}