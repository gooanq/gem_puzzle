namespace GemPuzzle {
  export class BlockGenerator {
    public static sound: HTMLAudioElement = null;
    parent: HTMLDivElement;
    fieldSize: number;
    max: number;
    public createBlock: (n: number) => Block;

    constructor(parent: HTMLDivElement, fieldSize: number) {
      this.parent = parent;
      this.fieldSize = fieldSize;
      this.max = fieldSize * fieldSize;
      const { blockSize, gap } = this.calcSizes(parent);

      this.createBlock = (n: number): Block => {
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

    public fillArea = (sequence: number[]) => {
      const blocks: Block[] = [];
      let isReady = true;
      sequence.forEach((value, index) => {
        const element = this.createBlock(value);
        element.node.style.order = index.toString();
        this.parent.append(element.node);
        blocks.push(element);
      });

      blocks.forEach((element, index) => {
        let indexChange: number;
        let emptyChild, contentChild;
        element.node.addEventListener('click', (e) => {
          if (!isReady) {
            return;
          }
          let transformation: string;
          if (blocks[index - 1]?.number === this.max) {
            indexChange = index - 1;
            transformation = 'translateX(-100%)';
          } else if (blocks[index + 1]?.number === this.max) {
            indexChange = index + 1;
            transformation = 'translateX(100%)';
          } else if (blocks[index - this.fieldSize]?.number === this.max) {
            indexChange = index - this.fieldSize;
            transformation = 'translateY(-100%)';
          } else if (blocks[index + this.fieldSize]?.number === this.max) {
            indexChange = index + this.fieldSize;
            transformation = 'translateY(100%)';
          } else {
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
          if (blocks[indexChange]) {
            blocks[indexChange].node.append(contentChild);
            blocks[index].node.append(emptyChild);
            blocks[index].node.style.transitionDuration = '0';
            blocks[index].node.style.transform = '';
            blocks[index].node.style.transitionDuration = '0.2s';
            BlockGenerator.sound?.play();
          }
          isReady = true;
        });

        const dragInner = element.node.children[0] as HTMLDivElement;

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
            BlockGenerator.sound?.play();
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

    private drawImage = (blocks: Block[]) => {
      const image = new Image();
      image.style.objectFit = 'cover';
      image.src = `src/images/${Game.appCache.image}.jpg`;

      const partSize = parseFloat(getComputedStyle(blocks[0].node.children[0]).width);
      const fontSize = partSize / 2.5;
      const imageFregmentSize = image.width / this.fieldSize;

      image.onload = () => {
        blocks.forEach((block) => {
          const num = block.number - 1;
          const ctx = (block.node.children[0] as HTMLCanvasElement).getContext('2d');
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

    private calcSizes = (parent: HTMLDivElement): { blockSize: number; gap: number } => {
      const outerWidth = parseFloat(getComputedStyle(parent).width);
      const blockSize = (outerWidth / 100) * ((100 - (this.fieldSize + 1)) / this.fieldSize);
      const gap = (outerWidth - blockSize * this.fieldSize) / (this.fieldSize + 1) / 2;
      return { blockSize, gap };
    };
  }

  export class Block {
    public node: HTMLDivElement;
    public number: number;

    public get Number(): number {
      return this.number;
    }

    constructor() {}
  }
}
