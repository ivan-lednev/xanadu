import React from "react";
import "./App.css";

class App extends React.Component {
    render() {
        return (
            <div className="editor-container">
                <div className="editor-sizer">
                    <h1>Page title</h1>
                    <div className="line">
                        <div className="bullet">●</div>
                        <textarea
                            autoFocus={true}
                            // value="hren"
                            onChange={(event) => this.handleChange(event)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        console.log("changed");
    }
}

export default App;
