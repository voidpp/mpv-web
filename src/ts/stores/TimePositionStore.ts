import BaseStore from './BaseStore';
import Action from '../actions/Action';
import mpv from '../constants/mpv';
import { RouterEvent } from '../utils/Router';

/**
 * Keep up to date the time pos data
 * If we observing the time-pos propery in the mpv, it will send back property-change events every ~20 ms
 * This is a local-timer solution
 */
export class TimePositonStore extends BaseStore {

    private _data: {
        [s: string]: {
            timerId: any,
            positionTime: number,
            positionValue: number,
        }
    } = {}

    private _updatePos(id: mpv.Id, val: number) : void {
        if (!(id in this._data))
            this._data[id] = {timerId: 0, positionTime: 0, positionValue: 0};

        this._data[id].positionValue = val;
        this._data[id].positionTime = new Date().getTime();
        this.emitChange();
    }

    private _startTimer(id: mpv.Id) {
        if (id in this._data)
            this._data[id].timerId = setInterval(() => this.emitChange(), 100);
    }

    private _stopTimer(id: mpv.Id) {
        if (id in this._data) {
            clearInterval(this._data[id].timerId);
            this._data[id].timerId = 0;
        }
    }

    getPosition(id: mpv.Id): number {
        if (!(id in this._data))
            return 0;

        let data = this._data[id];

        if (data.timerId) {
            let now = new Date().getTime();
            return data.positionValue + (now - data.positionTime) / 1000;
        } else
            return data.positionValue;
    }

    dispatchCallback(action: Action) {
        switch(action.type) {
            case mpv.Event.propertyChange:
                switch (action.name) {
                    case mpv.Property.timePos:
                        this._updatePos(action.id, action.data);
                        break;
                }
                break;

            case mpv.Event.fileLoaded:
                this._updatePos(action.id, action.data.timePos);
                if (!action.data.pause)
                    this._startTimer(action.id);
                break;

            case mpv.Event.endFile:
            case mpv.Event.pause:
                this._stopTimer(action.id);
                break;

            case mpv.Event.unpause:
                this._stopTimer(action.id);
                this._startTimer(action.id);
                break;

            case RouterEvent.disconnected:
                for (let id in this._data)
                    this._stopTimer(id);
                this._data = {};
                this.emitChange();
                break;
        }
    }
}

export default new TimePositonStore();
