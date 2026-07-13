# @lumine-code/jasmine-node

Runs legacy Jasmine 1 suites on current Node.js releases for Lumine tooling.

## Features

- **Jasmine 1 compatibility**: preserves the test environment used by legacy editor and package specs.
- **CoffeeScript support**: loads CoffeeScript and Literate CoffeeScript specs through the maintained compiler package.
- **Multiple reporters**: supports terminal, verbose, JUnit XML, and TeamCity output.
- **Flexible discovery**: loads nested specs, helpers, RequireJS suites, and optional watch mode.

## Installation

```sh
npm install @lumine-code/jasmine-node
```

## Usage

```sh
jasmine-node spec/
```

Use `--coffee` for CoffeeScript specs, `--captureExceptions` to report uncaught exceptions, or `--help` for the complete option list.

## Building

```sh
npm install
npm test
```

## Contributing

Got ideas to make this package better, found a bug, or want to help add new features? Just drop your thoughts on GitHub. Any feedback is welcome!
