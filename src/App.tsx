import React from "react";
import "./App.css";

class App extends React.Component<{}, AppState> {
    blockInFocus: React.RefObject<HTMLTextAreaElement> | undefined;
    idCounter: number;
    blockOrder: number[];
    blockRefs: Map<BlockId, React.RefObject<HTMLTextAreaElement>>;
    constructor(props: {}) {
        super(props);
        this.idCounter = 0;
        this.blockOrder = [];
        this.blockRefs = new Map();

        const firstBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const firstBlockId: BlockId = this.getNextId();
        const childRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const childId: BlockId = this.getNextId();
        const grandchildRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const grandchildId: BlockId = this.getNextId();

        this.state = {
            blocks: [
                {
                    id: firstBlockId,
                    children: [
                        {
                            id: childId,
                            children: [
                                {
                                    id: grandchildId,
                                },
                            ],
                        },
                    ],
                },
            ],
            blockContent: new Map([
                [firstBlockId, "First block"],
                [childId, "I'm a child"],
                [grandchildId, "I'm a grand-child"],
            ]),
        };
        // todo: remove refs from the main data structure
        this.blockRefs.set(firstBlockId, firstBlockRef);
        this.blockRefs.set(childId, childRef);
        this.blockRefs.set(grandchildId, grandchildRef);
        this.blockInFocus = firstBlockRef;
    }

    render() {
        this.blockOrder = [];
        return (
            <div className="editor-container">
                <div className="editor-sizer">
                    <h1>New note</h1>
                    {this.renderBlocks(this.state.blocks)}
                </div>
            </div>
        );
    }

    private renderBlocks(blocks: Block[]) {
        return (
            <ul>
                {blocks.map((block, blockIndex) => {
                    const blockId = block.id;
                    this.blockOrder.push(blockId);
                    return (
                        <li key={block.id} className="block">
                            <div className="block-content">
                                <div className="bullet">●</div>
                                <textarea
                                    ref={this.blockRefs.get(blockId)}
                                    onKeyDown={(event) =>
                                        this.handleKeyDown(
                                            event,
                                            block,
                                            blockIndex
                                        )
                                    }
                                    onChange={(event) => {
                                        this.handleChange(event, blockIndex);
                                    }}
                                    // todo: remove chaining
                                    value={this.state.blockContent.get(blockId)}
                                    rows={1}
                                    data-id={blockId}
                                />
                            </div>
                            {block.children &&
                                this.renderBlocks(block.children)}
                        </li>
                    );
                })}
            </ul>
        );
    }

    private handleKeyDown(
        event: React.KeyboardEvent<HTMLTextAreaElement>,
        block: Block,
        blockIndex: number
    ) {
        const blockId = block.id;
        // todo: remove the old one
        const newBlockIndex = this.blockOrder.findIndex((id) => id === blockId);
        const previousBlockId = this.blockOrder[newBlockIndex - 1];
        const nextBlockId = this.blockOrder[newBlockIndex + 1];

        switch (event.key) {
            case "ArrowDown":
                if (nextBlockId) {
                    this.blockRefs.get(nextBlockId)?.current?.focus();
                }
                break;
            case "ArrowUp":
                if (previousBlockId) {
                    this.blockRefs.get(previousBlockId)?.current?.focus();
                }
                break;
            case "Enter":
                event.preventDefault();
                this.handleEnter(block, blockIndex);
                break;
            case "Backspace":
                const blockContent = this.state.blockContent.get(block.id);
                if (
                    (blockContent === undefined || blockContent.length === 0) &&
                    this.blockOrder.length > 1
                ) {
                    event.preventDefault();
                    this.handleBackspace(blockId, previousBlockId, nextBlockId);
                }
                break;
        }
    }

    private handleBackspace(
        blockId: BlockId,
        previousBlockId: BlockId,
        nextBlockId: BlockId
    ) {
        function filterOutBlockFromTree(
            blocks: Block[],
            blockIdToDelete: BlockId
        ) {
            const filtered: Block[] = [];
            for (const block of blocks) {
                if (block.id === blockIdToDelete) {
                    continue;
                }
                if (block.children) {
                    block.children = filterOutBlockFromTree(
                        block.children,
                        blockIdToDelete
                    );
                }
                filtered.push(block);
            }
            return filtered;
        }
        const newBlocks = filterOutBlockFromTree(this.state.blocks, blockId);
        const newBlockInFocus = previousBlockId ? previousBlockId : nextBlockId
        this.blockInFocus = this.blockRefs.get(newBlockInFocus)
        this.setState(
            {
                blocks: newBlocks,
            },
            () => {
                this.blockInFocus?.current?.focus();
            }
        );
    }

    // todo: add new blocks at the same level
    private handleEnter(block: Block, blockIndex: number) {
        const newBlocks = this.state.blocks.slice();
        const newBlockId = this.getNextId();
        const newBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        newBlocks.splice(blockIndex + 1, 0, {
            id: newBlockId,
        });
        this.blockRefs.set(newBlockId, newBlockRef);
        this.blockInFocus = newBlockRef;
        this.setState(
            {
                blocks: newBlocks,
            },
            () => {
                this.blockInFocus?.current?.focus();
            }
        );
    }

    getNextId() {
        const next = ++this.idCounter;
        return next;
    }

    handleChange(
        event: React.ChangeEvent<HTMLTextAreaElement>,
        blockIndex: number
    ) {
        const newBlockValue = event.target.value;
        const blockId = Number.parseInt(event.target.dataset.id as string);
        console.log(blockId);

        this.setState((prevState) => {
            const newBlockContent = new Map(prevState.blockContent);
            newBlockContent.set(blockId, newBlockValue);
            return {
                blockContent: newBlockContent,
            };
        });
    }
}

interface AppState {
    blocks: Block[];
    blockContent: Map<BlockId, string>;
}

interface Block {
    id: BlockId;
    children?: Block[];
}

type BlockId = number;

export default App;
