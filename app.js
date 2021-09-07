var GemPuzzle;
(function (GemPuzzle) {
    class AppCache {
        constructor() {
            this.time = 0;
            this.steps = 0;
            this.sequence = null;
            this.records = [];
            this.sound = true;
            this.image = 0;
            this.save = () => {
                localStorage.setItem('cache-puzzle', JSON.stringify(this));
            };
        }
        saveRecord(n, m) {
            this.records.push({ name: n, moves: m });
            this.records = this.records.sort((a, b) => a.moves - b.moves);
            if (this.records.length > AppCache.recordsAmount) {
                this.records.pop();
            }
        }
    }
    AppCache.recordsAmount = 10;
    AppCache.load = () => {
        const res = JSON.parse(localStorage.getItem('cache-puzzle'));
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
    };
    GemPuzzle.AppCache = AppCache;
})(GemPuzzle || (GemPuzzle = {}));
var GemPuzzle;
(function (GemPuzzle) {
    class BlockGenerator {
        constructor(parent, fieldSize) {
            this.fillArea = (sequence) => {
                const blocks = [];
                let isReady = true;
                sequence.forEach((value, index) => {
                    const element = this.createBlock(value);
                    element.node.style.order = index.toString();
                    this.parent.append(element.node);
                    blocks.push(element);
                });
                blocks.forEach((element, index) => {
                    let indexChange;
                    let emptyChild, contentChild;
                    element.node.addEventListener('click', (e) => {
                        var _a, _b, _c, _d;
                        if (!isReady) {
                            return;
                        }
                        let transformation;
                        if (((_a = blocks[index - 1]) === null || _a === void 0 ? void 0 : _a.number) === this.max) {
                            indexChange = index - 1;
                            transformation = 'translateX(-100%)';
                        }
                        else if (((_b = blocks[index + 1]) === null || _b === void 0 ? void 0 : _b.number) === this.max) {
                            indexChange = index + 1;
                            transformation = 'translateX(100%)';
                        }
                        else if (((_c = blocks[index - this.fieldSize]) === null || _c === void 0 ? void 0 : _c.number) === this.max) {
                            indexChange = index - this.fieldSize;
                            transformation = 'translateY(-100%)';
                        }
                        else if (((_d = blocks[index + this.fieldSize]) === null || _d === void 0 ? void 0 : _d.number) === this.max) {
                            indexChange = index + this.fieldSize;
                            transformation = 'translateY(100%)';
                        }
                        else {
                            return false;
                        }
                        isReady = false;
                        blocks[indexChange].number = element.number;
                        blocks[index].number = this.max;
                        emptyChild = blocks[indexChange].node.children[0];
                        contentChild = blocks[index].node.children[0];
                        blocks[index].node.style.transform = transformation;
                        this.parent.dispatchEvent(new Event('move'));
                    });
                    element.node.addEventListener('transitionend', (e) => {
                        var _a;
                        if (blocks[indexChange]) {
                            blocks[indexChange].node.append(contentChild);
                            blocks[index].node.append(emptyChild);
                            blocks[index].node.style.transitionDuration = '0';
                            blocks[index].node.style.transform = '';
                            blocks[index].node.style.transitionDuration = '0.2s';
                            (_a = BlockGenerator.sound) === null || _a === void 0 ? void 0 : _a.play();
                        }
                        isReady = true;
                    });
                    const dragInner = element.node.children[0];
                    dragInner.addEventListener('dragover', (e) => e.preventDefault());
                    dragInner.addEventListener('dragstart', (e) => {
                        if (dragInner.classList.contains('empty')) {
                            return;
                        }
                        e.dataTransfer.setData('index', dragInner.parentElement.style.order.toString());
                        setTimeout(() => (dragInner.style.display = 'none'), 0);
                    });
                    dragInner.addEventListener('dragend', () => (dragInner.style.display = 'flex'));
                    dragInner.addEventListener('drop', (e) => {
                        var _a;
                        if (!dragInner.classList.contains('empty')) {
                            return;
                        }
                        const index = parseInt(e.dataTransfer.getData('index'));
                        const indexChange = parseInt(dragInner.parentElement.style.order);
                        const difference = index - indexChange;
                        if (Math.abs(difference) === 1 || Math.abs(difference) === this.fieldSize) {
                            const dragged = blocks[index];
                            const empty = blocks[indexChange];
                            empty.number = dragged.number;
                            dragged.number = this.max;
                            const contentChild = dragged.node.children[0];
                            const emptyChild = dragInner;
                            dragged.node.append(emptyChild);
                            empty.node.append(contentChild);
                            (_a = BlockGenerator.sound) === null || _a === void 0 ? void 0 : _a.play();
                            this.parent.dispatchEvent(new Event('move'));
                        }
                    });
                    element.node.onselectstart = (e) => {
                        e.preventDefault();
                    };
                });
                this.drawImage(blocks);
                return blocks;
            };
            this.drawImage = (blocks) => {
                const image = new Image();
                image.style.objectFit = 'cover';
                image.src = `src/images/${GemPuzzle.Game.appCache.image}.jpg`;
                const partSize = parseFloat(getComputedStyle(blocks[0].node.children[0]).width);
                const fontSize = partSize / 2.5;
                const imageFregmentSize = image.width / this.fieldSize;
                image.onload = () => {
                    blocks.forEach((block) => {
                        const num = block.number - 1;
                        const ctx = block.node.children[0].getContext('2d');
                        const y = Math.trunc(num / this.fieldSize) * imageFregmentSize;
                        const x = (num % this.fieldSize) * imageFregmentSize;
                        ctx.drawImage(image, x, y, imageFregmentSize, imageFregmentSize, 0, 0, partSize, partSize);
                        ctx.fillStyle = 'rgba(9, 224, 35, 0.6)';
                        ctx.font = `bold ${fontSize}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.fillText(block.number.toString(), partSize * 0.5, 0.7 * partSize);
                    });
                };
            };
            this.calcSizes = (parent) => {
                const outerWidth = parseFloat(getComputedStyle(parent).width);
                const blockSize = (outerWidth / 100) * ((100 - (this.fieldSize + 1)) / this.fieldSize);
                const gap = (outerWidth - blockSize * this.fieldSize) / (this.fieldSize + 1) / 2;
                return { blockSize, gap };
            };
            this.parent = parent;
            this.fieldSize = fieldSize;
            this.max = fieldSize * fieldSize;
            const { blockSize, gap } = this.calcSizes(parent);
            this.createBlock = (n) => {
                const block = new Block();
                block.node = document.createElement('div');
                block.node.classList.add('number-block-outer');
                block.node.style.padding = gap + 'px';
                block.node.style.width = block.node.style.height = blockSize + gap * 2 + 'px';
                block.node.innerHTML = `
					<canvas 
            class="number-block ${n == this.max ? 'empty' : ''}" 
            width="${blockSize}px" 
            height="${blockSize}px" draggable="true">
          </canvas>
				`;
                block.number = n;
                return block;
            };
        }
    }
    BlockGenerator.sound = null;
    GemPuzzle.BlockGenerator = BlockGenerator;
    class Block {
        constructor() { }
        get Number() {
            return this.number;
        }
    }
    GemPuzzle.Block = Block;
})(GemPuzzle || (GemPuzzle = {}));
var GemPuzzle;
(function (GemPuzzle) {
    class Timer {
        constructor(previous = 0) {
            this.addZero = (n) => (n > 9) ? `${n}` : `0${n}`;
            this.start = (previous = 0) => {
                this.startPoint = Date.now() - previous;
            };
            this.convert = (ms) => {
                const elapsedTime = Math.trunc(ms / 1000);
                return {
                    minutes: this.addZero(Math.trunc(elapsedTime / 60)),
                    seconds: this.addZero(elapsedTime % 60),
                };
            };
            this.getRowData = () => {
                return (Date.now() - this.startPoint);
            };
        }
    }
    GemPuzzle.Timer = Timer;
})(GemPuzzle || (GemPuzzle = {}));
var GemPuzzle;
(function (GemPuzzle) {
    class ImageSlider {
        constructor(query) {
            this.imageCount = 10;
            this.body = document.querySelector(query);
            this.imageNode = this.body.querySelector('.game-image');
            this.changeImage(GemPuzzle.Game.appCache.image);
            this.body.querySelector('.image-right').addEventListener('click', (e) => {
                this.changeImage(GemPuzzle.Game.appCache.image - 1);
            });
            this.body.querySelector('.image-left').addEventListener('click', (e) => {
                this.changeImage(GemPuzzle.Game.appCache.image + 1);
            });
        }
        changeImage(num) {
            if (num === this.imageCount) {
                num = 0;
            }
            ;
            if (num < 0) {
                num = this.imageCount;
            }
            ;
            this.imageNode.src = `src/images/${num}.jpg`;
            GemPuzzle.Game.appCache.image = num;
        }
    }
    GemPuzzle.ImageSlider = ImageSlider;
})(GemPuzzle || (GemPuzzle = {}));
var GemPuzzle;
(function (GemPuzzle) {
    class Game {
        constructor(query) {
            var _a;
            this.root = null;
            this.timer = new GemPuzzle.Timer();
            this.fieldSize = 4;
            this.max = this.fieldSize * this.fieldSize;
            this.gameBlocks = null;
            this.isSortable = (array) => {
                let counter = 0;
                for (let i = 1; i < array.length; i++) {
                    if (array[i] === this.max)
                        continue;
                    for (let j = 0; j < i; j++) {
                        if (array[j] === this.max)
                            continue;
                        if (array[j] > array[i])
                            ++counter;
                    }
                }
                counter =
                    counter + Math.trunc(array.indexOf(this.max) / this.fieldSize) + 1;
                return counter % 2 === 0;
            };
            this.createSequence = () => {
                let sequence = [];
                const max = this.fieldSize * this.fieldSize;
                for (let i = 1; i <= max; i++)
                    sequence.push(i);
                let sortable = false;
                while (sortable == false) {
                    sequence = sequence.sort((a, b) => Math.random() - 0.5);
                    sortable = this.isSortable(sequence);
                }
                return sequence;
            };
            this.isWin = () => {
                for (let i = 0; i < this.max; i++) {
                    if (this.gameBlocks[i].number !== i + 1) {
                        return false;
                    }
                }
                return true;
            };
            this.oneStepWin = () => {
                const sequence = [];
                for (let i = 1; i <= this.fieldSize * this.fieldSize; i++) {
                    sequence.push(i);
                }
                sequence[sequence.length - 2] = this.fieldSize * this.fieldSize;
                sequence[sequence.length - 1] = this.fieldSize * this.fieldSize - 1;
                Game.appCache.sequence = sequence;
            };
            this.drawBlocks = (sequence) => {
                this.fieldHTML.innerHTML = '';
                const blockGenerator = new GemPuzzle.BlockGenerator(this.fieldHTML, this.fieldSize);
                this.gameBlocks = blockGenerator.fillArea(sequence);
            };
            this.startGame = (isNew) => {
                if (isNew) {
                    Game.appCache.steps = 0;
                    Game.appCache.time = 0;
                    this.timer.start(0);
                    Game.appCache.sequence = null;
                }
                else {
                    this.timer.start(Game.appCache.time);
                }
                this.stepsHTML.textContent = Game.appCache.steps.toString();
                const time = this.timer.convert(Game.appCache.time);
                this.timeHTML.textContent = `${time.minutes}:${time.seconds}`;
                if (Game.appCache.sequence === null) {
                    this.drawBlocks(this.createSequence());
                }
                else {
                    this.drawBlocks(Game.appCache.sequence);
                }
            };
            this.moveHandle = () => {
                const isWin = this.isWin();
                Game.appCache.sequence = this.gameBlocks.map((b) => b.number);
                ++Game.appCache.steps;
                this.stepsHTML.textContent = Game.appCache.steps.toString();
                console.log(Game.appCache.sequence);
                if (isWin) {
                    const time = this.timer.convert(Game.appCache.time);
                    this.winModal.style.display = 'flex';
                    this.nameField.value = '';
                    if (Game.appCache.records.length === GemPuzzle.AppCache.recordsAmount &&
                        Game.appCache.records[GemPuzzle.AppCache.recordsAmount - 1].moves <
                            Game.appCache.steps) {
                        this.winModal.querySelector('.btn-save').textContent = 'new game';
                        this.nameField.style.display = 'none';
                    }
                    else {
                        this.winModal.querySelector('.btn-save').textContent = 'save';
                        this.nameField.style.display = 'block';
                    }
                    this.winModal.querySelector('.win-time').textContent = `${time.minutes}:${time.seconds}`;
                    this.winModal.querySelector('.win-moves').textContent = `${Game.appCache.steps}`;
                }
            };
            this.closeButtonClick = (e) => {
                for (const node of this.root.children)
                    node.style.display = 'none';
                Game.appCache.steps = 0;
                Game.appCache.sequence = null;
                this.gameBlocks = null;
                this.menu.style.display = 'flex';
            };
            this.playButtonClick = (e) => {
                this.menu.style.display = 'none';
                this.main.style.display = 'flex';
                this.startGame(true);
            };
            this.settingsButtonClick = (e) => {
                this.menu.style.display = 'none';
                this.settings.style.display = 'flex';
            };
            this.recordsButtonClick = (e) => {
                this.menu.style.display = 'none';
                this.records.style.display = 'flex';
                this.records.children[0].innerHTML = '';
                this.records.children[0].insertAdjacentHTML('beforeend', `
				
						<table class="records-table">
							<tr>
								<th>Name</th>
								<th>Moves</th>
							</tr>
							${Game.appCache.records.reduce((html, item) => {
                    return (html + `<tr><td>${item.name}</td><td>${item.moves}</td></tr>`);
                }, '')}
						</table>
				`);
            };
            this.restartButtonClick = (e) => {
                this.startGame(true);
            };
            this.winModalClick = (e) => {
                const target = e.target;
                if (target.className === 'game-save') {
                    this.winModal.style.display = 'none';
                    this.startGame(true);
                }
            };
            this.saveButtonClick = (e) => {
                if (this.nameField.value.length === 0 &&
                    this.nameField.style.display != 'none') {
                    return;
                }
                if (this.nameField.style.display != 'none') {
                    Game.appCache.saveRecord(this.nameField.value, Game.appCache.steps);
                    Game.appCache.save();
                }
                this.winModal.style.display = 'none';
                this.startGame(true);
            };
            this.modeSelectInput = (e) => {
                const srcElt = e.srcElement;
                const size = parseInt(srcElt.children[srcElt.selectedIndex].value);
                this.fieldSize = size;
                this.max = size * size;
            };
            this.swicthSound = (flag) => {
                Game.appCache.sound = flag;
                if (flag) {
                    GemPuzzle.BlockGenerator.sound = new Audio();
                    GemPuzzle.BlockGenerator.sound.src = 'src/move.mp3';
                }
                else {
                    GemPuzzle.BlockGenerator.sound = null;
                }
            };
            this.soundCheckboxChange = (e) => {
                this.swicthSound(this.soundCheckbox.checked);
                console.log(e);
            };
            this.showTime = () => {
                Game.appCache.time = this.timer.getRowData();
                const time = this.timer.convert(Game.appCache.time);
                this.timeHTML.textContent = `${time.minutes}:${time.seconds}`;
                setTimeout(this.showTime, 1000);
            };
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
            this.winModal = this.root.querySelector('.game-save');
            this.nameField = this.root.querySelector('#nickname');
            this.saveButton = this.root.querySelector('.btn-save');
            this.modeSelect = this.root.querySelector('.mode-select');
            this.soundCheckbox = this.root.querySelector('.sound-select');
            this.closeButtons.forEach((item) => item.addEventListener('click', this.closeButtonClick));
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
            Game.appCache = GemPuzzle.AppCache.load();
            this.soundCheckbox.checked = Game.appCache.sound;
            this.swicthSound(Game.appCache.sound);
            if (((_a = Game.appCache.sequence) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                this.fieldSize = Math.sqrt(Game.appCache.sequence.length);
                this.max = this.fieldSize * this.fieldSize;
                this.main.style.display = 'flex';
                this.startGame(false);
            }
            else {
                this.menu.style.display = 'flex';
            }
            this.slider = new GemPuzzle.ImageSlider('.game-images');
            this.showTime();
        }
    }
    GemPuzzle.Game = Game;
    const GAME = new Game('#game');
})(GemPuzzle || (GemPuzzle = {}));
//# sourceMappingURL=app.js.map