import type { PointerEvent } from 'react';
import type { Action } from '../games/types';
import type { InputStore } from '../engine/input';
import { useEffect, useState, useRef } from 'react';

const DEAD_ZONE = 12;

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

    const stickDirection = useRef<Action | null>(null);

    function setStick(next: Action | null) {
        const current = stickDirection.current;
        if (next === current) return;
        if (current) input.release(current);
        if (next) input.press(next);
        stickDirection.current = next;
    }

    function directionFrom(event: PointerEvent<HTMLDivElement>): Action | null {
        const box = event.currentTarget.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);

        if (Math.hypot(dx, dy) < DEAD_ZONE) return null;
        if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
        return dy > 0 ? 'down' : 'up';
    }

    const stickHandlers = {
        onPointerDown: (event: PointerEvent<HTMLDivElement>) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setStick(directionFrom(event));
        },
        onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            setStick(directionFrom(event));
        },
        onPointerUp: () => setStick(null),
        onPointerCancel: () => setStick(null),
        onLostPointerCapture: () => setStick(null),
    };

    function pressed(action: Action) {
        return held.has(action) ? ' pressed' : '';
    }

    return (
        <div className="controls controls--game">
            <div className="joystick" aria-hidden="true" {...stickHandlers}>
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
