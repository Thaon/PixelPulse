# PixelPulse

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

PixelPulse is a game engine that allows you to create and play games in your web browser. The engine is designed to be simple and easy to use, and is perfect for creating 2D games.

The engine uses the p5.js library and the following additional libraries to add functionalities:

- [p5.party](https://p5party.org/) for multiplayer support
- [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) for sound effects and music

Multiplayer is also handled using [DeepStream](https://deepstream.io/), which is a scalable server that allows you to create real-time applications.

## Table of Contents

- [Installation](#installation)
- [Running Games](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

The PixelPulse engine comes as a standalone HTML page with a single JavaScript file. To use the engine, simply open the index.html file and you are good to go.

## Running Games

The engine initially loads code and sprites from either the PixelPulse game server or local storage, so you will need to provide the engine with a game ID or set-up your own resources in local storage. You can make plug in your own editor if you made one.

## Contributing

If you would like to contribute to the project, please follow the steps below:

1. Fork the repository
2. Create a new branch for your feature (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Create a new Pull Request

If you find a bug or would like to request a new feature, please open an issue.

## License

This project is licensed under the [MIT License](LICENSE).
