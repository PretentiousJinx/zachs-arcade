function ControlDeck() {
    return (
        <div className="controls controls--game">
            <div className="joystick" aria-hidden="true">
                <div className="lever">
                    <div className="ball"></div>
                    <div className="stick"></div>
                </div>
            </div>
            <div className="buttons">
                <button type="button" className="btn pill">
                    START SELECT
                </button>
                <button type="button" className="btn pill">
                    SELECT
                </button>
                <button type="button" className="btn pink">
                    B
                </button>
                <button type="button" className="btn cyan">
                    A
                </button>
            </div>
        </div>
    );
}
export default ControlDeck;
