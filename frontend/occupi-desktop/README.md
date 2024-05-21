# Welcome to Occupi-Desktop 👋

//place desktop app renderings here

## Getting Started

1. We use bun as our package manager. Please download it at <a href="https://bun.sh/docs/installation">bun</a>.
2. Set up the pre-requisites as outlined at <a href="https://tauri.app/v1/guides/getting-started/prerequisites">tauri</a>
3. First, install dependencies:

```bash
bunx install
```

3. Next, run the development server:

```bash
bunx tauri dev
```
Please note that running this command for the first time might take upwards of 10 minutes for the rust backend to compile. This will only occur on the first invocation of this command. On subsequent runs, it will be a lot faster.

## Development Cycle

1. run the development server:

```bash
bunx tauri dev
```
2. to create a debug build, run:

```bash
bunx tauri build --debug
```
3. to create a build(you most likely will never have to do this), run:

```bash
bunx tauri build
```

## Learn More

To learn more about tauri, take a look at the following resources:

- [Tauri Documentation](https://tauri.app/v1/guides/) - learn about tauri's features and API.
