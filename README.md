# Server Project Boilerplate
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](https://github.com/orangeloops/public-ol-server-template/pulls) [![GitHub](https://img.shields.io/github/license/orangeloops/public-ol-server-template.svg)](https://github.com/orangeloops/public-ol-server-template/blob/develop/LICENSE)

## Components

- [Node.js](https://nodejs.org/en//) for JavaScript runtime.
- [Apollo](https://www.apollographql.com/) as GraphQL implementation.
- [GraphQL Modules](https://graphql-modules.com/) to implement 'modules' on GraphQL.
- [Sequelize](http://docs.sequelizejs.com/) as multi SQL dialect ORM for Node.js.
- [Sequelize-Typescript](https://github.com/RobinBuschmann/sequelize-typescript/) typescript decorators for Sequelize.

- [TypeScript](https://www.typescriptlang.org/) as main language.
- [Babel](https://babeljs.io/) for JavaScript transpiling.
- [Jest](https://jestjs.io/) as as test framework.

- [Prettier](https://prettier.io/) for code formatter.
- [ESlint](https://eslint.org/) for JavaScript/TypeScript linting.
- [Husky](https://github.com/typicode/husky/) for Git hooks support.
- [Lint-staged](https://github.com/okonet/lint-staged/) to run linters on git staged files.


## Getting Started

Run the following commands in your terminal

```bash
git clone https://github.com/orangeloops/public-ol-server-template.git
cd public-ol-server-template
npm install
npm start:watch
```
[ Optional ] Run `db:seed` to charge the database with initial dummy values

Then open [http://localhost:5000/](http://localhost:5000/graphql) on your web browser.

### Testing

Run `npm test` for test.

## License
>You can check out the full license [here](https://github.com/orangeloops/public-ol-server-template/blob/develop/LICENSE)

This project is licensed under the terms of the MIT license.

---

[orangeloops.com](https://www.orangeloops.com/) &nbsp;&middot;&nbsp;
[twitter](https://twitter.com/orangeloopsinc/) &nbsp;&middot;&nbsp;
[blog](https://orangeloops.com/blog/)
