
import * as React from "react";
import mpv from '../constants/mpv';
import { bind } from "../tools";
import TimePositionStore from "../stores/TimePositionStore";
import Time from "./Time";

export default class TimePositon extends React.Component<{playerId: mpv.Id}, {value: number}> {

    constructor(props) {
        super(props);
        this.state = this._getState();
        bind(this, this._onControllerChange);
    }

    componentDidMount() {
        TimePositionStore.addChangeListener(this._onControllerChange);
    }

    componentWillUnmount() {
        TimePositionStore.removeChangeListener(this._onControllerChange);
    }

    private _getState() {
        return {value: TimePositionStore.getPosition(this.props.playerId)};
    }

    private _onControllerChange() {
        this.setState(this._getState());
    }

    render() {
        return <Time seconds={this.state.value}/>;
    }
}
