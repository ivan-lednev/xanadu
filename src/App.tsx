import { cloneDeep } from "lodash";
import React from "react";
import "./App.css";

interface AppState {
    blocks: Block[];
    blockContent: Map<BlockId, string>;
}

interface Block {
    id: BlockId;
    children: Block[];
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
                                    children: [],
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
                                        this.handleKeyDown(event, block)
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
        block: Block
    ) {
        const blockId = block.id;
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
                this.handleEnter(block);
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
            case "Tab":
                event.preventDefault();
                if (event.shiftKey) {
                    this.handleShiftTab(blockId);
                    break;
                }
                this.handleTab(blockId);
                break;
        }
    }

    private handleEnter(block: Block) {
        const newBlockId = this.getNextId();
        const newBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const newBlocks = cloneDeep(this.state.blocks);
        this.insertBlockIntoTree(newBlocks, block, {
            id: newBlockId,
            children: [],
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

    private insertBlockIntoTree(
        blocks: Block[],
        blockInFocus: Block,
        newBlock: Block
    ) {
        for (const [i, block] of blocks.entries()) {
            if (block.id === blockInFocus.id) {
                blocks.splice(i + 1, 0, newBlock);
                return true;
            }
            if (block.children) {
                const inserted = this.insertBlockIntoTree(
                    block.children,
                    blockInFocus,
                    newBlock
                );
                if (inserted) {
                    return true;
                }
            }
        }
    }

    private handleBackspace(
        blockId: BlockId,
        previousBlockId: BlockId,
        nextBlockId: BlockId
    ) {
        const newBlocks = cloneDeep(this.state.blocks);
        this.filterOutBlockFromTree(newBlocks, blockId);
        // todo: no need to pass both of these parameters. This can be done outside
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

    // Todo: same as insert
    private filterOutBlockFromTree(blocks: Block[], blockIdToDelete: BlockId) {
        for (const [i, block] of blocks.entries()) {
            if (block.id === blockIdToDelete) {
                blocks.splice(i, 1);
                return true;
            }
            if (block.children) {
                const filtered = this.filterOutBlockFromTree(
                    block.children,
                    blockIdToDelete
                );
                if (filtered) {
                    return true;
                }
            }
        }
    }

    private handleShiftTab(blockId: BlockId) {
        const newBlocks = cloneDeep(this.state.blocks);
        this.dedentBlockInTree(blockId, newBlocks);
        this.setState(
            {
                blocks: newBlocks,
            },
            () => this.blockRefs.get(blockId)?.current?.focus()
        );
    }

    private dedentBlockInTree(blockIdToDedent: BlockId, blocks: Block[]) {
        function descendForDedenting(blocks: Block[]): Block | null {
            for (let i = 0; i < blocks.length; i++) {
                const block = blocks[i];
                if (block.id === blockIdToDedent) {
                    blocks.splice(i, 1);
                    return block;
                }
                if (block.children.length > 0) {
                    const retrieved = descendForDedenting(block.children);
                    if (retrieved !== null) {
                        blocks.splice(i + 1, 0, retrieved);
                        break;
                    }
                }
            }
            return null;
        }

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.id === blockIdToDedent) {
                break;
            }
            if (block.children.length > 0) {
                const retrieved = descendForDedenting(block.children);
                if (retrieved !== null) {
                    blocks.splice(i + 1, 0, retrieved);
                    break;
                }
            }
        }
    }

    private handleTab(blockId: BlockId) {
        const newBlocks = cloneDeep(this.state.blocks);
        this.indentBlockInTree(blockId, newBlocks);
        this.setState(
            {
                blocks: newBlocks,
            },
            () => this.blockRefs.get(blockId)?.current?.focus()
        );
    }

    private indentBlockInTree(blockIdToIndent: BlockId, blocks: Block[]) {
        for (const [i, block] of blocks.entries()) {
            const next = blocks[i + 1];

            if (next && next.id === blockIdToIndent) {
                blocks.splice(i + 1, 1)
                block.children.push(next);
                return true;
            }

            if (block.children) {
                const indented = this.indentBlockInTree(
                    blockIdToIndent,
                    block.children
                );
                if (indented) {
                    return true;
                }
            }
        }
    }

    private handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const newBlockValue = event.target.value;
        // todo: how do I remove casting?
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
