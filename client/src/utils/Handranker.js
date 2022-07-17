

/*
Rankings:
    1. Royal Flush
    2. Straight Flush
    3. Four of a kind
    4. Full House
    5. Flush
    6. Straight
    7. Three of a kind
    8. Two-pair
    9. Pair
    10. High Card
*/

function check_pair(hand, board) {
    const hMap = new Map();

    for (const card of board) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    for (const card of board) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    for (const card of hMap) {
        if (card[1] === 2) {
            console.log('WE HAVE A PAIR')
            return true
        }
    }
    console.log('no pair')
    return false;
}

function check_two_pair(hand, board) {
    const hMap = new Map();

    for (const card of board) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    for (const card of board) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    let numOfPairs = 0;
    for (let i = 0; i < 13; i++) {
        if (hMap.get(i) === 2) {
            numOfPairs++;
        }
    }

    if (numOfPairs >= 2) {
        return true;
    }
    return false;
}

function check_trips(hand, board) {
    const hMap = new Map();

    for (const card of board) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    for (const card of board) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    for (let i = 0; i < 13; i++) {
        if (hMap.get(i) === 3) {
            return true;
        }
    }
    return false;
}

//TODO
function check_straight(hand, board) {

}

//TODO
function check_flush(hand, board) {

}

function check_full_house(hand, board) {
    return check_pair(hand, board) && check_trips(hand, board);
}

function check_fours(hand, board) {
    const hMap = new Map();

    for (const card of board) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), 0);
    }

    for (const card of hand) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    for (const card of board) {
        hMap.set(parseInt(card), hMap.get(parseInt(card)) + 1);
    }

    for (let i = 0; i < 13; i++) {
        if (hMap.get(i) === 4) {
            return true;
        }
    }
    return false;
}

//TODO
function check_straight_flush(hand, board) {

}

//TODO
function check_royal_flush(hand, board) {

}

//TODO 
function get_high_card(hand, board) {

}

/*
Rankings:
    1. Royal Flush
    2. Straight Flush
    3. Four of a kind
    4. Full House
    5. Flush
    6. Straight
    7. Three of a kind
    8. Two-pair
    9. Pair
    10. High Card
*/

// how to handle if both players have the same hand rank?
    // need to check their max card

export default function handrank(hand, board) {
    if (check_royal_flush(hand, board)) {
        return 1;
    } else if (check_straight_flush(hand, board)) {
        return 2;
    } else if (check_fours(hand, board)) {
        return 3;
    } else if (check_full_house(hand, board)) {
        return 4;
    } else if (check_flush(hand, board)) {
        return 5;
    } else if (check_straight(hand, board)) {
        return 6;
    } else if (check_trips(hand, board)) {
        return 7;
    } else if (check_two_pair(hand, board)) {
        return 8;
    } else if (check_pair(hand, board)) {
        return 9;
    } else {
        return 10;
    }
}