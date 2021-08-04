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
                <div className="editor-sizer">
                    <h1>New note</h1>
                    <ul>
                        {this.state.blocks.map((block, blockIndex) => (
                            <li key={block.id} className="block">
                                <div className="bullet">●</div>
                                <textarea
                                    ref={block.ref}
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
                if (block.value.length === 0 && this.state.blocks.length > 1) {
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
            value: "",
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
