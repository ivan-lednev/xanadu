import React from "react";
import "./App.css";

class App extends React.Component<{}, AppState> {
    blockInFocus: React.RefObject<HTMLTextAreaElement>;
    constructor(props: {}) {
        super(props);
        this.state = {
            blocks: [{ id: 0, value: "", inFocus: true }],
        };
        this.blockInFocus = React.createRef();
    }

    render() {
        return (
            <div className="editor-container">
                <div className="editor-sizer">
                    <h1>New document</h1>
                    <ul>
                        {this.state.blocks.map((block, _, blocks) => (
                            <li key={block.id} className="block">
                                <div className="bullet">●</div>
                                <textarea
                                    ref={
                                        block.inFocus
                                            ? this.blockInFocus
                                            : undefined
                                    }
                                    onKeyDown={(event) => {
                                        const blocks =
                                            this.state.blocks.slice();
                                        const blockIndex = blocks.findIndex(
                                            (otherBlock) => otherBlock === block
                                        );
                                        const nextBlockIndex = blockIndex + 1;
                                        console.log(event.key);
                                        
                                        if (event.key === "Enter") {
                                            event.preventDefault()
                                            blocks[blockIndex].inFocus = false;
                                            blocks.splice(nextBlockIndex, 0, {
                                                id: blocks.length,
                                                value: "",
                                                inFocus: true,
                                            });
                                            this.setState(
                                                {
                                                    blocks: blocks,
                                                },
                                                () => {
                                                    this.blockInFocus.current?.focus();
                                                }
                                            );
                                        } else if (event.key === "ArrowDown") {
                                            const lastBlock = blockIndex === blocks.length - 1
                                            if (lastBlock) {
                                                return
                                            }
                                            blocks[blockIndex].inFocus = false;
                                            blocks[nextBlockIndex].inFocus = true;
                                            this.setState(
                                                {
                                                    blocks: blocks,
                                                },
                                                () => {
                                                    this.blockInFocus.current?.focus();
                                                }
                                            );
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
    inFocus: boolean;
}

export default App;
