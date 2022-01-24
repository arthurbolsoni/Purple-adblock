# Contributing to Purple-adblock

## Table of contents

### [Introduction](#introduction)

### [How to contribute](#how-to-contribute)

### [How to report a bug/request a feature](#how-to-report-a-bugrequest-a-feature)

## Introduction

Hey! Thanks for your interest in contributing to the project! What is presented before you is a set of guidelines and general information about how to contribute to the project.

## How to contribute

### Setting up the project

First off, make a fork of the project, then clone it. Do not just copy and paste this, replace the repo with your fork's url.

```bash
git clone https://github.com/YOURUSERNAME/Purple-adblock/fork
```

Then install the dependencies. There's no need to individually run `npm install` in the different sub-repos, theres a preinstall script that does that for you.

```bash
npm run install
```

Now you're all setup! If you'd like to...

- Build the service worker
  - `npm run worker:build`
- Build the service worker (Don't copy to `./chrome/`)
  - `npm run worker:build:nocopy`
- Run the server in...
  - Development
    - `npm run server:dev`
  - Production
    - `npm run server:build` then `npm run server:start`
- Run linter and prettier
  - `npm run lint`

### Formatting/linting

Respect our formatter (Run `npm run lint` or use an extension for your IDE that uses prettier-eslint). For typescript, you may use @ts-expect-error or eslint-disable, but it's not recommended.

### Making a pull request

After you've made your changes, make a pull request, and follow the template provided.

## How to report a bug/request a feature

Go here and click the button which meets your needs: <https://github.com/arthurbolsoni/Purple-adblock/issues/new>