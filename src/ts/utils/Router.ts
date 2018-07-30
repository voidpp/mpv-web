
import mpv from '../constants/mpv';
import * as ReconnectingWebSocket from 'reconnectingwebsocket';
import { bind } from '../tools';

export enum RouterEvent {
    mpvIstanceCreated = 'mpv-instance-created',
    mpvIstanceRemoved = 'mpv-instance-removed',
    connected = 'router-connected',
    initialDataFetched = 'router-initial-data-fetched',
    disconnected = 'router-disconnected',
}

export enum ServerEvent {
    add = 'server-event-add',
    remove = 'server-event-remove',
    connecting = 'server-event-connecting',
    connected = 'server-event-connected',
    disconnected = 'server-event-disconnected',
}

export enum ServerState {
    initial = 'server-state-initial',
    connecting = 'server-state-connecting',
    connected = 'server-state-connected',
    ready = 'server-state-ready',
    disconnected = 'server-state-disconnected',
}

export interface MPVMessage {
    name?: string;
    event?: string;
    error?: string;
    data?: any;
    routerevent?: RouterEvent;
}

export interface RouterMessage {
    id: mpv.Id;
    data: MPVMessage;
}

export class Server {
    private _host: string;
    private _port: number;
    private _name: string;
    private _state: ServerState = ServerState.initial;

    constructor(host: string, port: number, name: string) {
        this._host = host;
        this._port = port;
        this._name = name;
    }

    get state(): ServerState {
        return this._state
    }

    set state(st: ServerState) {
        this._state = st;
    }

    get id(): string {
        return this._host + this._port + this._name;
    }

    get ws(): string {
        return `ws://${this._host}:${this._port}/listen`;
    }

    get http(): string {
        return `http://${this._host}:${this._port}`;
    }

    get host(): string {
        return this._host;
    }

    get port(): number {
        return this._port;
    }

    get name(): string {
        return this._name;
    }

    toJSON() {
        return {
            host: this._host,
            port: this._port,
            name: this._name,
        }
    }
}

export abstract class Listener {
    abstract onConnecting(): void;
    abstract onOpen(): void;
    abstract onClose(): void;
    abstract onMessesage(msg: RouterMessage): void;
}

export interface ServerAction {
    type: ServerEvent | RouterEvent,
    server: Server,
}

export class Router {

    private _listeners: Array<Listener> = [];
    private _ws;
    private _server: Server = null;
    private _connected: boolean = false;
    private _suspended: boolean = false;

    constructor() {
        bind(this, this._onOpen, this._onClose, this._onMessage);
    }

    connect(server: Server): boolean {
        if (this._connected) {
            if (server.id == this._server.id)
                return;

            this.close();
            this.server.state = ServerState.disconnected;
        }

        this._server = server;

        for (let listener of this._listeners) {
            listener.onConnecting();
        }

        this._suspended = false;

        this._ws = new ReconnectingWebSocket(server.ws);
        this._ws.onopen = this._onOpen;
        this._ws.onmessage = this._onMessage;
        this._ws.onclose = this._onClose;
        return true;
    }

    suspend(): void {
        this._suspended = true;
    }

    resume(): void {
        this._suspended = false;
        if (!this._connected && this.server)
            this.connect(this.server);
    }

    get suspended(): boolean {
        return this._suspended;
    }

    close(): void {
        this._ws.close();
    }

    get server(): Server {
        return this._server;
    }

    registerListener(listener: Listener): void {
        this._listeners.push(listener);
    }

    batch(id: mpv.Id, commands: object[]): Promise<object> {
        return new Promise((resolve, reject) => {
            this._post(`/batch/${id}`, commands).then((resp: Response) => resolve(resp.json()))
        })
    }

    getProperty(id: mpv.Id, prop: mpv.Property): Promise<any> {
        let cmd = this._generatePropCommand(mpv.Command.IPC.getProperty, prop);
        return new Promise((resolve, reject) => {
            this._post(`/send/${id}`, cmd).then((resp: Response) => resp.json()) .then(data => {
                resolve(data.data);
            })
        });
    }

    getProperties(id: mpv.Id, props: mpv.Property[]): Promise<object> {
        return new Promise((resolve, reject) => {
            this.batch(id, this._generatePropCommands(mpv.Command.IPC.getProperty, props)).then((data) => {
                let res = {};
                for (let i in props) {
                    res[props[i]] = data[i].data;
                }
                resolve(res);
            });
        });
    }

    setProperty(id: mpv.Id, prop: mpv.Property, value: any): void {
        this._send(id, this._generatePropCommand(mpv.Command.IPC.setProperty, prop, value));
    }

    list(): Promise<mpv.Id[]> {
        return new Promise((resolve, reject) => this._get('/list').then((resp: Response) => resolve(resp.json())))
    }

    observeProperties(id: mpv.Id, props: mpv.Property[]): void {
        this._post(`/observe_properties/${id}`, props);
    }

    cycleProperty(id: mpv.Id, prop: mpv.Property) {
        this._send(id, this._generatePropCommand(mpv.Command.Input.cycle, prop));
    }

    inputCommand(id: mpv.Id, command: mpv.Command.Input, ...args: any[]) {
        this._send(id, {command: [command, ...args]});
    }

    private _onClose() {
        this._connected = false;
        if (this.suspended)
            return;
        for (let listener of this._listeners) {
            listener.onClose();
        }
    }

    private _onOpen() {
        this._connected = true;
        if (this.suspended)
            return;
        for (let listener of this._listeners) {
            listener.onOpen();
        }
    }

    private _onMessage(event) {
        if (this.suspended)
            return;
        let data: RouterMessage = JSON.parse(event.data);
        for (let listener of this._listeners) {
            listener.onMessesage(data);
        }
    }

    private _get(endpoint: string): Promise<Response> {
        return fetch(this._server.http + endpoint);
    }

    private _post(endpoint: string, data: any): Promise<Response> {
        return fetch(this._server.http + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    private _send(id: mpv.Id, data: object) {
        this._ws.send(JSON.stringify({id, data}));
    }

    private _generatePropCommand(command: string, prop: mpv.Property, value: any = null): object {
        let cmd = [command, prop];
        if (value !== null){
            cmd.push(value);
        }
        return {command: cmd};
    }

    private _generatePropCommands(command: string, props: mpv.Property[]): object[] {
        let commands = [];
        for (let prop of props) {
            commands.push(this._generatePropCommand(command, prop));
        }
        return commands;
    }
}
