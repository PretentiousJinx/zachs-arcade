import type { PointerEvent } from 'react';
import type { Action } from '../games/types';
import type { InputStore } from '../engine/input';

type ControlDeckProps = {
    input: InputStore;
};

function ControlDeck({ input }: ControlDeckProps) {
    function buttonHandlers(action: Action) {
        return {
            onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                input.press(action);
            },
            onPointerUp: () => input.release(action),
            onPointerCancel: () => input.release(action),
            onLostPointerCapture: () => input.release(action),
        };
    }
    return (
        <div className="controls controls--game">
            <div className="joystick" aria-hidden="true">
                <div className="lever">
                    <div className="ball"></div>
                    <div className="stick"></div>
                </div>
            </div>
            <div className="buttons">
                <button type="button" className="btn pill" {...buttonHandlers('start')}>
                    START
                </button>
                <button type="button" className="btn pill" {...buttonHandlers('select')}>
                    SELECT
                </button>
                <button type="button" className="btn pill" {...buttonHandlers('b')}>
                    B
                </button>
                <button type="button" className="btn pill" {...buttonHandlers('a')}>
                    A
                </button>
            </div>
        </div>
    );
}
export default ControlDeck;
