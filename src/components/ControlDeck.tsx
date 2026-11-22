import type { PointerEvent } from 'react';
import type { Action } from '../games/types';
import type { InputStore } from '../engine/input';
import { useEffect, useState } from 'react';

type ControlDeckProps = {
    input: InputStore;
};

function ControlDeck({ input }: ControlDeckProps) {
    const [held, setHeld] = useState(() => new Set(input.state.held));

    useEffect(() => {
        return input.subscribe(() => {
            setHeld(new Set(input.state.held));
        });
    }, [input]);

    const tiltX = held.has('up') ? 30 : held.has('down') ? -30 : 0;
    const tiltZ = held.has('right') ? 30 : held.has('left') ? -30 : 0;

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

    function pressed(action: Action) {
        return held.has(action) ? ' pressed' : '';
    }

    return (
        <div className="controls controls--game">
            <div className="joystick" aria-hidden="true">
                <div
                    className="lever"
                    style={{
                        transform: `perspective(200px) rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`,
                    }}
                >
                    <div className="ball"></div>
                    <div className="stick"></div>
                </div>
            </div>
            <div className="buttons">
                <button
                    type="button"
                    className={`btn pill${pressed('start')}`}
                    {...buttonHandlers('start')}
                >
                    START
                </button>
                <button
                    type="button"
                    className={`btn pill${pressed('select')}`}
                    {...buttonHandlers('select')}
                >
                    SELECT
                </button>
                <button
                    type="button"
                    className={`btn pink${pressed('b')}`}
                    {...buttonHandlers('b')}
                >
                    B
                </button>
                <button
                    type="button"
                    className={`btn cyan${pressed('a')}`}
                    {...buttonHandlers('a')}
                >
                    A
                </button>
            </div>
        </div>
    );
}
export default ControlDeck;
