# Frontend service (UI/UX service)
#### Main docs are in `./docs`
* [Docs](./docs/index.md)

## To run locally

1. You need to create .env file, you need to take respectively
- `prod` environment: `infra/prod/.env.prod`
- `staging` environment: `infra/staging/.env.staging`.

2. You can run frontend service in dev mode ``npm run dev``

## To update graphql schema

1. You need to update ```./schema.graphql``` file

2. Run ``npm run gqlts`` and new grahql typescript schema will appear in
   ``./src/types/graphql.schema.ts``

## To build and run

1. You need to create .env file, you can find sample of this in .env.sample

2. You can build frontend service by ``npm run build``

2. Then you can run frontend service by ``npm run start``
