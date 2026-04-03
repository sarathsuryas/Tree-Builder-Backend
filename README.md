# Recursive Node Tree Builder Backend

NestJS backend for managing an infinitely recursive node tree using MongoDB, Mongoose, and TypeScript.

This project follows clean architecture principles with:

- Feature-based modules
- Repository pattern with a shared base repository
- Dependency inversion through interfaces and injection tokens
- DTO validation using `class-validator` and `class-transformer`
- Materialized-path storage for efficient subtree reads and deletes

## Tech Stack

- NestJS
- TypeScript
- MongoDB
- Mongoose
- ESLint + Prettier

## Features

- Create a root or child node
- Fetch the full tree in nested form
- Delete a node and its entire subtree
- Validate request payloads centrally
- Enable configurable CORS in application bootstrap

## Architecture Overview

The codebase is organized by responsibility so business logic stays isolated from framework and database details.

```text
src/
  app.controller.ts
  app.module.ts
  main.ts
  common/
    constants/
      injection-tokens.ts
    persistence/
      base.repository.ts
      interfaces/
        base-repository.interface.ts
  nodes/
    application/
      dto/
        create-node.dto.ts
        delete-node.dto.ts
      interfaces/
        node.repository.interface.ts
        node.service.interface.ts
        node-tree.interface.ts
      services/
        node.service.ts
    domain/
      entities/
        node.entity.ts
    infrastructure/
      persistence/
        repositories/
          node.repository.ts
        schemas/
          node.schema.ts
    presentation/
      nodes.controller.ts
    nodes.module.ts
```

### Layer Responsibilities

- `presentation`: HTTP controllers and route handling
- `application`: use cases, DTOs, and service/repository contracts
- `domain`: core entity definitions
- `infrastructure`: Mongoose schema and repository implementations
- `common`: shared abstractions and tokens used across modules

## Tree Model

Each node contains:

- `name: string`
- `parentId: ObjectId | null`
- `path: string`
- `depth: number`
- `createdAt: Date`
- `updatedAt: Date`

### Why `path` is used

The application uses a materialized-path strategy. A node path looks like:

```text
/680d7cb2f6f2c4b715dcb001/680d7d01f6f2c4b715dcb002/
```

This makes subtree operations efficient:

- Read all descendants using a path-prefix query
- Delete an entire subtree with one `deleteMany` operation
- Avoid recursive database traversal for delete operations

## Dependency Inversion

The project uses interfaces plus provider tokens so upper layers do not depend on concrete implementations.

### Repository abstraction

- `INodeRepository` defines the contract used by the service
- `NodeRepository` implements the MongoDB/Mongoose behavior
- `NODE_REPOSITORY` is the injection token used in the module

### Service abstraction

- `INodeService` defines the contract used by the controller
- `NodeService` contains the business logic
- `NODE_SERVICE` is the injection token used in the module

## API Endpoints

Base URL:

```text
/api/v1
```

### Health Check

`GET /api/v1`

Response:

```json
{
  "status": "ok",
  "service": "recursive-node-tree-builder"
}
```

### Create Node

`POST /api/v1/nodes`

Request body:

```json
{
  "name": "Engineering",
  "parentId": "680d7cb2f6f2c4b715dcb001"
}
```

`parentId` is optional. Omit it or send `null` to create a root node.

Response example:

```json
{
  "id": "680d7d01f6f2c4b715dcb002",
  "name": "Engineering",
  "parentId": "680d7cb2f6f2c4b715dcb001",
  "path": "/680d7cb2f6f2c4b715dcb001/680d7d01f6f2c4b715dcb002/",
  "depth": 1,
  "createdAt": "2026-04-03T06:20:00.000Z",
  "updatedAt": "2026-04-03T06:20:00.000Z"
}
```

### Get Full Tree

`GET /api/v1/nodes`

Response example:

```json
[
  {
    "id": "680d7cb2f6f2c4b715dcb001",
    "name": "Root",
    "parentId": null,
    "path": "/680d7cb2f6f2c4b715dcb001/",
    "depth": 0,
    "createdAt": "2026-04-03T06:10:00.000Z",
    "updatedAt": "2026-04-03T06:10:00.000Z",
    "children": [
      {
        "id": "680d7d01f6f2c4b715dcb002",
        "name": "Engineering",
        "parentId": "680d7cb2f6f2c4b715dcb001",
        "path": "/680d7cb2f6f2c4b715dcb001/680d7d01f6f2c4b715dcb002/",
        "depth": 1,
        "createdAt": "2026-04-03T06:20:00.000Z",
        "updatedAt": "2026-04-03T06:20:00.000Z",
        "children": []
      }
    ]
  }
]
```

The service builds this structure in `O(n)` time using a map keyed by node id.

### Delete Node

`DELETE /api/v1/nodes/:id`

Example:

```text
DELETE /api/v1/nodes/680d7d01f6f2c4b715dcb002
```

Response:

```json
{
  "deletedCount": 3
}
```

The count includes the selected node and all descendants.

## Validation Rules

### Create node DTO

- `name` is required
- `name` is trimmed
- `name` length must be between 1 and 120 characters
- `parentId` is optional
- `parentId` must be a valid Mongo ObjectId if provided

### Delete node DTO

- `id` must be a valid Mongo ObjectId

Global validation is enabled in bootstrap with:

- `whitelist: true`
- `transform: true`
- `forbidNonWhitelisted: true`

## CORS

CORS is enabled in [src/main.ts](./src/main.ts).

Configuration behavior:

- If `CORS_ORIGIN` is set, it is treated as a comma-separated allowlist
- If `CORS_ORIGIN` is not set, all origins are allowed
- Credentials are enabled
- Allowed methods: `GET`, `POST`, `DELETE`, `OPTIONS`

## Environment Variables

Create a `.env` file in the project root.

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/tree-builder
CORS_ORIGIN=http://localhost:5001,http://localhost:5173
```

## Installation

```bash
npm install
```

## Running the Project

```bash
# development
npm run start:dev

# production build
npm run build

# run compiled app
npm run start:prod
```

The server starts on:

```text
http://localhost:5001/api/v1
```

## Linting

```bash
npm run lint
```

## Important Implementation Notes

### Base repository

The shared base repository centralizes common persistence behavior:

- `create`
- `findById`
- `findAll`
- `deleteMany`

This keeps feature repositories focused on feature-specific query behavior instead of duplicating CRUD code.

### Node repository

`NodeRepository` extends the base repository and adds subtree-specific operations:

- `findByPathPrefix`
- `deleteSubtreeByPath`

### Node service

`NodeService` is responsible for:

- validating parent existence before creating a child node
- computing `path` and `depth`
- transforming flat node records into a nested tree
- deleting a subtree using the stored materialized path

## Example Flow

### Create root node

```json
{
  "name": "Root"
}
```

Generated values:

- `parentId = null`
- `depth = 0`
- `path = /<nodeId>/`

### Create child node

```json
{
  "name": "Team A",
  "parentId": "<rootId>"
}
```

Generated values:

- `depth = parent.depth + 1`
- `path = parent.path + <nodeId>/`

## Current Notes

- The repository and service layers are both abstracted through interfaces and provider tokens
- The current codebase does not include active test files
- The `package.json` still contains Jest-related scripts, so update or remove them if you do not plan to restore tests later

## Future Improvements

- Add Swagger/OpenAPI documentation
- Add pagination or filtered subtree queries
- Add transactions if future write workflows span multiple collections
- Add role-based authorization if the API becomes multi-user
- Add audit logging for node mutations

## License

UNLICENSED
