import React from "react";
import "./App.css";

class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            blocks: [{ id: 0, value: "" }],
        };
    }

    render() {
        return (
            <div className="editor-container">
                <div className="editor-sizer">
                    <h1>New document</h1>
                    <ul>
                        {this.state.blocks.map((block) => (
                            <li key={block.id} className="block">
                                <div className="bullet">●</div>
                                <textarea
                                    onKeyPress={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            const blocks =
                                                this.state.blocks.slice();
                                            blocks.push({
                                                id: blocks.length,
                                                value: "",
                                            });
                                            this.setState({
                                                blocks: blocks,
                                            });
                                        }
                                    }}
                                    onChange={(event) =>
                                        this.handleChange(event, block.id)
                                    }
                                    value={block.value}
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
}

export default App;
