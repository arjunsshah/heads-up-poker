/* eslint-disable no-lone-blocks */
/* eslint-disable default-case */
import React, { useEffect, useState } from 'react'
import PACK_OF_CARDS from '../utils/packOfCards'
import shuffleArray from '../utils/shuffleArray'
import io from 'socket.io-client'
import queryString from 'query-string'
import Spinner from './Spinner'
import useSound from 'use-sound'
import handrank from '../utils/Handranker'
import DECK_OF_CARDS from '../utils/deckOfCards'


import bgMusic from '../assets/sounds/game-bg-music.mp3'
import unoSound from '../assets/sounds/uno-sound.mp3'
import shufflingSound from '../assets/sounds/shuffling-cards-1.mp3'
import skipCardSound from '../assets/sounds/skip-sound.mp3'
import draw2CardSound from '../assets/sounds/draw2-sound.mp3'
import wildCardSound from '../assets/sounds/wild-sound.mp3'
import draw4CardSound from '../assets/sounds/draw4-sound.mp3'
import gameOverSound from '../assets/sounds/game-over-sound.mp3'

//NUMBER CODES FOR ACTION CARDS
//SKIP - 404
//DRAW 2 - 252
//WILD - 300
//DRAW 4 WILD - 600

let socket
const ENDPOINT = 'http://localhost:5000'
// const ENDPOINT = 'https://uno-online-multiplayer.herokuapp.com/'

const DEFAULT_BLINDS = 20


const Game = (props) => {
    const data = queryString.parse(props.location.search)

    //initialize socket state
    const [room, setRoom] = useState(data.roomCode)
    const [roomFull, setRoomFull] = useState(false)
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
        const connectionOptions =  {
            "forceNew" : true,
            "reconnectionAttempts": "Infinity", 
            "timeout" : 10000,                  
            "transports" : ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)

        socket.emit('join', {room: room}, (error) => {
            if(error)
                setRoomFull(true)
        })

        //cleanup on component unmount
        return function cleanup() {
            socket.emit('disconnect')
            //shut down connnection instance
            socket.off()
        }
    }, [])

    //initialize game state


    const [gameOver, setGameOver] = useState(true)
    // SWITCHING SET WINNER TO TRUE INSTEAD OF ''
    const [turn, setTurn] = useState('')
    const [winner, setWinner] = useState('')
    const [player1Deck, setPlayer1Deck] = useState([])
    const [player2Deck, setPlayer2Deck] = useState([])
    const [currentColor, setCurrentColor] = useState('')
    const [currentNumber, setCurrentNumber] = useState('')
    const [playedCardsPile, setPlayedCardsPile] = useState([])
    const [drawCardPile, setDrawCardPile] = useState([])

    const [isChatBoxHidden, setChatBoxHidden] = useState(true)
    const [isUnoButtonPressed, setUnoButtonPressed] = useState(false)
    const [isSoundMuted, setSoundMuted] = useState(false)
    const [isMusicMuted, setMusicMuted] = useState(true)

    const [playBBgMusic, { pause }] = useSound(bgMusic, { loop: true })
    const [playUnoSound] = useSound(unoSound)
    const [playShufflingSound] = useSound(shufflingSound)
    const [playSkipCardSound] = useSound(skipCardSound)
    const [playDraw2CardSound] = useSound(draw2CardSound)
    const [playWildCardSound] = useSound(wildCardSound)
    const [playDraw4CardSound] = useSound(draw4CardSound)
    const [playGameOverSound] = useSound(gameOverSound)

    const [roundOver, setRoundOver] = useState(true)
    const [canCall, setCanCall] = useState(true)
    const [canCall2, setCanCall2] = useState('')
    const [twoCheck, setTwoCheck] = useState('')
    const [player1Hand, setPlayer1Hand] = useState([])
    const [player2Hand, setPlayer2Hand] = useState([])
    const [player1Balance, setPlayer1Balance] = useState('')
    const [player2Balance, setPlayer2Balance] = useState('')
    const [board, setBoard] = useState([])
    const [pot, setPot] = useState('')
    const [handRound, setHandRound] = useState('')
    const [gameDeck, setGameDeck] = useState([])
    const [needToSwitch, setNeedToSwitch] = useState(true)
    const [bigBlind, setBigBlind] = useState('')
    const [prevBetAmount, setPrevBetAmount] = useState('')
    const [isBlind, setIsBlind] = useState('')
    const [blindAmount, setBlindAmount] = useState('')

    function addToBoard() {
        if (board.length >= 5) {
            console.log(`Board is full can't add more cards`);
            throw "deck is full";
        }
        let card = gameDeck.pop();
        board.push(card);
    }

    //runs once on component mount
    useEffect(() => {
        //shuffle PACK_OF_CARDS array
        // const shuffledCards = shuffleArray(PACK_OF_CARDS)

        // //extract first 7 elements to player1Deck
        // const player1Deck = shuffledCards.splice(0, 7)

        // //extract first 7 elements to player2Deck
        // const player2Deck = shuffledCards.splice(0, 7)

        // //extract random card from shuffledCards and check if its not an action card
        // let startingCardIndex
        // while(true) {
        //     startingCardIndex = Math.floor(Math.random() * 94)
        //     if(shuffledCards[startingCardIndex]==='skipR' || shuffledCards[startingCardIndex]==='_R' || shuffledCards[startingCardIndex]==='D2R' ||
        //     shuffledCards[startingCardIndex]==='skipG' || shuffledCards[startingCardIndex]==='_G' || shuffledCards[startingCardIndex]==='D2G' ||
        //     shuffledCards[startingCardIndex]==='skipB' || shuffledCards[startingCardIndex]==='_B' || shuffledCards[startingCardIndex]==='D2B' ||
        //     shuffledCards[startingCardIndex]==='skipY' || shuffledCards[startingCardIndex]==='_Y' || shuffledCards[startingCardIndex]==='D2Y' ||
        //     shuffledCards[startingCardIndex]==='W' || shuffledCards[startingCardIndex]==='D4W') {
        //         continue;
        //     }
        //     else
        //         break;
        // }

        // //extract the card from that startingCardIndex into the playedCardsPile
        // const playedCardsPile = shuffledCards.splice(startingCardIndex, 1)

        // //store all remaining cards into drawCardPile
        // const drawCardPile = shuffledCards



        const shuffledCards = shuffleArray(DECK_OF_CARDS)

        // Player 1 deck
        const player1Hand = shuffledCards.splice(0,2)

        // Player 2 deck
        const player2Hand = shuffledCards.splice(0,2)

        const deck = shuffledCards

        const clearedBoard = []

        // send game initial state to socket
        socket.emit('initGameState', {
            gameOver: false,
            roundOver: false,
            turn: 'Player 2',
            player1Hand: [...player1Hand],
            player2Hand: [...player2Hand],
            player1Balance: 1000 - DEFAULT_BLINDS,
            player2Balance: 1000,
            pot: 20,
            handRound: 'preflop',
            gameDeck: deck,
            needToSwitch: true,
            bigBlind: 'Player 1',
            prevBetAmount: 20,
            isBlind: 'Player 1',
            board: clearedBoard,
            winner: '',
            canCall: true,
            canCall2: 1,
            twoCheck: '0'

        })

    }, [])

    useEffect(() => {

        socket.on('initGameState', ({ gameOver, roundOver, turn, player1Hand, player2Hand, player1Balance, player2Balance, board, pot, handRound, gameDeck, needToSwitch, bigBlind, prevBetAmount, isBlind, blindAmount, canCall, canCall2, twoCheck}) => {
            setGameOver(gameOver)
            setRoundOver(roundOver)
            setTurn(turn)
            setPlayer1Hand(player1Hand)
            setPlayer2Hand(player2Hand)
            setPlayer1Balance(player1Balance)
            setPlayer2Balance(player2Balance)
            setBoard(board)
            setPot(pot)
            setHandRound(handRound)
            setGameDeck(gameDeck)
            setNeedToSwitch(needToSwitch)
            setBigBlind(bigBlind)
            setPrevBetAmount(prevBetAmount)
            setIsBlind(isBlind)
            setBlindAmount(blindAmount)
            setCanCall(canCall)
            setCanCall2(canCall2)
            setTwoCheck(twoCheck)


        })

        socket.on('updateGameState', ({ gameOver, roundOver, winner, turn, player1Hand, player2Hand, player1Balance, player2Balance, board, pot, handRound, gameDeck, needToSwitch, bigBlind, prevBetAmount, isBlind, blindAmount, canCall, canCall2, twoCheck }) => {
            
            gameOver && setGameOver(gameOver)
            roundOver && setRoundOver(roundOver)
            // winner && setGameOver(gameOver)
            winner && setWinner(winner)
            handRound && setHandRound(handRound)
            turn && setTurn(turn)
            player1Hand && setPlayer1Hand(player1Hand)
            player2Hand && setPlayer2Hand(player2Hand)
            player1Balance && setPlayer1Balance(player1Balance)
            player2Balance && setPlayer2Balance(player2Balance)
            board && setBoard(board)
            pot && setPot(pot)
            prevBetAmount && setPrevBetAmount(prevBetAmount)
            canCall && setCanCall(canCall)
            canCall2 && setCanCall2(canCall2)
            twoCheck && setTwoCheck(twoCheck)
            isBlind && setIsBlind(isBlind)
            // setHandRound(handRound)
            // setGameDeck(gameDeck)
            // setNeedToSwitch(needToSwitch)
            // setBigBlind(bigBlind)
            // setPrevBetAmount(prevBetAmount)
            // setIsBlind(isBlind)
            // setBlindAmount(blindAmount)
            // setCanCall(canCall)
        })

        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })

        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })

        socket.on('message', message => {
            setMessages(messages => [ ...messages, message ])

            const chatBody = document.querySelector('.chat-body')
            chatBody.scrollTop = chatBody.scrollHeight
        })
    }, [])

    //some util functions
    // const checkGameOver = (arr) => {
    //     return arr.length === 1
    // }
    
    const checkWinner = (player) => {
        if (player === 'Player 1') {
            return true;
        } else {
            return false;
        }
    }

    const checkBlinds = (player) => {
        if (player === 'Player 1') {
            return 'Player 2';
        } else {
            return 'Player 1';
        }
    }






    const toggleChatBox = () => {
        const chatBody = document.querySelector('.chat-body')
        if(isChatBoxHidden) {
            chatBody.style.display = 'block'
            setChatBoxHidden(false)
        }
        else {
            chatBody.style.display = 'none'
            setChatBoxHidden(true)
        }
    }

    const sendMessage= (event) => {
        event.preventDefault()
        if(message) {
            socket.emit('sendMessage', { message: message }, () => {
                setMessage('')
            })
        }
    }

    //driver functions

    const onTurnHandler = (move) => {
        // who played the turn (bet fold check etc...)
        const amount = 0
        const blind = 10
        const turnPlayedBy = turn
        // eslint-disable-next-line default-case

        console.log('Board: ' + board)

        switch(move) {
            case 'check': {
                if (twoCheck === '1') {
                    if (handRound === 'preflop') {
                        if (turnPlayedBy === 'Player 1') {
                            const newBoard = []
                            const card1 = gameDeck.pop()
                            const card2 = gameDeck.pop()
                            const card3 = gameDeck.pop()
                            newBoard.push(card1)
                            newBoard.push(card2)
                            newBoard.push(card3)
                            socket.emit('updateGameState', {
                                gameOver: false,
                                roundOver: false,
                                turn: 'Player 2',
                                winner: checkWinner('Player 1'),
                                needToSwitch: true,
                                prevBetAmount: '0',
                                canCall: true,
                                canCall2: '0',
                                twoCheck: '0',
                                handRound: 'flop',
                                board: newBoard
                            })
                        } else if (turnPlayedBy === 'Player 2') {
                            const newBoard = []
                            const card1 = gameDeck.pop()
                            const card2 = gameDeck.pop()
                            const card3 = gameDeck.pop()
                            newBoard.push(card1)
                            newBoard.push(card2)
                            newBoard.push(card3)
                            socket.emit('updateGameState', {
                                gameOver: false,
                                roundOver: false,
                                turn: 'Player 1',
                                winner: checkWinner('Player 2'),
                                needToSwitch: true,
                                prevBetAmount: '0',
                                canCall: true,
                                canCall2: '0',
                                twoCheck: '0',
                                handRound: 'flop',
                                board: newBoard
                            })
                        }
                    } else if (handRound === 'flop') {
                        if (turnPlayedBy === 'Player 1') {
                            const newBoard = board
                            const card4 = gameDeck.pop()
                            newBoard.push(card4)
                            socket.emit('updateGameState', {
                                gameOver: false,
                                roundOver: false,
                                turn: 'Player 2',
                                winner: checkWinner('Player 1'),
                                needToSwitch: true,
                                prevBetAmount: '0',
                                canCall: true,
                                canCall2: '0',
                                twoCheck: '0',
                                handRound: 'turn',
                                board: newBoard
                            })
                        } else if (turnPlayedBy === 'Player 2') {
                            const newBoard = board
                            const card4 = gameDeck.pop()
                            newBoard.push(card4)
                            socket.emit('updateGameState', {
                                gameOver: false,
                                roundOver: false,
                                turn: 'Player 1',
                                winner: checkWinner('Player 2'),
                                needToSwitch: true,
                                prevBetAmount: '0',
                                canCall: true,
                                canCall2: '0',
                                twoCheck: '0',
                                handRound: 'turn',
                                board: newBoard
                            })
                        }
                    } else if (handRound === 'turn') {
                        if (turnPlayedBy === 'Player 1') {
                            const newBoard = board
                            const card4 = gameDeck.pop()
                            newBoard.push(card4)
                            socket.emit('updateGameState', {
                                gameOver: false,
                                roundOver: false,
                                turn: 'Player 2',
                                winner: checkWinner('Player 1'),
                                needToSwitch: true,
                                prevBetAmount: '0',
                                canCall: true,
                                canCall2: '0',
                                twoCheck: '0',
                                handRound: 'river',
                                board: newBoard
                            })
                        } else if (turnPlayedBy === 'Player 2') {
                            const newBoard = board
                            const card4 = gameDeck.pop()
                            newBoard.push(card4)
                            socket.emit('updateGameState', {
                                gameOver: false,
                                roundOver: false,
                                turn: 'Player 1',
                                winner: checkWinner('Player 2'),
                                needToSwitch: true,
                                prevBetAmount: '0',
                                canCall: true,
                                canCall2: '0',
                                twoCheck: '0',
                                handRound: 'river',
                                board: newBoard
                            })
                        }
                    } else {
                        const newBalance1 = player1Balance - pot
                        const newBalance2 = player2Balance - pot
                        const player1handrank = handrank(player1Hand, board)
                        const player2handrank = handrank(player2Hand, board)

                        const shuffledCards = shuffleArray(DECK_OF_CARDS)

                        // Player 1 deck
                        const newPlayer1Hand = shuffledCards.splice(0,2)

                        // Player 2 deck
                        const newPlayer2Hand = shuffledCards.splice(0,2)

                        const deck = shuffledCards

                        const clearedBoard = []
                        let w = 'Player 1'
                        if (player1handrank > player2handrank) {
                            w = 'Player 2'
                        }
                        const currBlind  = isBlind
                        if (w === 'Player 1') {
                        if (turnPlayedBy === 'Player 1') {
                            const winningBalance = parseInt(pot) + parseInt(player1Balance)
                            socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: currBlind,
                            winner: w,
                            player1Balance: winningBalance - 20,
                            pot: '20',
                            board: clearedBoard,
                            player1Hand: [...newPlayer1Hand],
                            player2Hand: [...newPlayer2Hand],
                            prevBetAmount: '20',
                            canCall: false,
                            canCall2: '1',
                            twoCheck: '0',
                            gameDeck: deck,
                            isBlind: checkBlinds(currBlind), 
                            handRound: 'preflop'
                        })
                    } else {
                        const winningBalance = parseInt(pot) + parseInt(player1Balance)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: currBlind,
                            winner: w,
                            player1Balance: winningBalance - 20,
                            pot: '20',
                            board: clearedBoard,
                            player1Hand: [...newPlayer1Hand],
                            player2Hand: [...newPlayer2Hand],
                            prevBetAmount: '20',
                            canCall: false,
                            canCall2: '1',
                            twoCheck: '0',
                            gameDeck: deck,
                            isBlind: checkBlinds(currBlind),
                            handRound: 'preflop'
                        })
                    }
                    } else {
                        if (turnPlayedBy === 'Player 2') {
                        const winningBalance = parseInt(pot) + parseInt(player2Balance)
                        socket.emit('updateGameState', {
                        gameOver: false,
                        roundOver: false,
                        turn: currBlind,
                        winner: w,
                        player2Balance: winningBalance - 20,
                        pot: '20',
                        board: clearedBoard,
                        player1Hand: [...newPlayer1Hand],
                        player2Hand: [...newPlayer1Hand],
                        prevBetAmount: '20',
                        canCall: false,
                        canCall2: '1',
                        twoCheck: '0',
                        gameDeck: deck,
                        isBlind: checkBlinds(currBlind), 
                        handRound: 'preflop'
                        })
                    } else {
                        const winningBalance = parseInt(pot) + parseInt(player2Balance)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: currBlind,
                            winner: w,
                            player2Balance: winningBalance - 20,
                            pot: '20',
                            board: clearedBoard,
                            player1Hand: [...newPlayer1Hand],
                            player2Hand: [...newPlayer2Hand],
                            prevBetAmount: '20',
                            canCall: false,
                            canCall2: '1',
                            twoCheck: '0',
                            gameDeck: deck,
                            isBlind: checkBlinds(currBlind),
                            handRound: 'preflop'
                        })
                    }
                    }
                    }
                } else {
                    const checkAmount = '0'
                    const cc = false
                    if (turnPlayedBy === 'Player 1') {
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 2',
                            winner: checkWinner('Player 1'),
                            needToSwitch: true,
                            prevBetAmount: checkAmount,
                            canCall: cc,
                            canCall2: '1',
                            twoCheck: '1'
                        })
                    } else if (turnPlayedBy === 'Player 2') {
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 1',
                            winner: checkWinner('Player 2'),
                            needToSwitch: true,
                            prevBetAmount: checkAmount,
                            canCall: cc,
                            canCall2: '1',
                            twoCheck: '1'
                        })
                    }
                }
            }
            break;
            case 'fold':  {
                console.log('fold')
                // add pot to other players balance and return gamestate
                const newBalance2 = parseInt(player2Balance) - parseInt(amount);
                const newBalance1 = parseInt(player1Balance) - parseInt(amount);

                const shuffledCards = shuffleArray(DECK_OF_CARDS)

                // Player 1 deck
                const player1Hand = shuffledCards.splice(0,2)

                // Player 2 deck
                const player2Hand = shuffledCards.splice(0,2)

                const deck = shuffledCards

                const clearedBoard = []

                const currBlind = isBlind
                if (turnPlayedBy === 'Player 1') {
                    const winningBalance = parseInt(player2Balance) + parseInt(pot)
                    socket.emit('updateGameState', {
                        gameOver: false,
                        roundOver: false,
                        turn: currBlind,
                        player2Balance: winningBalance,
                        player1Balance: newBalance1,
                        pot: '20',
                        handRound: 'preflop',
                        bigBlind: 'Player 2',
                        twoCheck: '0',
                        player1Hand: [...player1Hand],
                        player2Hand: [...player2Hand],
                        board: clearedBoard,
                        canCall2: '1',
                        gameDeck: deck,
                        isBlind: checkBlinds(currBlind),
                        prevBetAmount: '20'
                    })
                    console.log(winner)
                } else {
                    const winningBalance = parseInt(player1Balance) + parseInt(pot)
                    socket.emit('updateGameState', {
                        gameOver: false,
                        roundOver: false,
                        turn: currBlind,
                        player1Balance: winningBalance,
                        player2Balance: newBalance2,
                        pot: '20',
                        handRound: 'preflop',
                        bigBlind: 'Player 1',
                        twoCheck: '0',
                        player1Hand: [...player1Hand],
                        player2Hand: [...player2Hand],
                        board: clearedBoard,
                        gameDeck: deck,
                        canCall2: '1',
                        isBlind: checkBlinds(currBlind),
                        prevBetAmount: '20'
                    })
                    console.log(winner)
                }

            }
            // check no fall through if we still need this break statement
            break;
            case 'call': {
                console.log('call')
                const newPot = parseInt(pot) + parseInt(prevBetAmount); 
                const newBalance1 = parseInt(player1Balance) - prevBetAmount; 
                const newBalance2 = parseInt(player2Balance) - prevBetAmount;              
                if (handRound === 'preflop') {
                    if (turnPlayedBy === 'Player 1') {
                        const newBoard = []
                        const card1 = gameDeck.pop()
                        const card2 = gameDeck.pop()
                        const card3 = gameDeck.pop()
                        newBoard.push(card1)
                        newBoard.push(card2)
                        newBoard.push(card3)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 2',
                            winner: '',
                            player1Balance: newBalance1,
                            pot: parseInt(newPot),
                            handRound: 'flop',
                            needToSwitch: false,
                            prevBetAmount: 0,
                            board: newBoard,
                            canCall: false,
                            canCall2: '0',
                            twoCheck: '0'
                        })
                    } else {
                        const newBoard = []
                        const card1 = gameDeck.pop()
                        const card2 = gameDeck.pop()
                        const card3 = gameDeck.pop()
                        newBoard.push(card1)
                        newBoard.push(card2)
                        newBoard.push(card3)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 1',
                            winner: '',
                            player2Balance: newBalance2,
                            pot: newPot,
                            handRound: 'flop',
                            needToSwitch: false,
                            prevBetAmount: 0,
                            board: newBoard,
                            canCall: false,
                            canCall2: '0',
                            twoCheck: '0'
                        })
                    }
                } else if (handRound === 'flop') {
                    if (turnPlayedBy === 'Player 1') {
                        const newBoard = board
                        const card4 = gameDeck.pop()
                        newBoard.push(card4)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 2',
                            winner: '',
                            player1Balance: newBalance1,
                            pot: newPot,
                            handRound: 'turn',
                            needToSwitch: false,
                            prevBetAmount: 0,
                            board: newBoard,
                            canCall: false,
                            canCall2: '0',
                            twoCheck: '0'
                        })
                    } else {
                        const newBoard = board
                        const card4 = gameDeck.pop()
                        newBoard.push(card4)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 1',
                            winner: '',
                            player2Balance: newBalance2,
                            pot: newPot,
                            handRound: 'turn',
                            needToSwitch: false,
                            prevBetAmount: 0,
                            board: newBoard,
                            canCall: false,
                            canCall2: '0',
                            twoCheck: '0'
                        })
                    }
                } else if (handRound === 'turn') {
                    if (turnPlayedBy === 'Player 1') {
                        const newBoard = board
                        const card5 = gameDeck.pop()
                        newBoard.push(card5)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 2',
                            winner: '',
                            player1Balance: newBalance1,
                            pot: newPot,
                            handRound: 'river',
                            prevBetAmount: 0,
                            board: newBoard,
                            canCall: false,
                            canCall2: '0',
                            twoCheck: '0'
                        })
                    } else {
                        const newBoard = board
                        const card5 = gameDeck.pop()
                        newBoard.push(card5)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: 'Player 1',
                            winner: '',
                            player2Balance: newBalance2,
                            pot: newPot,
                            handRound: 'river',
                            prevBetAmount: 0,
                            board: newBoard,
                            canCall: false,
                            canCall2: '0',
                            twoCheck: '0'
                        })
                    }
                } else {
                    // Now apply handranking algorithm to figure out who wins or loses
                    const player1handrank = handrank(player1Hand, board)
                    const player2handrank = handrank(player2Hand, board)
                    const shuffledCards = shuffleArray(DECK_OF_CARDS)

                // Player 1 deck
                    const newPlayer1Hand = shuffledCards.splice(0,2)

                    // Player 2 deck
                    const newPlayer2Hand = shuffledCards.splice(0,2)

                    const deck = shuffledCards

                    const clearedBoard = []

                    const currBlind = isBlind
                    let w = 'Player 1'
                    if (player1handrank > player2handrank) {
                        w = 'Player 2'
                    }

                    if (w === 'Player 1') {
                        if (turnPlayedBy === 'Player 1') {
                            const winningBalance = parseInt(pot) + parseInt(player1Balance)
                            socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: currBlind,
                            winner: w,
                            player1Balance: winningBalance - 20,
                            pot: '20',
                            board: clearedBoard,
                            player1Hand: [...newPlayer1Hand],
                            player2Hand: [...newPlayer2Hand],
                            prevBetAmount: '20',
                            canCall: false,
                            canCall2: '1',
                            twoCheck: '0',
                            gameDeck: deck,
                            isBlind: checkBlinds(currBlind), 
                            handRound: 'preflop'
                        })
                    } else {
                        const winningBalance = parseInt(pot) + parseInt(player1Balance)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: currBlind,
                            winner: w,
                            player1Balance: winningBalance - 20,
                            pot: '20',
                            board: clearedBoard,
                            player1Hand: [...newPlayer1Hand],
                            player2Hand: [...newPlayer2Hand],
                            prevBetAmount: '20',
                            canCall: false,
                            canCall2: '1',
                            twoCheck: '0',
                            gameDeck: deck,
                            isBlind: checkBlinds(currBlind),
                            handRound: 'preflop'
                        })
                    }
                    } else {
                        if (turnPlayedBy === 'Player 2') {
                        const winningBalance = parseInt(pot) + parseInt(player2Balance)
                        socket.emit('updateGameState', {
                        gameOver: false,
                        roundOver: false,
                        turn: currBlind,
                        winner: w,
                        player2Balance: winningBalance - 20,
                        pot: '20',
                        board: clearedBoard,
                        player1Hand: [...newPlayer1Hand],
                        player2Hand: [...newPlayer1Hand],
                        prevBetAmount: '20',
                        canCall: false,
                        canCall2: '1',
                        twoCheck: '0',
                        gameDeck: deck,
                        isBlind: checkBlinds(currBlind), 
                        handRound: 'preflop'
                        })
                    } else {
                        const winningBalance = parseInt(pot) + parseInt(player2Balance)
                        socket.emit('updateGameState', {
                            gameOver: false,
                            roundOver: false,
                            turn: currBlind,
                            winner: w,
                            player2Balance: winningBalance - 20,
                            pot: '20',
                            board: clearedBoard,
                            player1Hand: [...newPlayer1Hand],
                            player2Hand: [...newPlayer2Hand],
                            prevBetAmount: '20',
                            canCall: false,
                            canCall2: '1',
                            twoCheck: '0',
                            gameDeck: deck,
                            isBlind: checkBlinds(currBlind),
                            handRound: 'preflop'
                        })
                    }
                    }
                    
                }
                console.log('Hand round: ' + handRound)
                
            }   
            break;
            case 'raise': {
                console.log('raise')
                const raiseAmount = prompt('Enter raise amount: ');
                
                const newPot = parseInt(pot) + parseInt(raiseAmount);
                if (turnPlayedBy === 'Player 1') {
                    const newBalance1 = parseInt(player1Balance) - parseInt(raiseAmount);
                    console.log('Player 1 initial balance: ' + player1Balance)
                    socket.emit('updateGameState', {
                        gameOver: false,
                        roundOver: false,
                        turn: 'Player 2',
                        winner: '',
                        player1Balance: newBalance1,
                        pot: newPot,
                        canCall: true,
                        prevBetAmount: raiseAmount,
                        canCall2: '1',
                        twoCheck: '0'
                    })
                    console.log('Player 1 final balance: ' + player1Balance)
                } else {
                    const newBalance2 = parseInt(player2Balance) - parseInt(raiseAmount);
                    console.log('Player 2 initial balance: ' + player2Balance)
                    socket.emit('updateGameState', {
                        gameOver: false,
                        roundOver: false,
                        turn: 'Player 1',
                        winner: '',
                        player2Balance: newBalance2,
                        pot: newPot,
                        canCall: true,
                        prevBetAmount: raiseAmount,
                        canCall2: '1',
                        twoCheck: '0'
                    })
                    console.log('Player 2 final balance: ' + player2Balance)
                }
            }
        }
    }
    console.log('Can Call: ' + canCall)
    console.log('Can Call 2: ' + canCall2)



    return (
        <div className={`Game backgroundColorR backgroundColorPoker`}>
            {(!roomFull) ? <>

                <div className='topInfo'>

                    <h1>Game Code: {room}</h1>
                    <h1 className='playerStats'>Hand Round: {handRound}</h1>
                    <h1 className='playerStats'>Pot: ${pot}</h1>
                </div>

                {/* PLAYER LEFT MESSAGES */}
                {users.length===1 && currentUser === 'Player 2' && <h1 className='topInfoText'>Player 1 has left the game.</h1> }
                {users.length===1 && currentUser === 'Player 1' && <h1 className='topInfoText'>Waiting for Player 2 to join the game.</h1> }

                {users.length===2 && <>
                    {gameOver ? <div>{winner !== '' && <><h1>GAME OVER</h1><h2>{winner} wins!</h2></>}</div> :

                    <div>
                        {/* PLAYER 1 VIEW */}
                        {currentUser === 'Player 1' && <>    
                        <div className='player2Deck' style={turn === 'Player 2' ? {pointerEvents: 'none'} : null}>
                            <p className='playerDeckText'>Player 2 Balance: ${player2Balance}</p>
                            {player2Hand.map((item, i) => (
                                <img
                                    key={i}
                                    className='Card'
                                    //onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../assets/poker-card-back.jpg`).default}
                                    />
                            ))}
                            {turn==='Player 2' && <Spinner />}
                            <button className='game-button' disabled={turn !== 'Player 1'} onClick={() => {onTurnHandler('fold')}}>FOLD</button>
                            <button className='game-button' disabled={turn !== 'Player 1'} onClick={() => {onTurnHandler('check')}}>CHECK</button>
                            <button className='game-button' disabled={(turn !== 'Player 1') || (canCall2 === '0')} onClick={() => {onTurnHandler('call')}}>CALL</button>
                            <button className='game-button' disabled={turn !== 'Player 1'} onClick={() => {onTurnHandler('raise')}}>RAISE</button>
                        </div>
                    
                        {/* <div>Player 1 balance is: ${player1Balance}</div>
                        <div>Player 2 balance is: ${player2Balance}</div>
                        <div>Handround is: ${handRound}</div>
                        <div>Pot: ${pot}</div>
                        <div>Winner: {winner}</div>
                        <div>Previous Bet Amount: {prevBetAmount}</div>
                        <div>Can call: {"" + canCall}</div> */}
                        <br />
                        <div className='middleInfo' style={turn === 'Player 2' ? {pointerEvents: 'none'} : null}>
                            {/* <button className='game-button' disabled={turn !== 'Player 1'} onClick={() => {onTurnHandler('fold')}}>FOLD</button>
                            <button className='game-button' disabled={turn !== 'Player 1'} onClick={() => {onTurnHandler('check')}}>CHECK</button>
                            <button className='game-button' disabled={(turn !== 'Player 1') || (canCall2 === '0')} onClick={() => {onTurnHandler('call')}}>CALL</button>
                            <button className='game-button' disabled={turn !== 'Player 1'} onClick={() => {onTurnHandler('raise')}}>RAISE</button> */}
                            {board.map((item, i) => (
                                <img 
                                    key={i}
                                    className='Card'
                                    src={require(`../assets/deck-cards-front/${item}.png`).default}
                                />
                            ))}
                            {/* {board && board.length>0 &&
                            <img
                                className='Card'
                                src={require(`../assets/deck-cards-front/${board[board.length-1]}.png`).default}
                                /> } */}
                            {/* <button className='game-button orange' disabled={player1Deck.length !== 2} onClick={() => {
                                setUnoButtonPressed(!isUnoButtonPressed)
                                playUnoSound()
                            }}>UNO</button> */}
                        </div>
                        <br />
                        <div className='player1Deck' style={turn === 'Player 1' ? null : {pointerEvents: 'none'}}>
                            <p className='playerDeckText'>Player 1 Balance: ${player1Balance}</p>
                            {player1Hand.map((item, i) => (
                                <img
                                    key={i}
                                    className='Card'
                                    //onClick={() => onCardPlayedHandler(item)}
                                    // we changed this 
                                    src={require(`../assets/deck-cards-front/${item}.png`).default}
                                    />
                            ))}
                        </div>

                        <div className="chatBoxWrapper">
                            <div className="chat-box chat-box-player1">
                                <div className="chat-head">
                                    <h2>Chat Box</h2>
                                    {!isChatBoxHidden ?
                                    <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_down</span> :
                                    <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_up</span>}
                                </div>
                                <div className="chat-body">
                                    <div className="msg-insert">
                                        {messages.map(msg => {
                                            if(msg.user === 'Player 2')
                                                return <div className="msg-receive">{msg.text}</div>
                                            if(msg.user === 'Player 1')
                                                return <div className="msg-send">{msg.text}</div>
                                        })}
                                    </div>
                                    <div className="chat-text">
                                        <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
                                    </div>
                                </div>
                            </div>
                        </div> </> }

                        {/* PLAYER 2 VIEW */}
                        {currentUser === 'Player 2' && <>
                        <div className='player1Deck' style={turn === 'Player 1' ? {pointerEvents: 'none'} : null}>
                            <p className='playerDeckText'>Player 1 Balance: ${player1Balance}</p>
                            {/* <p>Player 1 Balance: ${player1Balance}</p> */}
                            {player1Hand.map((item, i) => (
                                <img
                                    key={i}
                                    className='Card'
                                    //onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../assets/poker-card-back.jpg`).default}
                                    />
                            ))}
                            {turn==='Player 1' && <Spinner />}
                            <button className='game-button' disabled={turn !== 'Player 2' } onClick={() => {onTurnHandler('fold')}}>FOLD</button>
                            <button className='game-button' disabled={turn !== 'Player 2'} onClick={() => {onTurnHandler('check')}}>CHECK</button>
                            <button className='game-button' disabled={(turn !== 'Player 2') || (canCall2 === '0')} onClick={() => {onTurnHandler('call')}}>CALL</button>
                            <button className='game-button' disabled={turn !== 'Player 2'} onClick={() => {onTurnHandler('raise')}}>RAISE</button>
                        </div>
                        {/* <div>Player 2 balance is: ${player2Balance}</div>
                        <div>Player 1 balance is: ${player1Balance}</div>
                        <div>Handround is: ${handRound}</div>
                        <div>Pot: ${pot}</div>
                        <div>Previous Bet Amount: {prevBetAmount}</div> */}
                        <br />
                        <div className='middleInfo' style={turn === 'Player 1' ? {pointerEvents: 'none'} : null}>
                            {/* <button className='game-button' disabled={turn !== 'Player 2' } onClick={() => {onTurnHandler('fold')}}>FOLD</button>
                            <button className='game-button' disabled={turn !== 'Player 2'} onClick={() => {onTurnHandler('check')}}>CHECK</button>
                            <button className='game-button' disabled={(turn !== 'Player 2') || (canCall2 === '0')} onClick={() => {onTurnHandler('call')}}>CALL</button>
                            <button className='game-button' disabled={turn !== 'Player 2'} onClick={() => {onTurnHandler('raise')}}>RAISE</button> */}

                            {board.map((item, i) => (
                                <img 
                                    key={i}
                                    className='Card'
                                    src={require(`../assets/deck-cards-front/${item}.png`).default}
                                />
                            ))}
                        </div>
                        <br />
                        <div className='player2Deck' style={turn === 'Player 1' ? {pointerEvents: 'none'} : null}>
                            <p className='playerDeckText'>Player 2 Balance: ${player2Balance}</p>
                            {player2Hand.map((item, i) => (
                                <img
                                    key={i}
                                    className='Card'
                                    //onClick={() => onCardPlayedHandler(item)}
                                    src={require(`../assets/deck-cards-front/${item}.png`).default}
                                    />
                            ))}
                        </div>

                        <div className="chatBoxWrapper">
                            <div className="chat-box chat-box-player2">
                                <div className="chat-head">
                                    <h2>Chat Box</h2>
                                    {!isChatBoxHidden ?
                                    <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_down</span> :
                                    <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_up</span>}
                                </div>
                                <div className="chat-body">
                                    <div className="msg-insert">
                                        {messages.map(msg => {
                                            if(msg.user === 'Player 1')
                                                return <div className="msg-receive">{msg.text}</div>
                                            if(msg.user === 'Player 2')
                                                return <div className="msg-send">{msg.text}</div>
                                        })}
                                    </div>
                                    <div className="chat-text">
                                        <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
                                    </div>
                                </div>
                            </div>
                        </div> </> }
                    </div> }
                </> }
            </> : <h1>Room full</h1> }

            <br />
            <a href='/'><button className="game-button red">QUIT</button></a>
        </div>
    )
}

export default Game