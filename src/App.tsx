import React from "react";
import "./App.css";

class App extends React.Component<{}, AppState> {
    blockInFocus: React.RefObject<HTMLTextAreaElement>;
    constructor(props: {}) {
        super(props);
        const firstBlockRef: React.RefObject<HTMLTextAreaElement> =
            React.createRef();
        this.state = {
            blocks: [{ id: 0, value: "", ref: firstBlockRef }],
        };
        this.blockInFocus = firstBlockRef;
    }

    render() {
        return (
            <div className="editor-container">
                <div className="editor-sizer">
                    <h1>New document</h1>
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
                                                    id: newBlocks.length,
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
                                        } else if (event.key === "ArrowDown") {
                                            blocks[
                                                blockIndex + 1
                                            ]?.ref.current?.focus();
                                        }
                                    }}
                                    onChange={(event) =>
                                        this.handleChange(event, block.id)
                                    }
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

    handleChange(
        event: React.ChangeEvent<HTMLTextAreaElement>,
        blockId: number
    ) {
        const newBlockValue = event.target.value;
        const editedBlockIndex = this.state.blocks.findIndex(
            (block) => block.id === blockId
        );
        const blocks = this.state.blocks.slice();
        blocks[editedBlockIndex].value = newBlockValue;
        this.setState({
            blocks: blocks,
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
