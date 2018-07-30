import Dispatcher from '../Dispatcher';

import {Router, RouterMessage, Listener, ServerEvent, Server} from '../utils/Router';

class ServerActionCreator extends Listener {

    private _router: Router;

    set router(router: Router) {
        this._router = router;
        router.registerListener(this);
    }

    connect(server: Server): void {
        this._router.connect(server);
    }

    add(server: Server) {
        Dispatcher.dispatch({
            type: ServerEvent.add,
            server,
        });
    }

    remove(server: Server) {
        if (server.id == this._router.server.id)
            this._router.close();
        Dispatcher.dispatch({
            type: ServerEvent.remove,
            server,
        });
    }

    disconnect(): void {
        this._router.close();
    }

    onConnecting(): void {
        Dispatcher.dispatch({
            type: ServerEvent.connecting,
            server: this._router.server,
        });
    }

    onOpen(): void {
        Dispatcher.dispatch({
            type: ServerEvent.connected,
            server: this._router.server,
        });
    }

    onClose(): void {
        Dispatcher.dispatch({
            type: ServerEvent.disconnected,
            server: this._router.server,
        });
    }

    onMessesage(msg: RouterMessage): void {}
}

export default new ServerActionCreator();
