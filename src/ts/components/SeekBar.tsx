import * as React from "react";
import mpv from '../constants/mpv';
import { bind } from "../tools";
import TimePositionStore from "../stores/TimePositionStore";
import Slider from 'rc-slider';
import SliderStyle from "./SliderStyle";

export default class SeekBar extends React.Component<{player: mpv.Player}, {value: number}> {

    constructor(props) {
        super(props);
        this.state = {value: this.props.player.timePos};

        bind(this, this._onControllerChange);
    }

    componentDidMount() {
        TimePositionStore.addChangeListener(this._onControllerChange);
    }

    componentWillUnmount() {
        TimePositionStore.removeChangeListener(this._onControllerChange);
    }

    private _onControllerChange() {
        this.setState({value: TimePositionStore.getPosition(this.props.player.id)});
    }

    render() {
        let player = this.props.player;
        return (
            <span>
                <Slider
                    min={0}
                    max={Math.ceil(player.duration)}
                    value={player.timePos}
                    onChange={v => player.remote.seek(v, mpv.Command.SeekType.absolute)}
                    railStyle={SliderStyle.rail}
                    trackStyle={SliderStyle.track}
                    handleStyle={SliderStyle.handle}
                />
            </span>
        );
    }
}
