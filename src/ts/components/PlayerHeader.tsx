import * as React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import mpv from '../constants/mpv';
import TimePositon from "./TimePosition";
import Time from "./Time";

import classNames from 'classnames';
import { bind } from "../tools";

export default class PlayerHeader extends React.Component<{player: mpv.Player}> {

    private _timesContainerHeight: number = 0;
    private _mainContainerHeight: number = 0;

    constructor(props) {
        super(props);
        bind(this, this._onMainContainerRender, this._onTimesContainerRender);
    }

    private _getMainClassnames(): string {
        let player = this.props.player;
        return classNames('player-header', {
            closed: !player.opened,
            'hide-duration': this._timesContainerHeight > this._mainContainerHeight,
        });
    }

    private _onMainContainerRender(el: HTMLDivElement) {
        if (el == null)
            return;
        this._mainContainerHeight = el.clientHeight;
        el.className = this._getMainClassnames();
    }

    private _onTimesContainerRender(el: HTMLDivElement) {
        if (el == null || this._timesContainerHeight > 0)
            return;
        this._timesContainerHeight = el.clientHeight;
    }

    render() {
        let player = this.props.player;
        if (!player.enabled) {
            this._mainContainerHeight = this._timesContainerHeight = 0;
            return <div className={this._getMainClassnames()}></div>
        }

        return (
            <div className={this._getMainClassnames()} ref={this._onMainContainerRender}>
                <span className="close" onClick={e => player.remote.stop()}>
                    <FontAwesomeIcon icon="times" />
                </span>
                <div className="title" onClick={e => player.open()}>{player.caption}</div>
                <div className="mini-player">
                    <span className="controls" onClick={e => player.remote.cyclePause()}>
                        <FontAwesomeIcon icon={player.pause ? 'play' : 'pause'} />
                    </span>
                    <div className="times" ref={this._onTimesContainerRender}>
                        <span className="time"><TimePositon playerId={player.id}/></span>
                        <Time className="duration" seconds={player.duration} />
                    </div>
                </div>
            </div>
        );
    }
}
