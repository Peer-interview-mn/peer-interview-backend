## Check code comment
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
AWS_ACCESS=###
AWS_SECRET=###
AWS_REGION=###

AWS_S3_BUCKET=###

PORT=8000

MONGO_URI=###

JWT_SECRET=###
JWT_EXPRIRESIN=1h

REF_SECRET=###
REF_EXPRIRESIN=7d

#aws
SMTP_HOST=###
SMTP_PORT=###
IAM_USER=###
SMTP_USER=###
SMTP_PASSWORD=###
HOSTMAIL=###

GOOGLE_ID=###
GOOGLE_SECRET=###
GOOGLE_CALLBACK_URL=###

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
