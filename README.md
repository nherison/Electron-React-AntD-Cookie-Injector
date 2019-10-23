<div align="center">

</div>
<p>
  Sproot App
</p>
<br>

<div align="center">

<a href="https://facebook.github.io/react/"><img src="./internals/img/react-padded-90.png" /></a>
<a href="https://webpack.github.io/"><img src="./internals/img/webpack-padded-90.png" /></a>
<a href="http://redux.js.org/"><img src="./internals/img/redux-padded-90.png" /></a>
<a href="https://github.com/ReactTraining/react-router"><img src="./internals/img/react-router-padded-90.png" /></a>
<a href="https://flowtype.org/"><img src="./internals/img/flow-padded-90.png" /></a>
<a href="http://eslint.org/"><img src="./internals/img/eslint-padded-90.png" /></a>
<a href="https://facebook.github.io/jest/"><img src="./internals/img/jest-padded-90.png" /></a>
<a href="https://yarnpkg.com/"><img src="./internals/img/yarn-padded-90.png" /></a>

</div>

<hr>
<br>

## Install

Install the dependencies with yarn.

```bash
$ cd your-project-name
$ yarn
```

## Run

Start the app in the `dev` environment. This starts the renderer process in [**hot-module-replacement**](https://webpack.js.org/guides/hmr-react/) mode and starts a webpack dev server that sends hot updates to the renderer process:

```bash
$ yarn dev
```

If you don't need autofocus when your files was changed, then run `dev` with env `START_MINIMIZED=true`:

```bash
$ START_MINIMIZED=true yarn dev
```

## Packaging

To package apps for the local platform:

```bash
$ yarn package
```

To package apps for all platforms:

First, refer to the [Multi Platform Build docs](https://www.electron.build/multi-platform-build) for dependencies.

Then,

```bash
$ yarn package-all
```

To package apps with options:

```bash
$ yarn package --[option]
```

:bulb: You can debug your production build with devtools by simply setting the `DEBUG_PROD` env variable:

```bash
DEBUG_PROD=true yarn package
```

## License

MIT © 2019
