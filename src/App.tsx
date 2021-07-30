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
                                    onChange={(event) =>
                                        this.handleChange(event)
                                    }
                                    onKeyPress={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            const blocks = this.state.blocks.slice();
                                            blocks.push({
                                                id: blocks.length - 1,
                                                value: "",
                                            });
                                            this.setState({
                                                blocks: blocks,
                                            });
                                        }
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        this.setState({
            blocks: [{ id: 0, value: event.target.value }],
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
