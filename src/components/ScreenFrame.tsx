import type { ReactNode } from 'react';

type ScreenFrameProps = {
    title: string;
    children: ReactNode;
};

function ScreenFrame({ title, children }: ScreenFrameProps) {
    return (
        <main className="cabinet">
            <div className="marquee">Zach's Arcade</div>
            <div className="screen screen--content">
                <h1>{title}</h1>
                {children}
                <a className="back" href="#/">Back</a>
                </div>
        </main>
    );
}

export default ScreenFrame;