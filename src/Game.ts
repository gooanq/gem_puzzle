/// <reference path="Block.ts" />
/// <reference path="Timer.ts" />
/// <reference path="AppCache.ts" />
/// <reference path="ImageSlider.ts" />

namespace GemPuzzle {
  export class Game {
    public static appCache: AppCache;

    private root: HTMLElement = null;
    private stepsHTML: HTMLSpanElement;
    private timeHTML: HTMLSpanElement;
    private fieldHTML: HTMLDivElement;
    private menu: HTMLDivElement;
    private settings: HTMLDivElement;
    private records: HTMLDivElement;
    private main: HTMLDivElement;
    private closeButtons;
    private playButton: HTMLButtonElement;
    private settingsButton: HTMLButtonElement;
    private recordsButton: HTMLButtonElement;
    private restartButton: HTMLButtonElement;
    private winModal: HTMLDivElement;
    private nameField: HTMLInputElement;
    private saveButton: HTMLButtonElement;
    private modeSelect;
    private soundCheckbox: HTMLInputElement;
    private slider: ImageSlider;
    private timer: Timer = new Timer();
    private fieldSize: number = 4;
    private max = this.fieldSize * this.fieldSize;
    private gameBlocks: Block[] = null;

    private isSortable = (array: number[]): boolean => {
      let counter = 0;
      for (let i = 1; i < array.length; i++) {
        if (array[i] === this.max) continue;
        for (let j = 0; j < i; j++) {
          if (array[j] === this.max) continue;
          if (array[j] > array[i]) ++counter;
        }
      }
      counter =
        counter + Math.trunc(array.indexOf(this.max) / this.fieldSize) + 1;
      return counter % 2 === 0;
    };

    public createSequence = (): number[] => {
      let sequence: number[] = [];
      const max = this.fieldSize * this.fieldSize;
      for (let i = 1; i <= max; i++) sequence.push(i);
      let sortable = false;

      while (sortable == false) {
        sequence = sequence.sort((a, b) => Math.random() - 0.5);
        sortable = this.isSortable(sequence);
      }

      return sequence;
    };

    private isWin = (): boolean => {
      for (let i = 0; i < this.max; i++) {
        if (this.gameBlocks[i].number !== i + 1) {
          return false;
        }
      }
      return true;
    };

    private oneStepWin = () => {
      const sequence = [];
      for (let i = 1; i <= this.fieldSize * this.fieldSize; i++) {
        sequence.push(i);
      }
      sequence[sequence.length - 2] = this.fieldSize * this.fieldSize;
      sequence[sequence.length - 1] = this.fieldSize * this.fieldSize - 1;
      Game.appCache.sequence = sequence;
    }

    public drawBlocks = (sequence: number[]) => {
      this.fieldHTML.innerHTML = '';

      const blockGenerator = new BlockGenerator(this.fieldHTML, this.fieldSize);
      this.gameBlocks = blockGenerator.fillArea(sequence);
    };

    public startGame = (isNew: boolean) => {
      if (isNew) {
        Game.appCache.steps = 0;
        Game.appCache.time = 0;
        this.timer.start(0);
        Game.appCache.sequence = null;

        //this.oneStepWin();

      } else {
        this.timer.start(Game.appCache.time);
      }
      this.stepsHTML.textContent = Game.appCache.steps.toString();
      const time = this.timer.convert(Game.appCache.time);
      this.timeHTML.textContent = `${time.minutes}:${time.seconds}`;
      if (Game.appCache.sequence === null) {
        this.drawBlocks(this.createSequence());
      } else {
        this.drawBlocks(Game.appCache.sequence);
      }
    };

    constructor(query: string) {
      this.root = document.querySelector(query);
      this.root.innerHTML = `
					<div class="game-menu">
					<button class="game-menu__btn btn-play">Play</button>
					<button class="game-menu__btn btn-records">Records</button>
					<button class="game-menu__btn btn-settings">Settings</button>
				</div>

				<div class="game-main">
					<div class="game-header">
						<div>Time: <span class="game-time"></span></div>
						<div>Moves: <span class="game-steps"></span></div>
						<button class="btn-restart">🗘</button>
					</div>
					<div class="game-playfield"></div>
					<button class="game-menu__btn btn-close">close</button>
				</div>


				<div class="game-records">
					<div class="records-content">
						<div class="record">
							<div class="name">Lorem, ipsum dolor.</div>:<div class="time"> 35234</div>
						</div>
						<div class="record">
							<div class="name">Lorem, ipsum.</div>:<div class="time"> 2345</div>
						</div>
						<div class="record">
							<div class="name">Lorem ipsum dolor sit.</div>:<div class="time"> 2345234</div>
						</div>
					</div>
					<button class="game-menu__btn btn-close">close</button>
				</div>

				<div class="game-options">
					<div class="game-mode">
						<span>Mode: </span>
						<select class="mode-select">
							<option value="3">3 x 3</option>
							<option value="4" selected>4 x 4</option>
							<option value="5">5 x 5</option>
							<option value="6">6 x 6</option>
							<option value="7">7 x 7</option>
							<option value="8">8 x 8</option>
						</select>
					</div>

					<div class="game-sound">
						<span>Sound: </span>
						<input class="sound-select" type="checkbox" checked>
					</div>

					<div class="game-images">
						<buton class="btn-image image-right"><span>&#10094</span></buton>
						<img src="" alt="" class="game-image">
						<buton class="btn-image image-left"><span>&#10095</span></buton>
					</div>

					<button class="game-menu__btn btn-close">close</button>
				</div>

				<div class="game-save">
					<div class="game-save-content">
						<div>
              Congratulations! You have solved the puzzle in 
              <span class="win-time"></span> and 
              <span class="win-moves"></span> moves
            </div>
						<input id="nickname" placeholder="Enter your name">
						<button class="game-menu__btn btn-save">save</button>
					</div>
				</div>
			`;

      this.stepsHTML = this.root.querySelector('.game-steps');
      this.fieldHTML = this.root.querySelector('.game-playfield');
      this.timeHTML = this.root.querySelector('.game-time');
      this.menu = this.root.querySelector('.game-menu');
      this.settings = this.root.querySelector('.game-options');
      this.records = this.root.querySelector('.game-records');
      this.main = this.root.querySelector('.game-main');
      this.closeButtons = this.root.querySelectorAll('.btn-close');
      this.playButton = this.root.querySelector('.btn-play');
      this.settingsButton = this.root.querySelector('.btn-settings');
      this.recordsButton = this.root.querySelector('.btn-records');
      this.restartButton = this.root.querySelector('.btn-restart');
      this.winModal = this.root.querySelector('.game-save') as HTMLDivElement;
      this.nameField = this.root.querySelector('#nickname') as HTMLInputElement;
      this.saveButton = this.root.querySelector('.btn-save');
      this.modeSelect = this.root.querySelector('.mode-select');
      this.soundCheckbox = this.root.querySelector('.sound-select');

      this.closeButtons.forEach((item) =>
        item.addEventListener('click', this.closeButtonClick)
      );
      this.playButton.addEventListener('click', this.playButtonClick);
      this.settingsButton.addEventListener('click', this.settingsButtonClick);
      this.recordsButton.addEventListener('click', this.recordsButtonClick);
      this.restartButton.addEventListener('click', this.restartButtonClick);
      this.winModal.addEventListener('click', this.winModalClick);
      this.saveButton.addEventListener('click', this.saveButtonClick);
      this.modeSelect.addEventListener('input', this.modeSelectInput);
      this.soundCheckbox.addEventListener('change', this.soundCheckboxChange);

      this.fieldHTML.addEventListener('move', this.moveHandle);

      window.addEventListener('beforeunload', (e) => {
        Game.appCache.save();
      });

      Game.appCache = AppCache.load();
      this.soundCheckbox.checked = Game.appCache.sound;
      this.swicthSound(Game.appCache.sound);
      if (Game.appCache.sequence?.length > 0) {
        this.fieldSize = Math.sqrt(Game.appCache.sequence.length);
        this.max = this.fieldSize * this.fieldSize;
        this.main.style.display = 'flex';
        this.startGame(false);
      } else {
        this.menu.style.display = 'flex';
      }

      this.slider = new ImageSlider('.game-images');
      this.showTime();
    }

    private moveHandle = () => {
      const isWin = this.isWin();
      Game.appCache.sequence = this.gameBlocks.map((b) => b.number);
      ++Game.appCache.steps;
      this.stepsHTML.textContent = Game.appCache.steps.toString();
      console.log(Game.appCache.sequence);
      if (isWin) {
        const time = this.timer.convert(Game.appCache.time);
        this.winModal.style.display = 'flex';
        this.nameField.value = '';
        if (
          Game.appCache.records.length === AppCache.recordsAmount &&
          Game.appCache.records[AppCache.recordsAmount - 1].moves <
            Game.appCache.steps
        ) {
          this.winModal.querySelector('.btn-save').textContent = 'new game';
          this.nameField.style.display = 'none';
        } else {
          this.winModal.querySelector('.btn-save').textContent = 'save';
          this.nameField.style.display = 'block';
        }
        this.winModal.querySelector(
          '.win-time'
        ).textContent = `${time.minutes}:${time.seconds}`;
        this.winModal.querySelector(
          '.win-moves'
        ).textContent = `${Game.appCache.steps}`;
      }
    };

    private closeButtonClick = (e) => {
      for (const node of this.root.children)
        (node as HTMLDivElement).style.display = 'none';

      Game.appCache.steps = 0;
      Game.appCache.sequence = null;
      this.gameBlocks = null;
      this.menu.style.display = 'flex';
    };

    private playButtonClick = (e) => {
      this.menu.style.display = 'none';
      this.main.style.display = 'flex';
      this.startGame(true);
    };

    private settingsButtonClick = (e) => {
      this.menu.style.display = 'none';
      this.settings.style.display = 'flex';
    };

    private recordsButtonClick = (e) => {
      this.menu.style.display = 'none';
      this.records.style.display = 'flex';
      this.records.children[0].innerHTML = '';
      this.records.children[0].insertAdjacentHTML(
        'beforeend',
        `
				
						<table class="records-table">
							<tr>
								<th>Name</th>
								<th>Moves</th>
							</tr>
							${Game.appCache.records.reduce((html, item) => {
                return (
                  html + `<tr><td>${item.name}</td><td>${item.moves}</td></tr>`
                );
              }, '')}
						</table>
				`
      );
    };

    private restartButtonClick = (e) => {
      this.startGame(true);
    };

    private winModalClick = (e) => {
      const target = e.target as HTMLDivElement;
      if (target.className === 'game-save') {
        this.winModal.style.display = 'none';
        this.startGame(true);
      }
    };

    private saveButtonClick = (e) => {
      if (
        this.nameField.value.length === 0 &&
        this.nameField.style.display != 'none'
      ) {
        return;
      }

      if (this.nameField.style.display != 'none') {
        Game.appCache.saveRecord(this.nameField.value, Game.appCache.steps);
        Game.appCache.save();
      }

      this.winModal.style.display = 'none';
      this.startGame(true);
    };

    private modeSelectInput = (e) => {
      const srcElt = e.srcElement as HTMLSelectElement;
      const size = parseInt(
        (srcElt.children[srcElt.selectedIndex] as HTMLOptionElement).value
      );

      this.fieldSize = size;
      this.max = size * size;
    };

    private swicthSound = (flag: boolean) => {
      Game.appCache.sound = flag;
      if (flag) {
        BlockGenerator.sound = new Audio();
        BlockGenerator.sound.src = 'src/move.mp3';
      } else {
        BlockGenerator.sound = null;
      }
    };

    private soundCheckboxChange = (e) => {
      this.swicthSound(this.soundCheckbox.checked);
      console.log(e);
    };

    private showTime = () => {
      Game.appCache.time = this.timer.getRowData();
      const time = this.timer.convert(Game.appCache.time);
      this.timeHTML.textContent = `${time.minutes}:${time.seconds}`;
      setTimeout(this.showTime, 1000);
    };
  }

  const GAME = new Game('#game');
}
