import React from "react";
import "./App.css";

class App extends React.Component<{}, AppState> {
    blockInFocus: React.RefObject<HTMLTextAreaElement>;
    idCounter: number;
    constructor(props: {}) {
        super(props);
        const firstBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        this.idCounter = 0;
        this.state = {
            blocks: [{ id: this.getNextId(), value: "", ref: firstBlockRef }],
        };
        this.blockInFocus = firstBlockRef;
    }

    render() {
        return (
            <div className="editor-container">
                <div
                    className="editor-sizer"
                    onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                        const blockIndex = this.state.blocks.findIndex(
                            (block) => block.ref.current === event.target
                        );
                        if (event.key === "ArrowDown") {
                            this.state.blocks[
                                blockIndex + 1
                            ]?.ref.current?.focus();
                        } else if (event.key === "ArrowUp") {
                            this.state.blocks[
                                blockIndex - 1
                            ]?.ref.current?.focus();
                        }
                    }}
                >
                    <h1>New note</h1>
                    <ul>
                        {this.state.blocks.map((block, blockIndex, blocks) => (
                            <li key={block.id} className="block">
                                <div className="bullet">●</div>
                                <textarea
                                    ref={block.ref}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            const newBlocks = blocks.slice();
                                            const newBlockRef: React.RefObject<HTMLTextAreaElement> =
                                                React.createRef();
                                            newBlocks.splice(
                                                blockIndex + 1,
                                                0,
                                                {
                                                    id: this.getNextId(),
                                                    value: "",
                                                    ref: newBlockRef,
                                                }
                                            );
                                            this.blockInFocus = newBlockRef;
                                            this.setState(
                                                {
                                                    blocks: newBlocks,
                                                },
                                                () => {
                                                    this.blockInFocus.current?.focus();
                                                }
                                            );
                                        } else if (
                                            event.key === "Backspace" &&
                                            block.value.length === 0 &&
                                            blocks.length > 1
                                        ) {
                                            event.preventDefault();
                                            const newBlocks = blocks.slice();
                                            newBlocks.splice(blockIndex, 1);
                                            const indexOfBlockInFocusAfterDeletion =
                                                blockIndex === 0
                                                    ? 0
                                                    : blockIndex - 1;
                                            this.blockInFocus =
                                                newBlocks[
                                                    indexOfBlockInFocusAfterDeletion
                                                ].ref;
                                            this.setState(
                                                {
                                                    blocks: newBlocks,
                                                },
                                                () => {
                                                    this.blockInFocus.current?.focus();
                                                }
                                            );
                                        }
                                    }}
                                    onChange={(event) => {
                                        this.handleChange(event, blockIndex);
                                    }}
                                    value={block.value}
                                    rows={1}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
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
        this.setState((prevState) => {
            const newBlocks = prevState.blocks.slice();
            newBlocks[blockIndex].value = newBlockValue;
            return {
                blocks: newBlocks,
            };
        });
    }
}

interface AppState {
    blocks: Block[];
}

interface Block {
    id: number;
    value: string;
    ref: React.RefObject<HTMLTextAreaElement>;
}

export default App;
