import * as React from "react";
import { bind } from "../tools";
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ServerStore, { ServerMap } from "../stores/ServerStore";
import { Server, ServerEvent, ServerState } from "../utils/Router";
import ServerActionCreator from "../actions/ServerActionCreator";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Dialog from "./Dialog";
import ListContainer from "./ListContainer";


class Section extends React.Component<{icon: IconProp, title: string}> {

    render() {
        return (
            <div className="section">
                <div className="title">
                    <FontAwesomeIcon className="icon" icon={this.props.icon} />
                    <span className="text">{this.props.title}</span>
                </div>
                {this.props.children}
            </div>
        );
    }
}

interface State {
    currentServer: Server,
    showSidebar: boolean,
    servers: ServerMap,
    showServerList: boolean,
}

export default class MenuBar extends React.Component<{}, State> {

    private readonly _stateMap: { [s: string]: { readonly color: string, readonly label: string} } = {
        [ServerState.disconnected]: {color: '#be0000', label: 'disconnected'},
        [ServerState.connecting]: {color: '#ff9900', label: 'connecting'},
        [ServerState.connected]: {color: '#b5d400', label: 'connected'},
        [ServerState.ready]: {color: '#00ad00', label: 'ready'},
    };


    constructor(props) {
        super(props);
        bind(this, this._onServerStoreChange, this._onSidebarRender);
        this.state = {
            currentServer: null,
            showSidebar: false,
            servers: ServerStore.servers,
            showServerList: false,
        }
    }

    componentDidMount() {
        ServerStore.addChangeListener(this._onServerStoreChange);
    }

    componentWillUnmount() {
        ServerStore.removeChangeListener(this._onServerStoreChange);
    }

    private _onServerConnectClick(server: Server) {
        ServerActionCreator.connect(server)
        this.setState({showServerList: false});
    }

    private _onServerStoreChange() {
        this.setState({currentServer: ServerStore.currentServer, servers: ServerStore.servers});
    }

    private _onSidebarRender(el: HTMLElement) {
        if (el == null)
            return;
        el.style.left = this.state.showSidebar ? '0px' : `-${el.clientWidth}px`;
    }

    private get _currentServerState() {
        return this.state.currentServer ? this.state.currentServer.state : ServerState.disconnected;
    }

    private _onStateRendered(el: HTMLElement) {
        if (el == null)
            return;
        let stateColor = this._stateMap[this._currentServerState].color;
        el.style.backgroundColor = stateColor;
        // since there is no box-shadow-color need a little hack to set the color only
        el.style.setProperty('--shadow-color', stateColor);
    }

    render() {
        let serverList = [];
        for (let server of Object.values(this.state.servers)) {
            serverList.push(
                <div
                    key={server.id}
                    className={classNames('item', {current: this.state.currentServer ? server.id == this.state.currentServer.id: false})}
                >
                    <div onClick={this._onServerConnectClick.bind(this, server)} className="text">{server.name}</div>
                    <div onClick={e => ServerActionCreator.remove(server)} className="icon"><FontAwesomeIcon icon="trash" /></div>
                </div>
            );
        }

        return (
            <div>
                <Dialog show={this.state.showServerList} requestClose={() => this.setState({showServerList: false})}>
                    <ListContainer
                        className="list-dialog-container server-list"
                        title="Server list"
                        requestClose={() => this.setState({showServerList: false})}
                    >
                        {...serverList}
                    </ListContainer>
                </Dialog>

                <div className="menubar" onClick={e => this.setState({showServerList: true})}>
                    <div className="menu">
                        <FontAwesomeIcon icon="server" />
                    </div>
                    <div className="state-icon" ref={e => this._onStateRendered(e)}></div>
                    <div className="title">{this.state.currentServer ? this.state.currentServer.name : ''}</div>
                    <div className={classNames('state-text', {hide: this._currentServerState == ServerState.ready})}>
                        {this._stateMap[this._currentServerState].label}
                    </div>
                </div>
            </div>
            // <div>
            //     <div className="menubar">
            //         <div className="menu" onClick={e => this.setState({showSidebar: !this.state.showSidebar})}>
            //             <FontAwesomeIcon icon="bars" />
            //         </div>
            //         <div className="title">
            //             {this.state.currentServer ? this.state.currentServer.name : ''}
            //         </div>
            //     </div>
            //     <div className="sidebar" ref={el => this._onSidebarRender(el)}>
            //         <Section icon="server" title="Servers">
            //             <div className="server-list">
            //                 {...serverList}
            //             </div>
            //         </Section>
            //         <Section icon="info-circle" title="About" />
            //     </div>
            //     <div
            //         className={classNames('sidebar-back', {show: this.state.showSidebar})}
            //         onClick={e => this.setState({showSidebar: false})}
            //     ></div>
            // </div>
        );
    }
}
