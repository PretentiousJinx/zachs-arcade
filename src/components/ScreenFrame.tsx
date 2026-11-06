import type { ReactNode } from 'react';

type ScreenFrameProps = {
    title: string;
    children: ReactNode;
    action?: ReactNode;
};

function ScreenFrame({ title, children, action }: ScreenFrameProps) {
    return (
        <main className="cabinet">
            <div className="marquee">Zach's Arcade</div>
            <div className="screen screen--content">
                <h1>{title}</h1>
                {children}
                <div className="screen-footer">
                    <a className="back" href="#/">Back</a>
                    {action}
                </div>
            </div>
        </main>
    );
}

export default ScreenFrame;