
let rail = { backgroundColor: '#777', height: 6 }

let track = { backgroundColor: '#ccc', height: 6 }

let handle = {
    borderColor: '#555',
    height: 24,
    width: 24,
    backgroundColor: '#ccc',
    marginLeft: 0,
    marginTop: 0,
}
handle.marginLeft = -(handle.height / 2);
handle.marginTop = (rail.height - handle.height) / 2;

export default {rail, track, handle};
