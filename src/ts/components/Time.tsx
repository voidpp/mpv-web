import * as moment from 'moment';
import * as React from "react";

function timePad(v: number): string {
    return v.toString().padStart(2, '0');
}

export default class Time extends React.Component<{seconds: number, className?: string}> {
    render() {
        let dur = moment.duration(this.props.seconds, 'seconds');
        let time = dur.hours() ? (dur.hours().toString() + ':') : '';
        time += timePad(dur.minutes()) + ':' + timePad(dur.seconds());
        return <span className={this.props.className}>{time}</span>;
    }
}
