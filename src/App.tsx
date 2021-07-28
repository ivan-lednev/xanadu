import "./App.css";

function App() {
    return (
        <div className="editor-container">
            <div className="editor-sizer">
                <h1>Page title</h1>
                <div className="line">
                    <div className="bullet">●</div>
                    <textarea autoFocus={true}>Text</textarea>
                </div>
            </div>
        </div>
    );
}

export default App;
