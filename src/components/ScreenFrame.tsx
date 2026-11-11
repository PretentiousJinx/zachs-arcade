import type { ReactNode } from 'react';

type ScreenFrameProps = {
    title: string;
    children: ReactNode;
    action?: ReactNode;
    backHref?: string;
};

function ScreenFrame({ title, children, action, backHref = '#/' }: ScreenFrameProps) {
    return (
        <main className="cabinet">
            <div className="marquee">Zach's Arcade</div>
            <div className="screen screen--content">
                <h1>{title}</h1>
                {children}
                <div className="screen-footer">
                    <a className="back" href={backHref}>Back</a>
                    {action}
                </div>
            </div>
        </main>
    );
}

export default ScreenFrame;