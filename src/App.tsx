import React from "react";
import "./App.css";

interface AppState {
    blocks: Block[];
    blockContent: Map<BlockId, string>;
}

interface Block {
    id: BlockId;
    children?: Block[];
}

type BlockId = number;

class App extends React.Component<{}, AppState> {
    private blockInFocus: React.RefObject<HTMLTextAreaElement> | undefined;
    private blockOrder: number[] = [];
    private blockRefs: Map<BlockId, React.RefObject<HTMLTextAreaElement>> =
        new Map();
    private idCounter: number = 0;

    constructor(props: {}) {
        super(props);
        this.state = this.getStateForTests();
    }

    private getStateForTests() {
        const firstBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const firstBlockId: BlockId = this.getNextId();
        const childRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const childId: BlockId = this.getNextId();
        const grandchildRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const grandchildId: BlockId = this.getNextId();
        const state = {
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
                [firstBlockId, "This is the water"],
                [childId, "And this is the well"],
                [grandchildId, "Drink full and descend"],
            ]),
        };
        this.blockRefs.set(firstBlockId, firstBlockRef);
        this.blockRefs.set(childId, childRef);
        this.blockRefs.set(grandchildId, grandchildRef);
        this.blockInFocus = firstBlockRef;
        return state;
    }

    private getNextId() {
        const next = ++this.idCounter;
        return next;
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
                // todo: remove the index
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
                                        // todo: remove the index
                                        this.handleKeyDown(
                                            event,
                                            block,
                                            blockIndex
                                        )
                                    }
                                    onChange={(event) => {
                                        this.handleChange(event);
                                    }}
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
        // todo: remove the old one after redoing Enter
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
        const newBlockInFocus = previousBlockId ? previousBlockId : nextBlockId;

        this.blockInFocus = this.blockRefs.get(newBlockInFocus);
        this.setState(
            {
                blocks: newBlocks,
            },
            () => {
                this.blockInFocus?.current?.focus();
            }
        );
    }

    handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const newBlockValue = event.target.value;
        const blockId = Number.parseInt(event.target.dataset.id as string);

        this.setState((prevState) => {
            const newBlockContent = new Map(prevState.blockContent);
            newBlockContent.set(blockId, newBlockValue);
            return {
                blockContent: newBlockContent,
            };
        });
    }
}

export default App;
