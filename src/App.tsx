import React from "react";
import "./App.css";

class App extends React.Component<{}, AppState> {
    blockInFocus: React.RefObject<HTMLTextAreaElement>;
    idCounter: number;
    constructor(props: {}) {
        super(props);
        this.idCounter = 0;
        const firstBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const firstBlockId: number = this.getNextId();
        const childRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const childId: number = this.getNextId();
        const grandchildRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        const grandchildId: number = this.getNextId();
        this.state = {
            blocks: [
                {
                    id: firstBlockId,
                    ref: firstBlockRef,
                    children: [
                        {
                            id: childId,
                            ref: childRef,
                            children: [
                                {
                                    id: grandchildId,
                                    ref: grandchildRef,
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
        this.blockInFocus = firstBlockRef;
    }

    render() {
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
                {blocks.map((block, blockIndex) => (
                    <li key={block.id} className="block">
                        <div className="block-content">
                            <div className="bullet">●</div>
                            <textarea
                                ref={block.ref}
                                onKeyDown={(event) =>
                                    this.handleKeyDown(event, block, blockIndex)
                                }
                                onChange={(event) => {
                                    this.handleChange(event, blockIndex);
                                }}
                                // todo
                                value={this.state.blockContent.get(block.id)}
                                rows={1}
                                data-id={block.id}
                            />
                        </div>
                        {block.children && this.renderBlocks(block.children)}
                    </li>
                ))}
            </ul>
        );
    }

    private handleKeyDown(
        event: React.KeyboardEvent<HTMLTextAreaElement>,
        block: Block,
        blockIndex: number
    ) {
        switch (event.key) {
            case "ArrowDown":
                this.state.blocks[blockIndex + 1]?.ref.current?.focus();
                break;
            case "ArrowUp":
                this.state.blocks[blockIndex - 1]?.ref.current?.focus();
                break;
            case "Enter":
                event.preventDefault();
                this.handleEnter(blockIndex);
                break;
            case "Backspace":
                // todo
                if (
                    this.state.blockContent.get(block.id)?.length === 0 &&
                    this.state.blocks.length > 1
                ) {
                    event.preventDefault();
                    this.handleBackspace(blockIndex);
                }
                break;
        }
    }

    private handleBackspace(blockIndex: number) {
        const newBlocks = this.state.blocks.slice();
        newBlocks.splice(blockIndex, 1);
        const indexOfBlockInFocusAfterDeletion =
            blockIndex === 0 ? 0 : blockIndex - 1;
        this.blockInFocus = newBlocks[indexOfBlockInFocusAfterDeletion].ref;
        this.setState(
            {
                blocks: newBlocks,
            },
            () => {
                this.blockInFocus.current?.focus();
            }
        );
    }

    private handleEnter(blockIndex: number) {
        const newBlocks = this.state.blocks.slice();
        const newBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        newBlocks.splice(blockIndex + 1, 0, {
            id: this.getNextId(),
            ref: newBlockRef,
        });
        this.blockInFocus = newBlockRef;
        this.setState(
            {
                blocks: newBlocks,
            },
            () => {
                this.blockInFocus.current?.focus();
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
    blockContent: Map<number, string>;
}

interface Block {
    id: number;
    ref: React.RefObject<HTMLTextAreaElement>;
    children?: Block[];
}

export default App;
