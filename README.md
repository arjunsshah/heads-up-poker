<h1 align="center">Heads-Up Poker</h1>

## 🏁 Getting Started (to run game locally)

Follow the steps below, after cloning the repository:

### 🖐 Requirements

**For Installing:**

- Node

**For Running:**

- Change socket.IO endpoint on client side. To do this, go to `client/src/components/Game.js` and change line #26 from `const ENDPOINT = 'https://uno-online-multiplayer.herokuapp.com/'` to `const ENDPOINT = 'http://localhost:5000'`

### ⏳ Installation

- At the root of the project directory, use npm to install the server-side dependencies

```bash
npm install
```

This command installs all the server-side dependencies needed for the game to run locally.

- Use npm to run server

```bash
npm start
```

This command gets the server running on localhost port 5000.

- In a separate terminal, navigate into the client folder and use npm to install the client-side dependencies

```bash
cd client
npm install
```

This command installs all the client-side dependencies needed for the game to run locally.

- Finally, use npm to run client

```bash
npm start
```

This command gets the client running on localhost port 3000.

Head over to http://localhost:3000/ and enjoy the game! 🎉

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are greatly appreciated. The **Issues** tab is a good place to begin!

1. Fork the project repo
2. Clone the forked repo on your machine
3. Create your feature branch (`git checkout -b feature/AmazingFeature`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch on your forked repo (`git push origin feature/AmazingFeature`)
6. Open a pull request

## ❤️ Acknowledgements

- [Chirantan P](https://www.linkedin.com/in/chirantan-pradhan-76673019b/) for the background images
- [AlexDer](https://alexder.itch.io/) for the UNO cards assets
- [3mil1](https://codepen.io/3mil1) for the button designs
- [Divyank](https://codepen.io/Pahlaz) for the chat box design
