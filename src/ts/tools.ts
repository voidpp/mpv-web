

export function bind(context, ...functions) {
    for(let a = 0; a < functions.length; a++) {
        context[functions[a].name] = functions[a].bind(context);
    }
}

export default {
    bind,
}
