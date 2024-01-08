## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install or yarn b
```


## Help env
step 1: Create .env
```bash
touch .env
```
setup environment: copy to .env
```bash
PORT=8000

#MONGO_URI=mongodb://root:root@localhost:27001
MONGO_URI=mongodb+srv://dashmandalsaikhanbileg:amazon@testamazon.4lbhbua.mongodb.net/interview?retryWrites=true&w=majority

JWT_SECRET=peer_interview_3982fc1a
JWT_EXPRIRESIN=7d

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=0041ae855fbe0d
SMTP_PASSWORD=f7cde9aad7cff8

HOSTMAIL=peer@interview.io

```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn dev

# production mode
$ yarn start:prod
```

## Helping commands

```bash
# download node_modules
$ yarn b

# delete node_modules and cache clean
$ yarn cache

# generate new module
$ yarn new_module

# generate new service
$ yarn new_service

# generate new resource api gql or rest...
$ yarn new_api
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

Nest is [MIT licensed](LICENSE).
