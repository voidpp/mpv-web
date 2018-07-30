import {EventEmitter} from 'events';

import Dispatcher from '../Dispatcher';
import Action from '../actions/Action';

const NAME = '42';

export default abstract class BaseStore extends EventEmitter {

    dispatchToken;

    constructor() {
        super();
        this.dispatchCallback = this.dispatchCallback.bind(this);
        this.dispatchToken = Dispatcher.register(this.dispatchCallback);
    }

    abstract dispatchCallback(action: Action): void;

    addChangeListener(cb) {
        this.on(NAME, cb);
    }

    removeChangeListener(cb) {
        this.removeListener(NAME, cb);
    }

    emitChange() {
        this.emit(NAME);
    }
}
