# Valorant Crawler & Website Backend
This repository contains two primary components:
- **Valorant Crawler**: A Python script for collecting and updating player statistics from Valorant games.
- **NestJS Backend**: A server-side component that supports the crawled data service for [this website](https://prod.valps.gg/).

> **Note**: You need your own Valorant API key from Riot Games to request match output.


## 💻 Tech Stack
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) 

For more details about the backend architecture, visit [my blog](https://jooncode.com/blog/code/backend/).

## Valorant Crawler
The Valorant Crawler fetches real-time match data from the Valorant API. It compiles various metrics into a MongoDB database for:
- Tracking player performance
- Research and analysis

## NestJS Backend
The NestJS backend serves the data for [this website](https://prod.valps.gg/) with API. Note that sensitive data are omitted for security reasons.

## Version History
- **0.1**: Initial Release
- **0.2**: Added NestJS Backend Project
- **0.3**: Added data aggregator using psycopg2
- **0.4**: Multiple pipe lines are implemented in crawler
- **0.5**: NestJS also uses MongoDB now

## Authors
- [@HwiJoon Lee](https://jooncode.com/)

## License
This project is licensed under the [MIT License]. See the `LICENSE.md` file for details.

## Acknowledgments
Special thanks to [PS Analytics](https://lol.ps/) for providing a comprehensive environment to learn from!