[![GitHub contributors](https://img.shields.io/github/contributors/Aman035/W3-Exam?style=for-the-badge)](https://github.com/Aman035/W3-Exam/contributors)
[![GitHub issues](https://img.shields.io/github/issues/Aman035/W3-Exam?style=for-the-badge)](https://github.com/Aman035/W3-Exam/issues)
[![GitHub forks](https://img.shields.io/github/forks/Aman035/W3-Exam?style=for-the-badge)](https://github.com/Aman035/W3-Exam/network)
[![GitHub stars](https://img.shields.io/github/stars/Aman035/W3-Exam?style=for-the-badge)](https://github.com/Aman035/W3-Exam/stargazers)
[![GitHub license](https://img.shields.io/github/license/Aman035/W3-Exam?style=for-the-badge)](https://github.com/Aman035/W3-Exam/blob/main/LICENSE)

<!-- PROJECT LOGO -->
<br />
<p align="center">
    <!-- <img src="images/logo.png" alt="Logo" width="80" height="80"> -->
  <h3 align="center">W3-Exam</h3>
  <p align="center">
    <a href="https://w3exam.netlify.app">View Demo</a>
    ·
    <a href="https://github.com/Aman035/W3-Exam/issues">Report Bug</a>
    ·
    <a href="https://github.com/Aman035/W3-Exam/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#contract-code">Contract Code</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li><a href="#installation">Installation</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

W3 Exam project aims to address the need for a
solution that can mitigate the reliance on consistent high-speed internet connections for online examinations. By
leveraging cryptographic algorithms and secure distribution methods, the project seeks to
enable students to access exam materials in advance, minimising the impact of slow internet
speeds. This approach offers an alternative for students in regions with limited connectivity,
allowing them to participate in online exams more easily and reducing the likelihood of
opting out due to connectivity issues.

<p align="center">
<img src="assets\flow.png"/>
</p>

#### Contract Code

Contract is deployed on Polygon Mumbai testnet.
Contract Address - [View on PolygonScan](https://mumbai.polygonscan.com/address/0xeA2DEd9D03dADf5a84d19d42E5dAfbF270b92658)
0xeA2DEd9D03dADf5a84d19d42E5dAfbF270b92658

#### Built With

- ReactJS
- Redux
- NodeJS
- Express
- Wallet Integrations - Rainbow Kit
- Messaging Service Integration - Twilio
- Typescript
- Solidity
- Test Cases - Mocha And Chai
- Deployment - Polygon Mumbai Testnet

## Installation

1. Clone the repo

```sh
git clone https://github.com/Aman035/W3-Exam.git
```

#### Frontend

1. Install NPM packages

```sh
cd client
yarn install
```

2. Start the React App

```sh
yarn run start
```

#### Backend

1. Install NPM packages

```sh
cd server
yarn install
```

2. Add a .env file with the variables as given in .env.example

3. Start the Server

```sh
yarn run start
```

#### Contracts

1. Go to Contract Directory

```sh
cd contract
```

2. Insall packages

```sh
npm i
```

3. For running test cases

```sh
npx hardhat test
```

4. To compile the contarcts

```sh
npx hardhat compile
```

5. To deploy the contracts add a .env file with the following variables

```sh
// For Network RPC
ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
```

```sh
npx hardhat run scripts/deploy.js --network polygon_mumbai
```
